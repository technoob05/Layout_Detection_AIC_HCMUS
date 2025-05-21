import { useState } from "react";
import { FileUploadArea } from "./FileUploadArea";
import { TranslationForm } from "./TranslationForm";
import { TranslationProgress } from "./TranslationProgress";
import { useTranslationData } from "../hooks/useTranslationData";
import { useTranslationTask } from "../hooks/useTranslationTask";
import { TranslationOptions } from "../types";
import { AlertCircle, Loader2 } from "lucide-react";

export function PdfTranslatorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showTranslationOptions, setShowTranslationOptions] = useState<boolean>(false);
  
  // Get translation data (languages, services)
  const { 
    languages = [], 
    services = [], 
    apiHealthy, 
    isLoading: isLoadingData, 
    isError: isDataError 
  } = useTranslationData();
  
  // Translation task management
  const {
    task,
    isUploading,
    isTranslating,
    isCompleted,
    isError: isTaskError,
    errorMessage,
    uploadPdfForTranslation,
    downloadTranslation,
    cleanupTask,
    resetTask
  } = useTranslationTask();

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowTranslationOptions(true);
  };

  // Handle form submission
  const handleSubmitTranslation = (options: TranslationOptions) => {
    if (selectedFile) {
      console.log("Submitting translation with options:", options);
      uploadPdfForTranslation(selectedFile, options);
    }
  };

  // Handle download actions
  const handleDownloadDual = () => {
    downloadTranslation("dual");
  };

  const handleDownloadMono = () => {
    downloadTranslation("mono");
  };

  // Handle starting a new translation
  const handleStartNew = () => {
    resetTask();
    setSelectedFile(null);
    setShowTranslationOptions(false);
  };

  // Handle canceling a translation
  const handleCancelTranslation = async () => {
    await cleanupTask();
    resetTask();
    setShowTranslationOptions(true);
  };

  // Ensure languages and services are arrays
  const safeLanguages = Array.isArray(languages) ? languages : [];
  const safeServices = Array.isArray(services) ? services : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">PDF Document Translator</h1>
        <p className="text-muted-foreground">
          Translate your PDF documents between languages while preserving layout and formatting
        </p>
      </header>

      {/* API Status Indicator */}
      <div className={`flex items-center justify-center px-4 py-2 rounded-lg mb-8 ${
        isLoadingData 
          ? "bg-yellow-100 dark:bg-yellow-900/20" 
          : apiHealthy 
            ? "bg-green-100 dark:bg-green-900/20" 
            : "bg-red-100 dark:bg-red-900/20"
      }`}>
        {isLoadingData ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            <span>Checking translation API status...</span>
          </>
        ) : apiHealthy ? (
          <>
            <div className="size-3 bg-green-500 rounded-full mr-2" />
            <span>Translation API is online and ready</span>
          </>
        ) : (
          <>
            <AlertCircle className="size-4 text-red-500 mr-2" />
            <span>Translation API is currently unavailable</span>
          </>
        )}
      </div>

      {isDataError && (
        <div className="p-4 mb-8 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
          Failed to load translation services and languages. Please try refreshing the page.
        </div>
      )}

      <div className="space-y-8">
        {/* Step 1: File Upload */}
        {!task && !isTranslating && (
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Upload your PDF file</h2>
            <FileUploadArea 
              onFileSelect={handleFileSelect} 
              className="mb-6"
            />
          </div>
        )}

        {/* Step 2: Translation Options */}
        {!task && !isTranslating && showTranslationOptions && selectedFile && (
          <div>
            <h2 className="text-xl font-semibold mb-4">2. Configure translation options</h2>
            <TranslationForm
              languages={safeLanguages}
              services={safeServices}
              isLoading={isLoadingData}
              onSubmit={handleSubmitTranslation}
              disabled={isUploading || !apiHealthy}
            />
          </div>
        )}

        {/* Step 3: Translation Progress/Results */}
        {task && (isTranslating || isCompleted || isTaskError) && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {isCompleted 
                ? "3. Translation completed" 
                : isTaskError 
                  ? "Translation failed" 
                  : "3. Translation in progress"
              }
            </h2>
            <TranslationProgress
              task={task}
              isError={isTaskError}
              errorMessage={errorMessage}
              isCompleted={isCompleted}
              onDownloadDual={handleDownloadDual}
              onDownloadMono={handleDownloadMono}
              onCancel={handleCancelTranslation}
              onStartNew={handleStartNew}
            />
          </div>
        )}
      </div>
    </div>
  );
} 