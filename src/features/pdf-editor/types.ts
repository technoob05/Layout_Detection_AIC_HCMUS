export type AnnotationType = 
  | 'highlight' 
  | 'underline' 
  | 'strikethrough'
  | 'text'
  | 'drawing'
  | 'rectangle'
  | 'ellipse'
  | 'arrow'
  | 'translation';

export interface Point {
  x: number;
  y: number;
}

export interface AnnotationStyle {
  color: string;
  opacity: number;
  thickness?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: Point[];
  };
  content?: string;
  translatedContent?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  style: AnnotationStyle;
  createdAt: Date;
  updatedAt: Date;
}

export interface PdfEditorState {
  pdfDocument: any; // PDF.js document type
  currentPage: number;
  totalPages: number;
  scale: number;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  selectedTool: AnnotationType | null;
  isEditing: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  activeTranslationTask?: string;
} 