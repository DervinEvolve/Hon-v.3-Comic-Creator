import localforage from 'localforage';

const CACHE_VERSION = 1;
const CACHE_PREFIX = 'comic-media-v' + CACHE_VERSION;

const mediaStore = localforage.createInstance({
  name: CACHE_PREFIX,
  storeName: 'media',
  description: 'Comic media cache'
});

interface CacheEntry {
  blob: Blob;
  timestamp: number;
  version: number;
}

class MediaCache {
  private memoryCache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<string>>();
  private readonly TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

  async get(url: string): Promise<string | null> {
    // Check memory cache first
    const cachedUrl = this.memoryCache.get(url);
    if (cachedUrl) return cachedUrl;

    // Check if already loading
    const loadingPromise = this.loadingPromises.get(url);
    if (loadingPromise) return loadingPromise;

    // Handle blob URLs directly
    if (url.startsWith('blob:')) return url;

    // Check persistent storage
    try {
      const entry: CacheEntry | null = await mediaStore.getItem(url);
      if (entry && entry.version === CACHE_VERSION && Date.now() - entry.timestamp < this.TTL) {
        const objectUrl = URL.createObjectURL(entry.blob);
        this.memoryCache.set(url, objectUrl);
        return objectUrl;
      }
    } catch (error) {
      console.warn('Error reading from cache:', error);
    }

    return null;
  }

  async load(url: string): Promise<string> {
    // Handle blob URLs directly
    if (url.startsWith('blob:')) return url;

    // Check existing caches
    const cached = await this.get(url);
    if (cached) return cached;

    // Create new loading promise
    const loadPromise = this.fetchAndCache(url);
    this.loadingPromises.set(url, loadPromise);

    try {
      const objectUrl = await loadPromise;
      this.loadingPromises.delete(url);
      return objectUrl;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  private async fetchAndCache(url: string, retries = 3): Promise<string> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'force-cache',
          headers: {
            'Accept': 'image/*, video/*, application/octet-stream',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        // Cache in memory
        this.memoryCache.set(url, objectUrl);

        // Cache in persistent storage
        try {
          await mediaStore.setItem(url, {
            blob,
            timestamp: Date.now(),
            version: CACHE_VERSION
          });
        } catch (error) {
          console.warn('Error writing to cache:', error);
        }

        return objectUrl;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to load media');
  }

  async clear(url?: string) {
    if (url) {
      // Clear specific URL
      const objectUrl = this.memoryCache.get(url);
      if (objectUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
      this.memoryCache.delete(url);
      this.loadingPromises.delete(url);
      await mediaStore.removeItem(url);
    } else {
      // Clear all
      for (const objectUrl of this.memoryCache.values()) {
        if (objectUrl.startsWith('blob:')) {
          URL.revokeObjectURL(objectUrl);
        }
      }
      this.memoryCache.clear();
      this.loadingPromises.clear();
      await mediaStore.clear();
    }
  }

  revoke(url: string) {
    const objectUrl = this.memoryCache.get(url);
    if (objectUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(objectUrl);
    }
    this.memoryCache.delete(url);
    this.loadingPromises.delete(url);
  }
}

// Create and export a singleton instance
export const mediaCache = new MediaCache();