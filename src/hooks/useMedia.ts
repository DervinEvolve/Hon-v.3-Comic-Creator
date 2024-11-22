import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaService } from '../utils/mediaService';

interface UseMediaReturn {
  isLoading: boolean;
  error: string | null;
  objectUrl: string | null;
  retryLoad: () => void;
}

export function useMedia(url: string | null): UseMediaReturn {
  const [state, setState] = useState({
    isLoading: true,
    error: null as string | null,
    objectUrl: null as string | null,
  });
  
  const mountedRef = useRef(true);
  const previousUrlRef = useRef(url);
  const loadAttempts = useRef(0);

  const loadMedia = useCallback(async () => {
    if (!url) {
      setState({ isLoading: false, error: null, objectUrl: null });
      return;
    }

    // Skip if nothing changed and we have a valid URL
    if (previousUrlRef.current === url && state.objectUrl) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    loadAttempts.current = 0;

    try {
      const objectUrl = await mediaService.load(url);
      if (mountedRef.current) {
        previousUrlRef.current = url;
        setState({ isLoading: false, error: null, objectUrl });
      }
    } catch (err) {
      if (mountedRef.current) {
        setState({ isLoading: false, error: 'Failed to load media', objectUrl: null });
      }
    }
  }, [url, state.objectUrl]);

  const retryLoad = useCallback(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  return {
    ...state,
    retryLoad
  };
}