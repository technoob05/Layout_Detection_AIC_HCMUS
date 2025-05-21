import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '@/services/tts/speechService';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SpeechButtonProps {
  text: string;
  langCode?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  tooltip?: string;
  onFinish?: () => void;
}

export function SpeechButton({
  text,
  langCode = 'en-US',
  className,
  variant = 'outline',
  size = 'icon',
  tooltip = 'Text to Speech',
  onFinish
}: SpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if speech synthesis is supported
  const isSupported = isSpeechSynthesisSupported();
  
  if (!isSupported) {
    return null;
  }
  
  // Handle speech button click
  const handleClick = async () => {
    if (isSpeaking) {
      // Stop current speech
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    if (!text) return;
    
    setIsLoading(true);
    
    try {
      setIsSpeaking(true);
      
      await speakText(text, langCode, {
        onEnd: () => {
          setIsSpeaking(false);
          if (onFinish) onFinish();
        },
        onError: () => {
          setIsSpeaking(false);
        }
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get the appropriate tooltip text based on state
  const getTooltipText = () => {
    if (isSpeaking) return "Dừng đọc";
    if (isLoading) return "Đang tải...";
    return tooltip;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isSpeaking ? "destructive" : variant}
            size={size}
            className={cn(
              "relative transition-all duration-300",
              isHovered && !isSpeaking && "scale-110",
              isHovered && isSpeaking && "scale-105",
              isSpeaking && "shadow-sm shadow-primary/25",
              className
            )}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isLoading || !text}
            aria-label={isSpeaking ? "Dừng đọc" : "Đọc văn bản"}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSpeaking ? (
              <div className="relative flex items-center justify-center">
                <VolumeX className="size-4 text-destructive-foreground" />
                <div className="absolute -inset-2 rounded-full bg-destructive/25 animate-ping opacity-75" />
              </div>
            ) : (
              <Volume2 className="size-4" />
            )}
            {size !== 'icon' && (
              <span className="ml-2">
                {isSpeaking ? "Dừng đọc" : "Đọc văn bản"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 