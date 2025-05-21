import { Annotation, Point } from '../types';

/**
 * Renders all annotations on a canvas context
 */
export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: Annotation[],
  selectedAnnotation: Annotation | null,
  isTranslating: boolean,
  currentTranslationId: string | null
): void {
  // Clear canvas first
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Render each annotation
  annotations.forEach(annotation => {
    const isSelected = selectedAnnotation?.id === annotation.id;
    const isCurrentlyTranslating = isTranslating && currentTranslationId === annotation.id;
    
    // Set global alpha based on the annotation's opacity
    ctx.globalAlpha = annotation.style.opacity;
    
    // Common style setup
    ctx.strokeStyle = annotation.style.color;
    ctx.fillStyle = annotation.style.color;
    ctx.lineWidth = annotation.style.thickness || 2;
    
    // Handle different annotation types
    switch (annotation.type) {
      case 'highlight':
      case 'underline':
      case 'strikethrough':
        renderTextMarkAnnotation(ctx, annotation, isSelected);
        break;
      case 'text':
        renderTextAnnotation(ctx, annotation, isSelected);
        break;
      case 'drawing':
        renderDrawingAnnotation(ctx, annotation, isSelected);
        break;
      case 'rectangle':
        renderRectangleAnnotation(ctx, annotation, isSelected);
        break;
      case 'ellipse':
        renderEllipseAnnotation(ctx, annotation, isSelected);
        break;
      case 'arrow':
        renderArrowAnnotation(ctx, annotation, isSelected);
        break;
      case 'translation':
        renderTranslationAnnotation(ctx, annotation, isSelected);
        break;
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1.0;
    
    // Draw selection indicator if selected
    if (isSelected) {
      drawSelectionIndicator(ctx, annotation);
    }
    
    // Show loading indicator if translating
    if (isCurrentlyTranslating) {
      drawTranslatingIndicator(ctx, annotation);
    }
  });
}

/**
 * Renders highlight, underline, or strikethrough annotation
 */
function renderTextMarkAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  const { position, type } = annotation;
  const { x, y, width, height } = position;
  
  // Set styles based on annotation type
  switch (type) {
    case 'highlight':
      // Fill rectangle with color
      ctx.fillRect(x, y, width || 0, height || 0);
      break;
    case 'underline':
      // Draw line under the text
      ctx.beginPath();
      ctx.moveTo(x, y + (height || 0));
      ctx.lineTo(x + (width || 0), y + (height || 0));
      ctx.stroke();
      break;
    case 'strikethrough':
      // Draw line through the middle of the text
      ctx.beginPath();
      ctx.moveTo(x, y + (height || 0) / 2);
      ctx.lineTo(x + (width || 0), y + (height || 0) / 2);
      ctx.stroke();
      break;
  }
  
  // Draw content tooltip if available
  if (annotation.content && isSelected) {
    drawContentTooltip(ctx, annotation);
  }
}

/**
 * Renders text annotation
 */
function renderTextAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  const { position, style } = annotation;
  const { x, y, width, height } = position;
  
  // Draw text box background
  ctx.fillRect(x, y, width || 150, height || 30);
  
  // Draw text box border
  ctx.strokeRect(x, y, width || 150, height || 30);
  
  // Draw text if available
  if (annotation.content) {
    // Save context to restore later
    ctx.save();
    
    // Set text style
    ctx.font = `${style.fontSize || 12}px ${style.fontFamily || 'Arial'}`;
    ctx.fillStyle = "#000000"; // Black text
    ctx.globalAlpha = 1.0;
    
    // Draw text inside box with padding
    const padding = 5;
    ctx.fillText(
      truncateText(annotation.content, (width || 150) - padding * 2, ctx),
      x + padding,
      y + padding + (style.fontSize || 12)
    );
    
    // Restore context
    ctx.restore();
  }
  
  // Draw translated content if available
  if (annotation.translatedContent) {
    drawTranslationText(ctx, annotation);
  }
}

/**
 * Renders drawing annotation
 */
function renderDrawingAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  const { position } = annotation;
  const { points } = position;
  
  if (!points || points.length < 2) return;
  
  // Draw the path
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  // Set line style
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  // Stroke the path
  ctx.stroke();
}

/**
 * Renders rectangle annotation
 */
function renderRectangleAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  const { position } = annotation;
  const { x, y, width, height } = position;
  
  // Draw rectangle
  ctx.strokeRect(x, y, width || 0, height || 0);
}

/**
 * Renders ellipse annotation
 */
function renderEllipseAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  const { position } = annotation;
  const { x, y, width, height } = position;
  
  // Calculate ellipse parameters
  const radiusX = (width || 0) / 2;
  const radiusY = (height || 0) / 2;
  const centerX = x + radiusX;
  const centerY = y + radiusY;
  
  // Draw ellipse
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Renders arrow annotation
 */
function renderArrowAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  const { position } = annotation;
  const { points } = position;
  
  if (!points || points.length < 2) return;
  
  const startPoint = points[0];
  const endPoint = points[1];
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();
  
  // Draw arrow head
  const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
  const arrowLength = 15;
  
  ctx.beginPath();
  ctx.moveTo(endPoint.x, endPoint.y);
  ctx.lineTo(
    endPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
    endPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endPoint.x, endPoint.y);
  ctx.lineTo(
    endPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
    endPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

/**
 * Renders translation annotation
 */
function renderTranslationAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  isSelected: boolean
): void {
  const { position } = annotation;
  const { x, y, width, height } = position;
  
  // Highlight the original text
  ctx.fillRect(x, y, width || 0, height || 0);
  
  // Draw border
  ctx.strokeRect(x, y, width || 0, height || 0);
  
  // Draw translated content if available
  if (annotation.translatedContent) {
    drawTranslationText(ctx, annotation);
  }
}

/**
 * Draws selection indicator around an annotation
 */
function drawSelectionIndicator(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation
): void {
  const { position } = annotation;
  
  // Save context to restore later
  ctx.save();
  
  // Set selection indicator style
  ctx.strokeStyle = '#3b82f6'; // Blue
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 2]);
  ctx.globalAlpha = 1.0;
  
  // Draw selection box
  if (position.width && position.height) {
    // Rectangle-based annotation
    ctx.strokeRect(
      position.x - 2,
      position.y - 2,
      position.width + 4,
      position.height + 4
    );
  } else if (position.points) {
    // Path-based annotation (drawing)
    // Calculate bounding box
    const minX = Math.min(...position.points.map(p => p.x));
    const maxX = Math.max(...position.points.map(p => p.x));
    const minY = Math.min(...position.points.map(p => p.y));
    const maxY = Math.max(...position.points.map(p => p.y));
    
    // Draw selection box around the path
    ctx.strokeRect(
      minX - 2,
      minY - 2,
      maxX - minX + 4,
      maxY - minY + 4
    );
  }
  
  // Restore context
  ctx.restore();
}

/**
 * Draws content tooltip for an annotation
 */
function drawContentTooltip(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation
): void {
  if (!annotation.content) return;
  
  const { position } = annotation;
  const text = annotation.content;
  
  // Save context to restore later
  ctx.save();
  
  // Set tooltip style
  ctx.font = '12px Arial';
  ctx.fillStyle = '#ffffff'; // White background
  ctx.strokeStyle = '#000000'; // Black border
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.9;
  
  // Calculate tooltip dimensions
  const padding = 5;
  const textWidth = ctx.measureText(text).width;
  const tooltipWidth = textWidth + padding * 2;
  const tooltipHeight = 20;
  
  // Position tooltip above the annotation
  const tooltipX = position.x;
  const tooltipY = position.y - tooltipHeight - 5;
  
  // Draw tooltip background
  ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
  ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
  
  // Draw text
  ctx.fillStyle = '#000000'; // Black text
  ctx.fillText(text, tooltipX + padding, tooltipY + 14);
  
  // Restore context
  ctx.restore();
}

/**
 * Draws translated text for an annotation
 */
function drawTranslationText(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation
): void {
  if (!annotation.translatedContent) return;
  
  const { position } = annotation;
  const { x, y, width, height } = position;
  const text = annotation.translatedContent;
  
  // Save context to restore later
  ctx.save();
  
  // Set translation popup style
  ctx.font = '12px Arial';
  ctx.fillStyle = '#f8fafc'; // Light background
  ctx.strokeStyle = '#3b82f6'; // Blue border
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.95;
  
  // Calculate popup dimensions
  const padding = 8;
  const lineHeight = 16;
  const maxWidth = 200;
  
  // Measure and wrap text
  const lines = wrapText(text, maxWidth, ctx);
  const popupWidth = maxWidth + padding * 2;
  const popupHeight = lines.length * lineHeight + padding * 2;
  
  // Position popup below the annotation
  const popupX = x;
  const popupY = y + (height || 0) + 5;
  
  // Draw popup background
  ctx.fillRect(popupX, popupY, popupWidth, popupHeight);
  ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);
  
  // Draw text
  ctx.fillStyle = '#334155'; // Dark gray text
  ctx.globalAlpha = 1.0;
  
  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      popupX + padding,
      popupY + padding + lineHeight * index + 12
    );
  });
  
  // Restore context
  ctx.restore();
}

/**
 * Draws translating indicator for an annotation
 */
function drawTranslatingIndicator(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation
): void {
  const { position } = annotation;
  const { x, y, width, height } = position;
  
  // Save context to restore later
  ctx.save();
  
  // Set indicator style
  ctx.font = '12px Arial';
  ctx.fillStyle = '#3b82f6'; // Blue background
  ctx.globalAlpha = 0.8;
  
  // Draw indicator text
  const text = 'Translating...';
  const textWidth = ctx.measureText(text).width;
  const padding = 5;
  const indicatorWidth = textWidth + padding * 2;
  const indicatorHeight = 20;
  
  // Position indicator
  const indicatorX = x + ((width || 0) - indicatorWidth) / 2;
  const indicatorY = y + ((height || 0) - indicatorHeight) / 2;
  
  // Draw indicator background
  ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
  
  // Draw text
  ctx.fillStyle = '#ffffff'; // White text
  ctx.globalAlpha = 1.0;
  ctx.fillText(text, indicatorX + padding, indicatorY + 14);
  
  // Restore context
  ctx.restore();
}

/**
 * Wraps text into multiple lines based on a maximum width
 */
function wrapText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  lines.push(currentLine);
  return lines;
}

/**
 * Truncates text to fit within a maximum width
 */
function truncateText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  
  let truncated = text;
  
  while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  
  return truncated + '...';
} 