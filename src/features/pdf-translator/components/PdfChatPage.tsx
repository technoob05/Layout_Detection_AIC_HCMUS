import { useState, useEffect } from 'react';
import { FileUploadArea } from './FileUploadArea';
import { useFileUpload } from '../hooks/useFileUpload';
import { useTextExtraction } from '../hooks/useTextExtraction';
import { PdfChat } from './PdfChat';
import { EnhancedPdfChat } from './EnhancedPdfChat';
import { PdfNotebook } from '../../pdf-notebook/components/PdfNotebook';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Upload,
  AlertCircle,
  Sparkles,
  FileText,
  Info,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enum for UI modes
enum UiMode {
  CLASSIC = "classic",
  ENHANCED = "enhanced",
  NOTEBOOK = "notebook"
}

export function PdfChatPage() {
  const [uiMode, setUiMode] = useState<UiMode>(UiMode.NOTEBOOK);
  const { 
    file,
    fileUrl,
    fileName,
    handleFileSelect,
    handleClearFile,
    fileError
  } = useFileUpload();
  
  const {
    extractText,
    extractedText,
    loading: extracting,
    error: extractionError,
    progress: extractionProgress,
    resetExtraction
  } = useTextExtraction();
  
  // Extract text from PDF when uploaded
  useEffect(() => {
    if (file && !extractedText) {
      extractText(file);
    }
  }, [file, extractedText, extractText]);
  
  // Reset extracted text when file is cleared
  useEffect(() => {
    if (!file) {
      resetExtraction();
    }
  }, [file, resetExtraction]);

  // Render appropriate UI based on the selected mode
  const renderChatUI = () => {
    switch (uiMode) {
      case UiMode.NOTEBOOK:
        return <PdfNotebook 
          pdfContent={extractedText || ''} 
          pdfTitle={fileName || 'Document'} 
          pdfFile={file || undefined}
        />;
      case UiMode.ENHANCED:
        return <EnhancedPdfChat 
          pdfContent={extractedText || ''} 
          pdfTitle={fileName || 'Document'} 
        />;
      case UiMode.CLASSIC:
      default:
        return <PdfChat 
          pdfContent={extractedText || ''} 
          pdfTitle={fileName || 'Document'} 
          modernUI={true} 
        />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/50">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Bot className="size-6 text-primary" />
            <h1 className="text-xl font-semibold">PDF Chat</h1>
            <Badge variant="outline" className="ml-2">
              AI-powered
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {extractedText && (
              <div className="flex items-center bg-muted/50 rounded-lg p-1">
                <Button 
                  variant={uiMode === UiMode.CLASSIC ? "secondary" : "ghost"}
                  size="sm" 
                  onClick={() => setUiMode(UiMode.CLASSIC)}
                  className="gap-1 h-8"
                >
                  Classic
                </Button>
                <Button 
                  variant={uiMode === UiMode.ENHANCED ? "secondary" : "ghost"}
                  size="sm" 
                  onClick={() => setUiMode(UiMode.ENHANCED)}
                  className="gap-1 h-8"
                >
                  Enhanced
                  <Sparkles className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button 
                  variant={uiMode === UiMode.NOTEBOOK ? "secondary" : "ghost"}
                  size="sm" 
                  onClick={() => setUiMode(UiMode.NOTEBOOK)}
                  className="gap-1 h-8"
                >
                  Notebook
                  <BookOpen className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
            
            {file && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFile}
                className="gap-1"
              >
                <FileText className="h-4 w-4 mr-1" />
                <span className="truncate max-w-40">{fileName}</span>
                <span className="sr-only">Clear file</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-6 px-4">
        {!file ? (
          <div className="max-w-xl mx-auto">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Chat with your PDF</h2>
                  <p className="text-muted-foreground">
                    Upload a PDF document to ask questions and get instant answers based on its content.
                  </p>
                </div>
                
                <FileUploadArea
                  onFileSelect={handleFileSelect}
                  acceptedFileTypes={['application/pdf']}
                  maxFileSize={10}
                  icon={<Upload className="size-6" />}
                  title="Upload a PDF document"
                  description="Drag and drop or click to browse"
                  loading={false}
                />
                
                {fileError && (
                  <div className="flex items-start gap-2 mt-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{fileError}</span>
                  </div>
                )}
                
                <div className="bg-muted/50 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1 font-medium">Before you upload:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Your PDF is processed locally in your browser</li>
                        <li>Only relevant portions are sent to the AI when you ask questions</li>
                        <li>Maximum file size: 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : extracting || !extractedText ? (
          <div className="max-w-xl mx-auto">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold mb-2">Extracting text from PDF</h2>
                  <p className="text-muted-foreground">
                    Please wait while we process your document...
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-in-out"
                      style={{ width: `${extractionProgress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing...</span>
                    <span>{extractionProgress}%</span>
                  </div>
                </div>
                
                {extractionError && (
                  <div className="flex items-start gap-2 mt-6 p-3 bg-destructive/10 rounded-md text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Error processing PDF</p>
                      <p>{extractionError}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={uiMode === UiMode.NOTEBOOK ? "h-[calc(100vh-110px)] -mx-4" : "h-[calc(100vh-110px)]"}>
            {renderChatUI()}
          </div>
        )}
      </main>
    </div>
  );
} 