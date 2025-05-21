'use client';

import { useState } from 'react';
import { InputTabs } from './InputTabs';
import { SideBySidePreview } from './HtmlPreview';
import { LanguageSelector, QuickLanguageButtons } from './LanguageSelector';
import { Button } from '@/components/ui/button';
import { useWebTranslation, TranslationMode } from '../hooks/useWebTranslation';
import { SupportedLanguage } from '../types';
import { AlertCircle, Globe, Loader2, Info, Link, Code, LayoutGrid } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export function WebTranslationPage() {
  const {
    isLoading,
    error,
    originalHtml,
    translatedHtml,
    loadFromUrl,
    translateUrl,
    setContent,
    translateContent,
    translationMode,
    changeTranslationMode
  } = useWebTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);
  const [activeTab, setActiveTab] = useState<string>('url-load');
  const [directUrl, setDirectUrl] = useState<string>('');

  // Handle URL input for loading content
  const handleUrlSubmit = async (url: string) => {
    await loadFromUrl(url);
  };

  // Handle direct URL translation using Gemini URL context
  const handleUrlTranslate = async (url: string) => {
    if (!selectedLanguage) {
      return;
    }
    await translateUrl(url, selectedLanguage.code, selectedLanguage.name);
  };

  const handleHtmlSubmit = (html: string) => {
    setContent(html);
  };

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setSelectedLanguage(language);
  };

  const handleTranslate = async () => {
    if (!selectedLanguage) return;
    await translateContent(selectedLanguage.code, selectedLanguage.name);
  };

  const handleModeChange = (mode: TranslationMode) => {
    changeTranslationMode(mode);
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Web Translator</h1>
          <p className="text-muted-foreground">
            Translate web content while preserving the original layout using Gemini API
          </p>
        </div>

        <Tabs defaultValue="url-load" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url-load" className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Load & Translate</span>
            </TabsTrigger>
            <TabsTrigger value="url-direct" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>Direct URL Translation</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="url-load">
            <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle>Two-Step Process</AlertTitle>
              <AlertDescription>
                This tab uses a two-step process: first load content, then translate. 
                We use Gemini API to fetch content directly from URLs, avoiding CORS limitations.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 mt-4">
              <InputTabs 
                onUrlSubmit={handleUrlSubmit} 
                onHtmlSubmit={handleHtmlSubmit} 
                disabled={isLoading} 
              />
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {originalHtml && (
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex flex-col space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Translate to:</h2>
                        <div className="mt-2">
                          <LanguageSelector 
                            onSelectLanguage={handleLanguageSelect} 
                            disabled={isLoading} 
                          />
                        </div>
                        <div className="mt-2">
                          <QuickLanguageButtons 
                            onSelectLanguage={handleLanguageSelect} 
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <h3 className="text-sm font-semibold">Translation Mode:</h3>
                        </div>
                        <RadioGroup 
                          value={translationMode} 
                          onValueChange={(value) => handleModeChange(value as TranslationMode)}
                          className="flex flex-col space-y-2"
                          disabled={isLoading}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="structured" id="mode-structured" />
                            <Label htmlFor="mode-structured" className="flex items-center cursor-pointer">
                              <LayoutGrid className="h-4 w-4 mr-2" />
                              <div>
                                <span className="font-medium">Structured HTML</span>
                                <p className="text-xs text-muted-foreground">Best for preserving layout and visual design</p>
                              </div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="regular" id="mode-regular" />
                            <Label htmlFor="mode-regular" className="flex items-center cursor-pointer">
                              <Code className="h-4 w-4 mr-2" />
                              <div>
                                <span className="font-medium">Standard Translation</span>
                                <p className="text-xs text-muted-foreground">Better for content accuracy</p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleTranslate}
                      disabled={isLoading || !selectedLanguage}
                      className="mt-4 md:mt-0"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Translate
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <SideBySidePreview
                    originalHtml={originalHtml}
                    translatedHtml={translatedHtml}
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="url-direct">
            <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
              <Link className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Direct URL Translation</AlertTitle>
              <AlertDescription>
                Enter a URL and select a language to translate directly in one step using Gemini's URL context feature.
                This method allows Gemini to directly access and translate web content.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4 mt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium mb-2">Enter URL to translate</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 border rounded-md"
                        value={directUrl}
                        onChange={(e) => setDirectUrl(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Select language</label>
                    <LanguageSelector 
                      onSelectLanguage={handleLanguageSelect} 
                      disabled={isLoading} 
                    />
                  </div>
                  
                  <Button
                    className="md:self-end"
                    disabled={isLoading || !selectedLanguage || !directUrl.trim()}
                    onClick={() => handleUrlTranslate(directUrl)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Translate URL
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-2">
                  <QuickLanguageButtons 
                    onSelectLanguage={handleLanguageSelect} 
                    disabled={isLoading}
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {originalHtml && translatedHtml && (
                  <SideBySidePreview
                    originalHtml={originalHtml}
                    translatedHtml={translatedHtml}
                    className="mt-4"
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 