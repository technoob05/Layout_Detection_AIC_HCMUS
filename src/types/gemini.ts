// Gemini Service Types

export interface TranslationPair {
  original: string;
  translated: string;
}

export interface ObjectDetectionResult {
  objectName: string;
  translatedName: string;
  culturalInsight?: string;
}

// YouTube source or uploaded video
export type VideoSource = 
  | { youtubeUrl: string }
  | { base64Data: string; mimeType: string };

// Gemini Service Function Types
export interface GeminiService {
  geminiTranslateImageText: (
    base64ImageData: string,
    mimeType: string,
    targetLanguageCode: string,
    targetLanguageName: string
  ) => Promise<TranslationPair[]>;
  
  geminiIdentifyObjectsAndTranslate: (
    base64ImageData: string,
    mimeType: string,
    targetLanguageCode: string,
    targetLanguageName: string
  ) => Promise<ObjectDetectionResult[]>;
  
  geminiTranslateTextOnly: (
    textToTranslate: string,
    targetLanguageCode: string,
    targetLanguageName: string
  ) => Promise<string>;
  
  geminiTranscribeVideo: (
    videoSource: VideoSource
  ) => Promise<string>;
} 