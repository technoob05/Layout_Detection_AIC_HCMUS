import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslationPreviewProps {
  translatedPdfUrl: string;
  originalFileName: string;
  onClose?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function TranslationPreview({
  translatedPdfUrl,
  originalFileName,
  onClose,
  onDownload,
  className
}: TranslationPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleLoadSuccess = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      // Try to get total pages from iframe if possible
      const iframe = event.target as HTMLIFrameElement;
      if (iframe.contentWindow) {
        // This is a simplistic approach - actual page count might require PDF.js
        // For now we'll just set a placeholder
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error accessing PDF iframe content:", error);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={cn(
      "overflow-hidden flex flex-col",
      isFullscreen ? "fixed inset-0 z-50 rounded-none" : "relative",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="font-medium truncate flex-1">
          Translated: {originalFileName}
        </div>
        <div className="flex items-center gap-1">
          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onDownload}
              title="Download translated PDF"
            >
              <Download className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-muted/20 relative">
        <iframe
          src={`${translatedPdfUrl}#page=${currentPage}`}
          className="w-full h-full"
          title="Translation Preview"
          onLoad={handleLoadSuccess}
        />
      </div>

      {/* Footer with pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 border-t bg-muted/50">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
} 