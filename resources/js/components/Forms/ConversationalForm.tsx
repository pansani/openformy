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

interface ConversationalFormProps {
  questions: Question[];
  answers: Record<number, string | string[]>;
  errors: Record<number, string>;
  onAnswerChange: (questionId: number, value: string | string[]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ConversationalForm({
  questions,
  answers,
  errors,
  onAnswerChange,
  onSubmit,
  isSubmitting,
}: ConversationalFormProps) {
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
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
                className="gap-2 transition-all hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || isSubmitting || isAnimating}
              className="gap-2 ml-auto transition-all hover:scale-105"
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
            Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs">Enter ↵</kbd> to continue
          </p>
        </div>
      </div>
    </div>
  );
}
