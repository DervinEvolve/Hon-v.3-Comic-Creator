import React, { useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMedia } from '../../hooks/useMedia';
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
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const { isLoading, error, objectUrl, retryLoad } = useMedia(inView ? url : null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  if (error) {
    return <MediaError message={error} onRetry={retryLoad} />;
  }

  if (!inView || isLoading || !objectUrl) {
    return <div ref={ref}><MediaLoading /></div>;
  }

  const commonProps = {
    ref,
    className: `w-full h-full object-contain transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`,
    onLoad: handleLoad,
    onError: handleError,
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