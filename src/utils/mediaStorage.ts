import { set, get, del } from 'idb-keyval';
import { nanoid } from 'nanoid';

interface CachedMedia {
  blob: Blob;
  type: string;
  timestamp: number;
  id: string;
}

const TTL = 24 * 60 * 60 * 1000; // 24 hours

export class MediaStorage {
  private objectUrls = new Map<string, string>();
  private fetchPromises = new Map<string, Promise<string>>();

  async store(key: string, blob: Blob): Promise<string> {
    const cached: CachedMedia = {
      blob,
      type: blob.type,
      timestamp: Date.now(),
      id: nanoid()
    };

    await set(key, cached);
    const objectUrl = URL.createObjectURL(blob);
    this.objectUrls.set(key, objectUrl);
    return objectUrl;
  }

  async load(key: string): Promise<string | null> {
    try {
      // Check if we already have an object URL
      const existingUrl = this.objectUrls.get(key);
      if (existingUrl) return existingUrl;

      // Check if there's an ongoing fetch for this URL
      const existingPromise = this.fetchPromises.get(key);
      if (existingPromise) return existingPromise;

      // Try to get from IndexedDB
      const cached: CachedMedia | undefined = await get(key);
      
      if (!cached) return null;

      // Check if expired
      if (Date.now() - cached.timestamp > TTL) {
        await this.remove(key);
        return null;
      }

      // Create and store new object URL
      const objectUrl = URL.createObjectURL(cached.blob);
      this.objectUrls.set(key, objectUrl);
      return objectUrl;

    } catch (error) {
      console.error('Error loading media:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    const objectUrl = this.objectUrls.get(key);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.objectUrls.delete(key);
    }
    this.fetchPromises.delete(key);
    await del(key);
  }

  async fetchAndStore(url: string): Promise<string> {
    try {
      const existingPromise = this.fetchPromises.get(url);
      if (existingPromise) return existingPromise;

      // For blob URLs, try to get from cache first
      if (url.startsWith('blob:')) {
        const cached = await this.load(url);
        if (cached) return cached;

        try {
          // Try to get the blob directly from the URL
          const blob = await fetch(url).then(r => r.blob());
          return this.store(url, blob);
        } catch (error) {
          console.warn('Failed to fetch blob URL directly:', error);
          // If the blob URL is invalid, try to recover from IndexedDB
          const storedData = await get(url);
          if (storedData?.blob) {
            return this.store(url, storedData.blob);
          }
          throw error;
        }
      }

      // Rest of the existing fetchAndStore logic...
      const fetchPromise = (async () => {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'image/*, video/*, application/octet-stream',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        const objectUrl = await this.store(url, blob);
        this.fetchPromises.delete(url);
        return objectUrl;
      })();

      this.fetchPromises.set(url, fetchPromise);
      return fetchPromise;
    } catch (error) {
      console.error('Error in fetchAndStore:', error);
      throw error;
    }
  }

  revokeAll(): void {
    for (const objectUrl of this.objectUrls.values()) {
      URL.revokeObjectURL(objectUrl);
    }
    this.objectUrls.clear();
    this.fetchPromises.clear();
  }
}

export const mediaStorage = new MediaStorage();