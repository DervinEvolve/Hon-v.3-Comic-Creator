import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { mediaCache } from '../../utils/mediaCache';
import { useInView } from 'react-intersection-observer';

interface MediaContentProps {
  url: string;
  type: 'image' | 'video' | 'gif';
  onLoad?: () => void;
  onError?: () => void;
}

const MediaContent: React.FC<MediaContentProps> = ({ url, type, onLoad, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const retryCount = useRef(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (mediaUrl) {
        mediaCache.revoke(url);
      }
    };
  }, [url, mediaUrl]);

  useEffect(() => {
    if (!url || !inView) return;

    const loadMedia = async () => {
      try {
        // Check cache first
        const cached = await mediaCache.get(url);
        if (cached && mountedRef.current) {
          setMediaUrl(cached);
          setIsLoading(false);
          onLoad?.();
          return;
        }

        // Load and cache if not found
        const objectUrl = await mediaCache.load(url);
        if (mountedRef.current) {
          setMediaUrl(objectUrl);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (err) {
        if (mountedRef.current) {
          console.error('Media loading error:', err);
          setError('Failed to load media');
          setIsLoading(false);
          onError?.();
        }
      }
    };

    loadMedia();
  }, [url, inView, onLoad, onError]);

  const handleRetry = async () => {
    if (!url) return;
    
    setError(null);
    setIsLoading(true);
    retryCount.current = 0;

    try {
      await mediaCache.clear(url); // Clear failed entry
      const objectUrl = await mediaCache.load(url);
      if (mountedRef.current) {
        setMediaUrl(objectUrl);
        setIsLoading(false);
        onLoad?.();
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to load media');
        setIsLoading(false);
        onError?.();
      }
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white gap-4 p-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-gray-300 text-center">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const mediaProps = {
    ref,
    className: "w-full h-full object-contain",
    onError: () => {
      setError('Failed to load media');
      onError?.();
    }
  };

  if (isLoading || !mediaUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (type === 'video' || type === 'gif') {
    return (
      <video
        {...mediaProps}
        src={mediaUrl}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => onLoad?.()}
      />
    );
  }

  return (
    <img
      {...mediaProps}
      src={mediaUrl}
      alt=""
      onLoad={() => onLoad?.()}
      loading="eager"
      decoding="async"
    />
  );
};

export default React.memo(MediaContent);