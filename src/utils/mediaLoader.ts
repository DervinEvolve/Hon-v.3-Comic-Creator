import { nanoid } from 'nanoid';
import { set, get, del } from 'idb-keyval';

interface CacheEntry {
  blob: Blob;
  objectUrl: string;
  timestamp: number;
  id: string;
}

class MediaLoader {
  private cache = new Map<string, CacheEntry>();
  private loadPromises = new Map<string, Promise<string>>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours

  async load(url: string): Promise<string> {
    if (!url) throw new Error('URL is required');

    // Handle blob URLs directly
    if (url.startsWith('blob:')) {
      return url;
    }

    // Check memory cache first
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.objectUrl;
    }

    // Check for existing load promise
    const existingPromise = this.loadPromises.get(url);
    if (existingPromise) return existingPromise;

    // Create and store new load promise
    const loadPromise = this.loadWithRetry(url);
    this.loadPromises.set(url, loadPromise);

    try {
      const objectUrl = await loadPromise;
      this.loadPromises.delete(url);
      return objectUrl;
    } catch (error) {
      this.loadPromises.delete(url);
      throw error;
    }
  }

  private async loadWithRetry(url: string, retries = 3): Promise<string> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        // Try IndexedDB first
        const stored = await this.loadFromIndexedDB(url);
        if (stored) return stored;

        // Then try network fetch
        return await this.fetchAndCache(url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to load media after retries');
  }

  private async loadFromIndexedDB(url: string): Promise<string | null> {
    try {
      const stored: CacheEntry | undefined = await get(url);
      if (stored && Date.now() - stored.timestamp < this.TTL) {
        const objectUrl = URL.createObjectURL(stored.blob);
        const entry = { ...stored, objectUrl };
        this.cache.set(url, entry);
        return objectUrl;
      }
      return null;
    } catch (error) {
      console.warn('IndexedDB access failed:', error);
      return null;
    }
  }

  private async fetchAndCache(url: string): Promise<string> {
    const blob = await this.fetchBlob(url);
    return this.cacheMedia(url, blob);
  }

  private async fetchBlob(url: string): Promise<Blob> {
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
      return await response.blob();
    } catch (error) {
      // Fallback to image loading for images
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return this.loadImageAsBlob(url);
      }
      throw error;
    }
  }

  private async loadImageAsBlob(url: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/png',
          0.95
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  private async cacheMedia(url: string, blob: Blob): Promise<string> {
    const entry: CacheEntry = {
      blob,
      objectUrl: URL.createObjectURL(blob),
      timestamp: Date.now(),
      id: nanoid()
    };

    this.cache.set(url, entry);
    
    try {
      await set(url, entry);
    } catch (error) {
      console.warn('Failed to store in IndexedDB:', error);
    }

    return entry.objectUrl;
  }

  async clearCache(): Promise<void> {
    // Revoke all object URLs
    for (const entry of this.cache.values()) {
      URL.revokeObjectURL(entry.objectUrl);
    }

    this.cache.clear();
    this.loadPromises.clear();

    try {
      await del('mediaKeys');
    } catch (error) {
      console.warn('Failed to clear IndexedDB cache:', error);
    }
  }
}

export const mediaLoader = new MediaLoader();