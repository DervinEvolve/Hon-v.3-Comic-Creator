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
      // Check for existing fetch promise
      const existingPromise = this.fetchPromises.get(url);
      if (existingPromise) return existingPromise;

      // For blob URLs, store directly
      if (url.startsWith('blob:')) {
        const response = await fetch(url);
        const blob = await response.blob();
        return this.store(url, blob);
      }

      // Create new fetch promise
      const fetchPromise = (async () => {
        try {
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
        } catch (error) {
          this.fetchPromises.delete(url);
          throw error;
        }
      })();

      this.fetchPromises.set(url, fetchPromise);
      return fetchPromise;

    } catch (error) {
      console.error('Error fetching media:', error);
      // Try alternative fetch method for images
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          
          return new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
              if (blob) {
                const objectUrl = await this.store(url, blob);
                resolve(objectUrl);
              } else {
                reject(new Error('Failed to convert image to blob'));
              }
            }, 'image/png');
          });
        } catch (imgError) {
          console.error('Error with alternative image loading:', imgError);
          throw error; // Throw original error if alternative method fails
        }
      }
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