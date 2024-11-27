import React, { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Panel, Template } from '../../types';
import { DraggablePanel } from './DraggablePanel';
import { useComicStore } from '../../store/useComicStore';
import { nanoid } from 'nanoid';

interface PanelGridProps {
  template: Template;
  panels: Panel[];
  onUpdatePanel: (panel: Panel) => void;
  onRemovePanel: (panelId: string) => void;
  onReorderPanels: (start: number, end: number) => void;
  onPanelSelect: (panel: Panel | null) => void;
}

export const PanelGrid: React.FC<PanelGridProps> = ({
  template,
  panels,
  onUpdatePanel,
  onRemovePanel,
  onReorderPanels,
  onPanelSelect,
}) => {
  const { currentPageIndex, addPanel } = useComicStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const panel = panels.find(p => p.id === active.id);
    if (panel) {
      onPanelSelect(panel);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = panels.findIndex((p) => p.id === active.id);
      const newIndex = panels.findIndex((p) => p.id === over.id);
      onReorderPanels(oldIndex, newIndex);
    }
    onPanelSelect(null);
  };

  const handleDrop = useCallback(async (e: React.DragEvent, area: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = e.dataTransfer.getData('text/plain');
    if (url) {
      const panel: Panel = {
        id: nanoid(),
        type: 'image',
        url,
        size: area.size,
        position: {
          row: area.position.row,
          col: area.position.col,
          rowSpan: area.position.rowSpan,
          colSpan: area.position.colSpan,
        },
        aspectRatio: 1
      };
      addPanel(panel, currentPageIndex);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const type = file.type.includes('video') ? 'video' : 
                file.type.includes('gif') ? 'gif' : 'image';

    const mediaUrl = URL.createObjectURL(file);
    const panel: Panel = {
      id: nanoid(),
      type,
      url: mediaUrl,
      size: area.size,
      position: {
        row: area.position.row,
        col: area.position.col,
        rowSpan: area.position.rowSpan,
        colSpan: area.position.colSpan,
      },
      aspectRatio: 1
    };
    
    addPanel(panel, currentPageIndex);
  }, [addPanel, currentPageIndex]);

  const gridStyle = {
    display: 'grid',
    gridTemplateRows: `repeat(${template.layout.rows}, minmax(0, 1fr))`,
    gridTemplateColumns: `repeat(${template.layout.cols}, minmax(0, 1fr))`,
    gap: '1rem',
    width: '100%',
    aspectRatio: '1',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
  };

  const panelsByPosition = new Map(panels.map(panel => [
    `${panel.position.row}-${panel.position.col}`,
    panel
  ]));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        style={gridStyle}
        onDragOver={(e) => e.preventDefault()}
      >
        <SortableContext items={panels.map(p => p.id)} strategy={rectSortingStrategy}>
          {template.layout.areas.map((area) => {
            const key = `${area.position.row}-${area.position.col}`;
            const panel = panelsByPosition.get(key);
            
            return (
              <div
                key={key}
                style={{
                  gridRow: `${area.position.row + 1} / span ${area.position.rowSpan || 1}`,
                  gridColumn: `${area.position.col + 1} / span ${area.position.colSpan || 1}`,
                }}
                className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
                onDrop={(e) => handleDrop(e, area)}
                onDragOver={(e) => e.preventDefault()}
              >
                {panel ? (
                  <DraggablePanel
                    panel={panel}
                    onUpdate={onUpdatePanel}
                    onRemove={onRemovePanel}
                    onSelect={onPanelSelect}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Drop media here
                  </div>
                )}
              </div>
            );
          })}
        </SortableContext>
      </div>
    </DndContext>
  );
};