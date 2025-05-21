import { memo, useState, useRef, useEffect } from 'react';
import { DetectedTextBlock } from '../types';
import { cn } from '@/lib/utils';
import { Languages, Sparkles, CheckCircle2, CircleAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SpeechButton } from '@/components/ui/speech-button';

interface ARTranslationOverlayProps {
  detectedBlocks: DetectedTextBlock[];
  overlayOpacity: number;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  containerWidth: number;
  containerHeight: number;
  videoWidth: number;
  videoHeight: number;
  onTranslateBlock: (blockId: string) => Promise<void>;
  targetLanguage: string;
}

export const ARTranslationOverlay = memo(({
  detectedBlocks,
  overlayOpacity,
  selectedBlockId,
  onSelectBlock,
  containerWidth,
  containerHeight,
  videoWidth,
  videoHeight,
  onTranslateBlock,
  targetLanguage
}: ARTranslationOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});
  
  // Calculate scale factors between video dimensions and container dimensions
  const scaleX = containerWidth / videoWidth;
  const scaleY = containerHeight / videoHeight;
  
  // Local hover state for better touch device experience
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  
  // Calculate opacity classes - only specific values are available in Tailwind
  const getOpacityClass = (opacity: number) => {
    const opacityPercent = Math.round(opacity * 100);
    // Match to nearest available Tailwind opacity class
    if (opacityPercent <= 10) return 'opacity-10';
    if (opacityPercent <= 20) return 'opacity-20';
    if (opacityPercent <= 30) return 'opacity-30';
    if (opacityPercent <= 40) return 'opacity-40';
    if (opacityPercent <= 50) return 'opacity-50';
    if (opacityPercent <= 60) return 'opacity-60';
    if (opacityPercent <= 70) return 'opacity-70';
    if (opacityPercent <= 80) return 'opacity-80';
    if (opacityPercent <= 90) return 'opacity-90';
    return 'opacity-100';
  };
  
  const opacityClass = getOpacityClass(overlayOpacity);
  
  // Handle translate button click
  const handleTranslate = async (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsTranslating(prev => ({ ...prev, [blockId]: true }));
    
    try {
      await onTranslateBlock(blockId);
    } finally {
      setIsTranslating(prev => ({ ...prev, [blockId]: false }));
    }
  };
  
  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`
      }}
    >
      {/* Guide overlay when no text detected */}
      <AnimatePresence>
        {detectedBlocks.length === 0 && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-background/60 backdrop-blur-sm rounded-lg py-3 px-4 shadow-xl text-center"
              initial={{ y: 20, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div className="flex items-center justify-center gap-2 text-primary mb-1">
                <Languages className="size-4" />
                <p className="font-medium">Scanning for text</p>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Di chuyển camera từ từ về phía văn bản để nhận diện
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Detected text blocks */}
      <AnimatePresence>
        {detectedBlocks.map((block) => {
          // Scale bounding box to match container dimensions
          const scaledBox = {
            x: block.boundingBox.x * videoWidth * scaleX,
            y: block.boundingBox.y * videoHeight * scaleY,
            width: block.boundingBox.width * videoWidth * scaleX,
            height: block.boundingBox.height * videoHeight * scaleY
          };
          
          const isSelected = selectedBlockId === block.id;
          const isHovered = hoveredBlockId === block.id;
          const isActive = isSelected || isHovered;
          const hasTranslation = !!block.translatedText;
          
          return (
            <motion.div 
              key={block.id}
              className={cn(
                "absolute pointer-events-auto select-none",
                isSelected ? "z-20" : "z-10"
              )}
              style={{
                left: `${scaledBox.x}px`,
                top: `${scaledBox.y}px`,
                width: `${scaledBox.width}px`,
                height: `${scaledBox.height}px`,
                touchAction: "none"
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: isActive ? 1.02 : 1,
                zIndex: isActive ? 30 : 10
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(isSelected ? null : block.id);
              }}
              onMouseEnter={() => setHoveredBlockId(block.id)}
              onMouseLeave={() => setHoveredBlockId(null)}
              onTouchStart={(e) => {
                e.stopPropagation();
                setHoveredBlockId(block.id);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                setTimeout(() => setHoveredBlockId(null), 1500);
              }}
            >
              {/* Original text highlight box */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-sm border-2 backdrop-blur-[1px] transition-all duration-300",
                  isSelected 
                    ? "border-primary shadow-[0_0_0_1px_rgba(var(--primary),0.3),0_0_0_4px_rgba(var(--primary),0.2)]" 
                    : isHovered 
                      ? "border-primary/70 shadow-[0_0_0_2px_rgba(var(--primary),0.2)]" 
                      : "border-yellow-300/70 shadow-sm"
                )}
              >
                {/* Highlight background */}
                <div className={cn(
                  "absolute inset-0 bg-yellow-300/20",
                  isActive ? "bg-primary/10" : ""
                )} />
                
                {/* Status indicator */}
                <div className={cn(
                  "absolute -top-2 -right-2 size-4 rounded-full border flex items-center justify-center transition-all",
                  isSelected ? "bg-primary border-primary" : "bg-yellow-400/80 border-yellow-500",
                  isActive ? "opacity-100" : "opacity-0"
                )}>
                  <CheckCircle2 className="size-3 text-white" />
                </div>
              </div>
              
              {/* Text content inside box (for short text) */}
              {block.text.length < 10 && (
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "text-[10px] font-medium text-foreground/90",
                  "pointer-events-none select-none"
                )}>
                  <span className="line-clamp-1 px-1 bg-background/40 rounded-sm">{block.text}</span>
                </div>
              )}
              
              {/* Translated text overlay - optimized for Vietnamese */}
              <AnimatePresence>
                {(isActive || block.isTranslating) && (
                  <motion.div 
                    className={cn(
                      "absolute -bottom-16 -left-2 -right-2 min-w-48 max-w-72 overflow-hidden",
                      "z-50 pointer-events-none"
                    )}
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.25, type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg shadow-lg backdrop-blur-md",
                      "border border-primary/20",
                      block.isTranslating ? "bg-black/70" : "bg-black/90",
                      opacityClass
                    )}>
                      {block.isTranslating ? (
                        <div className="flex items-center justify-center gap-1.5 py-1.5">
                          <div className="relative">
                            <Sparkles className="size-3.5 text-primary animate-pulse" />
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-primary/25"
                              initial={{ scale: 0.8, opacity: 0.8 }}
                              animate={{ scale: 1.8, opacity: 0 }}
                              transition={{ 
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeOut"
                              }}
                            />
                          </div>
                          <span className="animate-pulse text-xs text-primary-foreground">Đang dịch văn bản...</span>
                        </div>
                      ) : block.translatedText ? (
                        <div className="flex flex-col">
                          {/* Original text */}
                          <div className="mb-2 pb-1.5 border-b border-primary/20">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-medium text-gray-300">
                                Văn bản gốc:
                              </span>
                            </div>
                            <p className="text-xs text-gray-200 break-words line-clamp-2 leading-snug">
                              {block.text}
                            </p>
                          </div>
                          
                          {/* Translation - improved Vietnamese display */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <motion.div
                                animate={{ rotateY: [0, 360] }}
                                transition={{ duration: 2, repeat: 0, delay: 0.2 }}
                              >
                                <Languages className="size-3 text-primary" />
                              </motion.div>
                              <span className="text-[11px] font-medium text-primary">
                                Bản dịch Tiếng Việt:
                              </span>
                            </div>
                            <motion.p 
                              className="text-sm font-medium text-primary-foreground break-words leading-normal"
                              initial={{ opacity: 0.5 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              {block.translatedText}
                            </motion.p>
                          </div>
                          
                          {/* Translation source */}
                          {block.translatedWith && (
                            <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[9px] text-gray-400">
                              <Sparkles className="size-2.5 text-primary/80" />
                              <span>Dịch bởi: {block.translatedWith}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-1.5">
                          <CircleAlert className="size-3.5 text-yellow-400" />
                          <span className="text-xs font-medium text-yellow-200">Nhấn để xem bản dịch</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Translation or translate button */}
              {isSelected && (
                <div className="absolute -bottom-12 left-0 z-50 bg-background border rounded-md shadow-lg p-1.5 min-w-48 max-w-72 flex flex-col gap-1">
                  {hasTranslation ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-foreground">Translation</div>
                        <SpeechButton 
                          text={block.translatedText || ''}
                          langCode={targetLanguage} 
                          size="sm"
                          variant="ghost"
                          className="size-6 -mr-1"
                        />
                      </div>
                      <p className="text-sm">{block.translatedText}</p>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full gap-2 relative overflow-hidden group"
                      onClick={(e) => handleTranslate(block.id, e)}
                      disabled={isTranslating[block.id]}
                    >
                      {isTranslating[block.id] ? (
                        <>
                          <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
                          <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer"></div>
                          <div className="relative flex items-center gap-2">
                            <div className="size-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"></div>
                            <span>Translating...</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Languages className="size-3.5 group-hover:rotate-12 transition-transform" />
                          <span>Translate Text</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}); 