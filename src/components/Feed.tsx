import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { useComicStore } from '../store/useComicStore';
import { Comic } from '../types';

export const Feed: React.FC = () => {
  const { publishedComics, setCurrentComic } = useComicStore();
  const [loadedCovers, setLoadedCovers] = useState<Record<string, boolean>>({});
  const [supportedComics, setSupportedComics] = useState<Set<string>>(new Set());

  // Reuse cover loading logic from ComicGrid
  useEffect(() => {
    const preloadCovers = async () => {
      const loadCover = async (comic: Comic): Promise<boolean> => {
        if (!comic.coverImage) return true;

        try {
          return new Promise((resolve) => {
            const element = comic.coverType === 'video' || comic.coverType === 'gif'
              ? document.createElement('video')
              : new Image();

            const timeoutId = setTimeout(() => {
              element.src = '';
              setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
              resolve(false);
            }, 10000);

            const handleLoad = () => {
              clearTimeout(timeoutId);
              setLoadedCovers(prev => ({ ...prev, [comic.id]: true }));
              resolve(true);
            };

            const handleError = () => {
              clearTimeout(timeoutId);
              setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
              resolve(false);
            };

            if (element instanceof HTMLVideoElement) {
              element.onloadeddata = handleLoad;
              element.onerror = handleError;
            } else {
              element.onload = handleLoad;
              element.onerror = handleError;
            }

            element.src = comic.coverImage;
            if (element instanceof HTMLVideoElement) {
              element.load();
            }
          });
        } catch (error) {
          console.error('Failed to load cover:', error);
          return false;
        }
      };

      await Promise.all(publishedComics.map(loadCover));
    };

    preloadCovers();
  }, [publishedComics]);

  const handleSupportClick = (e: React.MouseEvent, comic: Comic) => {
    e.stopPropagation(); // Prevent opening the comic when clicking support button
    // TODO: Add Solana payment modal logic here
    setSupportedComics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(comic.id)) {
        newSet.delete(comic.id);
      } else {
        newSet.add(comic.id);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Discover Comics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedComics.map((comic) => (
          <div 
            key={comic.id} 
            className="relative h-80 bg-gray-800 rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => setCurrentComic(comic)} // Add click handler to open comic
          >
            <div className="absolute inset-0">
              {comic.coverImage ? (
                loadedCovers[comic.id] ? (
                  comic.coverType === 'video' || comic.coverType === 'gif' ? (
                    <video
                      src={comic.coverImage}
                      className="w-full h-full object-cover"
                      style={comic.coverPosition ? {
                        objectPosition: `${comic.coverPosition.x}% ${comic.coverPosition.y}%`,
                        transform: `scale(${comic.coverPosition.scale})`,
                      } : undefined}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                      style={comic.coverPosition ? {
                        objectPosition: `${comic.coverPosition.x}% ${comic.coverPosition.y}%`,
                        transform: `scale(${comic.coverPosition.scale})`,
                      } : undefined}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse">Loading cover...</div>
                  </div>
                )
              ) : null}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">{comic.title}</h2>
                    <p className="text-sm text-gray-300">by {comic.creator}</p>
                  </div>
                  <button
                    onClick={(e) => handleSupportClick(e, comic)}
                    className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                      supportedComics.has(comic.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-green-500 hover:text-white'
                    }`}
                    title="Support Creator"
                  >
                    <Gift className={`w-5 h-5 ${supportedComics.has(comic.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
