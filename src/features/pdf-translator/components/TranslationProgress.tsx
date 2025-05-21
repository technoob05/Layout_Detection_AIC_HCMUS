import { AlertCircle, CheckCircle2, Download, Eye, FileText, Loader2, SplitSquareVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TranslationTask } from "../types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { TranslationPreview } from "./TranslationPreview";
import { useTranslationTask } from "../hooks/useTranslationTask";

interface TranslationProgressProps {
  task: TranslationTask;
  isError: boolean;
  errorMessage: string | null;
  isCompleted: boolean;
  onDownloadDual: () => void;
  onDownloadMono: () => void;
  onCancel: () => void;
  onStartNew: () => void;
  className?: string;
}

export function TranslationProgress({
  task,
  isError,
  errorMessage,
  isCompleted,
  onDownloadDual,
  onDownloadMono,
  onCancel,
  onStartNew,
  className
}: TranslationProgressProps) {
  const [showCompletedAnimation, setShowCompletedAnimation] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [animateSteps, setAnimateSteps] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Get the translation task hook to access the getPreviewUrl function
  const { getPreviewUrl } = useTranslationTask();
  
  // Animate progress bar
  useEffect(() => {
    // Smooth progress animation
    const targetProgress = task.progress;
    if (progressValue < targetProgress) {
      const animationFrame = requestAnimationFrame(() => {
        setProgressValue(prev => {
          // Faster animation speed for smoother progress
          const increment = Math.max(0.2, (targetProgress - prev) * 0.05);
          return Math.min(prev + increment, targetProgress);
        });
      });
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [task.progress, progressValue]);
  
  // Show completion animation
  useEffect(() => {
    if (isCompleted && !showCompletedAnimation) {
      setShowCompletedAnimation(true);
    }
  }, [isCompleted, showCompletedAnimation]);
  
  // Animate steps when progress reaches certain thresholds
  useEffect(() => {
    if ((progressValue >= 33 && progressValue < 34) || 
        (progressValue >= 66 && progressValue < 67) || 
        (progressValue >= 99 && progressValue < 100)) {
      setAnimateSteps(true);
      setTimeout(() => setAnimateSteps(false), 1000);
    }
  }, [progressValue]);

  const getStatusText = () => {
    if (isError) return "Translation Failed";
    if (isCompleted) return "Translation Completed";
    if (task.status === "pending") return "Translation Pending";
    if (task.status === "processing") return "Translation in Progress";
    return "Processing";
  };

  const getElapsedTime = () => {
    const now = isCompleted && task.completedTime 
      ? task.completedTime 
      : new Date();
    
    const elapsed = Math.floor((now.getTime() - task.startTime.getTime()) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handleDownloadWithToast = (type: "dual" | "mono") => {
    const action = type === "dual" ? onDownloadDual : onDownloadMono;
    
    try {
      action();
      toast.success(`Starting download of ${type === "dual" ? "dual-language" : "target language only"} PDF`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  // Calculate which step is active based on progress
  const getActiveStep = () => {
    if (progressValue >= 100) return 4;
    if (progressValue >= 66) return 3;
    if (progressValue >= 33) return 2;
    return 1;
  };
  
  const activeStep = getActiveStep();

  const togglePreview = () => {
    if (isCompleted) {
      const previewUrl = getPreviewUrl();
      if (previewUrl) {
        setShowPreview(!showPreview);
      } else {
        toast.error("Preview is not available. Please try downloading the file instead.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className={cn(
        "w-full overflow-hidden transition-all duration-500",
        isCompleted ? "shadow-lg ring-1 ring-green-500/20" : 
        isError ? "shadow-lg ring-1 ring-red-500/20" : 
        "shadow-md",
        className
      )}>
        <CardHeader className={cn(
          "transition-colors duration-500",
          isError ? "bg-red-50 dark:bg-red-900/10" : 
          isCompleted ? "bg-green-50 dark:bg-green-900/10" : 
          "bg-blue-50 dark:bg-blue-900/10"
        )}>
          <CardTitle className="flex items-center gap-2">
            {isError ? (
              <AlertCircle className="size-5 text-red-500" />
            ) : isCompleted ? (
              <div className="relative">
                <CheckCircle2 className={cn(
                  "size-5 text-green-500",
                  showCompletedAnimation && "animate-ping absolute"
                )} />
                <CheckCircle2 className="size-5 text-green-500 relative" />
              </div>
            ) : (
              <Loader2 className="size-5 animate-spin text-primary" />
            )}
            {getStatusText()}
          </CardTitle>
          <CardDescription>
            File: <span className="font-medium">{task.fileName}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{Math.round(progressValue)}% complete</span>
              <span className="text-muted-foreground">Elapsed time: {getElapsedTime()}</span>
            </div>
            <div className="relative h-3">
              <div className="absolute inset-0 bg-muted rounded-full"></div>
              <Progress value={progressValue} className="h-3" />
              
              {/* Progress markers */}
              <div className="absolute inset-0 flex justify-between px-1 items-center">
                <div className={cn(
                  "size-3 rounded-full transition-all duration-300 z-10 border-2 border-background",
                  activeStep >= 1 ? "bg-primary scale-100" : "bg-muted-foreground/30 scale-75",
                  activeStep === 1 && !isCompleted && !isError && "animate-pulse"
                )}></div>
                <div className={cn(
                  "size-3 rounded-full transition-all duration-300 z-10 border-2 border-background",
                  activeStep >= 2 ? "bg-primary scale-100" : "bg-muted-foreground/30 scale-75",
                  activeStep === 2 && !isCompleted && !isError && "animate-pulse"
                )}></div>
                <div className={cn(
                  "size-3 rounded-full transition-all duration-300 z-10 border-2 border-background",
                  activeStep >= 3 ? "bg-primary scale-100" : "bg-muted-foreground/30 scale-75",
                  activeStep === 3 && !isCompleted && !isError && "animate-pulse"
                )}></div>
                <div className={cn(
                  "size-3 rounded-full transition-all duration-300 z-10 border-2 border-background",
                  activeStep >= 4 ? "bg-primary scale-100" : "bg-muted-foreground/30 scale-75",
                  activeStep === 4 && !isCompleted && !isError && "animate-pulse"
                )}></div>
              </div>
            </div>
            
            {/* Progress steps */}
            <div className="grid grid-cols-4 text-xs mt-1">
              <div className={cn(
                "text-left transition-colors duration-300",
                activeStep >= 1 ? "text-primary font-medium" : "text-muted-foreground",
                animateSteps && activeStep === 1 && "animate-bounce"
              )}>
                Uploading
              </div>
              <div className={cn(
                "text-center transition-colors duration-300",
                activeStep >= 2 ? "text-primary font-medium" : "text-muted-foreground",
                animateSteps && activeStep === 2 && "animate-bounce"
              )}>
                Processing
              </div>
              <div className={cn(
                "text-center transition-colors duration-300",
                activeStep >= 3 ? "text-primary font-medium" : "text-muted-foreground",
                animateSteps && activeStep === 3 && "animate-bounce"
              )}>
                Translating
              </div>
              <div className={cn(
                "text-right transition-colors duration-300",
                activeStep >= 4 ? "text-primary font-medium" : "text-muted-foreground",
                animateSteps && activeStep === 4 && "animate-bounce"
              )}>
                Completed
              </div>
            </div>
          </div>
          
          {/* Translation Details */}
          <div className="grid grid-cols-2 gap-y-3 text-sm p-4 rounded-lg bg-muted/30 border">
            <div className="text-muted-foreground">Source Language:</div>
            <div className="font-medium">{task.options.source_lang.toUpperCase()}</div>
            
            <div className="text-muted-foreground">Target Language:</div>
            <div className="font-medium">{task.options.target_lang.toUpperCase()}</div>
            
            <div className="text-muted-foreground">Translation Service:</div>
            <div className="font-medium capitalize">
              <span className="inline-flex items-center gap-1.5">
                <span className={cn(
                  "size-2 rounded-full",
                  task.options.service === "google" ? "bg-blue-500" :
                  task.options.service === "deepl" ? "bg-yellow-500" :
                  "bg-green-500"
                )}></span>
                {task.options.service}
              </span>
            </div>
            
            <div className="text-muted-foreground">Processing Threads:</div>
            <div className="font-medium">{task.options.threads}</div>
          </div>
          
          {/* Custom Prompt - Always visible */}
          {task.options.prompt_translation && (
            <div className="mt-2 border rounded-md p-3 bg-muted/30">
              <div className="font-medium text-sm mb-1">Translation Prompt:</div>
              <div className="text-sm bg-background p-3 rounded border">
                {task.options.prompt_translation}
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {isError && errorMessage && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 flex items-start gap-3 animate-pulse">
              <AlertCircle className="size-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Translation Failed</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Download Options - Displayed only when completed */}
          {isCompleted && (
            <div className={cn(
              "mt-2 border rounded-md p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30",
              showCompletedAnimation && "animate-fade-in-down"
            )}>
              <h3 className="font-medium mb-4 flex items-center gap-2 text-green-800 dark:text-green-300">
                <Download className="size-4" />
                Download Options
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-md border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-1.5">
                    <SplitSquareVertical className="size-3.5" />
                    Dual-Language PDF
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">Side-by-side view with source text on the left and translated text on the right.</p>
                  <Button 
                    onClick={() => handleDownloadWithToast("dual")} 
                    size="sm" 
                    className="w-full group"
                  >
                    <span className="mr-1">Download Dual-Language</span>
                    <Download className="size-3.5 group-hover:translate-y-0.5 transition-transform" />
                  </Button>
                </div>
                
                <div className="p-4 bg-background rounded-md border hover:border-primary/50 hover:shadow-md transition-all duration-300">
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    {task.options.target_lang.toUpperCase()} Only
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">Contains only the translated text in the target language.</p>
                  <Button 
                    onClick={() => handleDownloadWithToast("mono")} 
                    variant="outline" 
                    size="sm" 
                    className="w-full group"
                  >
                    <span className="mr-1">Download Target Only</span>
                    <Download className="size-3.5 group-hover:translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                <span className="font-medium">Tip:</span> The side-by-side (dual language) PDF is great for comparing the original and translated text.
                It allows you to verify translations and understand the context better.
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className={cn(
          "flex flex-col sm:flex-row gap-3 border-t py-4", 
          isCompleted ? "justify-between" : "justify-end"
        )}>
          {isCompleted && (
            <Button 
              onClick={togglePreview} 
              variant="outline" 
              className="gap-2 group hover:border-primary/50"
            >
              <Eye className="size-4 group-hover:scale-110 transition-transform" />
              {showPreview ? "Hide Preview" : "Preview Translation"}
            </Button>
          )}
          
          {isCompleted ? (
            <Button onClick={onStartNew} variant="outline" className="gap-2 group hover:border-primary/50">
              <FileText className="size-4 group-hover:scale-110 transition-transform" />
              Start New Translation
            </Button>
          ) : !isError ? (
            <Button onClick={onCancel} variant="outline" className="gap-2 group hover:border-red-500/50 hover:text-red-500">
              <AlertCircle className="size-4 group-hover:scale-110 transition-transform" />
              Cancel Translation
            </Button>
          ) : (
            <Button onClick={onStartNew} variant="outline" className="gap-2 group hover:border-primary/50">
              <Loader2 className="size-4 group-hover:animate-spin" />
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Translation Preview */}
      {showPreview && isCompleted && (
        <TranslationPreview
          translatedPdfUrl={getPreviewUrl() || ""}
          originalFileName={task.fileName}
          onClose={() => setShowPreview(false)}
          onDownload={() => handleDownloadWithToast("dual")}
          className="h-[600px]"
        />
      )}
    </div>
  );
} 