import { useState } from "react";
import { Loader2, Languages } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationData } from "../hooks/useTranslationData";
import { geminiTranslateTextOnly } from "@/services/gemini/geminiService.ts";
import { Language } from "../types";

export function TextTranslationPage() {
  const [inputText, setInputText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("en-US");
  const [targetLanguage, setTargetLanguage] = useState<string>("vi-VN");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get translation data (languages, services)
  const { 
    languages = [], 
    apiHealthy, 
    isLoading: isLoadingData,
    isError: isDataError 
  } = useTranslationData();

  // Handle the translation
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to translate");
      return;
    }

    try {
      setError(null);
      setIsTranslating(true);
      
      // Find the selected language object to get the name
      const targetLang = languages.find((lang: Language) => lang.code === targetLanguage);
      
      if (!targetLang) {
        throw new Error("Target language not found");
      }
      
      const result = await geminiTranslateTextOnly(
        inputText,
        targetLanguage,
        targetLang.name
      );
      
      setTranslatedText(result);
    } catch (err) {
      console.error("Translation error:", err);
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle swapping languages
  const handleSwapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Also swap the text if we have a translation
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  // Handle clearing all text
  const handleClear = () => {
    setInputText("");
    setTranslatedText("");
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Text Translator</h1>
        <p className="text-muted-foreground">
          Instantly translate text between languages using AI
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
            <div className="size-3 bg-red-500 rounded-full mr-2" />
            <span>Translation API is currently unavailable</span>
          </>
        )}
      </div>

      {isDataError && (
        <div className="p-4 mb-8 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
          Failed to load translation services and languages. Please try refreshing the page.
        </div>
      )}

      {error && (
        <div className="p-4 mb-8 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Language Selection */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-2/5">
              <label className="block text-sm font-medium mb-2">Source Language</label>
              <Select 
                value={sourceLanguage} 
                onValueChange={setSourceLanguage}
                disabled={isTranslating || isLoadingData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Source Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language: Language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-center">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={handleSwapLanguages}
                disabled={isTranslating}
                className="rounded-full"
              >
                <Languages className="size-4 rotate-90" />
              </Button>
            </div>
            
            <div className="w-full md:w-2/5">
              <label className="block text-sm font-medium mb-2">Target Language</label>
              <Select 
                value={targetLanguage} 
                onValueChange={setTargetLanguage}
                disabled={isTranslating || isLoadingData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Target Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language: Language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Text Input and Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Input Text</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              className="h-56 md:h-64"
              disabled={isTranslating}
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!inputText || isTranslating}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Translation Result</label>
            <div className="relative">
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="h-56 md:h-64"
              />
              {isTranslating && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm">Translating...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (translatedText) {
                    navigator.clipboard.writeText(translatedText);
                  }
                }}
                disabled={!translatedText || isTranslating}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Translate Button */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleTranslate}
            disabled={!inputText || isTranslating || !apiHealthy || isLoadingData}
            className="px-12 py-6 text-lg gap-2"
          >
            {isTranslating ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="size-5" />
                Translate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 