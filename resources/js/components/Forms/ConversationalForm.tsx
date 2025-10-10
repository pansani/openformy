import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { FormQuestion } from './FormQuestion';
import { validateAnswer } from '@/utils/validation';

interface Question {
  id: number;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: {
    items?: string[];
  };
}

interface BrandColors {
  button?: string;
  background?: string;
  text?: string;
}

interface ConversationalFormProps {
  questions: Question[];
  answers: Record<number, string | string[]>;
  errors: Record<number, string>;
  onAnswerChange: (questionId: number, value: string | string[]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  brandColors?: BrandColors;
}

function hexToRgb(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '';
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `${r} ${g} ${b}`;
}

export function ConversationalForm({
  questions,
  answers,
  errors,
  onAnswerChange,
  onSubmit,
  isSubmitting,
  brandColors,
}: ConversationalFormProps) {
  console.log('ConversationalForm brand colors:', brandColors);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const canAdvance = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    const validation = validateAnswer(currentQuestion, answer);
    return validation.valid;
  };

  const handleNext = () => {
    if (isAnimating) {
      return;
    }

    const answer = answers[currentQuestion.id];
    const validation = validateAnswer(currentQuestion, answer);
    
    if (!validation.valid) {
      onAnswerChange(currentQuestion.id, answer || '');
      return;
    }
    
    if (isLastQuestion) {
      onSubmit();
    } else {
      setDirection('forward');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion && !isAnimating) {
      setDirection('backward');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canAdvance()) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentIndex, answers]);

  if (!currentQuestion) {
    return null;
  }

  const customStylesCSS = brandColors?.button ? `
    :root {
      --primary: ${hexToRgb(brandColors.button)};
      ${brandColors.background ? `--background: ${hexToRgb(brandColors.background)};` : ''}
      ${brandColors.text ? `--primary-foreground: ${hexToRgb(brandColors.text)};` : ''}
    }
    .brand-text {
      color: rgb(${hexToRgb(brandColors.button)});
      font-weight: 600;
    }
    .brand-bg {
      background-color: rgb(${hexToRgb(brandColors.button)});
    }
    .brand-card-bg {
      background-color: rgb(${hexToRgb(brandColors.button)} / 0.1);
      border: 2px solid rgb(${hexToRgb(brandColors.button)} / 0.2);
      color: rgb(${hexToRgb(brandColors.button)});
    }
    .brand-card-bg .text-slate-600,
    .brand-card-bg .text-slate-400,
    .brand-card-bg .dark\\:text-slate-400,
    .brand-card-bg .text-muted-foreground {
      color: rgb(${hexToRgb(brandColors.button)}) !important;
      opacity: 0.7;
    }
    .brand-button {
      background-color: rgb(${hexToRgb(brandColors.button)}) !important;
      color: rgb(${brandColors.text ? hexToRgb(brandColors.text) : '255 255 255'}) !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 6px -1px rgb(${hexToRgb(brandColors.button)} / 0.3);
    }
    .brand-button:hover:not(:disabled) {
      background-color: rgb(${hexToRgb(brandColors.button)} / 0.9) !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -2px rgb(${hexToRgb(brandColors.button)} / 0.4);
    }
    .brand-back-button {
      border: 2px solid rgb(${hexToRgb(brandColors.button)} / 0.3) !important;
      color: rgb(${hexToRgb(brandColors.button)}) !important;
      background-color: transparent !important;
      font-weight: 500 !important;
    }
    .brand-back-button:hover:not(:disabled) {
      border-color: rgb(${hexToRgb(brandColors.button)}) !important;
      background-color: rgb(${hexToRgb(brandColors.button)} / 0.05) !important;
    }
  ` : '';

  return (
    <>
      {customStylesCSS && <style>{customStylesCSS}</style>}
      <div className="min-h-screen flex flex-col bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Counter */}
      <div className="fixed top-6 right-6 text-sm text-slate-600 dark:text-slate-400 z-40">
        {currentIndex + 1} / {questions.length}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 pt-16">
        <div 
          key={currentIndex}
          className={`w-full max-w-2xl ${
            direction === 'forward' 
              ? 'animate-in fade-in slide-in-from-right-8 duration-300' 
              : 'animate-in fade-in slide-in-from-left-8 duration-300'
          }`}
        >
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold brand-text mb-3">
              {currentQuestion.title}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h2>
            {currentQuestion.description && (
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {currentQuestion.description}
              </p>
            )}
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            <FormQuestion
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => onAnswerChange(currentQuestion.id, value)}
              error={errors[currentQuestion.id]}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {!isFirstQuestion && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isAnimating}
                className="gap-2 transition-all hover:scale-105 brand-back-button"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || isSubmitting || isAnimating}
              className="gap-2 ml-auto transition-all hover:scale-105 brand-button"
            >
              {isLastQuestion ? (
                isSubmitting ? 'Submitting...' : 'Submit'
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard Hint */}
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
            Press <kbd className="px-2 py-1 brand-bg text-white rounded text-xs">Enter ↵</kbd> to continue
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
