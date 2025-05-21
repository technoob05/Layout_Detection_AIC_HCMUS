import { useState } from "react";
import { pdfTranslationApi } from "../api/pdfTranslationApi";
import { ExtractedTextResult } from "../types";

export interface UseTextExtractionResult {
  extractedText: ExtractedTextResult | null;
  isExtracting: boolean;
  isExtracted: boolean;
  isError: boolean;
  errorMessage: string | null;
  extractText: (file: File) => Promise<void>;
  resetExtraction: () => void;
}

/**
 * Hook to manage PDF text extraction
 */
export const useTextExtraction = (): UseTextExtractionResult => {
  const [extractedText, setExtractedText] = useState<ExtractedTextResult | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isExtracted, setIsExtracted] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const extractText = async (file: File) => {
    setIsExtracting(true);
    setIsError(false);
    setErrorMessage(null);
    setExtractedText(null);
    
    try {
      const result = await pdfTranslationApi.extractText(file);
      
      if (!result) {
        setIsError(true);
        setErrorMessage("Failed to extract text from PDF");
        setIsExtracting(false);
        return;
      }
      
      setExtractedText(result);
      setIsExtracted(true);
      setIsExtracting(false);
    } catch (error) {
      console.error("Error extracting text:", error);
      setIsError(true);
      setErrorMessage("Failed to extract text from PDF");
      setIsExtracting(false);
    }
  };

  const resetExtraction = () => {
    setExtractedText(null);
    setIsExtracting(false);
    setIsExtracted(false);
    setIsError(false);
    setErrorMessage(null);
  };

  return {
    extractedText,
    isExtracting,
    isExtracted,
    isError,
    errorMessage,
    extractText,
    resetExtraction
  };
}; 