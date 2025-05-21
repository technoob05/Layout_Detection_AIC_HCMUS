/**
 * Speech service for text-to-speech functionality
 * Provides a simple interface for speaking text using the browser's built-in Web Speech API
 */

// Speech voices cache to avoid repeated searches
let cachedVoices: SpeechSynthesisVoice[] = [];

// Global speaking state flag
let isSpeakingGlobal = false;

// Event system for speech state changes
type SpeechEventType = 'start' | 'end' | 'error' | 'stop';
type SpeechEventListener = (data?: any) => void;
const speechEventListeners: Record<SpeechEventType, SpeechEventListener[]> = {
  start: [],
  end: [],
  error: [],
  stop: []
};

/**
 * Subscribe to speech events
 * @param event Event type to subscribe to
 * @param callback Callback to execute when event occurs
 * @returns Unsubscribe function
 */
export const onSpeechEvent = (event: SpeechEventType, callback: SpeechEventListener): (() => void) => {
  speechEventListeners[event].push(callback);
  return () => {
    speechEventListeners[event] = speechEventListeners[event].filter(cb => cb !== callback);
  };
};

/**
 * Trigger speech event
 * @param event Event type to trigger
 * @param data Optional data to pass to listeners
 */
const triggerSpeechEvent = (event: SpeechEventType, data?: any) => {
  speechEventListeners[event].forEach(listener => listener(data));
};

/**
 * Get available voices for speech synthesis
 * @returns Array of available voices
 */
export const getVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  // Return cached voices if available
  if (cachedVoices.length > 0) {
    return cachedVoices;
  }

  // Wait for voices to be loaded if not yet available
  if (window.speechSynthesis.getVoices().length === 0) {
    await new Promise<void>((resolve) => {
      window.speechSynthesis.onvoiceschanged = () => resolve();
    });
  }

  // Get and cache the voices
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
};

/**
 * Get the best voice for a specific language
 * @param langCode Language code (e.g., 'en-US', 'vi-VN')
 * @returns The best voice for the language or a default voice
 */
export const getVoiceForLanguage = async (langCode: string): Promise<SpeechSynthesisVoice | null> => {
  const voices = await getVoices();
  
  // Try to find a voice that matches the language exactly
  let voice = voices.find(v => v.lang === langCode);
  
  // If no exact match, try to find a voice that starts with the language code
  if (!voice) {
    const langPrefix = langCode.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(langPrefix));
  }
  
  // Return the found voice or default to the first available voice
  return voice || null;
};

/**
 * Check if speech is currently active
 * @returns True if speech is currently active
 */
export const isSpeaking = (): boolean => {
  return isSpeakingGlobal || (window.speechSynthesis && window.speechSynthesis.speaking);
};

/**
 * Speak text using the browser's speech synthesis
 * @param text Text to speak
 * @param langCode Language code for the voice
 * @param options Additional options for speech synthesis
 * @returns Promise that resolves when speech ends or rejects on error
 */
export const speakText = async (
  text: string, 
  langCode: string = 'en-US',
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<void> => {
  try {
    // Stop any current speech
    if (isSpeaking()) {
      stopSpeaking();
    }
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language and try to find a matching voice
    utterance.lang = langCode;
    const voice = await getVoiceForLanguage(langCode);
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set speech parameters
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Update global speaking state
    isSpeakingGlobal = true;
    
    // Trigger start event
    triggerSpeechEvent('start', { text, langCode });
    
    // Set event handlers
    if (options.onStart) {
      options.onStart();
    }
    
    // Create a promise that resolves when speech ends or rejects on error
    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => {
        isSpeakingGlobal = false;
        triggerSpeechEvent('end');
        
        if (options.onEnd) {
          options.onEnd();
        }
        resolve();
      };
      
      utterance.onerror = (event) => {
        isSpeakingGlobal = false;
        const error = new Error(`Speech synthesis error: ${event.error}`);
        triggerSpeechEvent('error', error);
        
        if (options.onError) {
          options.onError(error);
        }
        reject(error);
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    });
  } catch (error) {
    console.error('Speech synthesis error:', error);
    isSpeakingGlobal = false;
    triggerSpeechEvent('error', error);
    
    if (options.onError) {
      options.onError(error instanceof Error ? error : new Error(String(error)));
    }
    throw error;
  }
};

/**
 * Check if text-to-speech is supported in the current browser
 * @returns True if speech synthesis is supported
 */
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeakingGlobal = false;
    triggerSpeechEvent('stop');
  }
}; 