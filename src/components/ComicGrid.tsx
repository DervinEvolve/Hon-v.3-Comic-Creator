import React, { useState, useEffect } from 'react';
import { useComicStore } from '../store/useComicStore';
import { Book, Edit2, Trash2, Save, Send } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Comic } from '../types';

export const ComicGrid: React.FC = () => {
  const { 
    publishedComics, 
    draftComics,
    setCurrentComic, 
    editComic, 
    toggleCreatorMode, 
    unpublishComic,
    deleteDraft,
    loadDraft 
  } = useComicStore();
  const [loadedCovers, setLoadedCovers] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

  const comics = activeTab === 'published' ? publishedComics : draftComics;

  useEffect(() => {
    const preloadCovers = async () => {
      const loadCover = async (comic: Comic): Promise<boolean> => {
        if (!comic.coverImage) return true;

        try {
          console.log('Attempting to load cover:', {
            comicId: comic.id,
            coverUrl: comic.coverImage,
            coverType: comic.coverType
          });

          const element = comic.coverType === 'video' || comic.coverType === 'gif'
            ? document.createElement('video')
            : new Image();

          return new Promise((resolve) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
              element.src = '';
              console.error('Cover load timeout:', {
                comicId: comic.id,
                coverUrl: comic.coverImage
              });
              setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
              resolve(false);
            }, 10000);

            const handleError = () => {
              clearTimeout(timeoutId);
              console.error('Cover load error:', {
                comicId: comic.id,
                coverUrl: comic.coverImage,
                element: element instanceof HTMLVideoElement ? 'video' : 'image'
              });
              setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
              resolve(false);
            };

            const cleanup = () => {
              clearTimeout(timeoutId);
              element.src = '';
              element.remove();
            };

            const handleLoad = () => {
              cleanup();
              setLoadedCovers(prev => ({ ...prev, [comic.id]: true }));
              resolve(true);
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

      await Promise.all(comics.map(loadCover));
    };

    preloadCovers();
  }, [comics]);

  const handleCreateNew = () => {
    const newComic: Comic = {
      id: nanoid(),
      title: 'Untitled Comic',
      creator: 'Anonymous',
      coverImage: '',
      coverType: 'image',
      pages: [[]],
      createdAt: new Date(),
      lastModified: new Date()
    };
    setCurrentComic(newComic);
    toggleCreatorMode();
  };

  const handleEdit = (e: React.MouseEvent, comic: Comic) => {
    e.preventDefault();
    e.stopPropagation();
    editComic(comic);
  };

  const handleDelete = (e: React.MouseEvent, comic: Comic) => {
    e.preventDefault();
    e.stopPropagation();
    const message = activeTab === 'published' 
      ? 'Are you sure you want to unpublish this comic?' 
      : 'Are you sure you want to delete this draft?';
    
    if (window.confirm(message)) {
      if (activeTab === 'published') {
        unpublishComic(comic.id);
      } else {
        deleteDraft(comic.id);
      }
    }
  };

  const handleComicClick = (comic: Comic) => {
    if (activeTab === 'drafts') {
      loadDraft(comic.id);
    } else {
      setCurrentComic(comic);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">My Comics</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'published'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Send className="w-4 h-4 inline-block mr-2" />
            Published
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'drafts'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Save className="w-4 h-4 inline-block mr-2" />
            Drafts
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Comic Card */}
        <div
          onClick={handleCreateNew}
          className="relative h-80 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors group cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCreateNew();
            }
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Book className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <p className="text-lg font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
              Create New Comic
            </p>
          </div>
        </div>

        {/* Comics Grid */}
        {comics.map((comic) => (
          <div
            key={comic.id}
            className="relative h-80 bg-gray-800 rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => handleComicClick(comic)}
          >
            {/* Comic Cover */}
            <div className="absolute inset-0">
              {comic.coverImage ? (
                loadedCovers[comic.id] ? (
                  comic.coverType === 'video' || comic.coverType === 'gif' ? (
                    <video
                      key={comic.coverImage}
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
                      onError={(e) => {
                        console.error('Video load error:', e);
                        setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
                      }}
                    />
                  ) : (
                    <img
                      key={comic.coverImage}
                      src={comic.coverImage}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                      style={comic.coverPosition ? {
                        objectPosition: `${comic.coverPosition.x}% ${comic.coverPosition.y}%`,
                        transform: `scale(${comic.coverPosition.scale})`,
                      } : undefined}
                      onError={(e) => {
                        console.error('Image load error:', e);
                        setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
                      }}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-sm text-gray-500">Loading cover...</div>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-sm text-gray-500">No cover image</div>
                </div>
              )}
            </div>

            {/* Comic Info Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-xl font-bold text-white mb-1">{comic.title}</h2>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{comic.creator}</span>
                  <span>{comic.pages.length} pages</span>
                </div>
                {comic.lastModified && (
                  <div className="text-xs text-gray-400 mt-1">
                    Last modified: {new Date(comic.lastModified).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEdit(e, comic)}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                title="Edit Comic"
              >
                <Edit2 className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={(e) => handleDelete(e, comic)}
                className="p-2 bg-white/90 rounded-full hover:bg-white hover:text-red-500 transition-colors"
                title={activeTab === 'published' ? 'Unpublish Comic' : 'Delete Draft'}
              >
                <Trash2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};