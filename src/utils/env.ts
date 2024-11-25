/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
}


function validateEnv(): ImportMetaEnv {
  const env = import.meta.env;

  if (!env.VITE_CLOUDINARY_CLOUD_NAME) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME is required');
  }

  if (!env.VITE_CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET is required');
  }

  return {
    VITE_CLOUDINARY_CLOUD_NAME: env.VITE_CLOUDINARY_CLOUD_NAME,
    VITE_CLOUDINARY_UPLOAD_PRESET: env.VITE_CLOUDINARY_UPLOAD_PRESET,
    VITE_CLOUDINARY_API_KEY: env.VITE_CLOUDINARY_API_KEY
  };
}

export const env = validateEnv();