import { useRef, useState, useEffect } from 'react';
import { usePdfEditor } from '../hooks/usePdfEditor';
import { useAnnotations } from '../hooks/useAnnotations';
import { useTranslationIntegration } from '../hooks/useTranslationIntegration';
import { AnnotationType } from '../types';
import { Toolbar } from './Toolbar';
import { PdfCanvas } from './PdfCanvas';
import { AnnotationsSidebar } from './AnnotationsSidebar';
import { cn } from '@/lib/utils';
import { FileUploader } from '@/components/ui/file-uploader';

export function PdfEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const {
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
  } = usePdfEditor();

  const annotations = useAnnotations({
    addAnnotation,
    updateAnnotation,
    currentPage: state.currentPage,
    selectedTool: state.selectedTool,
    scale: state.scale,
    sourceLanguage: state.sourceLanguage,
    targetLanguage: state.targetLanguage
  });

  const translation = useTranslationIntegration({
    updateAnnotation
  });

  // Render PDF page whenever relevant state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && state.pdfDocument) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderPage(ctx, state.currentPage);
      }
    }
  }, [state.pdfDocument, state.currentPage, state.scale, renderPage]);

  // Handle file selection for PDF upload
  const handleFileSelect = async (fileList: FileList | null): Promise<void> => {
    if (!fileList || fileList.length === 0) return;
    
    // Convert FileList to File array
    const files = Array.from(fileList);
    
    if (files.length > 0) {
      await loadPdfDocument(files[0]);
    }
  };

  // Wrapper function to add a translation annotation
  const addTranslationAnnotation = (text: string, x: number, y: number, width: number, height: number) => {
    return addAnnotation({
      type: 'translation',
      pageNumber: state.currentPage,
      position: {
        x,
        y,
        width,
        height
      },
      content: text,
      style: {
        color: '#4f46e5', // Indigo color for translations
        opacity: 0.2,
        thickness: 2
      },
      sourceLanguage: state.sourceLanguage,
      targetLanguage: state.targetLanguage
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {!state.pdfDocument ? (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Upload a PDF to get started</h2>
          <FileUploader 
            onFilesSelected={handleFileSelect}
            accept=".pdf"
            maxFiles={1}
            maxSize={100 * 1024 * 1024} // 100MB limit
            className="w-full max-w-xl"
          />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <Toolbar 
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            scale={state.scale}
            selectedTool={state.selectedTool}
            isEditing={state.isEditing}
            sourceLanguage={state.sourceLanguage}
            targetLanguage={state.targetLanguage}
            onPageChange={goToPage}
            onScaleChange={setScale}
            onToolSelect={setSelectedTool}
            onLanguageChange={setLanguages}
            availableLanguages={translation.getAvailableLanguages()}
            toggleSidebar={() => setShowSidebar(prev => !prev)}
            showSidebar={showSidebar}
          />
          
          <div className="flex flex-1 overflow-hidden">
            <div className={cn(
              "flex-1 overflow-auto p-4 flex justify-center", 
              { "mr-[320px]": showSidebar }
            )}>
              <PdfCanvas 
                canvasRef={canvasRef}
                annotations={getCurrentPageAnnotations()}
                selectedAnnotation={state.selectedAnnotation}
                selectedTool={state.selectedTool as AnnotationType}
                isTranslating={translation.isTranslating}
                currentTranslationId={translation.currentTranslationId}
                onSelectAnnotation={selectAnnotation}
                onCreateHighlight={annotations.createHighlightFromSelection}
                onStartDrawing={annotations.startDrawing}
                onContinueDrawing={annotations.continueDrawing}
                onEndDrawing={annotations.endDrawing}
                onAddTextAnnotation={annotations.addTextAnnotation}
                onTranslateAnnotation={translation.translateAnnotation}
                onTranslateSelection={(text, x, y, width, height) => 
                  translation.translateSelectedText(
                    text, 
                    addTranslationAnnotation, 
                    state.sourceLanguage, 
                    state.targetLanguage,
                    x, y, width, height
                  )
                }
              />
            </div>
            
            {showSidebar && (
              <AnnotationsSidebar 
                annotations={state.annotations}
                currentPage={state.currentPage}
                selectedAnnotation={state.selectedAnnotation}
                onSelectAnnotation={selectAnnotation}
                onUpdateAnnotation={updateAnnotation}
                onDeleteAnnotation={deleteAnnotation}
                onTranslateAnnotation={translation.translateAnnotation}
                isTranslating={translation.isTranslating}
                currentTranslationId={translation.currentTranslationId}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 