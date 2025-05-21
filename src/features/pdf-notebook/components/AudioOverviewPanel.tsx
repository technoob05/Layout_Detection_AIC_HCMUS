import { useRef, useState } from 'react';
import { RefreshCw, Headphones, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { PdfAudioOverview } from '../types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AudioOverviewPanelProps {
  audioOverview: PdfAudioOverview | undefined;
  isLoading: boolean;
  onGenerate: () => void;
}

export function AudioOverviewPanel({ audioOverview, isLoading, onGenerate }: AudioOverviewPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), audioRef.current.duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
        <h3 className="font-medium text-lg mb-2">Generating Audio Overview</h3>
        <p className="text-muted-foreground text-sm">
          Converting document contents to audio and preparing transcript...
        </p>
      </div>
    );
  }

  if (!audioOverview) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <Headphones className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No Audio Overview</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Generate an audio overview to listen to a summary of this document.
        </p>
        <Button onClick={onGenerate}>
          Generate Audio Overview
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {audioOverview.audioUrl && (
        <audio 
          ref={audioRef}
          src={audioOverview.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      
      <div className="flex flex-col gap-4">
        <h3 className="font-medium text-lg">Audio Overview</h3>
        
        {/* Audio Controls */}
        <div className="p-4 border rounded-md bg-muted/30 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                onClick={() => skip(-10)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="default" 
                size="icon" 
                className="h-10 w-10 rounded-full" 
                onClick={togglePlay}
              >
                {isPlaying 
                  ? <Pause className="h-5 w-5" /> 
                  : <Play className="h-5 w-5 ml-0.5" />
                }
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                onClick={() => skip(10)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                {showVolumeSlider && (
                  <div 
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-background border rounded-md shadow-md w-24"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <Slider
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onGenerate}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Transcript */}
      <div>
        <h4 className="text-sm font-medium mb-2">Transcript</h4>
        <ScrollArea className="h-[calc(100vh-330px)]">
          <div className="whitespace-pre-wrap text-sm p-3 border rounded-md bg-muted/30">
            {audioOverview.transcript}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 