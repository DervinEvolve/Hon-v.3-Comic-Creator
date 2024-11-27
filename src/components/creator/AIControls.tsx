import { useState } from 'react';
import { Wand2, Pencil, X, Download } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Panel } from '../../types';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

interface AIControlsProps {
  onGenerate: (prompt: string) => Promise<string>;
  onEdit: (prompt: string, imageUrl: string) => Promise<void>;
  selectedImageUrl?: string;
  onClearSelection?: () => void;
  onAddPanel: (panel: Panel) => void;
}

export const AIControls: React.FC<AIControlsProps> = ({ 
  onGenerate, 
  onEdit, 
  selectedImageUrl, 
  onClearSelection,
  onAddPanel 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      if (selectedImageUrl) {
        await onEdit(prompt, selectedImageUrl);
        onClearSelection?.();
      } else {
        const generatedUrl = await onGenerate(prompt);
        if (generatedUrl) {
          setGeneratedImages(prev => [{
            url: generatedUrl,
            prompt: prompt,
            timestamp: new Date()
          }, ...prev].slice(0, 10));
          setShowGallery(true);
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-${prompt.slice(0, 30)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleImageClick = (img: GeneratedImage) => {
    const panel: Panel = {
      id: nanoid(),
      type: 'image',
      url: img.url,
      caption: img.prompt,
      size: 'medium',
      aspectRatio: 1,
      position: { row: 0, col: 0 }
    };
    onAddPanel(panel);
    onClearSelection?.();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="prompt-input" className="sr-only">
          {selectedImageUrl ? "Edit image prompt" : "Generate image prompt"}
        </label>
        <input
          id="prompt-input"
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={selectedImageUrl ? "Describe how to edit this image..." : "Describe the image you want to generate..."}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <span className="animate-spin">⌛</span>
          ) : selectedImageUrl ? (
            <><Pencil className="w-4 h-4" /> Edit</>
          ) : (
            <><Wand2 className="w-4 h-4" /> Generate</>
          )}
        </button>
      </form>

      {/* Generated Images Gallery */}
      {showGallery && generatedImages.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Recent Generations</h3>
            <button
              onClick={() => setShowGallery(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {generatedImages.map((img, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                draggable
                onDragStart={(e) => handleDragStart(e, img.url)}
                onClick={() => handleImageClick(img)}
              >
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg">
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img.url, img.prompt);
                      }}
                      className="p-1 bg-white rounded-full hover:bg-gray-100"
                      title="Download image"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.prompt.slice(0, 50)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 