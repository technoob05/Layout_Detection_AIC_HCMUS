import { useState, useCallback, useEffect } from 'react';
import { Annotation, AnnotationType, PdfEditorState } from '../types';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import { Notification } from '@/components/ui/notification-toast';
import { initPdfJsConfig } from '../utils/pdfjs-config';

// Initialize PDF.js configuration
initPdfJsConfig();

export function usePdfEditor() {
  const [state, setState] = useState<PdfEditorState>({
    pdfDocument: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    annotations: [],
    selectedAnnotation: null,
    selectedTool: null,
    isEditing: false,
    sourceLanguage: 'auto',
    targetLanguage: 'en'
  });

  // Load PDF document from file
  const loadPdfDocument = useCallback(async (file: File): Promise<void> => {
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument({ data: typedArray });
          
          const pdfDocument = await loadingTask.promise;
          
          setState(prev => ({
            ...prev,
            pdfDocument,
            currentPage: 1,
            totalPages: pdfDocument.numPages,
            annotations: []
          }));

          Notification.success('PDF loaded successfully', {
            description: `${file.name} loaded with ${pdfDocument.numPages} pages`
          });
        } catch (error) {
          console.error('Error parsing PDF:', error);
          Notification.error('Error loading PDF', {
            description: 'The PDF file could not be parsed. Please try another file.'
          });
        }
      };

      fileReader.onerror = () => {
        Notification.error('Error reading file', {
          description: 'Failed to read the file. Please try again.'
        });
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error loading PDF:', error);
      Notification.error('Error loading PDF', {
        description: 'An error occurred while loading the PDF file.'
      });
    }
  }, []);

  // Toggle annotation tool selection
  const setSelectedTool = useCallback((tool: AnnotationType | null) => {
    setState(prev => ({
      ...prev,
      selectedTool: tool,
      selectedAnnotation: null
    }));
  }, []);

  // Navigate between pages
  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > state.totalPages) return;
    
    setState(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  }, [state.totalPages]);

  // Zoom in/out
  const setScale = useCallback((newScale: number) => {
    // Limit scale to reasonable range (0.25x to 3x)
    const limitedScale = Math.max(0.25, Math.min(3, newScale));
    
    setState(prev => ({
      ...prev,
      scale: limitedScale
    }));
  }, []);

  // Add a new annotation
  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newAnnotation: Annotation = {
      ...annotation,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };

    setState(prev => ({
      ...prev,
      annotations: [...prev.annotations, newAnnotation],
      selectedAnnotation: newAnnotation
    }));

    return newAnnotation;
  }, []);

  // Update an existing annotation
  const updateAnnotation = useCallback((annotation: Annotation) => {
    setState(prev => {
      const updatedAnnotations = prev.annotations.map(a => 
        a.id === annotation.id 
          ? { ...annotation, updatedAt: new Date() } 
          : a
      );

      return {
        ...prev,
        annotations: updatedAnnotations,
        selectedAnnotation: annotation.id === prev.selectedAnnotation?.id 
          ? { ...annotation, updatedAt: new Date() }
          : prev.selectedAnnotation
      };
    });
  }, []);

  // Delete an annotation
  const deleteAnnotation = useCallback((annotationId: string) => {
    setState(prev => {
      const updatedAnnotations = prev.annotations.filter(a => a.id !== annotationId);
      
      return {
        ...prev,
        annotations: updatedAnnotations,
        selectedAnnotation: prev.selectedAnnotation?.id === annotationId
          ? null
          : prev.selectedAnnotation
      };
    });
  }, []);

  // Select an annotation
  const selectAnnotation = useCallback((annotation: Annotation | null) => {
    setState(prev => ({
      ...prev,
      selectedAnnotation: annotation,
      selectedTool: annotation ? null : prev.selectedTool
    }));
  }, []);

  // Set source and target languages
  const setLanguages = useCallback((sourceLanguage: string, targetLanguage: string) => {
    setState(prev => ({
      ...prev,
      sourceLanguage,
      targetLanguage
    }));
  }, []);

  // Get annotations for current page
  const getCurrentPageAnnotations = useCallback(() => {
    return state.annotations.filter(a => a.pageNumber === state.currentPage);
  }, [state.annotations, state.currentPage]);

  // Render PDF page to canvas context
  const renderPage = useCallback(async (canvasContext: CanvasRenderingContext2D, pageNumber: number) => {
    if (!state.pdfDocument) return;

    try {
      const page = await state.pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: state.scale });
      
      // Set canvas dimensions to match the viewport
      canvasContext.canvas.width = viewport.width;
      canvasContext.canvas.height = viewport.height;
      
      // Render the PDF page
      await page.render({
        canvasContext,
        viewport
      }).promise;
      
      return { page, viewport };
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      Notification.error('Error rendering page', {
        description: `Failed to render page ${pageNumber}. Please try again.`
      });
    }
  }, [state.pdfDocument, state.scale]);

  return {
    state,
    loadPdfDocument,
    setSelectedTool,
    goToPage,
    setScale,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    setLanguages,
    getCurrentPageAnnotations,
    renderPage
  };
} 