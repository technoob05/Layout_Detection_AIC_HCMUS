import { useState } from 'react';
import { 
  translateHtmlContent, 
  fetchWebContent, 
  translateUrlWithGeminiContext, 
  translateStructuredHtml 
} from '../services/webTranslationService';
import { TranslatedWebContent } from '../types';

export type TranslationMode = 'regular' | 'structured';

export const useWebTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalHtml, setOriginalHtml] = useState<string>('');
  const [translatedHtml, setTranslatedHtml] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('');
  const [translationMode, setTranslationMode] = useState<TranslationMode>('structured');

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setOriginalHtml('');
    setTranslatedHtml(null);
    setUrl('');
  };

  /**
   * Loads content from URL using Gemini's URL context
   * @param url URL to fetch content from
   */
  const loadFromUrl = async (urlToFetch: string) => {
    setIsLoading(true);
    setError(null);
    setUrl(urlToFetch);
    
    try {
      const content = await fetchWebContent(urlToFetch);
      setOriginalHtml(content);
      setTranslatedHtml(null);
      return content;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch content');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Translates URL directly using Gemini's URL context
   * @param urlToTranslate URL to translate
   * @param targetLanguageCode Language code (e.g., 'es', 'fr')
   * @param targetLanguageName Language name (e.g., 'Spanish', 'French')
   */
  const translateUrl = async (urlToTranslate: string, targetLanguageCode: string, targetLanguageName: string) => {
    setIsLoading(true);
    setError(null);
    setUrl(urlToTranslate);
    
    try {
      const result = await translateUrlWithGeminiContext(
        urlToTranslate,
        targetLanguageCode,
        targetLanguageName
      );
      
      setOriginalHtml(result.originalHtml);
      setTranslatedHtml(result.translatedHtml);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to translate URL');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sets raw HTML content as original content
   * @param html HTML content
   */
  const setContent = (html: string) => {
    setOriginalHtml(html);
    setTranslatedHtml(null);
    setError(null);
  };

  /**
   * Changes the translation mode
   * @param mode New translation mode
   */
  const changeTranslationMode = (mode: TranslationMode) => {
    setTranslationMode(mode);
  };

  /**
   * Translates the current content to the target language
   * @param targetLanguageCode Language code (e.g., 'es', 'fr')
   * @param targetLanguageName Language name (e.g., 'Spanish', 'French')
   */
  const translateContent = async (targetLanguageCode: string, targetLanguageName: string) => {
    if (!originalHtml) {
      setError('No content to translate. Please load or enter content first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      let result: TranslatedWebContent;
      
      // Use the appropriate translation function based on mode
      if (translationMode === 'structured') {
        result = await translateStructuredHtml(
          originalHtml,
          targetLanguageCode,
          targetLanguageName
        );
      } else {
        result = await translateHtmlContent(
          originalHtml,
          targetLanguageCode,
          targetLanguageName
        );
      }
      
      setTranslatedHtml(result.translatedHtml);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Translation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    originalHtml,
    translatedHtml,
    url,
    translationMode,
    loadFromUrl,
    translateUrl,
    setContent,
    translateContent,
    changeTranslationMode,
    resetState,
  };
}; 