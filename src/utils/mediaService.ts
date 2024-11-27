import { env } from './env';

class MediaService {
  private objectUrls: Map<string, string> = new Map();

  async load(input: string | File): Promise<string> {
    if (typeof input === 'string') {
      return input;
    }

    const formData = new FormData();
    formData.append('file', input);
    formData.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('api_key', env.VITE_CLOUDINARY_API_KEY);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }

  upload(input: string | File): Promise<string> {
    return this.load(input);
  }

  revoke(url: string): void {
    const objectUrl = this.objectUrls.get(url);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.objectUrls.delete(url);
    }
  }

  async clear(): Promise<void> {
    this.objectUrls.forEach(objectUrl => {
      URL.revokeObjectURL(objectUrl);
    });
    this.objectUrls.clear();
  }
}

export const mediaService = new MediaService();
