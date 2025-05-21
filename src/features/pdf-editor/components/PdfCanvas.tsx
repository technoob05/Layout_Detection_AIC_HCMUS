import { useRef, useEffect, useState, MouseEvent } from 'react';
import { Annotation, AnnotationType } from '../types';
import { cn } from '@/lib/utils';
import { renderAnnotations } from '../utils/renderAnnotations';

interface PdfCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  selectedTool: AnnotationType | null;
  isTranslating: boolean;
  currentTranslationId: string | null;
  onSelectAnnotation: (annotation: Annotation | null) => void;
  onCreateHighlight: (canvasElement: HTMLCanvasElement) => void;
  onStartDrawing: (e: React.MouseEvent<HTMLCanvasElement>, canvasElement: HTMLCanvasElement) => string | null;
  onContinueDrawing: (e: React.MouseEvent<HTMLCanvasElement>, canvasElement: HTMLCanvasElement, activeAnnotationId?: string) => void;
  onEndDrawing: (canvasElement: HTMLCanvasElement, activeAnnotationId?: string) => void;
  onAddTextAnnotation: (x: number, y: number, canvasElement: HTMLCanvasElement) => void;
  onTranslateAnnotation: (annotation: Annotation) => Promise<void>;
  onTranslateSelection: (text: string, x: number, y: number, width: number, height: number) => Promise<void>;
}

export function PdfCanvas({
  canvasRef,
  annotations,
  selectedAnnotation,
  selectedTool,
  isTranslating,
  currentTranslationId,
  onSelectAnnotation,
  onCreateHighlight,
  onStartDrawing,
  onContinueDrawing,
  onEndDrawing,
  onAddTextAnnotation,
  onTranslateSelection
}: PdfCanvasProps) {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const interactionLayerRef = useRef<HTMLDivElement>(null);
  
  // Render annotations on overlay canvas whenever annotations change
  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas || !canvasRef.current) return;
    
    // Match overlay canvas size to main canvas
    overlayCanvas.width = canvasRef.current.width;
    overlayCanvas.height = canvasRef.current.height;
    
    // Get canvas context
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Render annotations
    renderAnnotations(ctx, annotations, selectedAnnotation, isTranslating, currentTranslationId);
  }, [annotations, selectedAnnotation, isTranslating, currentTranslationId]);
  
  // Event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    // Convert div coordinates to canvas coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasEvent = {
      ...e,
      nativeEvent: {
        ...e.nativeEvent,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      }
    } as unknown as React.MouseEvent<HTMLCanvasElement>;
    
    // Handle different tools
    if (['drawing', 'rectangle', 'ellipse', 'arrow'].includes(selectedTool || '')) {
      setIsDrawing(true);
      const id = onStartDrawing(canvasEvent, canvasRef.current);
      if (id) setActiveAnnotationId(id);
    } else if (selectedTool === 'text') {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onAddTextAnnotation(x, y, canvasRef.current);
    } else {
      // Check if clicking on an annotation
      const clickedAnnotation = findAnnotationAtPoint(e.clientX - rect.left, e.clientY - rect.top, annotations);
      onSelectAnnotation(clickedAnnotation);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    // Convert div coordinates to canvas coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasEvent = {
      ...e,
      nativeEvent: {
        ...e.nativeEvent,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      }
    } as unknown as React.MouseEvent<HTMLCanvasElement>;
    
    onContinueDrawing(canvasEvent, canvasRef.current, activeAnnotationId || undefined);
  };
  
  const handleMouseUp = () => {
    if (isDrawing && canvasRef.current) {
      onEndDrawing(canvasRef.current, activeAnnotationId || undefined);
      setIsDrawing(false);
      setActiveAnnotationId(null);
    }
  };
  
  const handleMouseLeave = () => {
    if (isDrawing && canvasRef.current) {
      onEndDrawing(canvasRef.current, activeAnnotationId || undefined);
      setIsDrawing(false);
      setActiveAnnotationId(null);
    }
  };
  
  const handleDoubleClick = () => {
    if (['highlight', 'underline', 'strikethrough'].includes(selectedTool || '') && canvasRef.current) {
      onCreateHighlight(canvasRef.current);
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    const x = rect.left - canvasRect.left;
    const y = rect.top - canvasRect.top;
    const width = rect.width;
    const height = rect.height;
    
    // Translate selected text
    onTranslateSelection(selection.toString(), x, y, width, height);
    
    // Clear selection
    selection.removeAllRanges();
  };
  
  // Helper function to find annotation at a point
  const findAnnotationAtPoint = (x: number, y: number, annotations: Annotation[]): Annotation | null => {
    // Check in reverse order (top-most first)
    for (let i = annotations.length - 1; i >= 0; i--) {
      const annotation = annotations[i];
      const { position } = annotation;
      
      if (position.width && position.height) {
        // Rectangle-based annotation
        if (
          x >= position.x &&
          x <= position.x + position.width &&
          y >= position.y &&
          y <= position.y + position.height
        ) {
          return annotation;
        }
      } else if (position.points) {
        // Path-based annotation (drawing)
        // Simple bounding box check for now
        const minX = Math.min(...position.points.map(p => p.x));
        const maxX = Math.max(...position.points.map(p => p.x));
        const minY = Math.min(...position.points.map(p => p.y));
        const maxY = Math.max(...position.points.map(p => p.y));
        
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return annotation;
        }
      }
    }
    
    return null;
  };

  // Update interaction layer dimensions when canvas size changes
  useEffect(() => {
    if (canvasRef.current && interactionLayerRef.current) {
      interactionLayerRef.current.style.width = `${canvasRef.current.width}px`;
      interactionLayerRef.current.style.height = `${canvasRef.current.height}px`;
    }
  }, [canvasRef.current?.width, canvasRef.current?.height]);
  
  return (
    <div className="relative inline-block shadow-lg" style={{ touchAction: 'none' }}>
      {/* Main canvas for PDF rendering */}
      <canvas
        ref={canvasRef}
        className={cn(
          "block",
          selectedTool === 'text' && 'cursor-text',
          selectedTool === 'drawing' && 'cursor-crosshair',
          ['rectangle', 'ellipse', 'arrow'].includes(selectedTool || '') && 'cursor-crosshair',
          ['highlight', 'underline', 'strikethrough'].includes(selectedTool || '') && 'cursor-text',
          !selectedTool && 'cursor-default'
        )}
      />
      
      {/* Overlay canvas for annotations */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ 
          width: canvasRef.current?.width,
          height: canvasRef.current?.height
        }}
      />
      
      {/* Interaction layer */}
      <div
        ref={interactionLayerRef}
        className="absolute top-0 left-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      />
      
      {/* Loading overlay */}
      {isTranslating && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="animate-pulse text-primary font-semibold">
            Translating...
          </div>
        </div>
      )}
    </div>
  );
} 