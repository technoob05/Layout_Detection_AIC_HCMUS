import { useMemo } from 'react';
import { TranslationTask } from '@/features/pdf-translator/types';
import { 
  TranslationAnalytics, 
  LanguagePair, 
  TimeSeriesData, 
  LanguageUsage 
} from '../types';

export function useTranslationAnalytics(history: TranslationTask[]): TranslationAnalytics {
  return useMemo(() => {
    // Calculate basic metrics
    const totalTranslations = history.length;
    const completedTranslations = history.filter(task => task.status === 'completed').length;
    const failedTranslations = history.filter(task => task.status === 'failed').length;
    
    // Calculate average processing time for completed tasks
    const completedTasks = history.filter(task => task.status === 'completed' && task.completedTime);
    let avgProcessingTime = 0;
    
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        if (task.completedTime) {
          return sum + (task.completedTime.getTime() - task.startTime.getTime());
        }
        return sum;
      }, 0);
      avgProcessingTime = Math.round(totalTime / completedTasks.length / 1000); // in seconds
    }
    
    // Calculate language pairs
    const langPairMap = new Map<string, number>();
    history.forEach(task => {
      const source = task.options.source_lang;
      const target = task.options.target_lang;
      const key = `${source}:${target}`;
      langPairMap.set(key, (langPairMap.get(key) || 0) + 1);
    });
    
    const languagePairs: LanguagePair[] = Array.from(langPairMap.entries())
      .map(([key, count]) => {
        const [source, target] = key.split(':');
        return { source, target, count };
      })
      .sort((a, b) => b.count - a.count);
    
    // Calculate time series data (last 30 days)
    const timeSeriesData: TimeSeriesData[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Create map for dates
    const dateMap = new Map<string, number>();
    
    // Populate with all dates in the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }
    
    // Count translations by date
    history.forEach(task => {
      const dateStr = task.startTime.toISOString().split('T')[0];
      if (task.startTime >= thirtyDaysAgo) {
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
      }
    });
    
    // Convert map to array
    Array.from(dateMap.entries()).forEach(([date, count]) => {
      timeSeriesData.push({ date, count });
    });
    
    // Sort by date
    timeSeriesData.sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate language usage
    const sourceLanguages = calculateLanguageUsage(history, 'source');
    const targetLanguages = calculateLanguageUsage(history, 'target');
    
    // Calculate changes from previous period (last 15 days vs previous 15 days)
    const currentPeriod = history.filter(
      task => task.startTime >= new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    ).length;
    
    const previousPeriod = history.filter(
      task => 
        task.startTime >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) && 
        task.startTime < new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    ).length;
    
    let totalChange = 0;
    if (previousPeriod > 0) {
      totalChange = Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100);
    }
    
    // Return the analytics object
    return {
      totalTranslations: {
        label: 'Total Translations',
        value: totalTranslations,
        change: totalChange
      },
      completedTranslations: {
        label: 'Completed',
        value: completedTranslations,
        change: calculateChangePercentage(history, 'completed')
      },
      failedTranslations: {
        label: 'Failed',
        value: failedTranslations,
        change: calculateChangePercentage(history, 'failed')
      },
      averageProcessingTime: {
        label: 'Avg. Processing Time',
        value: avgProcessingTime,
        change: 0 // We'll leave this as 0 for simplicity
      },
      languagePairs,
      timeSeriesData,
      sourceLanguages,
      targetLanguages
    };
  }, [history]);
}

// Helper function to calculate language usage
function calculateLanguageUsage(
  history: TranslationTask[], 
  type: 'source' | 'target'
): LanguageUsage[] {
  const langMap = new Map<string, number>();
  const langField = type === 'source' ? 'source_lang' : 'target_lang';
  
  history.forEach(task => {
    const lang = task.options[langField];
    langMap.set(lang, (langMap.get(lang) || 0) + 1);
  });
  
  const total = history.length || 1; // Avoid division by zero
  
  return Array.from(langMap.entries())
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

// Helper function to calculate change percentage for a specific status
function calculateChangePercentage(history: TranslationTask[], status: string): number {
  const now = new Date();
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const currentPeriod = history.filter(
    task => task.status === status && task.startTime >= fifteenDaysAgo
  ).length;
  
  const previousPeriod = history.filter(
    task => 
      task.status === status && 
      task.startTime >= thirtyDaysAgo && 
      task.startTime < fifteenDaysAgo
  ).length;
  
  if (previousPeriod === 0) return 0;
  return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100);
} 