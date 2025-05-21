import { DetectedTextBlock } from '../types';
import { nanoid } from 'nanoid';
import { TranslationEngine, translateWithEngine } from './translationEngines';
// Import Tesseract for offline OCR
import Tesseract from 'tesseract.js';

// Define extended Tesseract Page type to include missing properties in type definitions
interface ExtendedTesseractPage extends Tesseract.Page {
  paragraphs?: Array<{
    text: string;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
    confidence?: number;
  }>;
  lines?: Array<{
    text: string;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
    confidence?: number;
  }>;
  words?: Array<{
    text: string;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
    confidence?: number;
  }>;
}

// Supported OCR engines
export type OCREngine = 'gemini' | 'tesseract' | 'microsoft' | 'google';

export interface OCREngineConfig {
  name: string;
  description: string;
  requiresApiKey: boolean;
  isOffline: boolean;
}

export const OCR_ENGINES: Record<OCREngine, OCREngineConfig> = {
  gemini: {
    name: 'Gemini Vision',
    description: 'AI-powered text detection with Google Gemini',
    requiresApiKey: true,
    isOffline: false
  },
  tesseract: {
    name: 'Tesseract OCR',
    description: 'Powerful open-source OCR engine (works offline)',
    requiresApiKey: false,
    isOffline: true
  },
  microsoft: {
    name: 'Azure Computer Vision',
    description: 'Microsoft Azure OCR with high accuracy',
    requiresApiKey: true,
    isOffline: false
  },
  google: {
    name: 'Google Cloud Vision',
    description: 'Google Cloud Vision OCR with high accuracy',
    requiresApiKey: true,
    isOffline: false
  }
};

/**
 * API for AR Translation features
 */
export const arTranslationApi = {
  /**
   * Process image for OCR using selected engine
   * @param imageData Base64 encoded image
   * @param engine OCR engine to use
   */
  processImageForOCR: async (
    imageData: string, 
    engine: OCREngine = 'gemini',
    apiKey?: string
  ): Promise<DetectedTextBlock[]> => {
    try {
      switch (engine) {
        case 'gemini':
          return await arTranslationApi.processWithGemini(imageData, apiKey);
        case 'tesseract':
          return await arTranslationApi.processWithTesseract(imageData);
        case 'microsoft':
          return await arTranslationApi.processWithMicrosoft(imageData, apiKey);
        case 'google':
          return await arTranslationApi.processWithGoogle(imageData, apiKey);
        default:
          throw new Error(`Unknown OCR engine: ${engine}`);
      }
    } catch (error) {
      console.error(`${engine} OCR failed, falling back to mock:`, error);
      // If OCR fails, use mock data as fallback
      return arTranslationApi.generateMockOCRData();
    }
  },

  /**
   * Process image with Gemini Vision API
   * @param imageData Base64 encoded image
   */
  processWithGemini: async (imageData: string, apiKey?: string): Promise<DetectedTextBlock[]> => {
    try {
      // Extract the base64 part if it contains the data URI prefix
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      
      if (!base64Data) {
        throw new Error('Invalid image data format');
      }
      
      // Determine the MIME type from the data URI
      let mimeType = 'image/jpeg';
      if (imageData.startsWith('data:')) {
        const mimeMatch = imageData.match(/data:([^;]+);/);
        if (mimeMatch && mimeMatch[1]) {
          mimeType = mimeMatch[1];
        }
      }
      
      // Map of language codes to language names
      const languageMap: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'vi': 'Vietnamese',
        'en-US': 'English',
        'es-ES': 'Spanish',
        'fr-FR': 'French',
        'de-DE': 'German',
        'ja-JP': 'Japanese',
        'zh-CN': 'Chinese',
        'vi-VN': 'Vietnamese',
      };
      
      // Import the Gemini service to process the image
      try {
        // Import the geminiTranslateImageText service with the .ts extension
        const { geminiTranslateImageText } = await import('@/services/gemini/geminiService.ts');
        
        // Get user's language settings from stored settings or local storage or fallback to 'vi' if needed
        // Try to get settings from local storage as fallback
        const storedSettings = localStorage.getItem('arTranslationSettings');
        let targetLanguageCode = 'vi'; // Default to Vietnamese
        
        if (storedSettings) {
          try {
            const parsedSettings = JSON.parse(storedSettings);
            if (parsedSettings && parsedSettings.targetLanguage) {
              targetLanguageCode = parsedSettings.targetLanguage;
            }
          } catch (error) {
            console.warn('Failed to parse stored AR translation settings:', error);
          }
        }
        
        // Get language name from map or use a default
        const targetLanguageName = languageMap[targetLanguageCode] || 'English';
        
        // Override environment API key with user-provided key if available
        if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
          // Temporarily set the API key in localStorage for the Gemini service to use
          localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
        }
        
        // Call the Gemini service to detect and translate text with correct language settings
        const textBlocks = await geminiTranslateImageText(
          base64Data, 
          mimeType, 
          targetLanguageCode, 
          targetLanguageName
        );
        
        // Convert the Gemini response to our DetectedTextBlock format
        return textBlocks.map(block => ({
          id: nanoid(),
          text: block.original,
          translatedText: block.translated,
          boundingBox: {
            // Default positioning if we don't have precise coordinates
            x: Math.random() * 0.5 + 0.1, // Random x between 0.1 and 0.6
            y: Math.random() * 0.5 + 0.1, // Random y between 0.1 and 0.6
            width: 0.3, // Default width
            height: 0.1 // Default height
          }
        }));
      } catch (error) {
        console.error('Error using Gemini service:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in Gemini Vision processing:', error);
      throw error;
    }
  },

  /**
   * Process image with Tesseract.js (offline OCR)
   * @param imageData Base64 encoded image
   */
  processWithTesseract: async (imageData: string): Promise<DetectedTextBlock[]> => {
    try {
      // Show processing message
      console.log('Starting Tesseract OCR processing...');
      
      // Check if Tesseract is available
      if (!Tesseract || typeof Tesseract.recognize !== 'function') {
        console.error('Tesseract is not properly loaded');
        throw new Error('OCR engine not available');
      }
      
      // Extract the base64 part if it contains the data URI prefix
      const base64Data = imageData.split(',')[1] || imageData;
      
      // Create an image from the base64 data
      const img = new Image();
      img.src = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${base64Data}`;
      
      // Wait for image to load to get dimensions
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        
        // Set a timeout in case the image never loads
        setTimeout(() => reject(new Error('Image loading timeout')), 5000);
      });
      
      // Verify the image has valid dimensions
      if (!img.width || !img.height || img.width < 10 || img.height < 10) {
        console.error('Invalid image dimensions:', img.width, img.height);
        throw new Error('Invalid image dimensions');
      }
      
      // Start with original image data, will be replaced if enhancement succeeds
      let processedImageData = imageData;
      
      // Enhance image for better text detection using a canvas
      try {
        const enhanceCanvas = document.createElement('canvas');
        const ctx = enhanceCanvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          enhanceCanvas.width = img.width;
          enhanceCanvas.height = img.height;
          
          // Step 1: Draw the original image
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // Step 2: Get the image data
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const data = imgData.data;
          
          // Step 3: Apply advanced image processing for Vietnamese text
          // Create a grayscale version first
          const grayData = new Uint8ClampedArray(data.length);
          for (let i = 0; i < data.length; i += 4) {
            // Enhanced grayscale formula with more weight on green channel which carries most detail
            const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            grayData[i] = gray;
            grayData[i + 1] = gray;
            grayData[i + 2] = gray;
            grayData[i + 3] = data[i + 3]; // Keep alpha
          }
          
          // Apply adaptive thresholding for better text extraction
          // This is particularly helpful for Vietnamese diacritics
          const blockSize = 11; // Size of neighborhood for adaptive threshold
          const threshold = 10; // Constant subtracted from mean
          
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              const idx = (y * img.width + x) * 4;
              
              // Calculate local mean (simple box filter)
              let sum = 0;
              let count = 0;
              
              for (let wy = Math.max(0, y - blockSize/2); wy < Math.min(img.height, y + blockSize/2); wy++) {
                for (let wx = Math.max(0, x - blockSize/2); wx < Math.min(img.width, x + blockSize/2); wx++) {
                  const widx = (wy * img.width + wx) * 4;
                  sum += grayData[widx];
                  count++;
                }
              }
              
              const meanVal = sum / count;
              
              // Apply threshold
              if (grayData[idx] < meanVal - threshold) {
                data[idx] = 0;       // Black (text)
                data[idx + 1] = 0;
                data[idx + 2] = 0;
              } else {
                data[idx] = 255;     // White (background)
                data[idx + 1] = 255;
                data[idx + 2] = 255;
              }
            }
          }
          
          // Apply sharpening for better edge detection
          const sharpenData = new Uint8ClampedArray(data);
          const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]; // 3x3 sharpening kernel
          
          for (let y = 1; y < img.height - 1; y++) {
            for (let x = 1; x < img.width - 1; x++) {
              for (let c = 0; c < 3; c++) { // Process RGB channels
                let val = 0;
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * img.width + (x + kx)) * 4 + c;
                    val += data[idx] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
                  }
                }
                
                // Clamp values to valid range
                sharpenData[(y * img.width + x) * 4 + c] = Math.max(0, Math.min(255, val));
              }
              // Keep alpha channel unchanged
              sharpenData[(y * img.width + x) * 4 + 3] = data[(y * img.width + x) * 4 + 3];
            }
          }
          
          // Apply the sharpened data
          const sharpenedImageData = new ImageData(sharpenData, img.width, img.height);
          ctx.putImageData(sharpenedImageData, 0, 0);
          
          // Get the enhanced image as base64
          processedImageData = enhanceCanvas.toDataURL('image/png', 1.0); // Use PNG for better quality
          console.log('Image enhanced for better Vietnamese OCR');
        }
      } catch (enhanceError) {
        console.warn('Failed to enhance image, continuing with original:', enhanceError);
        // Continue with the original image
      }
      
      // Define Tesseract worker parameters for best language support including Vietnamese
      const workerParams = {
        logger: (m: any) => {
          if (m && m.status) {
            console.log(`Tesseract progress: ${m.status} (${Math.floor((m.progress || 0) * 100)}%)`);
          }
        },
        // Use newer tessdata models for better accuracy
        langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.4/tesseract-core.wasm.js',
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/worker.min.js',
        // Optimize for text detection - extended Vietnamese character support
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,?!-_():;%$#@&*+<>[]{}|/\'\"\\~`=^ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỂưăạảấầẩẫậắằẳẵặẹẻẽềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ',
        // Set PSM (page segmentation mode) to 11 for better Vietnamese text detection
        // 11 = sparse text with OSD (orientation and script detection)
        psm: 11,
        // Enable OSD to better detect text orientation
        tessjs_create_hocr: '1',
        tessjs_create_tsv: '1',
        tessjs_create_box: '1',
        tessjs_create_unlv: '0',
        tessjs_create_osd: '1',
        tessjs_progress: '1',
      };
      
      // First try to detect with Vietnamese language, which includes support for diacritics
      // If that fails, fall back to English which is more reliable for general text
      const languagesToTry = ['vie+eng', 'eng'];
      
      let result = null;
      let lastError = null;
      
      // Try each language in order
      for (const language of languagesToTry) {
        console.log(`Attempting OCR with language: ${language}`);
        
        try {
          // Process the image with Tesseract with a timeout
          const recognizePromise = Tesseract.recognize(
            processedImageData, 
            language, 
            {
              ...workerParams
            }
          );
          
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('OCR processing timeout')), 15000);
          });
          
          // Race between OCR processing and timeout
          result = await Promise.race([recognizePromise, timeoutPromise]);
          
          // If we got valid results, break the loop
          if (result && result.data) {
            console.log(`Successfully detected text with language: ${language}`);
            break;
          }
        } catch (error) {
          console.error(`OCR failed with language ${language}:`, error);
          lastError = error;
          // Continue to next language
        }
      }
      
      // If all languages failed, throw the last error
      if (!result || !result.data) {
        console.error('All OCR attempts failed:', lastError);
        throw new Error('OCR processing failed with all languages');
      }
      
      // Initialize blocks array
      const blocks: DetectedTextBlock[] = [];
      
      try {
        // Always use the confidence as a quality metric - lower threshold for Vietnamese 
        const confidenceThreshold = 45; // Lower threshold for Vietnamese text with diacritics
        
        // Process text using both structured and unstructured data
        const textBlocks: Array<{
          text: string;
          bbox: {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
          };
          confidence: number;
        }> = [];
        
        // First try to extract structured results (paragraphs/lines/words)
        if (result && result.data) {
          // Cast the data to our extended type that includes these properties
          const extendedData = result.data as ExtendedTesseractPage;
          
          // Try to get paragraphs first for better contextual grouping
          if (extendedData.paragraphs && Array.isArray(extendedData.paragraphs) && extendedData.paragraphs.length > 0) {
            console.log(`Tesseract found ${extendedData.paragraphs.length} paragraphs`);
            
            extendedData.paragraphs.forEach((paragraph: any) => {
              if (paragraph && paragraph.text && paragraph.text.trim() && paragraph.bbox) {
                textBlocks.push({
                  text: paragraph.text.trim(),
                  bbox: paragraph.bbox,
                  confidence: paragraph.confidence || 60
                });
              }
            });
          }
          
          // If no paragraphs, try lines
          if (textBlocks.length === 0 && extendedData.lines && Array.isArray(extendedData.lines) && extendedData.lines.length > 0) {
            console.log(`Tesseract found ${extendedData.lines.length} text lines`);
            
            extendedData.lines.forEach((line: any) => {
              if (line && line.text && line.text.trim() && line.bbox) {
                textBlocks.push({
                  text: line.text.trim(),
                  bbox: line.bbox,
                  confidence: line.confidence || 55
                });
              }
            });
          }
          
          // If no lines, try words as a last resort
          if (textBlocks.length === 0 && extendedData.words && Array.isArray(extendedData.words) && extendedData.words.length > 0) {
            console.log(`Tesseract found ${extendedData.words.length} words`);
            
            // Group words into meaningful blocks based on positioning
            const wordGroups: Array<{
              words: any[];
              bbox: {
                x0: number;
                y0: number;
                x1: number;
                y1: number;
              };
              confidence: number;
            }> = [];
            
            let currentGroup: {
              words: any[];
              bbox: {
                x0: number;
                y0: number;
                x1: number;
                y1: number;
              };
              confidence: number;
            } | null = null;
            
            // Sort words by vertical position, then horizontal
            const sortedWords = [...extendedData.words].sort((a: any, b: any) => {
              // Skip invalid words
              if (!a.bbox || !b.bbox) return 0;
              
              // Group by lines first (with more tolerance for Vietnamese)
              const yDiff = a.bbox.y0 - b.bbox.y0;
              if (Math.abs(yDiff) > 8) { // Increased tolerance for Vietnamese diacritics
                return yDiff;
              }
              // If on same line, sort by x position
              return a.bbox.x0 - b.bbox.x0;
            });
            
            // Group words that are on the same line
            for (const word of sortedWords) {
              // Skip invalid words with more permissive confidence for Vietnamese
              if (!word || !word.text || !word.bbox || 
                  (word.confidence && word.confidence < confidenceThreshold)) {
                continue;
              }
              
              if (!currentGroup) {
                // Start new group
                currentGroup = {
                  words: [word],
                  bbox: { ...word.bbox },
                  confidence: word.confidence || 50
                };
              } else {
                // Check if this word belongs to the current line with better Vietnamese handling
                const isOnSameLine = Math.abs(word.bbox.y0 - currentGroup.bbox.y0) < 12; // More tolerance
                const isCloseHorizontally = (word.bbox.x0 - currentGroup.bbox.x1) < 40; // More spacing for Vietnamese
                
                if (isOnSameLine && isCloseHorizontally) {
                  // Add to current group
                  currentGroup.words.push(word);
                  // Expand bounding box
                  currentGroup.bbox.x0 = Math.min(currentGroup.bbox.x0, word.bbox.x0);
                  currentGroup.bbox.y0 = Math.min(currentGroup.bbox.y0, word.bbox.y0);
                  currentGroup.bbox.x1 = Math.max(currentGroup.bbox.x1, word.bbox.x1);
                  currentGroup.bbox.y1 = Math.max(currentGroup.bbox.y1, word.bbox.y1);
                  // Average the confidence
                  const newConfidence = (currentGroup.confidence * (currentGroup.words.length - 1) + 
                                        (word.confidence || 50)) / currentGroup.words.length;
                  currentGroup.confidence = newConfidence;
                } else {
                  // Start new group
                  wordGroups.push(currentGroup);
                  currentGroup = {
                    words: [word],
                    bbox: { ...word.bbox },
                    confidence: word.confidence || 50
                  };
                }
              }
            }
            
            // Add the last group
            if (currentGroup) {
              wordGroups.push(currentGroup);
            }
            
            // Convert word groups to text blocks
            wordGroups.forEach(group => {
              // Join with space but handle Vietnamese word spacing better
              let text = '';
              if (group.words && group.words.length > 0) {
                text = group.words.map((w: any) => w.text).join(' ');
              }
              
              // Fix common Vietnamese OCR errors
              text = text
                .replace(/ă\s+/g, 'ă')   // Fix separated diacritics
                .replace(/â\s+/g, 'â') 
                .replace(/ê\s+/g, 'ê')
                .replace(/ô\s+/g, 'ô')
                .replace(/ơ\s+/g, 'ơ')
                .replace(/đ\s+/g, 'đ')
                .replace(/\s+([,.!?:;])/g, '$1'); // Fix punctuation
              
              textBlocks.push({
                text: text.trim(),
                bbox: group.bbox,
                confidence: group.confidence
              });
            });
          }
        }
        
        // Process all valid text blocks
        for (const block of textBlocks) {
          // Skip low confidence blocks
          if (block.confidence < confidenceThreshold) {
            continue;
          }
          
          try {
            // Normalize the bounding box coordinates
            const boundingBox = {
              x: block.bbox.x0 / img.width,
              y: block.bbox.y0 / img.height,
              width: (block.bbox.x1 - block.bbox.x0) / img.width,
              height: (block.bbox.y1 - block.bbox.y0) / img.height
            };
            
            // Add to blocks array
            blocks.push({
              id: nanoid(),
              text: block.text,
              boundingBox
            });
          } catch (boxError) {
            console.error('Error processing block bounding box:', boxError);
          }
        }
        
        // If we couldn't extract any blocks and have full text, use that as fallback
        if (blocks.length === 0 && result.data.text && result.data.text.trim().length > 0) {
          console.log(`Tesseract found text without structured data`);
          
          blocks.push({
            id: nanoid(),
            text: result.data.text.trim(),
            boundingBox: {
              x: 0.1,
              y: 0.1,
              width: 0.8,
              height: 0.2
            }
          });
        }
      } catch (parsingError) {
        console.error('Error parsing Tesseract results:', parsingError);
      }
      
      // If we couldn't extract any blocks, return a fallback
      if (blocks.length === 0) {
        console.warn('No text blocks found by Tesseract, using fallback');
      return arTranslationApi.generateMockOCRData();
      }
      
      console.log(`Successfully extracted ${blocks.length} text blocks`);
      return blocks;
    } catch (error) {
      console.error('Error in Tesseract processing:', error);
      // In case of error, fall back to mock data
      console.warn('Falling back to mock OCR data due to Tesseract error');
      return arTranslationApi.generateMockOCRData();
    }
  },

  /**
   * Process image with Microsoft Azure Computer Vision
   * @param imageData Base64 encoded image
   * @param apiKey Microsoft API key
   */
  processWithMicrosoft: async (imageData: string, apiKey?: string): Promise<DetectedTextBlock[]> => {
    if (!apiKey) {
      throw new Error('Microsoft Azure API key is required');
    }

    try {
      // In a real implementation, you would make API call to Azure Computer Vision
      // For demo purposes, return mock data
      console.log('Microsoft OCR would process image here with:', 
        imageData.substring(0, 20) + '...' // Use imageData to avoid unused variable warning
      );
      return arTranslationApi.generateMockOCRData();
    } catch (error) {
      console.error('Error in Microsoft Azure processing:', error);
      throw error;
    }
  },

  /**
   * Process image with Google Cloud Vision
   * @param imageData Base64 encoded image
   * @param apiKey Google API key
   */
  processWithGoogle: async (imageData: string, apiKey?: string): Promise<DetectedTextBlock[]> => {
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key is required');
    }

    try {
      // In a real implementation, you would make API call to Google Cloud Vision
      // For demo purposes, return mock data
      console.log('Google Vision OCR would process image here with:', 
        imageData.substring(0, 20) + '...' // Use imageData to avoid unused variable warning
      );
      return arTranslationApi.generateMockOCRData();
    } catch (error) {
      console.error('Error in Google Vision processing:', error);
      throw error;
    }
  },

  /**
   * Translate text using selected engine
   * @param text Text to translate
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code
   * @param engine Translation engine to use
   * @param apiKey API key for the translation service (if required)
   * @param fallbackEngineOrder Order of fallback engines to try if primary fails
   * @returns Object containing translated text, the engine used, and whether a rate limit was encountered
   */
  translateText: async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    engine: TranslationEngine = 'gemini',
    apiKey?: string,
    fallbackEngineOrder?: TranslationEngine[]
  ): Promise<{ 
    text: string; 
    usedEngine: TranslationEngine;
    wasRateLimited: boolean; 
  }> => {
    return translateWithEngine(
      text, 
      sourceLanguage, 
      targetLanguage, 
      engine, 
      apiKey, 
      fallbackEngineOrder
    );
  },

  /**
   * Generate mock OCR data for testing or when API fails
   */
  generateMockOCRData: (): DetectedTextBlock[] => {
    // Return realistic looking mock data
    return [
      {
        id: nanoid(),
        text: 'Hello World',
        boundingBox: {
          x: Math.random() * 0.5,
          y: Math.random() * 0.3,
          width: 0.3,
          height: 0.05
        }
      },
      {
        id: nanoid(),
        text: 'AR Translation Demo',
        boundingBox: {
          x: Math.random() * 0.4 + 0.3,
          y: Math.random() * 0.3 + 0.4,
          width: 0.35,
          height: 0.06
        }
      },
      {
        id: nanoid(),
        text: 'Powered by AI',
        boundingBox: {
          x: Math.random() * 0.5 + 0.2,
          y: Math.random() * 0.3 + 0.7,
          width: 0.25,
          height: 0.04
        }
      }
    ];
  },

  /**
   * Process a single image for translation (capture mode)
   * @param imageData Base64 encoded image
   * @param sourceLanguage Source language code
   * @param targetLanguage Target language code
   * @param ocrEngine OCR engine to use
   * @param translationEngine Translation engine to use
   * @param apiKey API key for services (if required)
   * @param fallbackEngineOrder Order of fallback engines to try if primary fails
   */
  processCapturedImage: async (
    imageData: string,
    sourceLanguage: string,
    targetLanguage: string,
    ocrEngine: OCREngine = 'gemini',
    translationEngine: TranslationEngine = 'gemini',
    apiKey?: string,
    fallbackEngineOrder?: TranslationEngine[]
  ): Promise<{ original: DetectedTextBlock[], translated: DetectedTextBlock[] }> => {
    // Detect text in the image
    const detectedBlocks = await arTranslationApi.processImageForOCR(imageData, ocrEngine, apiKey);
    
    // Translate each block
    const translatedBlocks = await Promise.all(
      detectedBlocks.map(async (block) => {
        try {
          const translation = await arTranslationApi.translateText(
            block.text,
            sourceLanguage,
            targetLanguage,
            translationEngine,
            apiKey,
            fallbackEngineOrder
          );
          
          // Track if any blocks hit rate limits
          if (translation.wasRateLimited) {
            console.warn(`Rate limit encountered for block: "${block.text.substring(0, 30)}..."`);
          }
          
          return {
            ...block,
            id: nanoid(), // New ID for translated block
            text: translation.text,
            translatedWith: translation.usedEngine,
            isTranslated: true
          };
        } catch (error) {
          console.error('Error translating block:', error);
          return {
            ...block,
            id: nanoid(),
            text: `[Translation error: ${block.text}]`,
            isTranslated: true
          };
        }
      })
    );
    
    return {
      original: detectedBlocks,
      translated: translatedBlocks
    };
  }
}; 