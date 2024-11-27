import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Layout, Save, Send, Wand2, BookOpen } from 'lucide-react';
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
import { mediaService } from '../utils/mediaService';

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
  const [selectedPanelForEdit, setSelectedPanelForEdit] = useState<Panel | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    if (currentComic) {
      const newPageTemplates = [...(currentComic.pageTemplates || [])];
      newPageTemplates[currentPageIndex] = template;
      
      const updatedComic = {
        ...currentComic,
        pageTemplates: newPageTemplates,
        lastModified: new Date()
      };
      
      setCurrentComic(updatedComic);
    }
  };

  const handleGenerateImage = async (prompt: string): Promise<string> => {
    try {
      const imageUrl = await fluxService.generateImage(prompt);
      if (!imageUrl) {
        throw new Error('No image URL returned from generation');
      }
      const panel: Panel = {
        id: nanoid(),
        type: 'image',
        url: imageUrl,
        size: 'medium',
        aspectRatio: 1,
        position: { row: 0, col: 0 }
      };
      addPanel(panel, currentPageIndex);
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    }
  };

  const handleEditImage = async (prompt: string, imageUrl: string): Promise<void> => {
    try {
      const editedImageUrl = await fluxService.editImage(prompt, imageUrl);
      if (selectedPanelForEdit) {
        updatePanel({
          ...selectedPanelForEdit,
          url: editedImageUrl
        }, currentPageIndex);
      }
    } catch (error) {
      console.error('Failed to edit image:', error);
      throw error;
    }
  };

  const handleAddPanel = (panel: Panel) => {
    addPanel(panel, currentPageIndex);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!selectedTemplate) return;

    const currentPanels = currentComic?.pages[currentPageIndex] || [];
    const emptyAreas = selectedTemplate.layout.areas.filter(area => 
      !currentPanels.some(panel => 
        panel.position.row === area.position.row && 
        panel.position.col === area.position.col
      )
    );

    for (let i = 0; i < Math.min(acceptedFiles.length, emptyAreas.length); i++) {
      const file = acceptedFiles[i];
      const area = emptyAreas[i];
      
      try {
        const url = await mediaService.upload(file);
        const panel: Panel = {
          id: nanoid(),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url,
          size: area.size,
          aspectRatio: 1,
          position: {
            row: area.position.row,
            col: area.position.col,
            rowSpan: area.position.rowSpan,
            colSpan: area.position.colSpan,
          }
        };
        addPanel(panel, currentPageIndex);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'image/gif': [],
    },
    multiple: true,
  });

  const handleSave = async () => {
    if (!currentComic) return;
    setIsSaving(true);
    try {
      await saveDraft(currentComic);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!currentComic) return;
    try {
      await publishComic(currentComic);
    } catch (error) {
      console.error('Failed to publish comic:', error);
    }
  };

  if (!currentComic) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <TitleEditor />
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentComic(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Comics</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Publish</span>
            </button>
          </div>
        </header>

        {/* Template Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <Layout className="w-5 h-5 mr-2" />
            Choose a Layout Template
          </h2>
          <TemplateSelector onSelect={handleTemplateSelect} />
        </div>

        {/* Cover Uploader */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Comic Cover</h2>
          <CoverUploader />
        </div>

        {/* Panel Grid and Content Area */}
        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* AI Controls */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <Wand2 className="w-5 h-5 mr-2" />
                AI Image Generation
              </h2>
              <AIControls 
                onGenerate={handleGenerateImage}
                onEdit={handleEditImage}
                selectedImageUrl={selectedPanelForEdit?.url}
                onClearSelection={() => setSelectedPanelForEdit(null)}
                onAddPanel={handleAddPanel}
              />
            </div>

            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors mb-6 ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-gray-600">Drag & drop files here, or click to select files</p>
                <p className="text-sm text-gray-500">Supports images, videos, and GIFs</p>
              </div>
            </div>

            {/* Panel Grid */}
            <div>
              <PanelGrid
                template={selectedTemplate}
                panels={currentComic?.pages[currentPageIndex] || []}
                onUpdatePanel={(panel) => updatePanel(panel, currentPageIndex)}
                onRemovePanel={(panelId) => removePanel(panelId, currentPageIndex)}
                onReorderPanels={(start, end) => reorderPanels(start, end, currentPageIndex)}
                onPanelSelect={setSelectedPanelForEdit}
              />
            </div>
          </div>
        )}

        {/* Page Manager */}
        <PageManager />
      </div>
    </div>
  );
};