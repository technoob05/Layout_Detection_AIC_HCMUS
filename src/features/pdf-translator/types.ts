import { 
  Language, 
  TranslationOptions, 
  TranslationService, 
  TranslationStatus 
} from "./api/pdfTranslationApi";

export interface ExtractedTextChunk {
  text: string;
  box: number[];
}

export interface ExtractedTextPage {
  page_number: number;
  chunks: ExtractedTextChunk[];
}

export interface ExtractedTextResult {
  pages: ExtractedTextPage[];
}

export interface TranslationTask {
  id: string;
  fileName: string;
  file: File;
  options: TranslationOptions;
  status: TranslationStatus['status'];
  progress: number;
  error?: string;
  startTime: Date;
  completedTime?: Date;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  // New fields for source tracking
  sources?: PdfSource[];
}

// Source reference from the PDF
export interface PdfSource {
  text: string;
  page: number;
  confidence: number;
  startPosition?: number;
  endPosition?: number;
}

// Chat preferences interface
export interface ChatPreferences {
  sourceVisibility: 'always' | 'onHover' | 'onClick' | 'never';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  includeCitations: boolean;
  conversationStyle?: 'concise' | 'balanced' | 'creative';
}

// Chat state interface - for persisting additional session state
export interface ChatState {
  pdfId?: string;  // Reference to the PDF
  pdfTitle?: string;
  userName?: string;
  lastActive?: Date;
  preferences?: ChatPreferences;
  // Add more state properties as needed
}

// Chat session interface
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  state: ChatState;
  createdAt: Date;
  updatedAt: Date;
  threadId?: string; // Support for multi-threading
}

// Session data interface for storage
export interface SessionData<S = ChatState> {
  session: ChatSession;
  state: S;
}

// Session store interface for persistence
export interface SessionStore<S = ChatState> {
  get(sessionId: string): Promise<SessionData<S> | undefined>;
  save(sessionId: string, sessionData: SessionData<S>): Promise<void>;
  delete?(sessionId: string): Promise<void>;
  list?(): Promise<string[]>; // Optional method to list all session IDs
}

// NotebookLM style interfaces
export interface PdfSummary {
  title: string;
  overview: string;
  keyPoints: string[];
  topics: string[];
  pageCount: number;
}

export interface SourceGuide {
  title: string;
  sections: SourceSection[];
}

export interface SourceSection {
  title: string;
  content: string;
  pages: number[];
  highlights?: SourceHighlight[];
}

export interface SourceHighlight {
  text: string;
  page: number;
  position?: { x: number, y: number, width: number, height: number };
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  color?: string;
}

export interface AudioOverview {
  audioUrl?: string;
  transcript: string;
  duration: number;
  isGenerating: boolean;
}

export interface NotebookView {
  type: 'chat' | 'sources' | 'mindmap' | 'audio' | 'notes';
  title: string;
  icon: string;
}

export type {
  Language,
  TranslationOptions,
  TranslationService,
  TranslationStatus
}; 