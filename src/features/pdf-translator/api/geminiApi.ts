import axios from 'axios';

// Simple LRU cache for conversation context
class ContextCache {
  private cache: Map<string, any>;
  private maxSize: number;

  constructor(maxSize = 10) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (item) {
      // Access makes this item the most recently used
      this.cache.delete(key);
      this.cache.set(key, item);
      return item;
    }
    return null;
  }

  set(key: string, value: any) {
    // If key exists, refresh it
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest item if cache is full
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

// Default API options
const DEFAULT_OPTIONS: ChatOptions = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Gemini API client
export class GeminiApiClient {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  private model: string = 'gemini-2.0-flash';
  private contextCache: ContextCache;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.contextCache = new ContextCache(20); // Cache up to 20 conversations
  }

  // Generate text completion
  async generateText(prompt: string, options: ChatOptions = {}): Promise<string> {
    try {
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          ...DEFAULT_OPTIONS,
          ...options
        }
      };

      const response = await axios.post(url, requestBody);
      
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]
      ) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected response structure:', response.data);
        return 'Sorry, I encountered an error processing your request.';
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error details:', error.response.data);
      }
      throw new Error('Failed to generate text with Gemini API');
    }
  }

  // Chat with context handling
  async chat(
    sessionId: string, 
    message: string,
    options: ChatOptions = {}
  ): Promise<string> {
    try {
      // Get existing messages for this session
      let history = this.contextCache.get(sessionId) || [];
      
      // Add user message to history
      history.push({ role: 'user', content: message });
      
      // Format conversation for the API
      const formattedMessages = history.map((msg: Message) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const requestBody = {
        contents: formattedMessages,
        generationConfig: {
          ...DEFAULT_OPTIONS,
          ...options
        }
      };

      const response = await axios.post(url, requestBody);
      
      let responseText = '';
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]
      ) {
        responseText = response.data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected response structure:', response.data);
        responseText = 'Sorry, I encountered an error processing your request.';
      }
      
      // Add model response to history
      history.push({ role: 'model', content: responseText });
      
      // Update cache
      this.contextCache.set(sessionId, history);
      
      return responseText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API error details:', error.response.data);
      }
      throw new Error('Failed to generate chat response with Gemini API');
    }
  }

  // Clear conversation history for a session
  clearChatHistory(sessionId: string) {
    this.contextCache.set(sessionId, []);
  }

  // Chat with PDF context
  async chatWithPdf(
    sessionId: string,
    message: string,
    pdfContent: string,
    options: ChatOptions = {}
  ): Promise<string> {
    // Get existing messages for this session
    let history = this.contextCache.get(sessionId) || [];
    
    // Create a system prompt that includes PDF content
    const systemPrompt = `You are an assistant that helps analyze PDF documents. 
    You have access to the following PDF content:
    ---
    ${pdfContent}
    ---
    
    Answer questions based on this content when relevant. If the question is not related to the document content, politely inform the user.`;
    
    // If this is the first message, add the system context
    if (history.length === 0) {
      history.push({ role: 'model', content: 'I can help you analyze this PDF. What would you like to know?' });
    }
    
    // Construct a prompt that includes PDF context and question
    const enhancedPrompt = `${systemPrompt}\n\nUser question: ${message}`;
    
    try {
      // Add user message to history
      history.push({ role: 'user', content: message });
      
      // Call Gemini API with the enhanced prompt
      const response = await this.generateText(enhancedPrompt, options);
      
      // Add model response to history
      history.push({ role: 'model', content: response });
      
      // Update cache
      this.contextCache.set(sessionId, history);
      
      return response;
    } catch (error) {
      console.error('Error in chatWithPdf:', error);
      throw error;
    }
  }
}

// Get API key from environment variables
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  
  // if (!apiKey) {
  //   console.warn('VITE_GOOGLE_API_KEY not found in environment variables. Using fallback method for development only.');
  //   // Fallback for development - NOT recommended for production
  //  
  // }
  
  return apiKey;
};

// Export a singleton instance with the API key from environment variables
export const geminiApi = new GeminiApiClient(getApiKey()); 