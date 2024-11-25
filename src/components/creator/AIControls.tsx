import { useState } from 'react';
import { Wand2, Pencil } from 'lucide-react';

interface AIControlsProps {
  onGenerate: (prompt: string) => Promise<void>;
  onEdit: (prompt: string, imageUrl: string) => Promise<void>;
  selectedImageUrl?: string;
}

export const AIControls: React.FC<AIControlsProps> = ({ onGenerate, onEdit, selectedImageUrl }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      if (selectedImageUrl) {
        await onEdit(prompt, selectedImageUrl);
      } else {
        await onGenerate(prompt);
      }
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
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
    </div>
  );
}; 