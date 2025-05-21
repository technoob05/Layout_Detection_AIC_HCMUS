import axios from "axios";

// Base URL for the translation API
const BASE_URL = "https://huynhtrungkiet09032005-pdf-translate-api.hf.space";

// Interface for translation options
export interface TranslationOptions {
  source_lang: string;
  target_lang: string;
  service: string;
  threads: string;
  prompt_translation?: string;
}

// Interface for translation status
export interface TranslationStatus {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

// Interface for language
export interface Language {
  code: string;
  name: string;
}

// Interface for translation service
export interface TranslationService {
  id: string;
  name: string;
}

// Fallback data in case API is not available
const FALLBACK_LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "vi", name: "Vietnamese" },
  { code: "zh", name: "Chinese" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" }
];

const FALLBACK_SERVICES: TranslationService[] = [
  { id: "google", name: "Google Translate" },
  { id: "deepl", name: "DeepL" },
  { id: "gemini", name: "Google Gemini" }
];

/**
 * Service for interacting with the PDF translation API
 */
export const pdfTranslationApi = {
  /**
   * Check if the API is healthy
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      return response.status === 200;
    } catch (error) {
      console.error("Error checking API health:", error);
      return false;
    }
  },

  /**
   * Get supported languages
   */
  getLanguages: async (): Promise<Language[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/languages`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      } else {
        console.warn("API returned invalid languages data, using fallback data");
        return FALLBACK_LANGUAGES;
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      console.warn("Using fallback language data");
      return FALLBACK_LANGUAGES;
    }
  },

  /**
   * Get supported translation services
   */
  getServices: async (): Promise<TranslationService[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/services`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      } else {
        console.warn("API returned invalid services data, using fallback data");
        return FALLBACK_SERVICES;
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      console.warn("Using fallback service data");
      return FALLBACK_SERVICES;
    }
  },

  /**
   * Upload PDF file for translation
   */
  translatePdf: async (
    file: File,
    options: TranslationOptions
  ): Promise<{ task_id: string } | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Add all options to the form data
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      console.log("Submitting translation with options:", options);
      
      const response = await axios.post(`${BASE_URL}/translate`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  },

  /**
   * Get translation status
   */
  getTranslationStatus: async (taskId: string): Promise<TranslationStatus | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/translate/${taskId}/status`);
      return response.data;
    } catch (error) {
      console.error("Error fetching translation status:", error);
      return null;
    }
  },

  /**
   * Download translated PDF
   */
  downloadTranslatedPdf: async (taskId: string, type: "dual" | "mono"): Promise<Blob | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/translate/${taskId}/download?type=${type}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading ${type} PDF:`, error);
      return null;
    }
  },

  /**
   * Clean up task resources
   */
  cleanupTask: async (taskId: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/cleanup-task/${taskId}`);
      return true;
    } catch (error) {
      console.error("Error cleaning up task:", error);
      return false;
    }
  },

  /**
   * Extract text from PDF with bounding boxes
   */
  extractText: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${BASE_URL}/extract-text`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error extracting text:", error);
      return null;
    }
  },
}; 