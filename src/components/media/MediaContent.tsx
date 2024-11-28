import React, { useState, useEffect } from 'react';
import { MediaError } from './MediaError';
import { MediaLoading } from './MediaLoading';

interface MediaContentProps {
  url: string;
  type: "image" | "video" | "gif";
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  onLoad?: () => void;
}

const MediaContent: React.FC<MediaContentProps> = ({ 
  url, 
  type, 
  className = '',
  style = {},
  onError,
  onLoad 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setError(null);
  }, [url]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError('Failed to load media');
    setIsLoaded(false);
    onError?.();
  };

  if (error) {
    return <MediaError message={error} onRetry={() => setError(null)} />;
  }

  if (!isLoaded) {
    return <MediaLoading />;
  }

  const commonProps = {
    className: `${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
    onError: handleError,
    style: {
      objectFit: 'cover' as const,
      width: '100%',
      height: '100%',
      backgroundColor: '#1a1a1a',
      ...style
    }
  };

  if (type === 'video' || type === 'gif') {
    return (
      <video
        {...commonProps}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={handleLoad}
      />
    );
  }

  return (
    <img
      {...commonProps}
      src={url}
      alt=""
      loading="eager"
      decoding="async"
      onLoad={handleLoad}
    />
  );
};

export default React.memo(MediaContent);