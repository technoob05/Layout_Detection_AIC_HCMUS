import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, FileText, Upload, X } from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload";
import { PdfPreview } from "./PdfPreview";

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
}

export function FileUploadArea({
  onFileSelect,
  acceptedFileTypes = ['.pdf'],
  maxFileSize = 10,
  icon,
  title,
  description,
  loading = false,
  className
}: FileUploadAreaProps) {
  const {
    file,
    fileError,
    handleFileDrop,
    handleFileInput,
    triggerFileInput,
    resetFile,
    fileInputRef
  } = useFileUpload();
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleFileDrop(e);
    setIsDragging(false);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Pass the file to parent component when it's selected
  useEffect(() => {
    if (file) {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 1500);
      onFileSelect(file);
    } else {
      setShowPreview(false);
    }
  }, [file, onFileSelect]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        ref={fileInputRef}
        className="hidden"
      />
      
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center",
            "bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md",
            isDragging ? "border-primary bg-primary/5 scale-[1.02] shadow-lg ring-4 ring-primary/10" : "border-muted-foreground/25 hover:border-primary/50",
            isAnimating ? "animate-pulse" : ""
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className={cn(
              "size-20 rounded-full flex items-center justify-center transition-all duration-300",
              isDragging ? "bg-primary/20 scale-110" : "bg-muted"
            )}>
              <Upload className={cn(
                "size-10 transition-all duration-300",
                isDragging ? "text-primary animate-bounce" : "text-muted-foreground"
              )} />
            </div>
            
            <div className="max-w-xs mx-auto">
              <h3 className={cn(
                "text-xl font-medium mb-2 transition-all duration-300",
                isDragging ? "text-primary scale-105" : ""
              )}>
                {isDragging ? "Drop your PDF here" : "Upload PDF Document"}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop your file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: 10MB · PDF format only
              </p>
            </div>
            
            <Button 
              type="button"
              variant={isDragging ? "default" : "outline"}
              size="lg"
              className={cn(
                "mt-2 transition-all duration-300",
                isDragging ? "bg-primary text-primary-foreground" : ""
              )}
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
            >
              Browse Files
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={cn(
            "border rounded-xl p-6 bg-background/50 backdrop-blur-sm shadow-md transition-all duration-300",
            showSuccessAnimation ? "ring-4 ring-green-500/20" : ""
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "size-16 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500",
                showSuccessAnimation ? "bg-green-500/20" : "bg-primary/10"
              )}>
                <FileText className={cn(
                  "size-8 transition-all duration-500",
                  showSuccessAnimation ? "text-green-500" : "text-primary"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium truncate text-lg">{file.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-8 flex-shrink-0 hover:bg-primary/10" 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePreview();
                      }}
                    >
                      {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-8 flex-shrink-0 hover:bg-red-500/10 hover:text-red-500" 
                      onClick={(e) => {
                        e.stopPropagation();
                        resetFile();
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary"></span>
                    {formatFileSize(file.size)}
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                    PDF Document
                  </span>
                </div>
              </div>
            </div>
            
            {fileError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 text-sm">
                {fileError}
              </div>
            )}
          </div>
          
          {/* PDF Preview */}
          {showPreview && file && (
            <div className="mt-4">
              <PdfPreview 
                file={file} 
                onClose={() => setShowPreview(false)} 
                className="h-[500px]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 