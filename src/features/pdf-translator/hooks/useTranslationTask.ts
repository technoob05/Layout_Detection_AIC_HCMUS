import { useState, useEffect, useCallback } from "react";
import { TranslationOptions, pdfTranslationApi } from "../api/pdfTranslationApi";
import { TranslationTask } from "../types";
import { useTranslationHistory } from "@/features/translation-history/hooks/useTranslationHistory";

export interface UseTranslationTaskResult {
  task: TranslationTask | null;
  isUploading: boolean;
  isTranslating: boolean;
  isCompleted: boolean;
  isError: boolean;
  errorMessage: string | null;
  uploadPdfForTranslation: (file: File, options: TranslationOptions) => Promise<void>;
  downloadTranslation: (type: "dual" | "mono") => Promise<void>;
  getPreviewUrl: (type?: "dual" | "mono") => string | null;
  cleanupTask: () => Promise<void>;
  resetTask: () => void;
}

/**
 * Hook to manage a PDF translation task
 */
export const useTranslationTask = (): UseTranslationTaskResult => {
  const [task, setTask] = useState<TranslationTask | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const translationHistory = useTranslationHistory();
  const { addToHistory, updateTask: updateHistoryTask } = translationHistory;

  // Log the current history on mount
  useEffect(() => {
    console.log('Current history on mount:', translationHistory.history.length, 'items');
  }, [translationHistory.history.length]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        window.clearInterval(statusCheckInterval);
      }
      // Clean up any created preview URLs
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [statusCheckInterval, previewUrl]);

  // Start polling for status when task is created
  useEffect(() => {
    if (task && task.status === "pending" && !statusCheckInterval) {
      console.log('Starting status checks for task:', task.id);
      const interval = window.setInterval(checkTaskStatus, 5000);
      setStatusCheckInterval(interval);
      
      // Add task to history when it's first created
      console.log('Adding initial task to history:', task.id, task.fileName);
      addToHistory(task);
    }
  }, [task, addToHistory]);

  // Check task status
  const checkTaskStatus = useCallback(async () => {
    if (!task) return;

    try {
      const status = await pdfTranslationApi.getTranslationStatus(task.id);
      
      if (!status) {
        setIsError(true);
        setErrorMessage("Failed to check translation status. The server may be unavailable.");
        if (statusCheckInterval) {
          window.clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        return;
      }

      console.log('Task status update:', task.id, status.status, status.progress);

      setTask(prevTask => {
        if (!prevTask) return null;
        
        const updatedTask = {
          ...prevTask,
          status: status.status,
          progress: status.progress,
          error: status.error
        };
        
        // If the task is completed or failed, stop polling
        if (status.status === "completed" || status.status === "failed") {
          if (statusCheckInterval) {
            window.clearInterval(statusCheckInterval);
            setStatusCheckInterval(null);
          }
          
          setIsTranslating(false);
          
          if (status.status === "completed") {
            console.log('Task completed:', updatedTask.id, updatedTask.fileName);
            setIsCompleted(true);
            updatedTask.completedTime = new Date();
          } else {
            setIsError(true);
            const errorMsg = status.error || "Translation failed without a specific error message.";
            
            // Provide a more general error message instead of specifically mentioning API keys
            setErrorMessage(
              "Translation failed: " + errorMsg + 
              " This may be due to a server configuration issue. Please try a different translation service or contact support."
            );
          }
          
          // Update task in history when status changes to completed or failed
          console.log('Updating task in history after completion/failure:', updatedTask.id, status.status);
          updateHistoryTask(updatedTask.id, updatedTask);
          
          // Save the completed task to history
          console.log('Adding completed/failed task to history:', updatedTask.id, updatedTask.fileName, status.status);
          
          // Ensure task is saved to history immediately with a slight delay to avoid race conditions
          setTimeout(() => {
            addToHistory({...updatedTask});
          }, 100);
        }
        
        return updatedTask;
      });
    } catch (error) {
      console.error("Error checking task status:", error);
      setIsError(true);
      setErrorMessage("Network error while checking translation status. Please check your connection.");
      
      if (statusCheckInterval) {
        window.clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
    }
  }, [task, statusCheckInterval, updateHistoryTask, addToHistory]);

  // Upload PDF for translation
  const uploadPdfForTranslation = async (file: File, options: TranslationOptions) => {
    setIsUploading(true);
    setIsError(false);
    setErrorMessage(null);
    
    try {
      console.log('Uploading PDF for translation:', file.name);
      const result = await pdfTranslationApi.translatePdf(file, options);
      
      if (!result) {
        setIsError(true);
        setErrorMessage("Failed to upload PDF for translation. The server may be unavailable.");
        setIsUploading(false);
        return;
      }
      
      // Create new task
      const newTask: TranslationTask = {
        id: result.task_id,
        fileName: file.name,
        file: file,
        options: options,
        status: "pending",
        progress: 0,
        startTime: new Date()
      };
      
      console.log('Created new translation task:', newTask.id, newTask.fileName);
      setTask(newTask);
      setIsUploading(false);
      setIsTranslating(true);
      
      // Make sure to add the new task to history
      console.log('Adding new task to history from upload:', newTask.id, newTask.fileName);
      addToHistory(newTask);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setIsError(true);
      
      // Handle the error message
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Network error while uploading PDF. Please check your connection and try again.");
      }
      
      setIsUploading(false);
    }
  };

  // Download translation
  const downloadTranslation = async (type: "dual" | "mono") => {
    if (!task || task.status !== "completed") {
      return;
    }
    
    try {
      const blob = await pdfTranslationApi.downloadTranslatedPdf(task.id, type);
      
      if (!blob) {
        setIsError(true);
        setErrorMessage(`Failed to download ${type} translation. The file may no longer be available.`);
        return;
      }
      
      // Create filename
      const fileName = task.fileName;
      const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      const fileExt = fileName.substring(fileName.lastIndexOf('.')) || '.pdf';
      
      const downloadName = type === "dual" 
        ? `${baseName}_${task.options.source_lang}_${task.options.target_lang}${fileExt}`
        : `${baseName}_${task.options.target_lang}${fileExt}`;
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${type} translation:`, error);
      setIsError(true);
      setErrorMessage(`Network error while downloading ${type} translation. Please check your connection.`);
    }
  };

  // Get preview URL for translation
  const getPreviewUrl = useCallback((type: "dual" | "mono" = "dual"): string | null => {
    if (!task || task.status !== "completed") {
      return null;
    }
    
    // In a real implementation, this would call the API to get a preview URL
    // For now, we'll simulate it with a placeholder or blob URL
    // This could be enhanced to actually fetch the PDF and create a blob URL
    
    // If we already have a preview URL, return it
    if (previewUrl) {
      return previewUrl;
    }
    
    // In a real implementation, we would fetch the PDF here and create a blob URL
    // For now, we'll just return a simulated URL
    const simulatedUrl = `/api/translations/${task.id}/preview?type=${type}`;
    return simulatedUrl;
  }, [task, previewUrl]);

  // Cleanup task resources
  const cleanupTask = async () => {
    if (!task) return;
    
    try {
      await pdfTranslationApi.cleanupTask(task.id);
    } catch (error) {
      console.error("Error cleaning up task resources:", error);
      // Don't set error state here as this is not critical for the user experience
    }
    
    // Clean up any created preview URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Reset task state
  const resetTask = () => {
    // Clean up any created preview URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    setTask(null);
    setIsUploading(false);
    setIsTranslating(false);
    setIsCompleted(false);
    setIsError(false);
    setErrorMessage(null);
    
    if (statusCheckInterval) {
      window.clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  return {
    task,
    isUploading,
    isTranslating,
    isCompleted,
    isError,
    errorMessage,
    uploadPdfForTranslation,
    downloadTranslation,
    getPreviewUrl,
    cleanupTask,
    resetTask
  };
}; 