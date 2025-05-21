import { GoogleGenAI, Part, GenerateContentResponse } from '@google/genai';
import { TranslationPair, ObjectDetectionResult, VideoSource } from '@/types/gemini';

// Access API key from environment variables (in Vite, they should be prefixed with VITE_)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Please set it in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY_PLACEHOLDER" }); 
const modelName = 'gemini-2.5-flash-preview-04-17'; // This model supports video processing

const parseGeminiJsonResponse = <T>(jsonStr: string, context: string): T => {
  let cleanJsonStr = jsonStr.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const fenceMatch = cleanJsonStr.match(fenceRegex);
  if (fenceMatch && fenceMatch[1]) {
    cleanJsonStr = fenceMatch[1].trim();
  }

  try {
    const parsedData = JSON.parse(cleanJsonStr);
    return parsedData as T;
  } catch (e) {
    console.error(`Failed to parse JSON response for ${context}:`, cleanJsonStr, e);
    throw new Error(`Failed to parse ${context} data. Raw AI response (truncated): "${cleanJsonStr.substring(0, 150)}..."`);
  }
};

export const geminiTranslateImageText = async (
  base64ImageData: string,
  mimeType: string,
  targetLanguageCode: string, 
  targetLanguageName: string
): Promise<TranslationPair[]> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform translation.");
  }

  const imagePart: Part = {
    inlineData: { mimeType, data: base64ImageData },
  };

  const textPrompt = `You are an expert multilingual OCR and translation system.
Analyze the provided image (MIME type: ${mimeType}) to identify all distinct text segments.
For each segment, provide:
1. The original text as detected.
2. Its accurate translation into ${targetLanguageName} (language code: ${targetLanguageCode.split('-')[0]}).
Respond ONLY with a valid JSON array of objects. Each object in the array must have two string keys: "original" and "translated".
Do not include any explanations, introductory text, comments, or markdown code fences (like \`\`\`json) around the JSON array.
If no text is found in the image, or if a text segment is gibberish/untranslatable, return an empty JSON array [].
Example for English to Vietnamese: [{"original": "Hello World", "translated": "Xin chào thế giới"}, {"original": "Exit", "translated": "Lối thoát"}]
Example for no text: []`;
  
  const contents: Part[] = [imagePart, { text: textPrompt }];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: { responseMimeType: "application/json" }
    });
    
    const responseText = response.text || "";
    const parsedData = parseGeminiJsonResponse<TranslationPair[]>(responseText, "text translation");
    
    if (Array.isArray(parsedData) && (parsedData.length === 0 || parsedData.every(item => typeof item.original === 'string' && typeof item.translated === 'string'))) {
      return parsedData;
    }
    console.warn("Parsed JSON for text translation is not in the expected TranslationPair[] format:", parsedData);
    throw new Error("Response from AI for text translation was not a valid array of translation pairs.");
  } catch (error) {
    console.error('Error calling Gemini API for text translation:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API (text): ${error.message}`);
    }
    throw new Error('An unknown error occurred with Gemini API (text).');
  }
};

export const geminiIdentifyObjectsAndTranslate = async (
  base64ImageData: string,
  mimeType: string,
  targetLanguageCode: string, 
  targetLanguageName: string
): Promise<ObjectDetectionResult[]> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform object identification.");
  }

  const imagePart: Part = {
    inlineData: { mimeType, data: base64ImageData },
  };

  const objectPrompt = `You are an expert visual object identifier and multilingual translator.
Analyze the provided image (MIME type: ${mimeType}) and identify up to 5-7 prominent, distinct, and clearly recognizable physical objects.
For each identified object, provide:
1. The common English name of the object ("objectName").
2. Its accurate translation into ${targetLanguageName} (language code: ${targetLanguageCode.split('-')[0]}) ("translatedName").
3. Optionally, a very brief (1-2 sentences) interesting cultural note or fact about the object, if applicable and widely known ("culturalInsight"). If no specific cultural insight is relevant, omit this field or set it to null/empty string.
Respond ONLY with a valid JSON array of objects. Each object must have "objectName" (string), "translatedName" (string), and optionally "culturalInsight" (string) keys.
Do not include explanations, introductions, comments, or markdown code fences.
If no distinct objects are clearly identifiable, return an empty JSON array [].
Example for English to Vietnamese, if a cat and a book are seen: [{"objectName": "Cat", "translatedName": "Con mèo", "culturalInsight": "Cats are popular pets in many cultures and were once revered in ancient Egypt."}, {"objectName": "Book", "translatedName": "Quyển sách"}]
Example for no objects: []`;

  const contents: Part[] = [imagePart, { text: objectPrompt }];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: { responseMimeType: "application/json" }
    });
    
    const responseText = response.text || "";
    const parsedData = parseGeminiJsonResponse<ObjectDetectionResult[]>(responseText, "object identification");
    
    if (Array.isArray(parsedData) && (parsedData.length === 0 || parsedData.every(item => typeof item.objectName === 'string' && typeof item.translatedName === 'string'))) {
      return parsedData.map(item => ({ ...item, culturalInsight: item.culturalInsight || undefined }));
    }
    console.warn("Parsed JSON for object identification is not in the expected ObjectDetectionResult[] format:", parsedData);
    throw new Error("Response from AI for object identification was not a valid array of object results.");

  } catch (error) {
    console.error('Error calling Gemini API for object identification:', error);
     if (error instanceof Error) {
        throw new Error(`Gemini API (object): ${error.message}`);
    }
    throw new Error('An unknown error occurred with Gemini API (object).');
  }
};

export const geminiTranslateTextOnly = async (
  textToTranslate: string,
  targetLanguageCode: string,
  targetLanguageName: string
): Promise<string> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform text translation.");
  }
  if (!textToTranslate.trim()) {
    return ""; 
  }

  const prompt = `Translate the following text accurately into ${targetLanguageName} (language code: ${targetLanguageCode.split('-')[0]}):
"${textToTranslate}"
Respond ONLY with the translated text. Do not include the original text, any explanations, introductory phrases, or any quotation marks around your response.
For example, if translating "Hello" to Vietnamese, respond with: "Xin chào"
If translating "How are you?" to French, respond with: "Comment ça va ?"`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return (response.text || "").trim();
  } catch (error) {
    console.error('Error calling Gemini API for text-only translation:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API (text-only): ${error.message}`);
    }
    throw new Error('An unknown error occurred with Gemini API (text-only).');
  }
};

export const geminiTranscribeVideo = async (
  videoSource: VideoSource
): Promise<string> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform video transcription.");
  }

  let videoPart: Part;

  if ('youtubeUrl' in videoSource) {
    if (!videoSource.youtubeUrl.trim() || !videoSource.youtubeUrl.startsWith("https://www.youtube.com/watch?v=")) {
        throw new Error("Invalid YouTube URL provided.");
    }
    videoPart = {
      fileData: {
        fileUri: videoSource.youtubeUrl,
      },
    };
  } else {
    if (!videoSource.base64Data || !videoSource.mimeType) {
        throw new Error("Missing base64 data or MIME type for uploaded video.");
    }
    videoPart = {
      inlineData: {
        mimeType: videoSource.mimeType,
        data: videoSource.base64Data,
      },
    };
  }

  const transcriptionPrompt = `Transcribe the spoken audio from this video. 
Provide a clean, narrative transcript. 
Avoid including timestamps (like MM:SS or HH:MM:SS) directly within the flow of dialogue. 
If there are distinct visual events crucial for understanding the spoken content, you can note them as [Visual: description at MM:SS], but the primary output should be the speech.`;
  
  const requestContents: Part[] = [videoPart, { text: transcriptionPrompt }];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName, 
      contents: requestContents,
    });
    return (response.text || "").trim();
  } catch (error) {
    console.error('Error calling Gemini API for video transcription:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API (video transcription): ${error.message}`);
    }
    throw new Error('An unknown error occurred with Gemini API (video transcription).');
  }
}; 