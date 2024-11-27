export interface CaptionPosition {
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
  vertical: 'top' | 'middle' | 'bottom';
}

export interface CaptionStyle {
  fontSize: number;
  fontFamily: string;
  backgroundColor: 'black' | 'white';
  opacity: number;
}

export interface CoverPosition {
  x: number;
  y: number;
  scale: number;
}

export interface Panel {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  size: 'small' | 'medium' | 'large';
  aspectRatio: number;
  position: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
  caption?: string;
  captionPosition?: {
    x: number;
    y: number;
    vertical: 'top' | 'bottom';
    align: 'left' | 'center' | 'right';
  };
  captionStyle?: {
    fontSize: number;
    fontFamily: string;
    backgroundColor: 'black' | 'white';
    opacity: number;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  layout: {
    rows: number;
    cols: number;
    areas: Array<{
      size: 'small' | 'medium' | 'large';
      position: {
        row: number;
        col: number;
        rowSpan?: number;
        colSpan?: number;
      };
    }>;
  };
}

export interface Comic {
  id: string;
  title: string;
  creator: string;
  coverImage: string;
  coverType: 'image' | 'video' | 'gif';
  coverPosition?: {
    x: number;
    y: number;
    scale: number;
  };
  pages: Panel[][];
  pageTemplates: (Template | null)[];
  createdAt: Date;
  lastModified: Date;
}