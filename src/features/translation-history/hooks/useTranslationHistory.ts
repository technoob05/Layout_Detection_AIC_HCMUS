import { useState, useEffect } from 'react';
import { TranslationTask } from '@/features/pdf-translator/types';

const STORAGE_KEY = 'translation_history';

// Helper function to safely check if localStorage is available
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper function to serialize a File to a storable object
const serializeFile = (file: File): { name: string, type: string, size: number, lastModified: number } => {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  };
};

// Helper function to make a task storable
const makeTaskStorable = (task: TranslationTask): any => {
  try {
    // Omit the file property when storing to localStorage
    // We'll keep the file metadata for display purposes
    const { file, ...rest } = task;
    return {
      ...rest,
      // Add file metadata
      fileInfo: file ? serializeFile(file) : undefined,
      // Convert dates to ISO strings
      startTime: task.startTime.toISOString(),
      completedTime: task.completedTime ? task.completedTime.toISOString() : undefined
    };
  } catch (error) {
    console.error('Error making task storable:', error);
    // Return a minimal version that won't cause serialization errors
    return {
      id: task.id,
      fileName: task.fileName || 'unknown.pdf',
      status: task.status,
      options: task.options,
      progress: task.progress,
      startTime: task.startTime.toISOString(),
      completedTime: task.completedTime ? task.completedTime.toISOString() : undefined
    };
  }
};

// Safe localStorage getItem wrapper
const safeGetItem = (key: string): string | null => {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(key);
};

// Safe localStorage setItem wrapper
const safeSetItem = (key: string, value: string): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

export function useTranslationHistory() {
  const [history, setHistory] = useState<TranslationTask[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;
    
    try {
      const storedHistory = safeGetItem(STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        
        // Convert stored items back to TranslationTask objects
        const historyWithDates = parsedHistory.map((item: any) => {
          try {
            // Create a dummy File object for display purposes
            // Note: This won't be the actual file, just a placeholder with metadata
            const dummyFile = new File([""], item.fileInfo?.name || "unknown.pdf", { 
              type: item.fileInfo?.type || "application/pdf",
              lastModified: item.fileInfo?.lastModified || Date.now()
            });
            
            return {
              ...item,
              file: dummyFile, // Replace with dummy file
              startTime: new Date(item.startTime),
              completedTime: item.completedTime ? new Date(item.completedTime) : undefined
            };
          } catch (error) {
            console.error('Error processing history item:', error, item);
            // Return a valid item even if there was an error
            return {
              id: item.id || 'unknown',
              fileName: item.fileName || 'unknown.pdf',
              file: new File([""], "unknown.pdf", { type: "application/pdf" }),
              options: item.options || {},
              status: item.status || 'failed',
              progress: item.progress || 0,
              startTime: new Date(item.startTime || Date.now()),
              completedTime: item.completedTime ? new Date(item.completedTime) : undefined
            };
          }
        });
        
        setHistory(historyWithDates);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to parse translation history:', error);
      // Reset history if parsing fails
      safeSetItem(STORAGE_KEY, JSON.stringify([]));
      setIsInitialized(true);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    // Skip initial render and server-side rendering
    if (!isInitialized || typeof window === 'undefined') return;
    
    try {
      // Don't try to store the actual File objects, which can't be serialized
      const storableHistory = history.map(makeTaskStorable);
      safeSetItem(STORAGE_KEY, JSON.stringify(storableHistory));
      console.log('Successfully saved history to localStorage', storableHistory.length);
    } catch (error) {
      console.error('Error saving translation history to localStorage:', error);
    }
  }, [history, isInitialized]);

  const addToHistory = (task: TranslationTask) => {
    console.log('Adding task to history:', task.id, task.fileName, task.status);
    setHistory(prev => {
      // Check if task with the same ID already exists
      const existingIndex = prev.findIndex(t => t.id === task.id);
      if (existingIndex >= 0) {
        // Replace existing task
        const updated = [...prev];
        updated[existingIndex] = task;
        return updated;
      } else {
        // Add new task to the beginning of the array
        return [task, ...prev];
      }
    });
  };

  const updateTask = (taskId: string, updates: Partial<TranslationTask>) => {
    console.log('Updating task in history:', taskId, updates.status);
    setHistory(prev => {
      return prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
    });
  };

  const removeFromHistory = (taskId: string) => {
    setHistory(prev => prev.filter(task => task.id !== taskId));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    updateTask,
    removeFromHistory,
    clearHistory
  };
} 