import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Layout, Save, Send, Wand2 } from 'lucide-react';
import { useComicStore } from '../store/useComicStore';
import { TemplateSelector } from './creator/TemplateSelector';
import { PanelGrid } from './creator/PanelGrid';
import { TitleEditor } from './creator/TitleEditor';
import { PageManager } from './creator/PageManager';
import { CoverUploader } from './creator/CoverUploader';
import { Template, Panel } from '../types';
import { nanoid } from 'nanoid';
import { AIControls } from './creator/AIControls';
import { fluxService } from '../services/fluxService';

export const Creator: React.FC = () => {
  const { 
    currentComic, 
    currentPageIndex,
    addPanel, 
    updatePanel, 
    removePanel, 
    reorderPanels, 
    publishComic,
    saveDraft,
    setCurrentComic,
  } = useComicStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const media = file.type.includes('video') || file.type.includes('gif')
          ? document.createElement('video')
          : document.createElement('img');

        media.onload = media.onloadedmetadata = () => {
          const aspectRatio = media instanceof HTMLVideoElement 
            ? media.videoWidth / media.videoHeight
            : media.width / media.height;

          const panel: Panel = {
            id: nanoid(),
            type: file.type.includes('video') ? 'video' as const : 
                  file.type.includes('gif') ? 'gif' as const : 'image' as const,
            url: URL.createObjectURL(file),
            caption: '',
            size: 'medium' as const,
            aspectRatio,
            position: { row: 0, col: 0 }
          };
          
          addPanel(panel, currentPageIndex);
        };

        if (media instanceof HTMLVideoElement) {
          media.src = URL.createObjectURL(file);
        } else {
          media.src = URL.createObjectURL(file);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, [addPanel, currentPageIndex]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'image/gif': [],
    },
    multiple: true,
  });

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      if (currentComic && currentComic.pages[0]?.length > 0) {
        await publishComic(currentComic);
        setCurrentComic(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (currentComic) {
        await saveDraft(currentComic);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewMode = () => {
    setCurrentComic(null);
  };

  const currentPagePanels = currentComic?.pages[currentPageIndex] || [];

  useEffect(() => {
    return () => {
      // Cleanup blob URLs when component unmounts
      if (currentComic) {
        currentComic.pages.forEach(page => {
          page.forEach(panel => {
            if (panel.url.startsWith('blob:')) {
              URL.revokeObjectURL(panel.url);
            }
          });
        });
      }
    };
  }, [currentComic]);

  const handleGenerateImage = async (prompt: string) => {
    try {
      const imageUrl = await fluxService.generateImage(prompt);
      const panel: Panel = {
        id: nanoid(),
        type: 'image',
        url: imageUrl,
        caption: prompt,
        size: 'medium',
        aspectRatio: 1, // Will be updated when image loads
        position: { row: 0, col: 0 }
      };
      addPanel(panel, currentPageIndex);
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate image. Please try again.');
    }
  };

  const handleEditImage = async (prompt: string, imageUrl: string) => {
    try {
      const editedImageUrl = await fluxService.editImage(prompt, imageUrl);
      // Update the current panel with the edited image
      const panelToUpdate = currentPagePanels.find(p => p.url === imageUrl);
      if (panelToUpdate) {
        updatePanel({
          ...panelToUpdate,
          url: editedImageUrl
        }, currentPageIndex);
      }
    } catch (error) {
      console.error('Failed to edit image:', error);
      alert('Failed to edit image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <TitleEditor />
          <div className="flex gap-4">
            <button
              onClick={handleViewMode}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Comics
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={!currentComic || isSaving}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={!currentComic?.pages.some(page => page.length > 0) || isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Publish Comic
            </button>
          </div>
        </div>

        {/* Cover Uploader */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Comic Cover</h2>
          <CoverUploader />
        </div>

        {/* Template Selector and Content Upload */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <Layout className="w-5 h-5 mr-2" />
              Choose a Layout Template
            </h2>
            <TemplateSelector onSelect={setSelectedTemplate} />
          </div>

          {/* Add AI Controls */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <Wand2 className="w-5 h-5 mr-2" />
              AI Image Generation
            </h2>
            <AIControls 
              onGenerate={handleGenerateImage}
              onEdit={handleEditImage}
              selectedImageUrl={currentPagePanels.length ? currentPagePanels[0].url : undefined}
            />
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-800">
              Drag 'n' drop images, videos, or GIFs here, or click to select files
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Supported formats: JPG, PNG, GIF, MP4, WebM
            </p>
          </div>
        </div>

        {/* Panel Grid */}
        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Page {currentPageIndex + 1} Layout</h2>
            <PanelGrid
              template={selectedTemplate}
              panels={currentPagePanels}
              onUpdatePanel={(panel) => updatePanel(panel, currentPageIndex)}
              onRemovePanel={(panelId) => removePanel(panelId, currentPageIndex)}
              onReorderPanels={(start, end) => reorderPanels(start, end, currentPageIndex)}
            />
          </div>
        )}
      </div>

      <PageManager />
    </div>
  );
};