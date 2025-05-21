import { useRef, useState } from "react";

export interface UseFileUploadResult {
  file: File | null;
  fileUrl?: string;
  fileName?: string;
  fileError: string | null;
  handleFileDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  resetFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (file: File) => void;
  handleClearFile: () => void;
}

/**
 * Hook to manage file uploads
 */
export const useFileUpload = (): UseFileUploadResult => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setFileError("File size exceeds 10MB limit");
      return false;
    }

    // Check file type (only PDF)
    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are supported");
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setFile(file);
      setFileName(file.name);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFileSelect = (file: File) => {
    handleFile(file);
  };

  const handleClearFile = () => {
    resetFile();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetFile = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(null);
    setFileUrl(undefined);
    setFileName(undefined);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    file,
    fileUrl,
    fileName,
    fileError,
    handleFileDrop,
    handleFileInput,
    triggerFileInput,
    resetFile,
    fileInputRef,
    handleFileSelect,
    handleClearFile
  };
}; 