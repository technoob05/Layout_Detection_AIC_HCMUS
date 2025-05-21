// Web Translation Types

export interface WebTranslationContent {
  html: string;
  url?: string;
}

export interface TranslatedWebContent {
  originalHtml: string;
  translatedHtml: string;
  url?: string;
}

export type SupportedLanguage = {
  code: string;
  name: string;
  nativeName: string;
};

export interface TranslationResult {
  isLoading: boolean;
  originalContent: string;
  translatedContent: string | null;
  error: string | null;
} 