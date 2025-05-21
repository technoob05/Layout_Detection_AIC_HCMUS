declare module '@google/genai' {
  export interface Part {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
    fileData?: {
      fileUri: string;
      mimeType?: string;
    };
  }

  export interface GenerateContentRequest {
    model: string;
    contents: Part[] | string;
    config?: {
      temperature?: number;
      topP?: number;
      topK?: number;
      maxOutputTokens?: number;
      stopSequences?: string[];
      responseMimeType?: string;
    };
  }

  export interface GenerateContentResponse {
    text?: string;
    candidates?: {
      content: {
        parts: Part[];
      };
    }[];
  }

  export class GoogleGenAI {
    constructor(options: { apiKey: string });
    
    models: {
      generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse>;
    };
  }
} 