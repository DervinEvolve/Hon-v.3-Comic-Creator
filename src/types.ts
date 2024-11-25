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
  url: string;
  type: 'image' | 'video' | 'gif';
  size?: 'small' | 'medium' | 'large';
  aspectRatio: number;
  caption?: string;
  position: {
    row: number;
    col: number;
  };
  captionPosition?: {
    x: number;
    y: number;
  };
  captionStyle?: {
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: string;
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
    areas: {
      size: Panel['size'];
      position: Panel['position'];
    }[];
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
  createdAt: Date;
  lastModified: Date;
}