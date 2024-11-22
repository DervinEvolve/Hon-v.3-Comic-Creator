import { set, get, del } from 'idb-keyval';

interface CachedMedia {
  blob: Blob;
  timestamp: number;
  type: string;
}

class MediaService {
  private memoryCache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<string>>();
  private readonly TTL = 30 * 24 * 60 * 60 * 1000;

  async load(url: string): Promise<string> {
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) return existingPromise;

    const loadPromise = (async () => {
      // Check memory cache first
      const cached = this.memoryCache.get(url);
      if (cached) return cached;

      // Then check IndexedDB
      const dbCached: CachedMedia | undefined = await get(url);
      if (dbCached && Date.now() - dbCached.timestamp <= this.TTL) {
        const objectUrl = URL.createObjectURL(dbCached.blob);
        this.memoryCache.set(url, objectUrl);
        return objectUrl;
      }

      // If not cached, fetch and store
      const blob = await this.fetchBlob(url);
      const objectUrl = URL.createObjectURL(blob);
      this.memoryCache.set(url, objectUrl);
      
      // Store in IndexedDB
      await set(url, {
        blob,
        timestamp: Date.now(),
        type: blob.type
      });

      return objectUrl;
    })();

    this.loadingPromises.set(url, loadPromise);
    try {
      return await loadPromise;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  private async fetchBlob(url: string): Promise<Blob> {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.blob();
    } catch (error) {
      console.error('Failed to fetch blob:', error);
      throw error;
    }
  }

  revoke(url: string): void {
    const objectUrl = this.memoryCache.get(url);
    if (objectUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(objectUrl);
    }
    this.memoryCache.delete(url);
    this.loadingPromises.delete(url);
  }

  async clear(): Promise<void> {
    for (const objectUrl of this.memoryCache.values()) {
      if (objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    }
    this.memoryCache.clear();
    this.loadingPromises.clear();
    await del('mediaCache');
  }

}

export const mediaService = new MediaService();
