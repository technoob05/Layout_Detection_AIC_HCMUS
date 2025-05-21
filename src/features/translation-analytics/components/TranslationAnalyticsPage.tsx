import { useTranslationHistory } from "@/features/translation-history/hooks/useTranslationHistory";
import { useTranslationAnalytics } from "../hooks/useTranslationAnalytics";
import { MetricCard } from "./MetricCard";
import { LanguagePairsChart } from "./LanguagePairsChart";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { LanguageDistributionChart } from "./LanguageDistributionChart";
import { FileTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";

export function TranslationAnalyticsPage() {
  const { history } = useTranslationHistory();
  const analytics = useTranslationAnalytics(history);
  
  // Format function for seconds to display as minutes and seconds
  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="mb-2"
            >
              <Link to="/history" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <ArrowLeftIcon className="size-4" />
                Back to History
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold">Translation Analytics</h1>
            <p className="text-muted-foreground">
              Insights and statistics about your translation activities
            </p>
          </div>
          
          {/* Optional: Date range picker for filtering */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">All time</span>
          </div>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            metric={analytics.totalTranslations} 
            icon={<FileTextIcon className="size-5 text-primary" />} 
          />
          
          <MetricCard 
            metric={analytics.completedTranslations} 
            icon={<CheckCircleIcon className="size-5 text-green-500" />} 
          />
          
          <MetricCard 
            metric={analytics.failedTranslations} 
            icon={<XCircleIcon className="size-5 text-red-500" />} 
          />
          
          <MetricCard 
            metric={analytics.averageProcessingTime} 
            formatValue={formatSeconds}
            icon={<ClockIcon className="size-5 text-primary" />} 
          />
        </div>
        
        {/* Time Series and Language Pairs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TimeSeriesChart 
            data={analytics.timeSeriesData} 
            className="lg:col-span-2"
          />
          
          <LanguagePairsChart 
            data={analytics.languagePairs} 
          />
        </div>
        
        {/* Language Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LanguageDistributionChart 
            title="Source Languages"
            data={analytics.sourceLanguages} 
          />
          
          <LanguageDistributionChart 
            title="Target Languages"
            data={analytics.targetLanguages} 
          />
        </div>
        
        {/* No data state */}
        {history.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center max-w-md p-6">
              <FileTextIcon className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No translation data yet</h3>
              <p className="text-muted-foreground mb-4">
                Start translating documents to see analytics and insights about your usage patterns.
              </p>
              <Button asChild>
                <Link to="/translate">
                  Start Translating
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 