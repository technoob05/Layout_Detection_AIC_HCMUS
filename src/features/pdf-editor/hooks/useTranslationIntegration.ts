import { useState, useCallback } from 'react';
import { Annotation } from '../types';
import { Notification } from '@/components/ui/notification-toast';

// Mock translation service for the hackathon
const mockTranslate = async (text: string, sourceLanguage: string, targetLanguage: string): Promise<string> => {
  console.log(`Translating from ${sourceLanguage} to ${targetLanguage}: "${text}"`);
  
  // Add artificial delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple mock translations for demo purposes
  const mockTranslations: Record<string, Record<string, string>> = {
    'en': {
      'vi': 'Đây là bản dịch tiếng Việt',
      'fr': 'Voici la traduction en français',
      'es': 'Esta es la traducción en español',
      'de': 'Hier ist die deutsche Übersetzung',
      'ja': 'これは日本語の翻訳です',
      'zh': '这是中文翻译'
    },
    'auto': {
      'en': 'This is the English translation',
      'vi': 'Đây là bản dịch tiếng Việt',
      'fr': 'Voici la traduction en français',
      'es': 'Esta es la traducción en español',
      'de': 'Hier ist die deutsche Übersetzung',
      'ja': 'これは日本語の翻訳です',
      'zh': '这是中文翻译'
    }
  };
  
  // Return mock translation if available, otherwise append target language code
  return mockTranslations[sourceLanguage]?.[targetLanguage] || 
    `[${targetLanguage.toUpperCase()}] ${text}`;
};

interface UseTranslationIntegrationProps {
  updateAnnotation: (annotation: Annotation) => void;
}

export function useTranslationIntegration({ updateAnnotation }: UseTranslationIntegrationProps) {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [currentTranslationId, setCurrentTranslationId] = useState<string | null>(null);

  // Translate the content of an annotation
  const translateAnnotation = useCallback(async (annotation: Annotation): Promise<void> => {
    if (!annotation.content || isTranslating) return;
    
    const { id, content, sourceLanguage = 'auto', targetLanguage = 'en' } = annotation;
    
    setIsTranslating(true);
    setCurrentTranslationId(id);
    
    try {
      // Call translation service
      const translatedContent = await mockTranslate(content, sourceLanguage, targetLanguage);
      
      // Update the annotation with translated content
      updateAnnotation({
        ...annotation,
        translatedContent
      });
      
      Notification.success('Translation complete', {
        description: `Translated from ${sourceLanguage} to ${targetLanguage}`
      });
    } catch (error) {
      console.error('Translation error:', error);
      Notification.error('Translation failed', {
        description: 'Could not translate the content. Please try again.'
      });
    } finally {
      setIsTranslating(false);
      setCurrentTranslationId(null);
    }
  }, [isTranslating, updateAnnotation]);

  // Translate selected text and create a translation annotation
  const translateSelectedText = useCallback(async (
    text: string,
    addTranslationAnnotation: (text: string, x: number, y: number, width: number, height: number) => Annotation,
    sourceLanguage: string,
    targetLanguage: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> => {
    if (!text || isTranslating) return;
    
    setIsTranslating(true);
    
    try {
      // Create translation annotation with original text
      const annotation = addTranslationAnnotation(text, x, y, width, height);
      
      setCurrentTranslationId(annotation.id);
      
      // Call translation service
      const translatedContent = await mockTranslate(text, sourceLanguage, targetLanguage);
      
      // Update the annotation with translated content
      updateAnnotation({
        ...annotation,
        translatedContent
      });
      
      Notification.success('Translation complete', {
        description: `Translated from ${sourceLanguage} to ${targetLanguage}`
      });
    } catch (error) {
      console.error('Translation error:', error);
      Notification.error('Translation failed', {
        description: 'Could not translate the selected text. Please try again.'
      });
    } finally {
      setIsTranslating(false);
      setCurrentTranslationId(null);
    }
  }, [isTranslating, updateAnnotation]);

  // Get available languages for translation
  const getAvailableLanguages = useCallback((): { code: string, name: string }[] => {
    return [
      { code: 'auto', name: 'Auto Detect' },
      { code: 'en', name: 'English' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'fr', name: 'French' },
      { code: 'es', name: 'Spanish' },
      { code: 'de', name: 'German' },
      { code: 'ja', name: 'Japanese' },
      { code: 'zh', name: 'Chinese' }
    ];
  }, []);

  return {
    isTranslating,
    currentTranslationId,
    translateAnnotation,
    translateSelectedText,
    getAvailableLanguages
  };
} 