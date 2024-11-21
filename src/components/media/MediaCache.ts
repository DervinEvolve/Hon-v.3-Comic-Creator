class MediaCacheManager {
  private cache = new Map<string, {
    blob: Blob;
    objectUrl: string;
    timestamp: number;
  }>();
  private readonly maxSize = 200; // Increased cache size
  private readonly ttl = 24 * 60 * 60 * 1000; // 24 hours

  async load(url: string) {
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
        credentials: 'omit',
        mode: 'cors',
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      this.cache.set(url, {
        blob,
        objectUrl,
        timestamp: Date.now(),
      });
      
      return { blob, objectUrl };
    } catch (error) {
      console.error('Error loading media:', error);
      throw error;
    }
  }

  get(url: string) {
    const item = this.cache.get(url);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.remove(url);
      return null;
    }

    return item;
  }

  set(url: string, blob: Blob) {
    if (this.cache.size >= this.maxSize) {
      this.removeOldest();
    }

    const objectUrl = URL.createObjectURL(blob);
    this.cache.set(url, {
      blob,
      objectUrl,
      timestamp: Date.now(),
    });
    return objectUrl;
  }

  remove(url: string) {
    const item = this.cache.get(url);
    if (item) {
      URL.revokeObjectURL(item.objectUrl);
      this.cache.delete(url);
    }
  }

  private removeOldest() {
    const oldest = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
    if (oldest) {
      this.remove(oldest[0]);
    }
  }

  clear() {
    for (const [url] of this.cache.entries()) {
      this.remove(url);
    }
  }
}

export const mediaCache = new MediaCacheManager();