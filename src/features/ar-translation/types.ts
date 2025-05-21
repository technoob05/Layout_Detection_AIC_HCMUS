import { OCREngine } from "./api/arTranslationApi";
import { TranslationEngine } from "./api/translationEngines";

export interface DetectedTextBlock {
  id: string;
  text: string;
  translatedText?: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isTranslating?: boolean;
  translatedWith?: TranslationEngine;
}

export type ARTranslationMode = 'realtime' | 'capture';

export interface ARTranslationSettings {
  mode: ARTranslationMode;
  sourceLanguage: string;
  targetLanguage: string;
  ocrEngine: OCREngine;
  translationEngine: TranslationEngine;
  enableAutoTranslate: boolean;
  showOriginalText: boolean;
  apiKey: string;
  translationTimeout?: number;
  fallbackEngineOrder?: TranslationEngine[];
  overlayOpacity: number;
}

export interface ARTranslationState {
  isLoading: boolean;
  isRecording: boolean;
  detectedBlocks: DetectedTextBlock[];
  selectedBlock: DetectedTextBlock | null;
  settings: ARTranslationSettings;
  capturedImage?: string;
  capturedBlocks?: {
    original: DetectedTextBlock[];
    translated: DetectedTextBlock[];
  };
  activeTab: 'camera' | 'upload' | 'screenshot';
  error?: string;
} 