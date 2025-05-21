import { useState, useRef, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { DetectedTextBlock, ARTranslationSettings, ARTranslationState } from '../types';
import { arTranslationApi } from '../api/arTranslationApi';
import { Notification } from '@/components/ui/notification-toast';
import { TRANSLATION_ENGINES } from '../api/translationEngines';

// This is a mock OCR function - in a real app you would use a library like Tesseract.js
const mockProcessImageForOCR = async (imageData: ImageData): Promise<DetectedTextBlock[]> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would process the image and detect text
  // For demo purposes, we'll return mock data
  return [
    {
      id: nanoid(),
      text: 'Example text detected in camera',
      boundingBox: {
        x: Math.random() * 200,
        y: Math.random() * 200,
        width: 150,
        height: 30
      }
    },
    {
      id: nanoid(),
      text: 'Another text block found',
      boundingBox: {
        x: Math.random() * 200 + 100,
        y: Math.random() * 200 + 100,
        width: 200,
        height: 30
      }
    }
  ];
};

// Mock translation function - would use a real translation API in production
const mockTranslateText = async (text: string, targetLanguage: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return `Translated: ${text} (to ${targetLanguage})`;
};

export function useARTranslation() {
  // Create initial settings optimized for Vietnamese translations
  const defaultSettings: ARTranslationSettings = {
    mode: 'realtime',
    sourceLanguage: 'auto', // Auto-detect source language
    targetLanguage: 'vi',
    ocrEngine: 'tesseract', // Offline OCR engine works best for Vietnamese with our optimizations
    translationEngine: 'gemini', // Gemini handles Vietnamese better than other options
    enableAutoTranslate: true,
    showOriginalText: true,
    apiKey: '',
    translationTimeout: 8000, // Longer timeout for better Vietnamese translations
    fallbackEngineOrder: ['libre', 'google', 'transformers-local'], // Better fallbacks for Vietnamese
    overlayOpacity: 0.9, // Higher opacity for better readability with Vietnamese text
  };
  
  // Initial state
  const [state, setState] = useState<ARTranslationState>({
    isLoading: false,
    isRecording: false,
    detectedBlocks: [],
    selectedBlock: null,
    settings: defaultSettings, // Use our new defaultSettings
    capturedImage: undefined,
    capturedBlocks: undefined,
    activeTab: 'camera'
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  
  // Control how often frames are processed (every 2 seconds)
  const frameProcessingIntervalRef = useRef<number>(2000);
  const lastProcessTimeRef = useRef<number>(0);
  
  // Start camera
  const startCamera = useCallback(async () => {
    try {
      // Check if we have camera permissions first
      if (navigator.mediaDevices === undefined) {
        Notification.error('Camera Access Error', {
          description: 'Your browser does not support camera access. Try using Chrome or Firefox.'
        });
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        setState(prev => ({
          ...prev,
          isRecording: true
        }));
        
        // Show notification
        Notification.success('Camera Started', {
          description: 'Point your camera at text to detect and translate'
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Show error notification
      Notification.error('Camera Access Error', {
        description: 'Could not access your camera. Please check permissions and try again.'
      });
    }
  }, []);
  
  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isRecording: false
    }));
  }, []);
  
  // Convert canvas content to base64 image
  const getImageDataAsBase64 = useCallback(() => {
    if (!canvasRef.current) return null;
    
    try {
      return canvasRef.current.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error getting image data:', error);
      return null;
    }
  }, []);
  
  // Process frame for OCR
  const processFrame = useCallback(async () => {
    // Skip if video or canvas is not ready, or if already processing
    if (!videoRef.current || !canvasRef.current || processingRef.current) return;
    
    // Skip if in capture mode - we only process frames in realtime mode
    if (state.settings.mode === 'capture') return;
    
    const now = Date.now();
    if (now - lastProcessTimeRef.current < frameProcessingIntervalRef.current) return;
    
    lastProcessTimeRef.current = now;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.paused || video.ended) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Set processing flag to avoid multiple concurrent processing
    processingRef.current = true;
    
    try {
      // Get image data as base64
      const imageDataBase64 = getImageDataAsBase64();
      
      if (!imageDataBase64) {
        throw new Error('Failed to get image data');
      }
      
      // Process image for text detection using our API with selected OCR engine
      const detectedBlocks = await arTranslationApi.processImageForOCR(
        imageDataBase64,
        state.settings.ocrEngine,
        state.settings.apiKey
      );
      
      // Update state with detected blocks
      setState(prev => ({
        ...prev,
        detectedBlocks
      }));
      
      // Auto-translate if enabled
      if (state.settings.enableAutoTranslate) {
        for (const block of detectedBlocks) {
          translateBlock(block.id, block.text);
        }
      }
    } catch (error) {
      console.error('Error processing frame:', error);
      Notification.error('Text Detection Error', {
        description: 'Failed to process camera image. Using fallback detection.'
      });
    } finally {
      processingRef.current = false;
    }
  }, [state.settings.ocrEngine, state.settings.apiKey, state.settings.enableAutoTranslate, state.settings.mode, getImageDataAsBase64]);
  
  // Translate a specific text block with better fallback strategy
  const translateBlock = useCallback(async (blockId: string, text: string) => {
    setState(prev => ({
      ...prev,
      detectedBlocks: prev.detectedBlocks.map(block => 
        block.id === blockId ? { ...block, isTranslating: true } : block
      )
    }));
    
    try {
      const translation = await arTranslationApi.translateText(
        text,
        state.settings.sourceLanguage,
        state.settings.targetLanguage,
        state.settings.translationEngine,
        state.settings.apiKey,
        state.settings.fallbackEngineOrder // Pass the fallback order to API
      );
      
      // Display notification if a rate limit was encountered
      if (translation.wasRateLimited) {
        Notification.warning(`Rate Limit Detected`, {
          description: `Switched to ${TRANSLATION_ENGINES[translation.usedEngine].name} due to rate limits.`
        });
      }
      
      // Update state with translated text and the engine that was actually used
      setState(prev => ({
        ...prev,
        detectedBlocks: prev.detectedBlocks.map(block => 
          block.id === blockId ? { 
            ...block, 
            translatedText: translation.text, 
            isTranslating: false,
            translatedWith: translation.usedEngine // Use the engine that was actually used
          } : block
        )
      }));
    } catch (error) {
      console.error('Translation error:', error);
      
      // If all engines failed, update state to show error
      setState(prev => ({
        ...prev,
        detectedBlocks: prev.detectedBlocks.map(block => 
          block.id === blockId ? { 
            ...block, 
            translatedText: `[Translation Error: ${text}]`,
            isTranslating: false 
          } : block
        )
      }));
      
      Notification.error('Translation Error', {
        description: 'Failed to translate text with all available engines. Please try again.'
      });
    }
  }, [
    state.settings.sourceLanguage, 
    state.settings.targetLanguage,
    state.settings.translationEngine,
    state.settings.apiKey,
    state.settings.fallbackEngineOrder
  ]);
  
  // Select a text block
  const selectBlock = useCallback((blockId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedBlock: blockId 
        ? prev.detectedBlocks.find(block => block.id === blockId) || null 
        : null
    }));
  }, []);
  
  // Update settings and also handle tab changes
  const updateSettings = useCallback((newSettings: Partial<ARTranslationSettings>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
    
    // If language or engine changed and there are detected blocks, offer to retranslate
    if (
      (newSettings.sourceLanguage || 
       newSettings.targetLanguage || 
       newSettings.translationEngine) && 
      state.detectedBlocks.length > 0
    ) {
      // Show notification with action
      Notification.info('Translation Settings Changed', {
        description: 'Would you like to retranslate detected text?',
        action: {
          label: 'Retranslate',
          onClick: () => {
            state.detectedBlocks.forEach(block => {
              translateBlock(block.id, block.text);
            });
          }
        }
      });
    }
    
    // If mode changes to 'capture', clear detected blocks
    if (newSettings.mode === 'capture' && state.settings.mode !== 'capture') {
      setState(prev => ({
        ...prev,
        detectedBlocks: []
      }));
    }
  }, [state.detectedBlocks, translateBlock]);
  
  // Set active tab
  const setActiveTab = useCallback((tab: 'camera' | 'upload' | 'screenshot') => {
    setState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, []);
  
  // Capture current frame for translation
  const captureFrame = useCallback(async () => {
    try {
      console.log('Capturing frame...');
      let imageDataBase64: string | null = null;
      
      // Handle case where we're taking a screenshot directly (not from video)
      if (state.activeTab === 'screenshot' && !videoRef.current) {
        const canvas = canvasRef.current;
        if (!canvas) {
          Notification.error('Capture Error', {
            description: 'Canvas is not initialized. Please try again.'
          });
          return;
        }
        
        // For screenshot mode without video, capture the screen
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ 
            video: { mediaSource: 'screen' } 
          });
          
          // Create a video element to hold the stream
          const tempVideo = document.createElement('video');
          tempVideo.srcObject = stream;
          
          // Wait for metadata to load
          await new Promise((resolve) => {
            tempVideo.onloadedmetadata = resolve;
            tempVideo.play();
          });
          
          // Draw to canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');
          
          // Set dimensions based on the screen capture
          canvas.width = tempVideo.videoWidth || 1280;
          canvas.height = tempVideo.videoHeight || 720;
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          
          // Get image and stop stream
          imageDataBase64 = canvas.toDataURL('image/jpeg', 0.9);
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.error('Screen capture error:', error);
          Notification.error('Screen Capture Error', {
            description: 'Failed to capture screen. Please check permissions.'
          });
          return;
        }
      } else {
        // Regular camera capture
        if (!videoRef.current) {
          // Try to start camera if it's not running yet
          try {
            await startCamera();
            // Wait a moment for camera to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!videoRef.current) {
              throw new Error('Failed to initialize camera');
            }
          } catch (error) {
            console.error('Failed to start camera:', error);
            Notification.error('Capture Error', {
              description: 'Camera could not be started. Please check permissions.'
            });
            return;
          }
        }
        
        // Now we should have a valid video reference
        if (!videoRef.current || !canvasRef.current) {
          Notification.error('Capture Error', {
            description: 'Camera is still initializing. Please try again in a moment.'
          });
          return;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Create a new canvas for this capture to avoid modifying the one used for video
        const captureCanvas = document.createElement('canvas');
        const ctx = captureCanvas.getContext('2d');
        
        if (!ctx) {
          Notification.error('Capture Error', {
            description: 'Failed to create capture context.'
          });
          return;
        }
        
        // Handle case where video is not playing yet
        if (video.paused || video.ended || video.videoWidth === 0) {
          Notification.error('Capture Error', {
            description: 'Camera feed is not available or not ready.'
          });
          return;
        }
        
        // Set canvas dimensions to match video
        captureCanvas.width = video.videoWidth || 640;  // Fallback width
        captureCanvas.height = video.videoHeight || 480;  // Fallback height
        
        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Get image data as base64
        imageDataBase64 = captureCanvas.toDataURL('image/jpeg', 0.9);
      }
      
      if (!imageDataBase64) {
        Notification.error('Capture Error', {
          description: 'Failed to capture image. Please try again.'
        });
        return;
      }
      
      // Process the image while keeping the camera running
      await processScreenshot(imageDataBase64);
      console.log('Capture completed successfully');
      
    } catch (error) {
      console.error('Error in capture function:', error);
      Notification.error('Capture Error', {
        description: 'An unexpected error occurred while capturing. Please try again.'
      });
    }
  }, [state.activeTab, startCamera]);
  
  // Helper function to process screenshot
  const processScreenshot = useCallback(async (imageDataBase64: string) => {
    // Show loading notification
    Notification.info('Processing', {
      description: 'Analyzing image for text...'
    });
    
    try {
      console.log('Starting OCR and translation process...');
      
      // Process captured image
      const result = await arTranslationApi.processCapturedImage(
        imageDataBase64,
        state.settings.sourceLanguage,
        state.settings.targetLanguage,
        state.settings.ocrEngine,
        state.settings.translationEngine,
        state.settings.apiKey,
        state.settings.fallbackEngineOrder
      );
      
      console.log('OCR & Translation completed:', result);
      console.log('Found original blocks:', result.original.length);
      console.log('Translated blocks:', result.translated.length);
      
      // Clone the detected blocks for the AR overlay if in camera mode
      if (state.activeTab === 'camera' && state.isRecording) {
        // Add detected blocks to state for AR overlay
        setState(prev => ({
          ...prev,
          detectedBlocks: result.original.map((block, index) => ({
            ...block,
            translatedText: result.translated[index]?.text || '',
            translatedWith: result.translated[index]?.translatedWith
          }))
        }));
      }
      
      // Update state with captured image and results
      // Always store results but don't switch tabs if in camera mode and continuing to use camera
      setState(prev => ({
        ...prev,
        capturedImage: imageDataBase64,
        capturedBlocks: result,
        // Only change tab if not in camera mode or explicitly requested
        activeTab: prev.activeTab === 'camera' && prev.isRecording 
          ? prev.activeTab 
          : 'screenshot'
      }));
      
      // Show success notification with more detail
      Notification.success('Image Processed', {
        description: result.original.length > 0
          ? `Found ${result.original.length} text blocks.` 
          : 'No text was detected. Try with a clearer image.'
      });
      
    } catch (error) {
      console.error('Error processing captured image:', error);
      
      // Provide more helpful error message
      Notification.error('Processing Error', {
        description: 'Failed to process image. Please try again with clearer text or different settings.'
      });
      
      // Create a simple mock result as fallback
      const fallbackBlocks = arTranslationApi.generateMockOCRData();
      console.log('Using fallback blocks due to error:', fallbackBlocks);
      
      setState(prev => ({
        ...prev,
        capturedImage: imageDataBase64,
        capturedBlocks: {
          original: fallbackBlocks,
          translated: fallbackBlocks.map(block => ({
            ...block,
            id: nanoid(),
            text: `[Translation failed for: ${block.text}]`,
            isTranslated: true
          }))
        },
        // Don't change tab if in camera mode
        activeTab: prev.activeTab === 'camera' ? prev.activeTab : 'screenshot'
      }));
    }
  }, [
    state.settings.sourceLanguage, 
    state.settings.targetLanguage,
    state.settings.ocrEngine,
    state.settings.translationEngine,
    state.settings.apiKey,
    state.settings.fallbackEngineOrder,
    state.activeTab,
    state.isRecording
  ]);
  
  // Clear captured image and results
  const clearCapture = useCallback(() => {
    setState(prev => ({
      ...prev,
      capturedImage: undefined,
      capturedBlocks: undefined
    }));
  }, []);
  
  // Animation loop for processing frames
  useEffect(() => {
    if (!state.isRecording) return;
    
    const processFrameLoop = () => {
      processFrame();
      animationFrameRef.current = requestAnimationFrame(processFrameLoop);
    };
    
    processFrameLoop();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isRecording, processFrame]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  // Process an uploaded image file
  const processImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      Notification.error('Invalid File', {
        description: 'Please upload an image file (JPEG, PNG, etc.)'
      });
      return;
    }

    // Show loading notification
    Notification.info('Processing', {
      description: 'Analyzing image for text...'
    });

    try {
      // Convert File to base64
      const imageDataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Process image with OCR and translation
      const result = await arTranslationApi.processCapturedImage(
        imageDataBase64,
        state.settings.sourceLanguage,
        state.settings.targetLanguage,
        state.settings.ocrEngine,
        state.settings.translationEngine,
        state.settings.apiKey,
        state.settings.fallbackEngineOrder
      );

      // Update state with processed image and results
      setState(prev => ({
        ...prev,
        capturedImage: imageDataBase64,
        capturedBlocks: result
      }));

      // Show success notification
      Notification.success('Image Processed', {
        description: `Found ${result.original.length} text blocks`
      });
    } catch (error) {
      console.error('Error processing image file:', error);
      Notification.error('Processing Error', {
        description: 'Failed to process the image file. Please try again.'
      });
    }
  }, [
    state.settings.sourceLanguage,
    state.settings.targetLanguage,
    state.settings.ocrEngine,
    state.settings.translationEngine,
    state.settings.apiKey,
    state.settings.fallbackEngineOrder
  ]);
  
  return {
    state,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    translateBlock,
    selectBlock,
    updateSettings,
    captureFrame,
    clearCapture,
    processImageFile,
    setActiveTab
  };
} 