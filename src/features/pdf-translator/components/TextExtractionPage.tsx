import { useState } from "react";
import { FileUploadArea } from "./FileUploadArea";
import { useTextExtraction } from "../hooks/useTextExtraction";
import { ExtractedTextPage as ExtractedPage } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Download, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TextExtractionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activePage, setActivePage] = useState<number>(0);
  
  const {
    extractedText,
    isExtracting,
    isExtracted,
    isError,
    errorMessage,
    extractText,
    resetExtraction
  } = useTextExtraction();

  // Handle file selection
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    extractText(file);
  };

  // Handle JSON download
  const handleDownloadJson = () => {
    if (!extractedText) return;
    
    const jsonString = JSON.stringify(extractedText, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedFile?.name.replace(".pdf", "") || "extracted"}_text_and_bboxes.json`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle reset
  const handleReset = () => {
    resetExtraction();
    setSelectedFile(null);
    setActivePage(0);
  };

  // Safe access to extracted text and pages
  const pages = extractedText?.pages || [];
  const currentPage = activePage < pages.length ? pages[activePage] : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">PDF Text Extraction</h1>
        <p className="text-muted-foreground">
          Extract text from PDF documents with bounding box coordinates
        </p>
      </header>

      <div className="space-y-8">
        {/* Step 1: File Upload */}
        {!isExtracted && !isExtracting && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload your PDF file</h2>
            <FileUploadArea 
              onFileSelect={handleFileSelected} 
              className="mb-6"
            />
          </div>
        )}

        {/* Processing Indicator */}
        {isExtracting && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                Extracting Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-4">
                Extracting text from {selectedFile?.name}. Please wait...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {isError && errorMessage && (
          <Card className="border-red-300 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="size-5" />
                Extraction Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{errorMessage}</p>
              <Button onClick={handleReset}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Extracted Results */}
        {isExtracted && extractedText && pages.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">
                Extracted Text from {selectedFile?.name}
              </h2>
              <div className="flex gap-2">
                <Button onClick={handleDownloadJson} className="flex items-center gap-2">
                  <Download className="size-4" />
                  Download JSON
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Extract Another File
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Extracted Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Page Navigation */}
                <div className="mb-4">
                  <p className="mb-2">Select page:</p>
                  <div className="flex flex-wrap gap-2">
                    {pages.map((page, idx) => (
                      <Button
                        key={idx}
                        variant={activePage === idx ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivePage(idx)}
                      >
                        {idx + 1}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Page Content */}
                {currentPage ? (
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="text">Text Content</TabsTrigger>
                      <TabsTrigger value="raw">Raw Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4">
                      <PageTextView page={currentPage} />
                    </TabsContent>

                    <TabsContent value="raw">
                      <pre className={cn(
                        "p-4 bg-muted rounded-md overflow-auto max-h-[60vh]",
                        "text-xs sm:text-sm font-mono whitespace-pre-wrap"
                      )}>
                        {JSON.stringify(currentPage, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No page content available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Component to display text content of a page
function PageTextView({ page }: { page: ExtractedPage }) {
  if (!page || !page.chunks || page.chunks.length === 0) {
    return <p className="text-muted-foreground">No text content found on this page.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-2">
        Page {page.page_number} - {page.chunks.length} text chunks found
      </p>
      
      <div className="p-4 border rounded-md bg-background space-y-4">
        {page.chunks.map((chunk, idx) => (
          <div key={idx} className="group relative">
            <div className="p-2 rounded-md group-hover:bg-muted transition-colors duration-150">
              <p className="whitespace-pre-wrap">{chunk.text}</p>
              <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Box coords: [{chunk.box.join(', ')}]
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 