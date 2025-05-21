import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Language, TranslationOptions, TranslationService } from "../types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Info, Languages, Settings } from "lucide-react";

interface TranslationFormProps {
  languages: Language[];
  services: TranslationService[];
  isLoading: boolean;
  onSubmit: (options: TranslationOptions) => void;
  className?: string;
  disabled?: boolean;
}

export function TranslationForm({
  languages = [],
  services = [],
  isLoading,
  onSubmit,
  className,
  disabled = false
}: TranslationFormProps) {
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("vi");
  const [service, setService] = useState<string>("google");
  const [threads, setThreads] = useState<string>("4");
  const [promptTranslation, setPromptTranslation] = useState<string>("Hãy dịch văn bản theo phong cách trang trọng như hợp đồng pháp lý. Giữ các thuật ngữ chuyên ngành trong ngoặc đơn.");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Set default values when data loads
  useEffect(() => {
    if (services.length > 0) {
      // Only set default service if current service isn't valid
      const serviceExists = services.some(s => s.id === service);
      if (!serviceExists) {
        setService(services[0].id);
      }
    }
  }, [services, service]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const options: TranslationOptions = {
      source_lang: sourceLanguage,
      target_lang: targetLanguage,
      service: service,
      threads: threads,
      prompt_translation: promptTranslation.trim()
    };
    
    onSubmit(options);
  };

  // Ensure languages and services are arrays
  const safeLanguages = Array.isArray(languages) ? languages : [];
  const safeServices = Array.isArray(services) ? services : [];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Languages className="size-5 text-primary" />
          Translation Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Language */}
            <div className="space-y-2">
              <Label htmlFor="source-language" className="flex items-center gap-1">
                <span>Source Language</span>
                {isLoading && <div className="size-3 rounded-full bg-primary/60 animate-ping"></div>}
              </Label>
              <Select
                disabled={isLoading || disabled || safeLanguages.length === 0}
                value={sourceLanguage}
                onValueChange={setSourceLanguage}
              >
                <SelectTrigger id="source-language">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {safeLanguages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Language */}
            <div className="space-y-2">
              <Label htmlFor="target-language" className="flex items-center gap-1">
                <span>Target Language</span>
                {isLoading && <div className="size-3 rounded-full bg-primary/60 animate-ping"></div>}
              </Label>
              <Select
                disabled={isLoading || disabled || safeLanguages.length === 0}
                value={targetLanguage}
                onValueChange={setTargetLanguage}
              >
                <SelectTrigger id="target-language">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {safeLanguages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label htmlFor="service" className="flex items-center gap-1">
              <span>Translation Service</span>
              {isLoading && <div className="size-3 rounded-full bg-primary/60 animate-ping"></div>}
            </Label>
            <Select
              disabled={isLoading || disabled || safeServices.length === 0}
              value={service}
              onValueChange={setService}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="Select translation service" />
              </SelectTrigger>
              <SelectContent>
                {safeServices.map((service) => (
                  <SelectItem 
                    key={service.id} 
                    value={service.id}
                  >
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Different services may provide different translation quality and features.
            </p>
          </div>

          {/* Gemini Info */}
          {service === "gemini" && (
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-md flex items-start gap-2 text-sm">
              <Info className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">Google Gemini AI</p>
                <p className="text-blue-700 dark:text-blue-400 mt-1">
                  Gemini provides high-quality translations powered by Google's advanced AI model.
                  It excels at preserving context and handling complex documents with specialized terminology.
                </p>
              </div>
            </div>
          )}

          {/* Translation Prompt (always visible) */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="flex items-center gap-1">
              <span>Translation Prompt</span>
              <span className="text-primary ml-1">*</span>
            </Label>
            <textarea
              id="prompt"
              className={cn(
                "flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1",
                "focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholder="Enter instructions for the translation style or terminology preferences..."
              value={promptTranslation}
              onChange={(e) => setPromptTranslation(e.target.value)}
              disabled={isLoading || disabled}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Customize how the text is translated by providing specific instructions about style, formality, or terminology preferences.
            </p>
          </div>

          {/* Advanced Options Toggle */}
          <div 
            className="flex items-center justify-between cursor-pointer py-2 px-4 bg-muted/50 hover:bg-muted rounded-md"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center gap-2">
              <Settings className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Advanced Options</span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </div>

          {showAdvanced && (
            <div className="space-y-6 pt-2 border p-4 rounded-md bg-muted/30">
              {/* Threads */}
              <div className="space-y-2">
                <Label htmlFor="threads">Number of Threads</Label>
                <Select
                  disabled={isLoading || disabled}
                  value={threads}
                  onValueChange={setThreads}
                >
                  <SelectTrigger id="threads">
                    <SelectValue placeholder="Select number of threads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (Slower, less resource intensive)</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4 (Recommended)</SelectItem>
                    <SelectItem value="8">8 (Faster, more resource intensive)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  More threads may process faster but use more system resources.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || 
              disabled || 
              !sourceLanguage || 
              !targetLanguage || 
              !service ||
              !promptTranslation.trim()
            }
          >
            Start Translation
          </Button>

          {/* Dual Language Preview Info */}
          <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-md flex items-start gap-2 text-sm">
            <Info className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-400">
              When translation is complete, you'll be able to download both a dual-language (side-by-side) 
              version and a target language only version of your document.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 