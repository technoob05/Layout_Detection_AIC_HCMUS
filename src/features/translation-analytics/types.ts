export interface LanguagePair {
  source: string;
  target: string;
  count: number;
}

export interface TranslationMetric {
  label: string;
  value: number;
  change?: number; // percentage change from previous period
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface LanguageUsage {
  language: string;
  count: number;
  percentage: number;
}

export interface TranslationAnalytics {
  totalTranslations: TranslationMetric;
  completedTranslations: TranslationMetric;
  failedTranslations: TranslationMetric;
  averageProcessingTime: TranslationMetric;
  languagePairs: LanguagePair[];
  timeSeriesData: TimeSeriesData[];
  sourceLanguages: LanguageUsage[];
  targetLanguages: LanguageUsage[];
} 