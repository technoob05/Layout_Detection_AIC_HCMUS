import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatSession } from '../../pdf-translator/types';
import { PdfNotebookState, PdfSummary, PdfAudioOverview, PdfMindMap, MindMapNode, FollowUpQuestion, PdfSlide, PdfSlideCollection } from '../types';
import { createPdfReasoningGraph } from '../../pdf-translator/api/langGraphApi';
import { GoogleGenAI } from '@google/genai';

interface NotebookSession extends ChatSession {
  summary?: PdfSummary;
  audioOverview?: PdfAudioOverview;
  mindMap?: PdfMindMap;
  followUpQuestions?: FollowUpQuestion[];
  slideCollection?: PdfSlideCollection;
}

// Default notebook state
const DEFAULT_STATE: PdfNotebookState = {
  isAutoSummaryEnabled: true,
  isAudioOverviewEnabled: false,
  isMindMapEnabled: false,
  selectedSourceId: null,
  highlightedText: null,
};

export function usePdfNotebook(pdfContent: string, pdfTitle: string) {
  const [session, setSession] = useState<NotebookSession | null>(null);
  const [state, setState] = useState<PdfNotebookState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    if (pdfContent && !session) {
      const newSession: NotebookSession = {
        id: uuidv4(),
        title: pdfTitle || 'Untitled Document',
        messages: [],
        state: {
          pdfId: uuidv4(),
          pdfTitle,
          lastActive: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setSession(newSession);
    }
  }, [pdfContent, pdfTitle, session]);

  // Send message and get response
  const sendMessage = useCallback(async (content: string) => {
    if (!session || !pdfContent) return;
    
    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    // Update session with user message
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        updatedAt: new Date(),
      };
    });
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the reasoning graph to process the query
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      const result = await reasoningGraph.processQueryWithSources(content);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        sources: result.sources,
      };
      
      // Update session with assistant message
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          updatedAt: new Date(),
        };
      });
      
      // Generate follow-up questions based on the context
      if (result.response) {
        generateFollowUpQuestions(result.response);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, errorMessage],
          updatedAt: new Date(),
        };
      });
    } finally {
      setLoading(false);
    }
  }, [pdfContent, session]);

  // Generate document summary
  const generateSummary = useCallback(async () => {
    if (!session || !pdfContent) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the reasoning graph to generate a summary
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      const summaryPrompt = "Please provide a comprehensive summary of this document, highlighting the key points, main arguments, and important conclusions.";
      const result = await reasoningGraph.processQueryWithSources(summaryPrompt);
      
      // Create summary
      const summary: PdfSummary = {
        id: uuidv4(),
        title: `Summary of ${pdfTitle || 'Document'}`,
        content: result.response,
        createdAt: new Date(),
      };
      
      // Update session with summary
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          summary,
          updatedAt: new Date(),
        };
      });
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating summary');
    } finally {
      setLoading(false);
    }
  }, [pdfContent, pdfTitle, session]);

  // Generate audio overview (mocked in this version)
  const generateAudioOverview = useCallback(async () => {
    if (!session || !pdfContent) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the reasoning graph to generate content for the audio overview
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      const audioPrompt = "Please create a brief audio script that summarizes this document in a conversational tone. Focus on the most important points that someone would want to hear.";
      const result = await reasoningGraph.processQueryWithSources(audioPrompt);
      
      // In a real implementation, we would send the text to a Text-to-Speech API
      // For this demo, we'll use a sample audio file that actually exists
      const audioOverview: PdfAudioOverview = {
        id: uuidv4(),
        // Using a real sample audio file that can actually be played
        audioUrl: 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3',
        transcript: result.response,
        createdAt: new Date(),
      };
      
      // Update session with audio overview
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          audioOverview,
          updatedAt: new Date(),
        };
      });
    } catch (err) {
      console.error('Error generating audio overview:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating audio overview');
    } finally {
      setLoading(false);
    }
  }, [pdfContent, session]);

  // Generate mind map
  const generateMindMap = useCallback(async () => {
    if (!session || !pdfContent) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the reasoning graph to get content for the mind map
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      const mindMapPrompt = `Please analyze the document and create a hierarchical outline of the main topics and subtopics that would be suitable for a mind map. Format the response as JSON with the following structure:
      {
        "label": "Main Topic",
        "children": [
          {
            "label": "Subtopic 1",
            "children": [{"label": "Sub-subtopic 1"}, {"label": "Sub-subtopic 2"}]
          },
          {
            "label": "Subtopic 2",
            "children": []
          }
        ]
      }`;
      
      const result = await reasoningGraph.processQueryWithSources(mindMapPrompt);
      
      // Parse the response to get the mind map structure
      let rootNode: MindMapNode;
      try {
        // Extract JSON from the response (the API might wrap it in backticks or text)
        const jsonMatch = result.response.match(/```json\s*(\{.*\})\s*```/s) || 
                       result.response.match(/\{[\s\S]*"label"[\s\S]*\}/);
        
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : result.response;
        const parsed = JSON.parse(jsonStr);
        
        // Add unique IDs to each node
        const addIds = (node: any): MindMapNode => {
          const result: MindMapNode = {
            id: uuidv4(),
            label: node.label || 'Unknown',
          };
          
          if (node.children && Array.isArray(node.children)) {
            result.children = node.children.map(addIds);
          }
          
          return result;
        };
        
        rootNode = addIds(parsed);
      } catch (parseErr) {
        console.error('Error parsing mind map structure:', parseErr);
        
        // Fallback: create a simple mind map with the document title
        rootNode = {
          id: uuidv4(),
          label: pdfTitle || 'Document',
          children: [
            {
              id: uuidv4(),
              label: 'Parsing Error',
              children: [
                {
                  id: uuidv4(),
                  label: 'Could not generate mind map structure',
                }
              ]
            }
          ]
        };
      }
      
      // Create the mind map
      const mindMap: PdfMindMap = {
        id: uuidv4(),
        rootNode,
        createdAt: new Date(),
      };
      
      // Update session with mind map
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          mindMap,
          updatedAt: new Date(),
        };
      });
    } catch (err) {
      console.error('Error generating mind map:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating mind map');
    } finally {
      setLoading(false);
    }
  }, [pdfContent, pdfTitle, session]);

  // Generate follow-up questions
  const generateFollowUpQuestions = useCallback(async (context: string) => {
    if (!session) return;
    
    try {
      // Use the reasoning graph to generate follow-up questions
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      const followUpPrompt = `Based on the following conversation context, generate 3 follow-up questions that would be helpful for exploring the document further:
      
      CONTEXT:
      ${context}
      
      Format each question as a simple string. The questions should be related to the document content but explore different aspects than what has already been covered.`;
      
      const result = await reasoningGraph.processQueryWithSources(followUpPrompt);
      
      // Extract questions from the response
      const questionRegex = /(?:\d+\.\s*|\-\s*|\*\s*)(.+?)(?=\n\d+\.|\n\-|\n\*|\n\n|$)/g;
      const matches = [...result.response.matchAll(questionRegex)];
      
      const questions: FollowUpQuestion[] = matches
        .map(match => match[1].trim())
        .filter(question => question.length > 0 && question.endsWith('?'))
        .map(question => ({
          id: uuidv4(),
          question,
        }));
      
      // Update session with follow-up questions
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          followUpQuestions: questions,
        };
      });
    } catch (err) {
      console.error('Error generating follow-up questions:', err);
      // Non-critical, so we don't set error state
    }
  }, [pdfContent, session]);

  // Generate visual slides with actual image generation
  const generateSlides = useCallback(async () => {
    if (!session || !pdfContent) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the reasoning graph to get content for the slides
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      const slidesPrompt = `Please analyze this document and create 4-6 key visual slides that explain the most important concepts. Each slide should have:
      1. A short, concise explanation text (1-2 sentences)
      2. A description of what a simple black and white illustration for this concept would look like.
      
      Format your response as a JSON array:
      [
        {
          "text": "Short explanation of concept 1",
          "imageDescription": "Description of the illustration for concept 1"
        },
        ...
      ]`;
      
      const result = await reasoningGraph.processQueryWithSources(slidesPrompt);
      
      // Parse the response to get slides
      let parsedSlides: Array<{text: string, imageDescription: string}> = [];
      try {
        // Extract JSON from the response
        const jsonMatch = result.response.match(/```json\s*(\[.*\])\s*```/s) || 
                       result.response.match(/\[[\s\S]*\]/);
        
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : result.response;
        parsedSlides = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error('Error parsing slides JSON:', parseErr);
        // Fallback: create mock slides with error message
        parsedSlides = [
          {
            text: "Could not parse slide content from AI response",
            imageDescription: "Error visualization"
          }
        ];
      }
      
      // Generate actual images using Gemini API with chat model
      const apiKey = 'AIzaSyCwg1omBoK9kSWwmjJ3BWFb0CO7oEAAJVU';
      const genAI = new GoogleGenAI({ apiKey });
      
      // Initialize the chat model that supports image generation
      const imageModel = genAI.chats.create({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
        history: [],
      });

      // Process slides sequentially to avoid rate limiting
      const slides: PdfSlide[] = [];
      
      for (const slide of parsedSlides) {
        let imageData: string | null = null;
        let mimeType = "image/png";
        
        try {
          // Generate both text and image in one call with streaming
          const prompt = `Create a simple black and white line drawing to illustrate this concept: ${slide.imageDescription}.
          Make it minimal, cute, and with clean lines on white background.`;
          
          // Send message stream to generate the image
          const result = await imageModel.sendMessageStream({
            message: prompt,
          });
          
          // Process the stream response
          for await (const chunk of result) {
            for (const candidate of chunk.candidates ?? []) {
              if (candidate.content?.parts) {
                for (const part of candidate.content.parts) {
                  if (part.inlineData) {
                    // Found an image part in the response
                    imageData = part.inlineData.data ?? null;
                    mimeType = part.inlineData.mimeType || "image/png";
                    break;
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Error generating image with Gemini chat model:', err);
          // Will fall back to placeholder image
        }
        
        // If Gemini API failed or is not available, use placeholder SVG
        if (!imageData) {
          imageData = btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
            <rect width="300" height="200" fill="${slides.length % 3 === 0 ? '#e6f7ff' : slides.length % 3 === 1 ? '#e6fff2' : '#fff9e6'}" />
            <text x="50%" y="30%" font-family="Arial" font-size="14" text-anchor="middle" fill="#333">
              Image would show:
            </text>
            <text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" fill="#555" width="280">
              ${slide.imageDescription.substring(0, 80)}${slide.imageDescription.length > 80 ? '...' : ''}
            </text>
            <text x="50%" y="80%" font-family="Arial" font-size="10" text-anchor="middle" fill="#777">
              Image generation failed - using placeholder
            </text>
          </svg>`);
          mimeType = "image/svg+xml";
        }
        
        // Add the slide to our collection
        slides.push({
          id: uuidv4(),
          text: slide.text,
          image: imageData,
          mimeType,
          createdAt: new Date()
        });
      }
      
      // Create the slide collection
      const slideCollection: PdfSlideCollection = {
        id: uuidv4(),
        slides,
        createdAt: new Date(),
      };
      
      // Update session with slide collection
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          slideCollection,
          updatedAt: new Date(),
        };
      });
    } catch (err) {
      console.error('Error generating slides:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating slides');
    } finally {
      setLoading(false);
    }
  }, [pdfContent, session]);

  // Set selected source and highlighted text
  const setSelectedSource = useCallback((sourceId: string, text?: string) => {
    setState(prev => ({
      ...prev,
      selectedSourceId: sourceId,
      highlightedText: text || null,
    }));
  }, []);

  // Toggle feature (auto-summary, audio, mind map)
  const toggleFeature = useCallback((feature: keyof PdfNotebookState) => {
    setState(prev => ({
      ...prev,
      [feature]: !prev[feature as keyof PdfNotebookState],
    }));
  }, []);

  return {
    currentSession: session,
    loading,
    error,
    state,
    sendMessage,
    generateSummary,
    generateAudioOverview,
    generateMindMap,
    generateSlides,
    setSelectedSource,
    toggleFeature,
  };
} 