import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

interface FlashcardViewProps {
  flashcards: Flashcard[];
}

export function FlashcardView({ flashcards }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // Handle empty flashcards array
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No flashcards available yet. Generate materials to create flashcards.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const goToNextCard = () => {
    setDirection('right');
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      setDirection(null);
    }, 300);
  };

  const goToPreviousCard = () => {
    setDirection('left');
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
      setDirection(null);
    }, 300);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        <Button variant="ghost" size="sm" onClick={flipCard}>
          <RotateCw className="mr-2 h-4 w-4" />
          Flip Card
        </Button>
      </div>

      <div className="w-full mb-6 relative h-64 sm:h-80">
        <div
          className={cn(
            "absolute w-full h-full transition-all duration-300 transform",
            isFlipped ? "opacity-0 scale-95" : "opacity-100 scale-100",
            direction === 'right' ? 'translate-x-10 opacity-0' : direction === 'left' ? '-translate-x-10 opacity-0' : ''
          )}
        >
          <Card className="w-full h-full flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors overflow-auto" onClick={flipCard}>
            <CardContent className="p-6 text-center font-medium text-lg">
              {currentCard.front}
            </CardContent>
          </Card>
        </div>
        <div
          className={cn(
            "absolute w-full h-full transition-all duration-300 transform",
            !isFlipped ? "opacity-0 scale-95" : "opacity-100 scale-100",
            direction === 'right' ? 'translate-x-10 opacity-0' : direction === 'left' ? '-translate-x-10 opacity-0' : ''
          )}
        >
          <Card className="w-full h-full flex items-center justify-center bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors overflow-auto" onClick={flipCard}>
            <CardContent className="p-6 text-center text-lg">
              {currentCard.back}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full flex justify-between">
        <Button onClick={goToPreviousCard} variant="outline" disabled={flashcards.length <= 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button onClick={goToNextCard} variant="outline" disabled={flashcards.length <= 1}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 