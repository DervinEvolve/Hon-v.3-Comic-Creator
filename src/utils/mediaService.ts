import { env } from './env';

export const mediaService = {
  async load(input: string | File): Promise<string> {
    if (typeof input === 'string') {
      return input;
    }

    const formData = new FormData();
    formData.append('file', input);
    formData.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('api_key', env.VITE_CLOUDINARY_API_KEY);

    console.log('Upload preset:', env.VITE_CLOUDINARY_UPLOAD_PRESET);
    console.log('Cloud name:', env.VITE_CLOUDINARY_CLOUD_NAME);

    // Debug logging
    console.log('FormData contents:', {
      file: input,
      upload_preset: env.VITE_CLOUDINARY_UPLOAD_PRESET,
      cloudName: env.VITE_CLOUDINARY_CLOUD_NAME
    });

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
        console.error('Upload error details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestURL: `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          preset: env.VITE_CLOUDINARY_UPLOAD_PRESET
        });
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  },

  upload(input: string | File): Promise<string> {
    return this.load(input);
  }
};
