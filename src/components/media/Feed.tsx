import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { useComicStore } from '../../store/useComicStore';
import MediaContent from './MediaContent';
import { Comic } from '../../types';
import { SupportModal } from './SupportModal';

export const Feed: React.FC = () => {
  const { publishedComics, setCurrentComic } = useComicStore();
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [supportedComics, setSupportedComics] = useState<Set<string>>(new Set());

  const handleSupportClick = (e: React.MouseEvent, comic: Comic) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedComic(comic);
  };

  const handleSupportSuccess = (comicId: string) => {
    setSupportedComics(prev => {
      const newSet = new Set(prev);
      newSet.add(comicId);
      return newSet;
    });
    setSelectedComic(null);
  };

  const handleModalClose = () => {
    setSelectedComic(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Discover Comics</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(publishedComics) && publishedComics.map((comic) => (
          <div key={comic.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div 
              className="relative h-80 cursor-pointer group" 
              onClick={() => setCurrentComic(comic)}
            >
              <div className="absolute inset-0">
                {comic.coverImage && (
                  <MediaContent
                    url={comic.coverImage}
                    type={comic.coverType}
                    className="w-full h-full"
                    style={{
                      objectFit: 'cover',
                      ...(comic.coverPosition && {
                        objectPosition: `${comic.coverPosition.x}% ${comic.coverPosition.y}%`,
                        transform: `scale(${comic.coverPosition.scale})`
                      })
                    }}
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 group-hover:opacity-90 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-white">{comic.title || 'Untitled'}</h2>
                      <p className="text-sm text-gray-300">by {comic.creator || 'Anonymous'}</p>
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
          </div>
        ))}
      </div>

      {selectedComic && (
        <SupportModal
          isOpen={true}
          onClose={handleModalClose}
          comic={selectedComic}
          onSuccess={() => handleSupportSuccess(selectedComic.id)}
        />
      )}
    </div>
  );
};
