import { useState, useEffect, useRef } from 'react';
import { FormHeader } from './FormHeader';
import { EmptyState } from './EmptyState';
import { QuestionCard } from './QuestionCard';

interface Question {
  id: string;
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

interface FormPreviewProps {
  form: {
    title: string;
    description?: string;
  };
  questions: Question[];
  selectedQuestionId: string | null;
  onQuestionSelect: (id: string | null) => void;
  onQuestionDelete: (id: string) => void;
  onReorder: (questions: Question[]) => void;
}

export function FormPreview({ 
  form, 
  questions, 
  selectedQuestionId, 
  onQuestionSelect,
  onQuestionDelete,
  onReorder 
}: FormPreviewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedQuestionId && questionRefs.current[selectedQuestionId]) {
      questionRefs.current[selectedQuestionId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedQuestionId]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedQuestion);

    setDraggedIndex(index);
    onReorder(newQuestions);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-muted/30 to-muted/10">
      <FormHeader title={form.title} description={form.description} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {questions.length === 0 ? (
            <EmptyState />
          ) : (
            questions.map((question, index) => (
              <div key={question.id} ref={(el) => { questionRefs.current[question.id] = el; }}>
                <QuestionCard
                  question={question}
                  index={index}
                  isSelected={selectedQuestionId === question.id}
                  onSelect={() => onQuestionSelect(question.id)}
                  onDelete={() => onQuestionDelete(question.id)}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

