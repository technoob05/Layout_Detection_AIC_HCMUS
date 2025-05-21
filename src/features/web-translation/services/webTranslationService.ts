import { GoogleGenAI } from '@google/genai';
import { TranslatedWebContent } from '../types';

// Access API key from environment variables (in Vite, they should be prefixed with VITE_)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Please set it in your .env file.");
}

// Type definitions for the Gemini API
// These augment the existing types to support newer features like URL context
interface GeminiToolConfig {
  urlContext: Record<string, unknown>;
  googleSearch?: Record<string, unknown>;
}

// Extended interface to support response candidates with URL metadata
interface UrlContextMetadata {
  urlMetadata: {
    retrievedUrl: string;
    urlRetrievalStatus: string;
  }[];
}

// Extended Part interface to support role property
interface ExtendedPart {
  text: string;
}

// Extended Content interface to support role-based content structure
interface ExtendedContent {
  role: string;
  parts: ExtendedPart[];
}

// Extended candidate interface
interface ExtendedCandidate {
  content: { parts: { text: string }[] };
  urlContextMetadata?: UrlContextMetadata;
}

// Extended response interface
interface ExtendedResponse {
  text?: string;
  candidates?: ExtendedCandidate[];
}

// Define a custom config interface for Gemini that includes tools
interface ExtendedGeminiConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseMimeType?: string;
  tools?: GeminiToolConfig[];
}

// Extended interface for Gemini content generation requests
interface ExtendedGenerateContentRequest {
  model: string;
  contents: string | { text: string };
  config?: ExtendedGeminiConfig;
}

// Create custom Gemini client
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY_PLACEHOLDER" }); 
const modelName = 'gemini-2.0-flash'; // More stable model than preview versions

/**
 * Extracts text content from HTML while preserving the structure
 * @param html HTML content
 * @returns Object with HTML nodes tree and extracted text segments
 */
export const extractTextSegmentsFromHtml = (html: string) => {
  // Parse HTML to DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract text nodes
  const segments: { node: Node; text: string; path: string }[] = [];
  
  const processNode = (node: Node, path: string = '') => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        segments.push({ node, text, path });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script and style tags
      const tagName = (node as Element).tagName.toLowerCase();
      if (tagName === 'script' || tagName === 'style') {
        return;
      }
      
      // Process child nodes
      Array.from(node.childNodes).forEach((child, index) => {
        processNode(child, `${path}/${(node as Element).tagName}[${index}]`);
      });
    }
  };
  
  processNode(doc.body);
  
  return {
    document: doc,
    segments,
  };
};

/**
 * Uses Gemini API to translate HTML content
 * @param html Original HTML content
 * @param targetLanguageCode Target language code (e.g., 'es', 'fr')
 * @param targetLanguageName Target language name (e.g., 'Spanish', 'French')
 * @returns Promise with translated HTML content
 */
export const translateWebContent = async (
  html: string,
  targetLanguageCode: string,
  targetLanguageName: string
): Promise<TranslatedWebContent> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform translation.");
  }
  
  const { document, segments } = extractTextSegmentsFromHtml(html);
  
  if (segments.length === 0) {
    return {
      originalHtml: html,
      translatedHtml: html,
    };
  }
  
  // Prepare batch of segments for translation
  const textsToTranslate = segments.map(segment => segment.text);
  
  // Prepare prompt for Gemini
  const prompt = `Translate the following HTML text segments from their original language to ${targetLanguageName} (${targetLanguageCode}).
Respond ONLY with a valid JSON array of translated strings in the exact same order as the input array.
Do not include any explanations, notes, or code formatting.
Here is the array of text segments to translate:
${JSON.stringify(textsToTranslate)}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    // Using response.text without () as it's a property, not a method
    const responseText = response.text || '';
    
    // Parse JSON response
    let translatedTexts: string[];
    try {
      // Clean up response if needed (remove markdown code blocks, etc.)
      const cleanedJson = responseText.replace(/^```json\s*|\s*```$/g, '').trim();
      translatedTexts = JSON.parse(cleanedJson);
      
      if (!Array.isArray(translatedTexts) || translatedTexts.length !== textsToTranslate.length) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse translation response');
    }
    
    // Replace text in the document
    segments.forEach((segment, index) => {
      if (segment.node.nodeType === Node.TEXT_NODE && index < translatedTexts.length) {
        const originalText = segment.node.textContent;
        if (originalText && segment.text) {
          // Create a replacement that preserves any whitespace
          const replacement = originalText.replace(segment.text, translatedTexts[index]);
          segment.node.textContent = replacement;
        }
      }
    });
    
    // Convert back to HTML
    const translatedHtml = new XMLSerializer().serializeToString(document);
    
    return {
      originalHtml: html,
      translatedHtml: translatedHtml,
    };
  } catch (error) {
    console.error('Error calling Gemini API for web translation:', error);
    throw new Error(`Error translating content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fetches web content from URL using Gemini's URL context tool
 * This avoids CORS issues since the fetching happens on the server side
 */
export const fetchWebContent = async (url: string): Promise<string> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot fetch web content.");
  }

  try {
    // Format the prompt to include the specific URL in the content
    const prompt = `Analyze and retrieve the full content from this URL: ${url}. 
    Return the complete content exactly as it appears on the webpage, with no additions, summaries, or explanations.`;
    
    // Make the API call using the proper format for Gemini 2.5
    const requestOptions = {
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
        tools: [{urlContext: {}}]
      }
    } as unknown as Parameters<typeof ai.models.generateContent>[0];
    
    const response = await ai.models.generateContent(requestOptions) as unknown as ExtendedResponse;
    
    // Check if we got a response and it has text
    const contentText = response.text || '';
    
    // Check for metadata about URLs retrieved (optional, for debugging)
    if (response.candidates && response.candidates[0]?.urlContextMetadata) {
      console.log("URL metadata:", response.candidates[0].urlContextMetadata);
    }
    
    // If the content contains specific patterns that indicate it failed to fetch the actual content
    if (!contentText || 
        contentText.includes('Content` field of the browsed result') || 
        contentText.includes('raw HTML content') || 
        contentText.trim().startsWith('The')) {
      
      // Try an alternative approach, explicitly mentioning the URL
      const retryPrompt = `I need to see the complete textual content of the webpage at ${url}.
      Return ONLY the page content without any explanation, commentary, or description.
      Do not say anything about browsing results or content fields - just provide the webpage content directly.`;
      
      // Make the retry API call
      const retryRequestOptions = {
        model: "gemini-2.0-flash",
        contents: retryPrompt,
        config: {
          temperature: 0.1,
          tools: [{urlContext: {}}]
        }
      } as unknown as Parameters<typeof ai.models.generateContent>[0];
      
      const retryResponse = await ai.models.generateContent(retryRequestOptions) as unknown as ExtendedResponse;
      
      const retryContentText = retryResponse.text || '';
      if (retryContentText && !retryContentText.includes('Content` field')) {
        return retryContentText;
      }
    }
    
    if (!contentText) {
      throw new Error(`Failed to fetch URL content`);
    }
    
    return contentText;
  } catch (error) {
    console.error('Error fetching web content with Gemini URL context:', error);
    
    // Provide a helpful error message
    throw new Error(`Error fetching web content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Uses Gemini URL context tool to fetch and translate web content directly
 * @param url URL to fetch and translate
 * @param targetLanguageCode Target language code (e.g., 'es', 'fr')
 * @param targetLanguageName Target language name (e.g., 'Spanish', 'French')
 * @returns Promise with translated HTML content
 */
export const translateUrlWithGeminiContext = async (
  url: string,
  targetLanguageCode: string,
  targetLanguageName: string
): Promise<TranslatedWebContent> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform translation.");
  }

  try {
    // First, use URL context to fetch the content - specifically mention the URL in the prompt
    const fetchPrompt = `Read and analyze this URL: ${url}. Return the complete webpage content.`;
    
    // Make the API call for fetching
    const fetchRequestOptions = {
      model: "gemini-2.0-flash",
      contents: fetchPrompt,
      config: {
        temperature: 0.1,
        tools: [{urlContext: {}}]
      }
    } as unknown as Parameters<typeof ai.models.generateContent>[0];
    
    const fetchResponse = await ai.models.generateContent(fetchRequestOptions) as unknown as ExtendedResponse;
    
    // Original content as retrieved through Gemini
    let originalHtml = fetchResponse.text || '';
    
    // Check for URL metadata (optional, for debugging)
    if (fetchResponse.candidates && fetchResponse.candidates[0]?.urlContextMetadata) {
      console.log("URL metadata:", fetchResponse.candidates[0].urlContextMetadata);
    }
    
    // Check if we got a helpful response or just a message about the Content field
    if (!originalHtml || 
        originalHtml.includes('Content` field of the browsed result') || 
        originalHtml.includes('raw HTML content') || 
        originalHtml.trim().startsWith('The')) {
      
      // Try a different approach - more specific prompt
      const retryPrompt = `Visit this URL: ${url} and extract its complete textual content.
      Return ONLY the actual content as displayed on the page.
      The content should be comprehensive and include all text as displayed to users.`;
      
      // Make the retry API call
      const retryRequestOptions = {
        model: "gemini-2.0-flash",
        contents: retryPrompt,
        config: {
          temperature: 0.1,
          tools: [{urlContext: {}}]
        }
      } as unknown as Parameters<typeof ai.models.generateContent>[0];
      
      const retryResponse = await ai.models.generateContent(retryRequestOptions) as unknown as ExtendedResponse;
      
      originalHtml = retryResponse.text || '';
    }
    
    if (!originalHtml || typeof originalHtml !== 'string') {
      throw new Error("Failed to retrieve content from URL");
    }
    
    // Now translate the content with a separate request
    // Use the URL directly in the prompt to ensure the model accesses it properly
    const translatePrompt = `
Visit this URL: ${url} and translate all textual content to ${targetLanguageName} (${targetLanguageCode}).
Translation guidelines:
1. Keep all headings, paragraphs, and text layout exactly as they appear
2. Only translate human-readable text content
3. DO NOT translate technical terms, product names, brand names, or code examples
4. Return the complete translated content with the original layout preserved
`;

    // Make the translation API call
    const translateRequestOptions = {
      model: "gemini-2.0-flash",
      contents: translatePrompt,
      config: {
        temperature: 0.2,
        tools: [{urlContext: {}}]
      }
    } as unknown as Parameters<typeof ai.models.generateContent>[0];
    
    const translateResponse = await ai.models.generateContent(translateRequestOptions) as unknown as ExtendedResponse;
    
    // Get translated content
    const translatedHtml = translateResponse.text || '';
    
    if (!translatedHtml || typeof translatedHtml !== 'string') {
      throw new Error("Failed to translate content");
    }
    
    return {
      originalHtml,
      translatedHtml,
      url
    };
  } catch (error) {
    console.error('Error using Gemini URL context for translation:', error);
    throw new Error(`Error translating URL with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Alternative implementation using a simpler approach
 * Preserves HTML structure by maintaining tags and only translating text
 */
export const translateHtmlContent = async (
  html: string, 
  targetLanguageCode: string,
  targetLanguageName: string
): Promise<TranslatedWebContent> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform translation.");
  }

  const prompt = `You are an expert at website translation that preserves HTML structure perfectly.
Translate the text content within this HTML from its original language to ${targetLanguageName} (${targetLanguageCode}).

CRITICAL INSTRUCTIONS:
1. Return COMPLETE, VALID HTML that I can render in a browser directly.
2. Preserve ALL HTML elements exactly as they appear with:
   - All tags (div, span, p, h1-h6, etc.) in the exact same hierarchy
   - All attributes (class, id, style, data-*, etc.) unchanged
   - All CSS classes and inline styles unchanged
3. Only translate human-readable text content that would be visible to users.

DO NOT:
- Alter HTML structure in any way
- Translate HTML tags or attribute names/values
- Translate CSS class names or IDs
- Translate URLs, variable names, or code snippets
- Add any explanatory text or comments about the translation

The output MUST be valid HTML that perfectly matches the structure of the original but with translated text.

Here is the HTML to translate:
${html}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.1, // Lower temperature for more precise output
        maxOutputTokens: 8192, // Allow larger responses
      }
    });
    
    // Using response.text without () as it's a property, not a method
    const translatedHtml = response.text || '';
    
    // Clean up any markdown code block indicators that might be in the response
    const cleanedHtml = translatedHtml
      .replace(/^```html\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    return {
      originalHtml: html,
      translatedHtml: cleanedHtml,
    };
  } catch (error) {
    console.error('Error calling Gemini API for web translation:', error);
    throw new Error(`Error translating content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Translates HTML content with an enhanced focus on producing well-structured HTML output
 * @param html Original HTML content
 * @param targetLanguageCode Target language code (e.g., 'es', 'fr')
 * @param targetLanguageName Target language name (e.g., 'Spanish', 'French')
 * @returns Promise with original and translated HTML
 */
export const translateStructuredHtml = async (
  html: string, 
  targetLanguageCode: string,
  targetLanguageName: string
): Promise<TranslatedWebContent> => {
  if (!apiKey || apiKey === "MISSING_API_KEY_PLACEHOLDER") {
    throw new Error("Gemini API Key is not configured. Cannot perform translation.");
  }

  const prompt = `As an expert HTML translator, translate all text content within this HTML from its original language to ${targetLanguageName} (${targetLanguageCode}).

OUTPUT REQUIREMENTS:
1. Return COMPLETE, valid HTML that's ready to be rendered directly in a browser
2. Wrap your output in <html> and <body> tags if not already present
3. Maintain ALL styling, classes and visual layout exactly as in the original
4. Preserve the exact DOM tree structure with all elements and attributes intact

TRANSLATION GUIDELINES:
- Only translate visible text content meant for human readers
- Do NOT translate: HTML tags, attribute names/values, CSS classes, IDs, script content, or URLs
- Preserve all formatting, line breaks, and whitespace in the text content

Begin translation and output ONLY the complete HTML with no additional text, explanations or code blocks.

Here is the HTML to translate:
${html}`;

  try {
    // Use a slightly higher temperature for more natural translations
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      }
    });
    
    let translatedHtml = response.text || '';
    
    // Clean up any markdown code block indicators
    translatedHtml = translatedHtml
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    return {
      originalHtml: html,
      translatedHtml,
    };
  } catch (error) {
    console.error('Error calling Gemini API for structured HTML translation:', error);
    throw new Error(`Error translating HTML content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 