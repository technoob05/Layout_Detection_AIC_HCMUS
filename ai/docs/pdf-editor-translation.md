# PDF Editor with Translation Integration

## Overview

The Advanced PDF Editor with Translation Integration is a powerful feature that allows users to annotate, edit, and translate PDF documents directly within the application. This feature combines robust PDF annotation capabilities with our existing translation technology to provide a seamless workflow for working with multilingual PDF content.

## Implementation Details

### Data Model

The PDF Editor uses the following key data structures:

- **Annotation**: Represents a single annotation in the PDF document, including highlights, underlines, text notes, drawings, shapes, and translations.
- **Point**: Represents a point coordinate, used for freehand drawings and shape positioning.
- **AnnotationStyle**: Contains styling properties for annotations such as color, opacity, thickness, etc.
- **PdfEditorState**: Manages the overall state of the PDF editor, including the document, current page, scale, and annotations.

### Components

1. **PdfEditor**: Main component that integrates all hooks and UI components
   - Handles the PDF document loading
   - Manages annotation creation, update, and deletion
   - Coordinates interactions between canvas and sidebar

2. **Toolbar**: Provides controls for:
   - Page navigation
   - Zoom controls
   - Annotation tools (highlight, underline, drawing, text, shapes)
   - Language selection for translation
   - Toggle sidebar visibility

3. **PdfCanvas**: Core display component that:
   - Renders PDF pages using PDF.js
   - Displays annotations on an overlay canvas
   - Handles mouse/touch interactions for annotations
   - Provides context menu for text translation

4. **AnnotationsSidebar**: Provides a UI for:
   - Viewing all annotations in the document
   - Filtering annotations by page
   - Editing annotation text
   - Initiating translations
   - Deleting annotations

### Hooks

1. **usePdfEditor**: Main hook for managing PDF document state
   - Loads PDF documents
   - Manages page navigation and zoom
   - Handles annotation CRUD operations
   - Renders PDF pages to canvas

2. **useAnnotations**: Hook for annotation-specific operations
   - Creates different types of annotations (highlight, text, drawing, shapes)
   - Manages annotation positioning and rendering
   - Handles user interactions for creating and editing annotations

3. **useTranslationIntegration**: Hook for translation functionality
   - Translates selected text or annotations
   - Manages translation state (loading, error handling)
   - Provides language options

### Utilities

- **renderAnnotations**: Helper function to render different types of annotations on the canvas
- Various helper functions for working with PDF and canvas elements

## Features

### PDF Viewing and Navigation
- Load and render PDF documents
- Navigate between pages
- Zoom in/out
- Smooth rendering with canvas-based display

### Annotation Tools
- **Text Markup**: Highlight, underline, strikethrough
- **Notes**: Add text annotations to the document
- **Drawing**: Freehand drawing with smoothing
- **Shapes**: Add rectangles, ellipses, and arrows
- **Translation**: Select text for translation while preserving context

### Translation Integration
- Translate highlighted text or annotations
- Multiple language support
- Inline translation display
- Translation history in sidebar

### Annotation Management
- View all annotations in sidebar
- Filter annotations by page
- Edit annotation text
- Delete annotations
- Translation of existing annotations

## User Flows

### Loading a PDF
1. User navigates to the PDF Editor
2. User uploads a PDF document through the file uploader
3. PDF is loaded and first page is displayed
4. User can begin annotating or navigating the document

### Creating Annotations
1. User selects an annotation tool from the toolbar
2. For text markup (highlight, underline, strikethrough):
   - User selects text on the PDF
   - Annotation is created on selection
3. For drawings and shapes:
   - User clicks and drags on the canvas
   - Shape is rendered according to mouse movement
4. For text annotations:
   - User clicks on the location to add text
   - Text input box appears for adding content

### Translating Content
1. User selects text on the PDF
2. User right-clicks to access context menu or uses the translate button
3. Text is translated according to selected language settings
4. Translation annotation appears below the selected text
5. Translation is also logged in the sidebar

## Usage Examples

```typescript
// Loading a PDF document
const handleFileSelect = async (files: File[]) => {
  if (files.length > 0) {
    await loadPdfDocument(files[0]);
  }
};

// Creating a highlight annotation
const createHighlight = () => {
  if (selection && pdfViewer) {
    const { content, position } = getSelectionDetails(selection);
    addAnnotation({
      type: 'highlight',
      content,
      position,
      pageNumber: currentPage,
      style: { color: '#ffff00', opacity: 0.3 }
    });
  }
};

// Translating selected text
const translateSelection = async () => {
  if (selection && pdfViewer) {
    const { content, position } = getSelectionDetails(selection);
    const translated = await translateText(content, sourceLanguage, targetLanguage);
    addAnnotation({
      type: 'translation',
      content,
      translatedContent: translated,
      position,
      pageNumber: currentPage,
      style: { color: '#4a86e8', opacity: 0.1 }
    });
  }
};
```

## Future Enhancements

- Export PDF with annotations
- Import/export annotations separately
- Collaborative annotation with real-time updates
- OCR integration for scanned documents
- Add more advanced drawing tools
- AR translation overlay for mobile viewing 