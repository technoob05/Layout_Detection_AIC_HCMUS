import { useEffect, useState } from "react";
import { Language, TranslationService, pdfTranslationApi } from "../api/pdfTranslationApi";

export interface TranslationData {
  isLoading: boolean;
  isError: boolean;
  apiHealthy: boolean;
  languages: Language[];
  services: TranslationService[];
}

/**
 * Hook to fetch and manage translation data (languages, services, API health)
 */
export const useTranslationData = (): TranslationData => {
  const [apiHealthy, setApiHealthy] = useState<boolean>(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [services, setServices] = useState<TranslationService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchTranslationData = async () => {
      setIsLoading(true);
      setIsError(false);
      
      try {
        // Check API health
        const healthy = await pdfTranslationApi.checkHealth();
        setApiHealthy(healthy);
        
        if (healthy) {
          // Fetch languages and services in parallel
          const [languagesData, servicesData] = await Promise.all([
            pdfTranslationApi.getLanguages(),
            pdfTranslationApi.getServices()
          ]);
          
          // Make sure we have arrays even if the API returns null or undefined
          setLanguages(Array.isArray(languagesData) ? languagesData : []);
          setServices(Array.isArray(servicesData) ? servicesData : []);
        }
      } catch (error) {
        console.error("Error fetching translation data:", error);
        setIsError(true);
        // Reset to empty arrays if there's an error
        setLanguages([]);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslationData();
  }, []);

  return {
    isLoading,
    isError,
    apiHealthy,
    languages,
    services
  };
}; 