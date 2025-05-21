import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, MicOff, Play, StopCircle, Settings as SettingsIcon, Globe, ArrowRight, Copy, Check, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Notification } from '@/components/ui/notification-toast';
import { geminiTranslateTextOnly } from '@/services/gemini/geminiService.ts';
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speech';
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

export function VoiceTranslationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('vi-VN');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize Speech Recognition and Speech Synthesis
  useEffect(() => {
    // Check if browser supports Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setIsLoading(false);
        Notification.error('Speech Recognition Error', {
          description: `Error: ${event.error}`,
          action: {
            label: 'Retry',
            onClick: startRecording
          }
        });
      };
    } else {
      Notification.error('Browser Not Supported', {
        description: 'Your browser does not support speech recognition.'
      });
    }
    
    // Check if browser supports Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Update recognition language when source language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLanguage;
    }
  }, [sourceLanguage]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [manualText]);
  
  // Setup audio visualizer
  const setupAudioVisualizer = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || ((window as any).webkitAudioContext);
        audioContextRef.current = new AudioCtx();
      }
      
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // Update audio level
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const level = Math.min(100, average * 2); // Scale up for better visual effect
          setAudioLevel(level);
          
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to setup audio visualizer:', error);
    }
  };
  
  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Start recording
  const startRecording = async () => {
    if (recognitionRef.current) {
      setTranscript('');
      setTranslatedText('');
      setIsLoading(true);
      
      try {
        await setupAudioVisualizer();
        recognitionRef.current.start();
        setIsRecording(true);
        
        // Start timer
        setRecordingTime(0);
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsLoading(false);
        Notification.error('Recording Error', {
          description: 'Failed to start recording. Please try again.'
        });
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Clean up audio visualizer
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setAudioLevel(0);
    }
  };
  
  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Translate the transcript
  const translateVoice = async () => {
    if (!transcript.trim()) {
      Notification.warning('Empty Text', {
        description: 'Please speak or type something to translate.'
      });
      return;
    }
    
    setIsTranslating(true);
    try {
      const targetLang = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'Unknown';
      const result = await geminiTranslateTextOnly(transcript, targetLanguage, targetLang);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation error:', error);
      Notification.error('Translation Error', {
        description: 'Failed to translate text. Please try again.'
      });
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Translate manual text input
  const translateText = async () => {
    if (!manualText.trim()) {
      Notification.warning('Empty Text', {
        description: 'Please enter some text to translate.'
      });
      return;
    }
    
    setIsTranslating(true);
    try {
      const targetLang = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'Unknown';
      const result = await geminiTranslateTextOnly(manualText, targetLanguage, targetLang);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation error:', error);
      Notification.error('Translation Error', {
        description: 'Failed to translate text. Please try again.'
      });
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Speak the translated text
  const speakTranslatedText = () => {
    if (synthRef.current && translatedText) {
      // Stop any current speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = targetLanguage;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Copy translated text to clipboard
  const copyToClipboard = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText)
        .then(() => {
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          Notification.error('Copy Failed', {
            description: 'Failed to copy text to clipboard.'
          });
        });
    }
  };
  
  // Get source and target language names
  const sourceLangName = LANGUAGES.find(lang => lang.code === sourceLanguage)?.name || 'Unknown';
  const targetLangName = LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'Unknown';
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-background/50">
      {/* Header */}
      <motion.header 
        className="flex justify-between items-center p-3 border-b backdrop-blur-lg bg-background/70 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <a href="/">
              <ArrowLeft className="size-5" />
            </a>
          </Button>
          <motion.h1 
            className="text-xl font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 font-bold">Voice Translation</span>
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Display */}
          <motion.div 
            className="hidden md:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <span className="font-medium">{sourceLangName}</span>
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <span className="font-medium">{targetLangName}</span>
          </motion.div>
          
          {/* Tabs Navigation */}
          <Tabs 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'voice' | 'text')} 
            className="w-auto"
          >
            <TabsList className="h-9 backdrop-blur-md bg-card/50">
              <TabsTrigger value="voice" className="text-xs px-3 relative">
                <Mic className="size-3.5 mr-1.5" />
                Voice
                {activeTab === 'voice' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    layoutId="activeTabIndicator"
                  />
                )}
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs px-3 relative">
                <span className="i-lucide-text-cursor size-3.5 mr-1.5" />
                Text
                {activeTab === 'text' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    layoutId="activeTabIndicator"
                  />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Settings Button */}
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all border-card"
              >
                <SettingsIcon className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md border-l border-border/40 backdrop-blur-2xl bg-card/80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Globe className="size-5" />
                  <span>Translation Settings</span>
                </SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-sm font-medium">Source Language</h3>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-full bg-background/50 border-border/40">
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
                </motion.div>
                
                <motion.div 
                  className="relative flex items-center justify-center my-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="h-px w-full bg-border/40"></div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute bg-card z-10 rounded-full"
                    onClick={() => {
                      const temp = sourceLanguage;
                      setSourceLanguage(targetLanguage);
                      setTargetLanguage(temp);
                    }}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm font-medium">Target Language</h3>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-full bg-background/50 border-border/40">
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
                </motion.div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-auto">
        {/* Input Section */}
        <motion.div 
          className="flex-1 flex flex-col gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500"></span>
              Original Text
              <span className="text-xs text-muted-foreground font-normal">({sourceLangName})</span>
            </h2>
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'voice' ? (
              <motion.div
                key="voice-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex-1 flex flex-col overflow-hidden border-border/40 shadow-lg bg-card/90 backdrop-blur-sm relative">
                  {/* Audio Visualizer */}
                  {isRecording && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted/50 overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary/80 rounded-full"
                        style={{ width: `${audioLevel}%` }}
                        transition={{ type: "spring", damping: 10 }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-4 overflow-auto relative">
                    {transcript ? (
                      <p className="text-lg">{transcript}</p>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <RefreshCw className="size-8 text-muted-foreground" />
                          </motion.div>
                        ) : (
                          <>
                            <motion.div 
                              className="size-24 rounded-full bg-primary/5 flex items-center justify-center"
                              animate={isRecording ? { 
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                  "0 0 0 0 rgba(147, 51, 234, 0.3)",
                                  "0 0 0 15px rgba(147, 51, 234, 0)",
                                ]
                              } : {}}
                              transition={{ 
                                repeat: Infinity,
                                duration: 1.5,
                              }}
                            >
                              <Mic className={`size-12 ${isRecording ? 'text-primary' : 'text-muted-foreground'}`} />
                            </motion.div>
                            <p className="text-muted-foreground">
                              {isRecording ? 'Listening...' : 'Press the microphone button to start speaking'}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-border/20 p-3 flex justify-between items-center">
                    {isRecording && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium flex items-center gap-1"
                      >
                        <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                        {formatTime(recordingTime)}
                      </motion.div>
                    )}
                    
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isRecording ? "recording" : "not-recording"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-2"
                      >
                        <Button 
                          variant={isRecording ? "destructive" : "default"}
                          onClick={toggleRecording}
                          disabled={isLoading}
                          className={isRecording ? "shadow-md shadow-red-500/20" : "shadow-md shadow-primary/10"}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="size-4 mr-2" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="size-4 mr-2" />
                              Start Recording
                            </>
                          )}
                        </Button>
                        
                        {transcript && (
                          <Button 
                            onClick={translateVoice} 
                            disabled={!transcript || isTranslating}
                            className="shadow-md shadow-primary/10 relative overflow-hidden"
                          >
                            {isTranslating ? (
                              <motion.div 
                                className="absolute inset-0 bg-primary/20"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                              />
                            ) : null}
                            <Globe className="size-4 mr-2" />
                            Translate
                          </Button>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="text-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex-1 flex flex-col overflow-hidden border-border/40 shadow-lg bg-card/90 backdrop-blur-sm">
                  <div className="relative flex-1">
                    <textarea
                      ref={textareaRef}
                      className="w-full p-4 resize-none bg-transparent outline-none min-h-36"
                      placeholder="Type or paste text to translate..."
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                    />
                    {!manualText && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-muted-foreground/50 flex flex-col items-center gap-2">
                          <span className="i-lucide-file-text size-12"></span>
                          Enter text to translate
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-border/20 p-3 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {manualText ? `${manualText.length} characters` : ''}
                    </div>
                    
                    <Button 
                      onClick={translateText} 
                      disabled={!manualText || isTranslating}
                      className="shadow-md shadow-primary/10 relative overflow-hidden"
                    >
                      {isTranslating ? (
                        <motion.div 
                          className="absolute inset-0 bg-primary/20"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2 }}
                        />
                      ) : null}
                      <Globe className="size-4 mr-2" />
                      Translate
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Output Section */}
        <motion.div 
          className="flex-1 flex flex-col gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500"></span>
              Translated Text
              <span className="text-xs text-muted-foreground font-normal">({targetLangName})</span>
            </h2>
          </div>
          
          <Card className="flex-1 flex flex-col overflow-hidden border-border/40 shadow-lg bg-card/90 backdrop-blur-sm">
            <div className="flex-1 p-4 overflow-auto">
              {translatedText ? (
                <motion.p 
                  className="text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {translatedText}
                </motion.p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  {isTranslating ? (
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <RefreshCw className="size-8 text-muted-foreground" />
                      </motion.div>
                      <p className="text-muted-foreground">Translating...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-24 rounded-full bg-muted/20 flex items-center justify-center">
                        <Globe className="size-12 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground">
                        Translation will appear here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="border-t border-border/20 p-3 flex justify-between gap-2">
              {translatedText && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyToClipboard}
                  className="bg-background/50 border-border/40"
                >
                  <AnimatePresence mode="wait">
                    {hasCopied ? (
                      <motion.div
                        key="copied"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="size-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy className="size-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              )}
              
              <div className="flex-1 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={speakTranslatedText}
                  disabled={!translatedText || isSpeaking}
                  className={`bg-background/50 border-border/40 ${isSpeaking ? 'text-primary' : ''}`}
                >
                  <Play className="size-4 mr-2" />
                  {isSpeaking ? 'Speaking...' : 'Speak Translation'}
                </Button>
                
                {isSpeaking && (
                  <Button 
                    variant="outline" 
                    onClick={stopSpeaking}
                    className="bg-background/50 border-border/40"
                  >
                    <StopCircle className="size-4 mr-2" />
                    Stop Audio
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}