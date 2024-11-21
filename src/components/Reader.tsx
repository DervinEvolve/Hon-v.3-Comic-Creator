import React, { useState, useCallback } from 'react';
import { useComicStore } from '../store/useComicStore';
import { ChevronLeft, ChevronRight, Edit2, Home } from 'lucide-react';
import { Panel } from '../types';
import MediaContent from './MediaContent';

export const Reader: React.FC = () => {
  const { currentComic, editComic, setCurrentComic } = useComicStore();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loadedPanels, setLoadedPanels] = useState<Set<string>>(new Set());

  if (!currentComic) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">No comic selected</div>
      </div>
    );
  }

  const currentPage = currentComic.pages[currentPageIndex] || [];
  const totalPages = currentComic.pages.length;

  const handlePanelLoad = useCallback((panelId: string) => {
    setLoadedPanels(prev => new Set(prev).add(panelId));
  }, []);

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      setLoadedPanels(new Set());
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setLoadedPanels(new Set());
    }
  };

  const renderPanel = (panel: Panel, index: number) => (
    <div
      key={panel.id || index}
      className={`relative bg-gray-800 rounded-lg overflow-hidden ${
        panel.size === 'large' ? 'col-span-2 row-span-2' :
        panel.size === 'medium' ? 'col-span-1 row-span-1' :
        'col-span-1'
      }`}
      style={{
        minHeight: '300px',
        aspectRatio: panel.aspectRatio || '1',
      }}
    >
      <MediaContent
        url={panel.url}
        type={panel.type}
        onLoad={() => handlePanelLoad(panel.id)}
      />
      {panel.caption && (
        <div
          className="absolute p-2 rounded shadow-lg"
          style={{
            left: `${panel.captionPosition?.x || 50}%`,
            top: `${panel.captionPosition?.y || 90}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: `rgba(0,0,0,0.75)`,
            color: 'white',
            maxWidth: '90%',
          }}
        >
          {panel.caption}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentComic(null)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">{currentComic.title}</h1>
          </div>
          <button
            onClick={() => editComic(currentComic)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPage.map((panel, index) => renderPanel(panel, index))}
        </div>

        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-6 py-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="text-sm font-medium text-gray-700">
            Page {currentPageIndex + 1} of {totalPages}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPageIndex === totalPages - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};