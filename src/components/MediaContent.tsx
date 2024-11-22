import React, { useEffect } from 'react';
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
  const { isLoading, error, objectUrl, retryLoad } = useMedia(url);

  useEffect(() => {
    if (!isLoading && !error && objectUrl) {
      onLoad?.();
    }
  }, [isLoading, error, objectUrl, onLoad]);

  useEffect(() => {
    if (error) {
      onError?.();
    }
  }, [error, onError]);

  if (error) {
    return <MediaError message={error} onRetry={retryLoad} />;
  }

  if (isLoading || !objectUrl) {
    return <MediaLoading />;
  }

  const commonProps = {
    className: "w-full h-full object-contain",
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
    />
  );
});

MediaContent.displayName = 'MediaContent';

export default MediaContent;