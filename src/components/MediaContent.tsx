import React, { useEffect, useState, useCallback } from 'react';
import { useMedia } from '../hooks/useMedia';
import { MediaError } from './MediaError';
import { MediaLoading } from './MediaLoading';

interface MediaContentProps {
  url: string;
  type: "image" | "video" | "gif";
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const MediaContent: React.FC<MediaContentProps> = React.memo(({ 
  url, 
  type, 
  className = '',
  onError,
  onLoad 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isLoading, error, objectUrl, retryLoad } = useMedia(url);

  useEffect(() => {
    setIsLoaded(false);
  }, [url]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  if (error) {
    return <MediaError message={error} onRetry={retryLoad} />;
  }

  if (isLoading || !objectUrl) {
    return <MediaLoading />;
  }

  const commonProps = {
    className: `${className} ${isLoaded ? '' : 'opacity-0'}`,
    onError: handleError,
    style: {
      objectFit: 'cover' as const,
      width: '100%',
      height: '100%',
      backgroundColor: '#1a1a1a'
    }
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
      onLoad={handleLoad}
    />
  );
});

MediaContent.displayName = 'MediaContent';

export default MediaContent;