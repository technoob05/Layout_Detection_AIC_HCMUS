import { useState, useEffect } from 'react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, HelpCircle } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";

interface VoiceCommandsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function VoiceCommandsDialog({
  open,
  onOpenChange,
  trigger
}: VoiceCommandsDialogProps) {
  const { 
    isListening, 
    toggleListening, 
    commands, 
    transcript,
    isSupported
  } = useVoiceCommands();
  const { theme } = useTheme();
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);

  // Add transcripts to history when they change
  useEffect(() => {
    if (transcript && transcript.trim() !== '') {
      setTranscriptHistory(prev => {
        const newHistory = [...prev, transcript];
        // Keep only the last 5 transcripts
        return newHistory.slice(-5);
      });
    }
  }, [transcript]);

  // Group commands by category for better organization
  const groupedCommands = commands.reduce((acc, command) => {
    const category = command.command.includes('translate') || command.command.includes('extract')
      ? 'Translation'
      : command.command.includes('settings') || command.command.includes('theme')
        ? 'Settings'
        : command.command === 'help' || command.command === 'stop listening'
          ? 'Voice Control'
          : 'Navigation';
      
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, typeof commands>);

  // Apply theme-specific styling
  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix':
        return {
          badge: 'matrix',
          micColor: 'text-primary matrix-text',
          glowEffect: 'shadow-lg shadow-primary/30',
        };
      case 'synthwave':
        return {
          badge: 'synthwave',
          micColor: 'gradient-text',
          glowEffect: 'shadow-lg shadow-primary/30',
        };
      case 'cyberpunk':
        return {
          badge: 'cyberpunk',
          micColor: 'text-yellow-500',
          glowEffect: 'shadow-lg shadow-yellow-500/30',
        };
      case 'nord':
        return {
          badge: 'nord',
          micColor: 'text-blue-400',
          glowEffect: 'shadow-lg shadow-blue-400/20',
        };
      default:
        return {
          badge: 'default',
          micColor: 'text-primary',
          glowEffect: '',
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl overflow-hidden p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Volume2 className={cn("size-4 sm:size-5", themeClasses.micColor)} />
            <DialogTitle>Voice Commands</DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            Control the application using voice commands
          </DialogDescription>
        </DialogHeader>

        {!isSupported && (
          <div className="rounded-md p-3 bg-destructive/20 text-destructive-foreground mb-3 text-sm">
            <h4 className="font-medium">Voice recognition not supported</h4>
            <p className="text-xs mt-1">
              Your browser doesn't support the Web Speech API. Try using Chrome, Edge, or Safari.
            </p>
          </div>
        )}

        {isSupported && (
          <ScrollArea className="max-h-[70vh] sm:max-h-[80vh] pr-3">
            <div className="space-y-4 sm:space-y-6">
              {/* Voice recognition control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-sm sm:text-base">Voice Recognition</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isListening 
                      ? "Listening for commands..." 
                      : "Click the button to start"}
                  </p>
                </div>
                <Button 
                  onClick={toggleListening} 
                  variant={isListening ? "destructive" : "default"}
                  size="default"
                  className={cn(
                    "group relative",
                    isListening && themeClasses.glowEffect
                  )}
                >
                  {isListening ? (
                    <MicOff className="size-4 me-2 animate-pulse" />
                  ) : (
                    <Mic className="size-4 me-2 group-hover:scale-110 transition-transform" />
                  )}
                  {isListening ? "Stop Listening" : "Start Listening"}
                </Button>
              </div>

              {/* Transcript display */}
              {isListening && (
                <Card className="p-3 bg-muted/50 overflow-hidden text-sm">
                  <h4 className="font-medium text-xs sm:text-sm flex items-center gap-1">
                    <span className="relative">
                      <Mic className="size-3 sm:size-4" />
                      <span className="absolute top-0 right-0 size-1.5 sm:size-2 bg-primary rounded-full animate-ping" />
                    </span>
                    Current Transcript
                  </h4>
                  <div className="text-muted-foreground italic mt-2 min-h-8 text-xs sm:text-sm">
                    {transcript || "Listening..."}
                  </div>
                  {transcriptHistory.length > 0 && (
                    <>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-3 mb-1">Recent Transcripts</div>
                      <div className="space-y-1">
                        {transcriptHistory.map((text, i) => (
                          <div key={i} className="text-[10px] sm:text-xs text-muted-foreground p-1 rounded">
                            {text}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              )}

              {/* Available commands */}
              <div>
                <h3 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <HelpCircle className="size-3 sm:size-4" />
                  Available Voice Commands
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  {Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div key={category}>
                      <Badge variant={themeClasses.badge as any} className="mb-2 text-xs">
                        {category}
                      </Badge>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {cmds.map((cmd) => (
                          <div
                            key={cmd.command}
                            className="flex flex-col p-2 sm:p-3 border rounded-md bg-background/70 hover:bg-accent/50 transition-colors"
                          >
                            <span className="font-medium text-xs sm:text-sm">"{cmd.command}"</span>
                            {cmd.aliases && cmd.aliases.length > 0 && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                Also: {cmd.aliases.length > 2 
                                  ? `"${cmd.aliases[0]}", "${cmd.aliases[1]}", +${cmd.aliases.length - 2} more`
                                  : cmd.aliases.map(a => `"${a}"`).join(", ")}
                              </span>
                            )}
                            <span className="text-xs sm:text-sm mt-1 text-muted-foreground">
                              {cmd.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs sm:text-sm text-muted-foreground border-t pt-3">
                <p>
                  Start voice recognition and say one of the commands above. For best results, speak clearly.
                </p>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
} 