import { useState, useCallback, useRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/components/ui/notification-toast";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesSelected: (files: FileList | null) => void;
  className?: string;
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function FileUploader({
  accept = "*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  onFilesSelected,
  className,
  icon,
  title = "Upload files",
  subtitle = "Drag and drop or click to browse",
  disabled = false
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, [disabled]);

  const validateFiles = useCallback((files: FileList | null): FileList | null => {
    if (!files || files.length === 0) return null;
    
    // Check file count
    if (maxFiles && files.length > maxFiles) {
      Notification.warning(`Too many files`, {
        description: `You can only upload a maximum of ${maxFiles} file${maxFiles > 1 ? 's' : ''}.`
      });
      return null;
    }

    // Check file types and sizes
    const acceptedTypes = accept.split(",").map(type => type.trim());
    const fileArray = Array.from(files);
    
    const invalidFiles = fileArray.filter(file => {
      // Check file type
      if (accept !== "*" && !acceptedTypes.some(type => {
        if (type.startsWith(".")) {
          // Extension check (e.g., .pdf)
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else {
          // MIME type check (e.g., image/*)
          return new RegExp(type.replace("*", ".*")).test(file.type);
        }
      })) {
        Notification.error(`Invalid file type`, {
          description: `The file "${file.name}" is not of an accepted type.`
        });
        return true;
      }
      
      // Check file size
      if (maxSize && file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024) * 10) / 10;
        Notification.error(`File too large`, {
          description: `The file "${file.name}" exceeds the maximum size of ${sizeMB}MB.`
        });
        return true;
      }
      
      return false;
    });
    
    if (invalidFiles.length > 0) return null;
    
    return files;
  }, [accept, maxFiles, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const validFiles = validateFiles(e.dataTransfer.files);
    onFilesSelected(validFiles);
  }, [disabled, validateFiles, onFilesSelected]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files);
    onFilesSelected(validFiles);
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [validateFiles, onFilesSelected]);

  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-6 cursor-pointer",
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-input",
        disabled 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:border-primary/50 hover:bg-muted/40",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={maxFiles !== 1}
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <Button 
        type="button" 
        className="mt-4"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleButtonClick();
        }}
      >
        Browse files
      </Button>
    </div>
  );
} 