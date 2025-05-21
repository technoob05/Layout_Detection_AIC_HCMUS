import { geminiApi } from '@/features/pdf-translator/api/geminiApi';
import axios from 'axios';

export type TranslationEngine = 'gemini' | 'google' | 'libre' | 'local' | 'libre-translate-local' | 'transformers-local';

export interface TranslationEngineConfig {
  name: string;
  description: string;
  requiresApiKey: boolean;
  isOffline: boolean;
}

export const TRANSLATION_ENGINES: Record<TranslationEngine, TranslationEngineConfig> = {
  gemini: {
    name: 'Gemini AI',
    description: 'High-quality AI translation powered by Google Gemini',
    requiresApiKey: true,
    isOffline: false
  },
  google: {
    name: 'Google Translate',
    description: 'Industry standard translation via Google Translate API',
    requiresApiKey: true,
    isOffline: false
  },
  libre: {
    name: 'LibreTranslate',
    description: 'Open source machine translation (free)',
    requiresApiKey: false,
    isOffline: false
  },
  'libre-translate-local': {
    name: 'LibreTranslate (Local)',
    description: 'Local LibreTranslate server for better reliability',
    requiresApiKey: false,
    isOffline: true
  },
  'transformers-local': {
    name: 'Local ML Translation',
    description: 'Browser-based machine translation with Transformers.js',
    requiresApiKey: false,
    isOffline: true
  },
  local: {
    name: 'Offline Translation',
    description: 'Basic translation using local dictionaries (works offline)',
    requiresApiKey: false,
    isOffline: true
  }
};

// Language dictionaries for offline translation (very basic)
const BASIC_DICTIONARIES: Record<string, Record<string, Record<string, string>>> = {
  en: {
    fr: {
      'hello': 'bonjour',
      'world': 'monde',
      'welcome': 'bienvenue',
      'thank you': 'merci',
      'yes': 'oui',
      'no': 'non',
      'please': 's\'il vous plaît',
      'goodbye': 'au revoir',
      'book': 'livre',
      'food': 'nourriture',
      'water': 'eau',
      'time': 'temps',
      'day': 'jour',
      'night': 'nuit',
      'sun': 'soleil',
      'moon': 'lune',
      'car': 'voiture',
      'house': 'maison',
      'language': 'langue',
      'translate': 'traduire'
    },
    es: {
      'hello': 'hola',
      'world': 'mundo',
      'welcome': 'bienvenido',
      'thank you': 'gracias',
      'yes': 'sí',
      'no': 'no',
      'please': 'por favor',
      'goodbye': 'adiós',
      'book': 'libro',
      'food': 'comida',
      'water': 'agua',
      'time': 'tiempo',
      'day': 'día',
      'night': 'noche',
      'sun': 'sol',
      'moon': 'luna',
      'car': 'coche',
      'house': 'casa',
      'language': 'idioma',
      'translate': 'traducir'
    },
    vi: {
      'hello': 'xin chào',
      'world': 'thế giới',
      'welcome': 'chào mừng',
      'thank you': 'cảm ơn',
      'yes': 'có',
      'no': 'không',
      'please': 'làm ơn',
      'goodbye': 'tạm biệt',
      'book': 'sách',
      'food': 'thức ăn',
      'water': 'nước',
      'time': 'thời gian',
      'day': 'ngày',
      'night': 'đêm',
      'sun': 'mặt trời',
      'moon': 'mặt trăng',
      'car': 'xe hơi',
      'house': 'nhà',
      'language': 'ngôn ngữ',
      'translate': 'dịch'
    }
  }
};

/**
 * Translates text using specified engine
 * @returns Object containing translated text, the engine used, and whether a rate limit was encountered
 */
export const translateWithEngine = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  engine: TranslationEngine,
  apiKey?: string,
  fallbackEngineOrder?: TranslationEngine[]
): Promise<{ 
  text: string; 
  usedEngine: TranslationEngine; 
  wasRateLimited: boolean;
}> => {
  try {
    let translatedText: string;
    
    switch (engine) {
      case 'gemini':
        translatedText = await translateWithGemini(text, sourceLanguage, targetLanguage);
        break;
      
      case 'google':
        translatedText = await translateWithGoogle(text, sourceLanguage, targetLanguage, apiKey);
        break;
      
      case 'libre':
        translatedText = await translateWithLibre(text, sourceLanguage, targetLanguage);
        break;
        
      case 'libre-translate-local':
        translatedText = await translateWithLibreLocal(text, sourceLanguage, targetLanguage);
        break;
        
      case 'transformers-local':
        translatedText = await translateWithTransformers(text, sourceLanguage, targetLanguage);
        break;
        
      case 'local':
        translatedText = translateOffline(text, sourceLanguage, targetLanguage);
        break;
        
      default:
        throw new Error(`Unknown translation engine: ${engine}`);
    }
    
    return { 
      text: translatedText, 
      usedEngine: engine,
      wasRateLimited: false 
    };
  } catch (error) {
    console.error(`Error in ${engine} translation:`, error);
    
    // Check if it's a rate limiting error
    const isRateLimitError = error instanceof Error && 
      (error.message === 'RATE_LIMIT_EXCEEDED' || 
       error.message.includes('rate limit') || 
       error.message.includes('429'));
    
    if (isRateLimitError) {
      console.warn(`Rate limit exceeded for ${engine}. Trying fallback engines.`);
    }
    
    // If we have fallback engines defined, try them in order
    if (fallbackEngineOrder && fallbackEngineOrder.length > 0) {
      console.log(`Attempting fallback translation with engines: ${fallbackEngineOrder.join(', ')}`);
      
      // Filter out the current engine to avoid loops
      const availableFallbacks = fallbackEngineOrder.filter(e => e !== engine);
      
      // Try each fallback engine in order
      for (const fallbackEngine of availableFallbacks) {
        try {
          console.log(`Trying fallback translation with ${fallbackEngine}`);
          const result = await translateWithEngine(
            text, 
            sourceLanguage, 
            targetLanguage, 
            fallbackEngine, 
            apiKey,
            [] // Empty array to prevent infinite recursion
          );
          return { 
            ...result, 
            usedEngine: fallbackEngine,
            wasRateLimited: isRateLimitError || result.wasRateLimited
          };
        } catch (fallbackError) {
          console.error(`Fallback translation with ${fallbackEngine} failed:`, fallbackError);
          // Continue to next fallback engine
        }
      }
    }
    
    // As a last resort, try offline translation
    try {
      console.log(`All translation engines failed. Falling back to offline translation for "${text}"`);
      const offlineTranslation = translateOffline(text, sourceLanguage, targetLanguage);
      return { 
        text: offlineTranslation, 
        usedEngine: 'local',
        wasRateLimited: isRateLimitError
      };
    } catch {
      return { 
        text: `[Translation Error: ${text}]`, 
        usedEngine: 'local',
        wasRateLimited: isRateLimitError
      };
    }
  }
};

/**
 * Translate text using Gemini API
 */
const translateWithGemini = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
  Return only the translated text without any explanations:
  
  "${text}"`;
  
  const translation = await geminiApi.generateText(prompt, {
    temperature: 0.2,
    maxOutputTokens: 1024
  });
  
  return translation;
};

/**
 * Translate text using Google Translate API
 */
const translateWithGoogle = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Google Translate API key is required');
  }
  
  try {
    const url = 'https://translation.googleapis.com/language/translate/v2';
    const response = await axios.post(
      `${url}?key=${apiKey}`,
      {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }
    );
    
    if (response.data?.data?.translations?.[0]?.translatedText) {
      return response.data.data.translations[0].translatedText;
    } else {
      throw new Error('Invalid response from Google Translate API');
    }
  } catch (error) {
    console.error('Google Translate API error:', error);
    throw error;
  }
};

/**
 * Translate text using LibreTranslate (free, open source)
 */
const translateWithLibre = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  try {
    // Use a public LibreTranslate instance (or set up your own)
    const url = 'https://libretranslate.de/translate';
    
    const response = await axios.post(url, {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data?.translatedText) {
      return response.data.translatedText;
    } else {
      throw new Error('Invalid response from LibreTranslate');
    }
  } catch (error) {
    console.error('LibreTranslate error:', error);
    throw error;
  }
};

/**
 * Translate text using local LibreTranslate server
 */
const translateWithLibreLocal = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  try {
    // Connect to a locally hosted LibreTranslate server
    // Default port is usually 5000, but can be configured
    const url = 'http://localhost:5000/translate';
    
    const response = await axios.post(url, {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000 // 3 second timeout to fail fast if server is down
    });
    
    if (response.data?.translatedText) {
      return response.data.translatedText;
    } else {
      throw new Error('Invalid response from local LibreTranslate server');
    }
  } catch (error) {
    console.error('Local LibreTranslate error:', error);
    throw error;
  }
};

/**
 * Translate text using Transformers.js (browser-based machine translation)
 */
const translateWithTransformers = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  try {
    // Simple wordlist-based translation as immediate fallback if transformers fails
    const simpleTranslate = () => {
      return translateOffline(text, sourceLanguage, targetLanguage);
    };
    
    // If text is very short (less than 5 characters), use the simple dictionary approach
    // This avoids loading large ML models for simple words
    if (text.length < 5) {
      return simpleTranslate();
    }
    
    // Check if we're offline first
    if (!navigator.onLine) {
      console.warn('Browser is offline, using dictionary translation');
      return simpleTranslate();
    }
    
    try {
      // Try to dynamically import the package
      const transformersModule = await Promise.race([
        import('@xenova/transformers').catch(() => null),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)) // 3s timeout
      ]);
      
      if (!transformersModule || !transformersModule.pipeline) {
        console.warn('Failed to load Transformers.js module');
        return simpleTranslate();
      }
      
      // Language codes for Transformers models use different format
      const getModelLanguageCode = (code: string): string => {
        const mapping: Record<string, string> = {
          'en': 'en_XX', // English
          'fr': 'fr_XX', // French
          'de': 'de_DE', // German
          'es': 'es_XX', // Spanish
          'pt': 'pt_XX', // Portuguese
          'it': 'it_IT', // Italian
          'ru': 'ru_RU', // Russian
          'nl': 'nl_XX', // Dutch
          'zh': 'zh_CN', // Chinese
          'ar': 'ar_AR', // Arabic
          'cs': 'cs_CZ', // Czech
          'ja': 'ja_XX', // Japanese
          'pl': 'pl_PL', // Polish
          'vi': 'vi_VN', // Vietnamese
        };
        return mapping[code] || code;
      };
      
      // Setup timeout to avoid hanging if model loading takes too long
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Model loading timed out')), 7000);
      });
      
      // Convert language codes to model format
      const sourceCode = getModelLanguageCode(sourceLanguage);
      const targetCode = getModelLanguageCode(targetLanguage);
      
      const { pipeline } = transformersModule;
      
      // Create a race between the model loading/translation and a timeout
      const translationPromise = (async () => {
        try {
          // Load a small model for better browser performance
          const translator = await pipeline('translation', 'Xenova/nllb-200-distilled-600M', {
            quantized: true,
            progress_callback: (progress: { progress?: number }) => {
              if (progress && typeof progress.progress !== 'undefined') {
                console.log(`Loading model: ${Math.round(progress.progress * 100)}%`);
              }
            }
          });
          
          // Define type for the parameters
          interface TranslationParams {
            src_lang: string;
            tgt_lang: string;
            max_length: number;
          }
          
          // Translate the text
          const result = await translator(text, {
            src_lang: sourceCode,
            tgt_lang: targetCode,
            max_length: 512
          } as TranslationParams);
          
          // Verify we have valid result 
          if (result && Array.isArray(result) && result[0] && 
              typeof result[0] === 'object' && 'translation_text' in result[0]) {
            return result[0].translation_text;
          } else {
            console.warn('Invalid translation result structure:', result);
            throw new Error('Invalid translation result');
          }
        } catch (innerError) {
          console.error('Translation model processing error:', innerError);
          throw innerError;
        }
      })();
      
      // Return the translation result, or the fallback if it times out
      return await Promise.race([translationPromise, timeoutPromise]);
    } catch (error) {
      console.warn('Transformers.js failed or timed out:', error);
      return simpleTranslate();
    }
  } catch (error) {
    console.error('Transformers.js translation error:', error);
    // Last resort fallback
    return text;
  }
};

/**
 * Translate text offline using basic dictionaries
 */
const translateOffline = (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): string => {
  // Very simple offline translation using basic dictionary
  // In a real app, you would use a more comprehensive offline translation system
  
  // Check if dictionary exists
  if (!BASIC_DICTIONARIES[sourceLanguage] || !BASIC_DICTIONARIES[sourceLanguage][targetLanguage]) {
    return `[Offline translation not available for ${sourceLanguage} to ${targetLanguage}]`;
  }
  
  const dictionary = BASIC_DICTIONARIES[sourceLanguage][targetLanguage];
  
  // For simple words, check direct translation
  if (dictionary[text.toLowerCase()]) {
    return dictionary[text.toLowerCase()];
  }
  
  // For sentences, try to translate word by word
  const words = text.split(' ');
  const translatedWords = words.map(word => {
    const lowerWord = word.toLowerCase();
    return dictionary[lowerWord] || word;
  });
  
  return translatedWords.join(' ');
}; 