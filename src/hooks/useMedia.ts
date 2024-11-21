import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaCache } from '../utils/mediaCache';

export function useMedia(url: string) {
  const [state, setState] = useState({
    isLoading: true,
    error: null as string | null,
    mediaUrl: '',
  });
  
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const loadingPromiseRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (state.mediaUrl && state.mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.mediaUrl);
      }
    };
  }, [state.mediaUrl]);

  const loadMedia = useCallback(async () => {
    if (!url || !mountedRef.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Handle blob URLs directly
      if (url.startsWith('blob:')) {
        setState({ isLoading: false, error: null, mediaUrl: url });
        return;
      }

      // Check if already loading
      if (loadingPromiseRef.current) {
        const mediaUrl = await loadingPromiseRef.current;
        if (mountedRef.current) {
          setState({ isLoading: false, error: null, mediaUrl });
        }
        return;
      }

      // Try to get from cache first
      const cached = await mediaCache.get(url);
      if (cached && mountedRef.current) {
        setState({ isLoading: false, error: null, mediaUrl: cached });
        return;
      }

      // Load and cache if not found
      loadingPromiseRef.current = mediaCache.load(url);
      const mediaUrl = await loadingPromiseRef.current;
      
      if (mountedRef.current) {
        setState({ isLoading: false, error: null, mediaUrl });
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Error loading media:', err);
      setState({
        isLoading: false,
        error: 'Failed to load media',
        mediaUrl: '',
      });
    } finally {
      loadingPromiseRef.current = null;
    }
  }, [url]);

  useEffect(() => {
    loadMedia();
  }, [url, loadMedia]);

  const retry = useCallback(() => {
    if (retryCountRef.current >= 3) {
      setState(prev => ({ ...prev, error: 'Maximum retry attempts reached' }));
      return;
    }
    retryCountRef.current += 1;
    loadMedia();
  }, [loadMedia]);

  return {
    isLoading: state.isLoading,
    error: state.error,
    mediaUrl: state.mediaUrl,
    retry,
  };
}