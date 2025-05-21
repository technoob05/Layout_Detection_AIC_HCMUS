import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Youtube, Settings as SettingsIcon, Globe, Copy, Wand2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Notification } from '@/components/ui/notification-toast';
import { Input } from '@/components/ui/input';
import { geminiTranscribeVideo, geminiTranslateTextOnly } from '@/services/gemini/geminiService.ts';
import { SpeechButton } from '@/components/ui/speech-button';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Language options for translation
const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'fr-FR', name: 'French' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'vi-VN', name: 'Vietnamese' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'ar-SA', name: 'Arabic' },
];

export function VideoTranslationPage() {
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('vi-VN');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showGlowEffect, setShowGlowEffect] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Visual effect on successful processing
  useEffect(() => {
    if (transcription) {
      setShowGlowEffect(true);
      const timer = setTimeout(() => setShowGlowEffect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [transcription]);

  // Copy translated text to clipboard
  const copyToClipboard = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      Notification.success('Copied', {
        description: 'Translation copied to clipboard'
      });
    }
  };
  
  // Process YouTube URL
  const processYoutubeVideo = async () => {
    if (!isValidYoutubeUrl(youtubeUrl)) {
      Notification.error('Invalid URL', {
        description: 'Please enter a valid YouTube URL (https://www.youtube.com/watch?v=...).'
      });
      return;
    }
    
    setIsProcessing(true);
    setTranscription('');
    setTranslatedText('');
    
    try {
      const transcription = await geminiTranscribeVideo({ youtubeUrl });
      setTranscription(transcription);
      
      // Auto-translate the transcription
      if (transcription) {
        const targetLang = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'Unknown';
        const translated = await geminiTranslateTextOnly(transcription, targetLanguage, targetLang);
        setTranslatedText(translated);
      }
      
      Notification.success('Video Processed', {
        description: 'YouTube video transcribed successfully.'
      });
    } catch (error) {
      console.error('Error processing YouTube video:', error);
      Notification.error('Processing Error', {
        description: 'Failed to process YouTube video. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process uploaded video file
  const processVideoFile = async (file: File) => {
    if (!file || !file.type.startsWith('video/')) {
      Notification.error('Invalid File', {
        description: 'Please upload a valid video file.'
      });
      return;
    }
    
    setIsProcessing(true);
    setTranscription('');
    setTranslatedText('');
    
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      const transcription = await geminiTranscribeVideo({
        base64Data,
        mimeType: file.type
      });
      
      setTranscription(transcription);
      
      // Auto-translate the transcription
      if (transcription) {
        const targetLang = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'Unknown';
        const translated = await geminiTranslateTextOnly(transcription, targetLanguage, targetLang);
        setTranslatedText(translated);
      }
      
      Notification.success('Video Processed', {
        description: 'Uploaded video transcribed successfully.'
      });
    } catch (error) {
      console.error('Error processing video file:', error);
      Notification.error('Processing Error', {
        description: 'Failed to process video file. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle file upload event
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Validate YouTube URL
  const isValidYoutubeUrl = (url: string) => {
    return url.match(/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/) !== null;
  };
  
  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extract the base64 data from the data URL (remove the prefix)
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };
  
  // Manual translation
  const translateTranscription = async () => {
    if (!transcription) {
      Notification.warning('Empty Transcription', {
        description: 'No transcription to translate.'
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const targetLang = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'Unknown';
      const translated = await geminiTranslateTextOnly(transcription, targetLanguage, targetLang);
      setTranslatedText(translated);
      
      Notification.success('Translation Complete', {
        description: 'Transcription has been translated successfully.'
      });
    } catch (error) {
      console.error('Translation error:', error);
      Notification.error('Translation Error', {
        description: 'Failed to translate transcription. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -inset-1/4 opacity-50">
          <div className="absolute top-1/3 left-1/4 size-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/2 right-1/3 size-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2/3 right-1/4 size-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0 text-foreground/80 hover:text-foreground transition-colors">
            <a href="/">
              <ArrowLeft className="size-5" />
            </a>
          </Button>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="size-5 text-primary animate-pulse" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Video Translation
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Tabs Navigation */}
          <Tabs 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'youtube' | 'upload')} 
            className="w-auto"
          >
            <TabsList className="h-10 bg-card/70 backdrop-blur-sm">
              <TabsTrigger 
                value="youtube" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 text-sm px-4"
              >
                <Youtube className="size-4 mr-2" />
                YouTube
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 text-sm px-4"
              >
                <Upload className="size-4 mr-2" />
                Upload
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Settings Button */}
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all duration-300"
              >
                <SettingsIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SettingsIcon className="size-5 text-primary" />
                  Translation Settings
                </SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    Target Language
                  </h3>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="flex-1 grid lg:grid-cols-2 gap-6 p-6 overflow-auto">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-lg font-medium flex items-center gap-2 mb-4">
            <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
            Video Source
          </h2>
          
          <AnimatePresence mode="wait">
            {activeTab === 'youtube' && (
              <motion.div
                key="youtube"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border border-border/40 bg-card/60 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input 
                          type="text" 
                          placeholder="Enter YouTube URL" 
                          value={youtubeUrl} 
                          onChange={(e) => setYoutubeUrl(e.target.value)} 
                          className="flex-1 bg-background/50 border-border/40 focus:border-primary/30 transition-all duration-300"
                        />
                        <Button 
                          onClick={processYoutubeVideo}
                          disabled={isProcessing || !youtubeUrl}
                          variant="default"
                          className="gap-2 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-primary/20"
                        >
                          {isProcessing ? (
                            <>
                              <LoadingAnimation type="spinner" size="sm" className="size-6 text-primary" />
                              Processing
                            </>
                          ) : (
                            <>
                              <Wand2 className="size-4" />
                              Process
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {isProcessing && activeTab === 'youtube' && (
                        <div className="flex items-center justify-center p-8 h-40">
                          <LoadingAnimation 
                            type="pulse" 
                            size="lg" 
                            text="Processing YouTube video..." 
                            className="text-primary/80"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border border-border/40 bg-card/60 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      <div 
                        className={cn(
                          "relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-500",
                          isProcessing ? "opacity-70" : "hover:border-primary/40"
                        )}
                        onClick={isProcessing ? undefined : handleUploadClick}
                      >
                        <Button 
                          variant="outline"
                          disabled={isProcessing}
                          className={cn(
                            "w-full py-12 border border-dashed gap-3 bg-background/30 hover:bg-background/50 transition-all duration-500",
                            isProcessing ? "" : "group-hover:border-primary/30 group-hover:shadow-sm group-hover:shadow-primary/10"
                          )}
                        >
                          {isProcessing ? (
                            <>
                              <LoadingAnimation type="spinner" size="sm" className="size-6 text-primary" />
                              <div className="flex flex-col items-center">
                                <span>Processing Video</span>
                                <span className="text-xs text-muted-foreground mt-1">Please wait...</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="size-6 text-primary" />
                              </div>
                              <div className="flex flex-col items-center">
                                <span>Drop your video file here</span>
                                <span className="text-xs text-muted-foreground mt-1">or click to browse</span>
                              </div>
                            </>
                          )}
                        </Button>
                        
                        {/* Ripple effect background for hover */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="video/*" 
                        className="hidden" 
                      />
                      
                      {isProcessing && activeTab === 'upload' && (
                        <div className="flex items-center justify-center p-6 h-20">
                          <LoadingAnimation 
                            type="pulse" 
                            size="lg" 
                            text="Processing video file..." 
                            className="text-primary/80"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Display transcription */}
          <AnimatePresence>
            {transcription && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary"></div>
                    Transcription
                  </h2>
                  <div className="flex items-center gap-2">
                    <SpeechButton 
                      text={transcription}
                      langCode="en-US"
                      tooltip="Listen to transcription"
                      className="bg-card/70 hover:bg-card shadow-sm"
                    />
                  </div>
                </div>
                <Card 
                  className={cn(
                    "overflow-hidden transition-all duration-1000 bg-card/60 backdrop-blur-md border-border/40 shadow-md",
                    showGlowEffect && "shadow-lg shadow-primary/20"
                  )}
                >
                  <CardContent className="p-5 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <p className="whitespace-pre-line leading-relaxed">{transcription}</p>
                  </CardContent>
                  {showGlowEffect && (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent animate-pulse"></div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Output Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
          ref={videoContainerRef}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center gap-2 mb-4">
              <div className={cn(
                "size-1.5 rounded-full",
                translatedText ? "bg-primary" : "bg-muted-foreground"
              )}></div>
              Translation
              {LANGUAGES.find(lang => lang.code === targetLanguage) && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {LANGUAGES.find(lang => lang.code === targetLanguage)?.name}
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              {transcription && !translatedText && !isProcessing && (
                <Button 
                  onClick={translateTranscription} 
                  size="sm" 
                  variant="outline"
                  className="gap-2 hover:bg-primary/5 hover:text-primary transition-colors duration-300"
                >
                  <Wand2 className="size-3.5" />
                  Translate Again
                </Button>
              )}
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {isProcessing && transcription && !translatedText ? (
              <motion.div
                key="translating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 flex justify-center items-center min-h-[300px] border-border/40 bg-card/60 backdrop-blur-md shadow-md">
                  <LoadingAnimation 
                    type="dots" 
                    size="lg" 
                    text="Translating content..." 
                    className="text-primary/80"
                  />
                </Card>
              </motion.div>
            ) : translatedText ? (
              <motion.div
                key="translated"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="relative group border border-border/40 bg-card/60 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={copyToClipboard}
                      className="size-8 bg-card/70 hover:bg-card shadow-sm"
                      title="Copy translation"
                    >
                      <Copy className={cn(
                        "size-3.5 transition-all",
                        copySuccess ? "text-green-500" : "text-muted-foreground"
                      )} />
                    </Button>
                    <SpeechButton 
                      text={translatedText}
                      langCode={targetLanguage}
                      tooltip="Listen to translation"
                      className="bg-card/70 hover:bg-card shadow-sm"
                    />
                  </div>
                  <CardContent className="p-5 pt-10 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <p className="whitespace-pre-line leading-relaxed">{translatedText}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : transcription ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 flex justify-center items-center min-h-[300px] border border-dashed border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <LoadingAnimation type="dots" size="sm" className="text-primary" />
                    Translation will appear here
                  </p>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 flex flex-col justify-center items-center min-h-[300px] border border-dashed border-border/40 bg-card/40 backdrop-blur-md">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Globe className="size-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground mb-2">No content to translate yet</p>
                  <p className="text-xs text-muted-foreground">Process a video to see translation</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Add custom CSS for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.2);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.3);
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
} 