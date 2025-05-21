import { RefreshCw, Image, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PdfSlideCollection } from '../types';
import { cn } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

interface SlidesPanelProps {
  slideCollection: PdfSlideCollection | undefined;
  isLoading: boolean;
  onGenerate: () => void;
}

export function SlidesPanel({ slideCollection, isLoading, onGenerate }: SlidesPanelProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'slides'>('cards');
  const genAiRef = useRef<GoogleGenAI | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasMoreRight, setHasMoreRight] = useState(false);
  const [hasMoreLeft, setHasMoreLeft] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  // Initialize Google Generative AI client
  useEffect(() => {
    // Default API key used for development - in production this would be in a secure environment variable
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || 'AIzaSyCwg1omBoK9kSWwmjJ3BWFb0CO7oEAAJVU';
    
    if (apiKey) {
      genAiRef.current = new GoogleGenAI({ apiKey });
    }
  }, []);

  // Check for overflow to show scroll indicators - improved logic
  useEffect(() => {
    if (viewMode === 'cards' && scrollContainerRef.current) {
      const checkForOverflow = () => {
        const container = scrollContainerRef.current;
        if (container) {
          // Improved calculation with a small threshold to handle rounding errors
          const maxScrollLeft = container.scrollWidth - container.clientWidth;
          setHasMoreRight(container.scrollWidth > container.clientWidth && 
                         container.scrollLeft < maxScrollLeft - 2); // Added threshold
          setHasMoreLeft(container.scrollLeft > 2); // Added threshold
        }
      };

      // Initial check
      checkForOverflow();

      // Add scroll event listener
      const scrollContainer = scrollContainerRef.current;
      scrollContainer?.addEventListener('scroll', checkForOverflow);
      
      // Add resize listener
      const resizeObserver = new ResizeObserver(() => {
        // Delay calculation slightly to ensure accurate measurements after resize
        setTimeout(checkForOverflow, 100);
      });
      if (scrollContainer) {
        resizeObserver.observe(scrollContainer);
      }

      // Cleanup
      return () => {
        scrollContainer?.removeEventListener('scroll', checkForOverflow);
        if (scrollContainer) {
          resizeObserver.disconnect();
        }
      };
    }
  }, [viewMode, slideCollection]);

  // Ensure scroll indicators are updated when slide collection changes
  useEffect(() => {
    if (viewMode === 'cards' && scrollContainerRef.current) {
      const checkForOverflow = () => {
        const container = scrollContainerRef.current;
        if (container) {
          const maxScrollLeft = container.scrollWidth - container.clientWidth;
          setHasMoreRight(container.scrollWidth > container.clientWidth && 
                         container.scrollLeft < maxScrollLeft - 2);
          setHasMoreLeft(container.scrollLeft > 2);
        }
      };
      
      // Use timeout to ensure elements are rendered first
      setTimeout(checkForOverflow, 200);
    }
  }, [slideCollection, viewMode]);

  const handleNextSlide = () => {
    if (!slideCollection) return;
    setActiveSlideIndex((prev) => (prev + 1) % slideCollection.slides.length);
  };

  const handlePrevSlide = () => {
    if (!slideCollection) return;
    setActiveSlideIndex((prev) => (prev - 1 + slideCollection.slides.length) % slideCollection.slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!slideCollection) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    
    // Swipe right to left (next slide)
    if (diffX > 50) {
      handleNextSlide();
    }
    // Swipe left to right (previous slide)
    else if (diffX < -50) {
      handlePrevSlide();
    }
  };

  // Improved scroll functions with smooth behavior
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Calculate scroll position based on container width for more intuitive scrolling
      const scrollAmount = Math.min(scrollContainerRef.current.clientWidth * 0.7, 300);
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
      
      // Force check overflow after scrolling
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          setHasMoreLeft(container.scrollLeft > 2);
          setHasMoreRight(container.scrollWidth > container.clientWidth && 
                         container.scrollLeft < container.scrollWidth - container.clientWidth - 2);
        }
      }, 400); // Wait for smooth scroll to complete
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Calculate scroll position based on container width for more intuitive scrolling
      const scrollAmount = Math.min(scrollContainerRef.current.clientWidth * 0.7, 300);
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      
      // Force check overflow after scrolling
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          setHasMoreLeft(container.scrollLeft > 2);
          setHasMoreRight(container.scrollWidth > container.clientWidth && 
                         container.scrollLeft < container.scrollWidth - container.clientWidth - 2);
        }
      }, 400); // Wait for smooth scroll to complete
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'slides') {
        if (e.key === 'ArrowRight') {
          handleNextSlide();
        } else if (e.key === 'ArrowLeft') {
          handlePrevSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, slideCollection]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
        <h3 className="font-medium text-lg mb-2">Đang tạo Visual Slides</h3>
        <p className="text-muted-foreground text-sm">
          Đang tạo hình ảnh minh họa từ tài liệu của bạn...
        </p>
      </div>
    );
  }

  if (!slideCollection) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <Image className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">Chưa có Visual Slides</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Tạo visual slides để xem các khái niệm chính từ tài liệu này được minh họa.
        </p>
        <div className="flex flex-col space-y-3 w-full max-w-xs">
          <Button onClick={onGenerate} className="bg-primary hover:bg-primary/90 transition-colors">
            Tạo Visual Slides
          </Button>
        </div>
      </div>
    );
  }

  const activeSlide = slideCollection.slides[activeSlideIndex];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Visual Slides</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onGenerate} className="hover:bg-primary/10 transition-colors">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Tạo lại
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'cards' | 'slides')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cards">Xem dạng thẻ</TabsTrigger>
          <TabsTrigger value="slides">Xem dạng slide</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4 relative">
          <div className="relative w-full">
            {/* Left scroll indicator - Improved UI */}
            {hasMoreLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-md hover:bg-background hover:shadow-lg transition-all"
                aria-label="Scroll left"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            
            {/* Right scroll indicator - Improved UI */}
            {hasMoreRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-md hover:bg-background hover:shadow-lg transition-all"
                aria-label="Scroll right"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
            
            <ScrollArea className="w-full pb-4">
              <div 
                ref={scrollContainerRef}
                className="flex gap-4 p-1 pb-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {slideCollection.slides.map((slide, index) => (
                  <Card
                    key={slide.id}
                    className={cn(
                      "min-w-[220px] max-w-[220px] flex-shrink-0 cursor-pointer transition-all snap-center hover:translate-y-[-2px]",
                      index === activeSlideIndex ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"
                    )}
                    onClick={() => setActiveSlideIndex(index)}
                  >
                    <CardContent className="p-3 flex flex-col items-center">
                      {slide.image && (
                        <div className="flex justify-center mb-3 w-full h-36 overflow-hidden rounded-sm">
                          <img
                            src={slide.mimeType && slide.image 
                              ? (slide.image.startsWith('data:') 
                                  ? slide.image 
                                  : `data:${slide.mimeType};base64,${slide.image}`)
                              : slide.image}
                            alt={`Slide ${index + 1}`}
                            className="object-contain max-h-full max-w-full transition-opacity hover:opacity-95"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <p className={cn(
                        "text-sm text-center line-clamp-2",
                        index % 3 === 0 ? "text-blue-600" : 
                        index % 3 === 1 ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {slide.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="slides" className="mt-4">
          <div className="relative px-8" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                {activeSlide.image && (
                  <div className="flex justify-center mb-4 w-full">
                    <div className="w-full max-w-[280px] md:max-w-[320px] h-[200px] md:h-[240px] flex items-center justify-center">
                      <img
                        src={activeSlide.mimeType && activeSlide.image 
                          ? (activeSlide.image.startsWith('data:') 
                              ? activeSlide.image 
                              : `data:${activeSlide.mimeType};base64,${activeSlide.image}`)
                          : activeSlide.image}
                        alt={`Slide ${activeSlideIndex + 1}`}
                        className="object-contain max-h-full max-w-full transition-transform duration-200 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
                <p className={cn(
                  "text-center text-base md:text-lg max-w-[500px]",
                  activeSlideIndex % 3 === 0 ? "text-blue-600" : 
                  activeSlideIndex % 3 === 1 ? "text-emerald-600" : "text-amber-600"
                )}>
                  {activeSlide.text}
                </p>
              </CardContent>
            </Card>

            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-background/90 shadow-sm hover:bg-background/95 hover:shadow-md transition-all"
                onClick={handlePrevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Slide trước</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-background/90 shadow-sm hover:bg-background/95 hover:shadow-md transition-all"
                onClick={handleNextSlide}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Slide sau</span>
              </Button>
            </div>

            <div className="mt-4 flex justify-center gap-1.5">
              {slideCollection.slides.map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-2.5 w-2.5 rounded-full p-0 transition-all",
                    index === activeSlideIndex 
                      ? "bg-primary scale-110" 
                      : "bg-muted hover:bg-muted-foreground/30"
                  )}
                  onClick={() => setActiveSlideIndex(index)}
                >
                  <span className="sr-only">Đi đến slide {index + 1}</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground space-y-1 mt-4 p-3 border border-dashed rounded-md bg-muted/30 hover:bg-muted/40 transition-colors">
        <p className="flex items-center">
          <Image className="h-3 w-3 mr-1.5" /> 
          Hình ảnh được tạo thông qua API Gemini.
        </p>
        <p>
          Mỗi slide có hình ảnh do AI tạo để trực quan hóa các khái niệm chính từ tài liệu của bạn.
        </p>
      </div>
    </div>
  );
}