import { useCallback } from 'react';
import { Annotation, AnnotationType, Point } from '../types';
import { getStroke } from 'perfect-freehand';

interface UseAnnotationsProps {
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => Annotation;
  updateAnnotation: (annotation: Annotation) => void;
  currentPage: number;
  selectedTool: AnnotationType | null;
  scale: number;
  sourceLanguage: string;
  targetLanguage: string;
}

export function useAnnotations({
  addAnnotation,
  updateAnnotation,
  currentPage,
  selectedTool,
  scale,
  sourceLanguage,
  targetLanguage
}: UseAnnotationsProps) {
  // Create a highlight annotation from a selection
  const createHighlightFromSelection = useCallback((canvasElement: HTMLCanvasElement) => {
    if (!selectedTool || !['highlight', 'underline', 'strikethrough'].includes(selectedTool)) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const range = selection.getRangeAt(0);
    const boundingRect = range.getBoundingClientRect();
    
    // Convert to canvas coordinates
    const canvasRect = canvasElement.getBoundingClientRect();
    const x = (boundingRect.left - canvasRect.left) / scale;
    const y = (boundingRect.top - canvasRect.top) / scale;
    const width = boundingRect.width / scale;
    const height = boundingRect.height / scale;
    
    // Get the selected text
    const content = selection.toString();
    
    // Create the annotation
    const annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> = {
      type: selectedTool as AnnotationType,
      pageNumber: currentPage,
      position: {
        x,
        y,
        width,
        height
      },
      content,
      style: {
        color: selectedTool === 'highlight' ? '#ffff00' : 
               selectedTool === 'underline' ? '#0000ff' : '#ff0000',
        opacity: 0.3,
        thickness: 2
      },
      sourceLanguage,
      targetLanguage
    };
    
    // Add the annotation
    addAnnotation(annotation);
    
    // Clear the selection
    selection.removeAllRanges();
  }, [addAnnotation, currentPage, scale, selectedTool, sourceLanguage, targetLanguage]);

  // Drawing annotation
  // Store drawing points
  let drawingPoints: Point[] = [];
  
  const startDrawing = useCallback((e: MouseEvent | React.MouseEvent<HTMLCanvasElement>, canvasElement: HTMLCanvasElement) => {
    if (!selectedTool || !['drawing', 'rectangle', 'ellipse', 'arrow'].includes(selectedTool)) return;
    
    // Convert to canvas coordinates
    const canvasRect = canvasElement.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left) / scale;
    const y = (e.clientY - canvasRect.top) / scale;
    
    // Initialize points array for drawing, or start position for shapes
    drawingPoints = [{ x, y }];
    
    // For shapes (rectangle, ellipse, arrow), create an initial annotation to be updated
    if (selectedTool !== 'drawing') {
      const annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> = {
        type: selectedTool as AnnotationType,
        pageNumber: currentPage,
        position: {
          x,
          y,
          width: 0,
          height: 0,
          points: [...drawingPoints]
        },
        style: {
          color: '#000000',
          opacity: 1,
          thickness: 2
        }
      };
      
      const newAnnotation = addAnnotation(annotation);
      return newAnnotation.id;
    }
    
    return null;
  }, [addAnnotation, currentPage, scale, selectedTool]);

  const continueDrawing = useCallback((e: MouseEvent | React.MouseEvent<HTMLCanvasElement>, canvasElement: HTMLCanvasElement, activeAnnotationId?: string) => {
    if (!selectedTool || !['drawing', 'rectangle', 'ellipse', 'arrow'].includes(selectedTool)) return;
    
    // Convert to canvas coordinates
    const canvasRect = canvasElement.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left) / scale;
    const y = (e.clientY - canvasRect.top) / scale;
    
    if (selectedTool === 'drawing') {
      // Add point to the drawing
      drawingPoints.push({ x, y });
    } else if (activeAnnotationId) {
      // Update shape dimensions
      const startPoint = drawingPoints[0];
      
      const annotation: Partial<Annotation> = {
        id: activeAnnotationId,
        position: {
          x: Math.min(startPoint.x, x),
          y: Math.min(startPoint.y, y),
          width: Math.abs(x - startPoint.x),
          height: Math.abs(y - startPoint.y),
          points: [startPoint, { x, y }]
        }
      };
      
      updateAnnotation(annotation as Annotation);
    }
  }, [selectedTool, scale, updateAnnotation]);

  const endDrawing = useCallback((canvasElement: HTMLCanvasElement, activeAnnotationId?: string) => {
    if (!selectedTool) return;
    
    if (selectedTool === 'drawing' && drawingPoints.length > 1) {
      // Process freehand drawing points
      const drawingOptions = {
        size: 4 * scale,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5
      };
      
      // Get the path from perfect-freehand
      const stroke = getStroke(drawingPoints, drawingOptions);
      
      // Create the annotation
      const annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'drawing',
        pageNumber: currentPage,
        position: {
          x: Math.min(...drawingPoints.map(p => p.x)),
          y: Math.min(...drawingPoints.map(p => p.y)),
          points: stroke.map((point: number[]) => ({ x: point[0], y: point[1] }))
        },
        style: {
          color: '#000000',
          opacity: 1,
          thickness: 2
        }
      };
      
      addAnnotation(annotation);
    }
    
    // Reset drawing points
    drawingPoints = [];
  }, [addAnnotation, currentPage, scale, selectedTool]);

  // Add text annotation
  const addTextAnnotation = useCallback((x: number, y: number, canvasElement: HTMLCanvasElement) => {
    if (selectedTool !== 'text') return;
    
    // Convert to canvas coordinates
    const canvasRect = canvasElement.getBoundingClientRect();
    const normalizedX = (x - canvasRect.left) / scale;
    const normalizedY = (y - canvasRect.top) / scale;
    
    const annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'text',
      pageNumber: currentPage,
      position: {
        x: normalizedX,
        y: normalizedY,
        width: 200 / scale, // Default width for text box
        height: 30 / scale
      },
      content: '',
      style: {
        color: '#000000',
        opacity: 1,
        fontSize: 16,
        fontFamily: 'Arial'
      }
    };
    
    return addAnnotation(annotation);
  }, [addAnnotation, currentPage, scale, selectedTool]);

  // Add translation annotation
  const addTranslationAnnotation = useCallback((content: string, x: number, y: number, width: number, height: number) => {
    const annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'translation',
      pageNumber: currentPage,
      position: {
        x,
        y,
        width,
        height
      },
      content,
      sourceLanguage,
      targetLanguage,
      style: {
        color: '#4a86e8',
        opacity: 0.1,
        fontSize: 14,
        fontFamily: 'Arial'
      }
    };
    
    return addAnnotation(annotation);
  }, [addAnnotation, currentPage, sourceLanguage, targetLanguage]);

  // Render annotations on canvas
  const renderAnnotations = useCallback((ctx: CanvasRenderingContext2D, annotations: Annotation[]) => {
    ctx.save();
    
    annotations.forEach(annotation => {
      const { type, position, style, content, translatedContent } = annotation;
      
      // Set styles based on annotation type
      ctx.strokeStyle = style.color;
      ctx.fillStyle = style.color;
      ctx.globalAlpha = style.opacity;
      ctx.lineWidth = style.thickness || 2;
      
      switch (type) {
        case 'highlight':
          // Draw highlight rectangle
          ctx.fillRect(position.x, position.y, position.width || 0, position.height || 0);
          break;
          
        case 'underline':
          // Draw underline
          ctx.beginPath();
          ctx.moveTo(position.x, position.y + (position.height || 0));
          ctx.lineTo(position.x + (position.width || 0), position.y + (position.height || 0));
          ctx.stroke();
          break;
          
        case 'strikethrough':
          // Draw strikethrough line in the middle
          ctx.beginPath();
          ctx.moveTo(position.x, position.y + (position.height || 0) / 2);
          ctx.lineTo(position.x + (position.width || 0), position.y + (position.height || 0) / 2);
          ctx.stroke();
          break;
          
        case 'drawing':
          // Draw freehand drawing
          if (position.points && position.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(position.points[0].x, position.points[0].y);
            
            for (let i = 1; i < position.points.length; i++) {
              ctx.lineTo(position.points[i].x, position.points[i].y);
            }
            
            ctx.stroke();
          }
          break;
          
        case 'rectangle':
          // Draw rectangle
          ctx.strokeRect(position.x, position.y, position.width || 0, position.height || 0);
          break;
          
        case 'ellipse':
          // Draw ellipse
          ctx.beginPath();
          ctx.ellipse(
            position.x + (position.width || 0) / 2,
            position.y + (position.height || 0) / 2,
            (position.width || 0) / 2,
            (position.height || 0) / 2,
            0, 0, 2 * Math.PI
          );
          ctx.stroke();
          break;
          
        case 'arrow':
          // Draw arrow
          if (position.points && position.points.length >= 2) {
            const start = position.points[0];
            const end = position.points[1];
            
            // Arrow body
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            
            // Arrow head
            const headLength = 15 / scale;
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            
            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle - Math.PI / 6),
              end.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              end.x - headLength * Math.cos(angle + Math.PI / 6),
              end.y - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }
          break;
          
        case 'text':
          // Draw text box
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(position.x, position.y, position.width || 0, position.height || 0);
          
          // Draw text content
          if (content) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = style.color;
            ctx.font = `${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
            ctx.fillText(content, position.x + 5, position.y + (position.height || 0) / 2 + 5);
          }
          break;
          
        case 'translation':
          // Draw translation annotation
          ctx.fillStyle = `${style.color}30`; // 30 = ~20% opacity in hex
          ctx.fillRect(position.x, position.y, position.width || 0, position.height || 0);
          
          // Draw original text
          if (content) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = style.color;
            ctx.font = `${style.fontSize || 14}px ${style.fontFamily || 'Arial'}`;
            ctx.fillText(content, position.x + 5, position.y + 15);
          }
          
          // Draw translated text if available
          if (translatedContent) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = style.color;
            ctx.font = `bold ${style.fontSize || 14}px ${style.fontFamily || 'Arial'}`;
            ctx.fillText(translatedContent, position.x + 5, position.y + 35);
          }
          break;
      }
    });
    
    ctx.restore();
  }, [scale]);

  return {
    createHighlightFromSelection,
    startDrawing,
    continueDrawing,
    endDrawing,
    addTextAnnotation,
    addTranslationAnnotation,
    renderAnnotations
  };
} 