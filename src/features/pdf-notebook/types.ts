import { ChatMessage, ChatPreferences, PdfSource } from "../pdf-translator/types";

export interface PdfNotebookState {
  isAutoSummaryEnabled: boolean;
  isAudioOverviewEnabled: boolean;
  isMindMapEnabled: boolean;
  selectedSourceId: string | null;
  highlightedText: string | null;
}

export interface PdfSummary {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface PdfAudioOverview {
  id: string;
  audioUrl: string;
  transcript: string;
  createdAt: Date;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface PdfMindMap {
  id: string;
  rootNode: MindMapNode;
  createdAt: Date;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
}

export interface PdfSlide {
  id: string;
  text: string;
  image: string | null;
  mimeType: string | null;
  createdAt: Date;
}

export interface PdfSlideCollection {
  id: string;
  slides: PdfSlide[];
  createdAt: Date;
} 