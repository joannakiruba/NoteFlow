import { useState, useEffect } from 'react';
import { Flashcard } from "@/utils/parser"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

interface FlashcardViewProps {
  cards: Flashcard[];
}

export const FlashcardView = ({ cards }: FlashcardViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset state when cards change (e.g. new generation)
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // Small delay for UX if flipping back? No, instant is fine usually
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.key === 'Enter') handleFlip();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]); // Dependencies needed for current closure state

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        No flashcards found. Create bullet points with "Term : Definition" format.
      </div>
    )
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-8">
      
      {/* Progress Indicator */}
      <div className="text-sm text-muted-foreground font-medium">
        Card {currentIndex + 1} of {cards.length}
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full max-w-2xl aspect-[3/2] perspective-1000 group cursor-pointer" 
        onClick={handleFlip}
      >
        <div className={cn(
          "relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-2xl border bg-card text-card-foreground",
          isFlipped ? "rotate-y-180" : ""
        )}>
          {/* Front (Question) */}
          <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 text-center select-none">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Question</span>
            <h3 className="text-2xl md:text-3xl font-bold">{currentCard.front}</h3>
            <span className="absolute bottom-4 text-xs text-muted-foreground opacity-50">Click to flip</span>
          </div>
          
          {/* Back (Answer) */}
          <div className="absolute w-full h-full backface-hidden bg-primary text-primary-foreground rotate-y-180 flex flex-col items-center justify-center p-8 text-center rounded-2xl overflow-auto select-none">
             <span className="text-xs font-bold text-primary-foreground/70 uppercase tracking-wider mb-4">Answer</span>
             <p className="text-xl md:text-2xl leading-relaxed">{currentCard.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentIndex === 0}
          className="h-12 w-12 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); handleFlip(); }}
          className="h-12 w-12 rounded-full"
          title="Flip Card (Space)"
        >
           <RotateCw className="h-5 w-5" />
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={currentIndex === cards.length - 1}
          className="h-12 w-12 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Use arrow keys to navigate, Space to flip
      </div>

    </div>
  )
}
