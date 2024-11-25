import React, { useEffect, useState, useCallback } from 'react';
import { useMedia } from '../hooks/useMedia';
import { MediaError } from './MediaError';
import { MediaLoading } from './MediaLoading';

interface MediaContentProps {
  url: string;
  type?: 'image' | 'video' | 'gif';
  onLoad?: () => void;
  onError?: () => void;
}

const MediaContent: React.FC<MediaContentProps> = React.memo(({ url, type = 'image', onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isLoading, error, objectUrl, retryLoad } = useMedia(url);

  useEffect(() => {
    if (error) {
      onError?.();
    }
  }, [error, onError]);

  const handleLoad = useCallback(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [isLoaded, onLoad]);

  if (error) {
    return <MediaError message={error} onRetry={retryLoad} />;
  }

  if (isLoading || !objectUrl) {
    return <MediaLoading />;
  }

  const commonProps = {
    className: `w-full h-full object-cover transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`,
    onError: () => onError?.(),
  };

  if (type === 'video' || type === 'gif') {
    return (
      <video
        {...commonProps}
        src={objectUrl}
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        onLoadedData={handleLoad}
      />
    );
  }

  return (
    <img
      {...commonProps}
      src={objectUrl}
      alt=""
      loading="eager"
      decoding="async"
      crossOrigin="anonymous"
      onLoad={handleLoad}
    />
  );
});

MediaContent.displayName = 'MediaContent';

export default MediaContent;