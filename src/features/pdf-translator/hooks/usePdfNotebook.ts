import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { usePdfChat } from './usePdfChat';
import { PdfSummary, SourceGuide, MindMapNode, AudioOverview, NotebookView, SourceSection } from '../types';
import { createPdfReasoningGraph } from '../api/langGraphApi';

export function usePdfNotebook(pdfFile?: File, pdfContent?: string) {
  const [pdfSummary, setPdfSummary] = useState<PdfSummary | null>(null);
  const [sourceGuide, setSourceGuide] = useState<SourceGuide | null>(null);
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [audioOverview, setAudioOverview] = useState<AudioOverview>({
    transcript: '',
    duration: 0,
    isGenerating: false
  });
  const [activeView, setActiveView] = useState<NotebookView['type']>('chat');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingSourceGuide, setIsGeneratingSourceGuide] = useState(false);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [availableViews, setAvailableViews] = useState<NotebookView[]>([
    { type: 'chat', title: 'Chat', icon: 'message-square' },
    { type: 'sources', title: 'Sources', icon: 'book-open' }
  ]);
  
  const pdfChat = usePdfChat(pdfContent);
  
  // Extract title from file name
  const pdfTitle = pdfFile ? pdfFile.name.replace(/\.[^/.]+$/, "") : "Untitled PDF";
  
  // Auto-generate summary when PDF is loaded
  useEffect(() => {
    if (pdfContent && !pdfSummary && !isGeneratingSummary) {
      generatePdfSummary();
    }
  }, [pdfContent, pdfSummary]);
  
  // Auto-generate source guide when PDF is loaded
  useEffect(() => {
    if (pdfContent && !sourceGuide && !isGeneratingSourceGuide) {
      generateSourceGuide();
    }
  }, [pdfContent, sourceGuide]);
  
  // Generate PDF summary using the reasoning graph
  const generatePdfSummary = useCallback(async () => {
    if (!pdfContent) return;
    
    setIsGeneratingSummary(true);
    
    try {
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      
      // Generate title
      const titleResult = await reasoningGraph.processQuery(
        "What would be an appropriate title for this document? Keep it short and concise. Respond with only the title."
      );
      
      // Generate overview
      const overviewResult = await reasoningGraph.processQuery(
        "Provide a brief overview of this document in 2-3 sentences."
      );
      
      // Generate key points
      const keyPointsResult = await reasoningGraph.processQuery(
        "List the 3-5 most important key points from this document. Format as a JSON array of strings."
      );
      
      // Generate topics
      const topicsResult = await reasoningGraph.processQuery(
        "What are the main topics covered in this document? List up to 5 topics. Format as a JSON array of strings."
      );
      
      // Parse key points
      let keyPoints: string[] = [];
      try {
        const keyPointsJson = keyPointsResult.trim().replace(/```json|```/g, '');
        keyPoints = JSON.parse(keyPointsJson);
      } catch (e) {
        console.error('Error parsing key points:', e);
        keyPoints = keyPointsResult.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
      }
      
      // Parse topics
      let topics: string[] = [];
      try {
        const topicsJson = topicsResult.trim().replace(/```json|```/g, '');
        topics = JSON.parse(topicsJson);
      } catch (e) {
        console.error('Error parsing topics:', e);
        topics = topicsResult.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
      }
      
      // Create summary object
      const summary: PdfSummary = {
        title: titleResult || pdfTitle,
        overview: overviewResult,
        keyPoints: Array.isArray(keyPoints) ? keyPoints : [keyPointsResult],
        topics: Array.isArray(topics) ? topics : [topicsResult],
        pageCount: estimatePageCount(pdfContent)
      };
      
      setPdfSummary(summary);
      
      // Add audio view if not already added
      if (!availableViews.some(view => view.type === 'audio')) {
        setAvailableViews(prev => [
          ...prev,
          { type: 'audio', title: 'Audio Overview', icon: 'headphones' }
        ]);
      }
      
      // Add mindmap view if not already added
      if (!availableViews.some(view => view.type === 'mindmap')) {
        setAvailableViews(prev => [
          ...prev,
          { type: 'mindmap', title: 'Mind Map', icon: 'git-branch' }
        ]);
      }
    } catch (error) {
      console.error('Error generating PDF summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [pdfContent, pdfTitle, availableViews]);
  
  // Generate source guide using the reasoning graph
  const generateSourceGuide = useCallback(async () => {
    if (!pdfContent) return;
    
    setIsGeneratingSourceGuide(true);
    
    try {
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      
      // Generate sections prompt
      const sectionsPrompt = `
      Analyze this document and identify 3-5 main sections or themes.
      For each section, provide:
      1. A short title
      2. A brief description of the content (50-100 words)
      3. Estimated page numbers where this content appears
      
      Format your response as JSON like this:
      {
        "sections": [
          {
            "title": "Section Title",
            "content": "Section description...",
            "pages": [1, 2, 3]
          }
        ]
      }
      
      Make sure your response is valid JSON.
      `;
      
      const sectionsResult = await reasoningGraph.processQuery(sectionsPrompt);
      
      // Parse sections
      let sections: SourceSection[] = [];
      try {
        const sectionsJson = sectionsResult.trim().replace(/```json|```/g, '');
        const parsedSections = JSON.parse(sectionsJson);
        sections = parsedSections.sections || [];
      } catch (e) {
        console.error('Error parsing sections:', e);
        sections = [
          {
            title: "Main Content",
            content: "The document's primary content.",
            pages: [1]
          }
        ];
      }
      
      // Create source guide
      const guide: SourceGuide = {
        title: pdfSummary?.title || pdfTitle,
        sections
      };
      
      setSourceGuide(guide);
    } catch (error) {
      console.error('Error generating source guide:', error);
    } finally {
      setIsGeneratingSourceGuide(false);
    }
  }, [pdfContent, pdfSummary, pdfTitle]);
  
  // Generate mind map using the reasoning graph
  const generateMindMap = useCallback(async () => {
    if (!pdfContent || !pdfSummary) return;
    
    setIsGeneratingMindMap(true);
    
    try {
      const reasoningGraph = createPdfReasoningGraph(pdfContent);
      
      // Generate mind map prompt
      const mindMapPrompt = `
      Based on this document, create a hierarchical mind map structure.
      Start with the main topic as the root node, then include major topics and their subtopics.
      Limit to a depth of 2-3 levels and a maximum of 15 total nodes.
      
      Format your response as JSON like this:
      {
        "id": "root",
        "label": "Main Topic",
        "children": [
          {
            "id": "child1",
            "label": "Subtopic 1",
            "children": [
              {
                "id": "child1-1",
                "label": "Sub-subtopic 1.1"
              }
            ]
          }
        ]
      }
      
      Make sure your response is valid JSON.
      `;
      
      const mindMapResult = await reasoningGraph.processQuery(mindMapPrompt);
      
      // Parse mind map
      try {
        const mindMapJson = mindMapResult.trim().replace(/```json|```/g, '');
        const parsedMindMap = JSON.parse(mindMapJson);
        
        // Ensure the root node has the title
        if (parsedMindMap && !parsedMindMap.label) {
          parsedMindMap.label = pdfSummary.title;
        }
        
        // Add missing IDs if needed
        addMissingIds(parsedMindMap);
        
        setMindMap(parsedMindMap);
      } catch (e) {
        console.error('Error parsing mind map:', e);
        
        // Create a simple fallback mind map
        const fallbackMap: MindMapNode = {
          id: 'root',
          label: pdfSummary.title,
          children: pdfSummary.topics.map((topic, index) => ({
            id: `topic-${index}`,
            label: topic
          }))
        };
        
        setMindMap(fallbackMap);
      }
    } catch (error) {
      console.error('Error generating mind map:', error);
    } finally {
      setIsGeneratingMindMap(false);
    }
  }, [pdfContent, pdfSummary]);
  
  // Generate audio overview
  const generateAudioOverview = useCallback(async () => {
    if (!pdfSummary) return;
    
    setAudioOverview(prev => ({ ...prev, isGenerating: true }));
    
    try {
      // In a real implementation, this would call a text-to-speech API
      // For now, we'll just set the transcript
      const transcript = `
        ${pdfSummary.title}. 
        ${pdfSummary.overview}
        
        Key points include:
        ${pdfSummary.keyPoints.map((point, i) => `Number ${i + 1}: ${point}`).join('. ')}
        
        This document covers the following topics:
        ${pdfSummary.topics.join(', ')}
      `;
      
      // Simulate a delay for audio generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAudioOverview({
        transcript,
        duration: transcript.length / 20, // Rough estimate of duration in seconds
        isGenerating: false,
        // In a real implementation, audioUrl would be set to the URL of the generated audio
        audioUrl: undefined
      });
    } catch (error) {
      console.error('Error generating audio overview:', error);
      setAudioOverview(prev => ({ ...prev, isGenerating: false }));
    }
  }, [pdfSummary]);
  
  // Utility to add missing IDs to mind map nodes
  const addMissingIds = (node: MindMapNode): void => {
    if (!node.id) {
      node.id = uuidv4();
    }
    
    if (node.children) {
      node.children.forEach(child => addMissingIds(child));
    }
  };
  
  // Utility to estimate page count from content length
  const estimatePageCount = (content: string): number => {
    // Very rough estimation: ~3000 characters per page
    return Math.max(1, Math.ceil(content.length / 3000));
  };
  
  return {
    pdfTitle,
    pdfSummary,
    sourceGuide,
    mindMap,
    audioOverview,
    activeView,
    availableViews,
    isGeneratingSummary,
    isGeneratingSourceGuide,
    isGeneratingMindMap,
    pdfChat,
    setActiveView,
    generatePdfSummary,
    generateSourceGuide,
    generateMindMap,
    generateAudioOverview
  };
} 