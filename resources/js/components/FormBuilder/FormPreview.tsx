import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
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
      <div className="p-6 border-b bg-background/50 backdrop-blur">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {questions.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">No fields added yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Add fields from the left panel to start building your form
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                isSelected={selectedQuestionId === question.id}
                onSelect={() => onQuestionSelect(question.id)}
                onDelete={() => onQuestionDelete(question.id)}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function QuestionCard({ 
  question, 
  index, 
  isSelected, 
  onSelect, 
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd
}: QuestionCardProps) {
  return (
    <Card
      className={`group relative transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'hover:border-primary/40 hover:shadow-md'
      }`}
      onClick={onSelect}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">
                    {question.title || 'Untitled Question'}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>
                {question.description && (
                  <p className="text-sm text-muted-foreground">
                    {question.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <QuestionPreview question={question} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuestionPreview({ question }: { question: Question }) {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
      case 'url':
        return (
          <input
            type={question.type}
            placeholder={question.placeholder || `Enter ${question.type}...`}
            disabled
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder || 'Enter your answer...'}
            disabled
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            disabled
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
          />
        );
      case 'dropdown':
        return (
          <select
            disabled
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
          >
            <option>Select an option...</option>
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" disabled className="text-primary" />
              <span className="text-muted-foreground">Option 1</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" disabled className="text-primary" />
              <span className="text-muted-foreground">Option 2</span>
            </label>
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled className="text-primary" />
              <span className="text-muted-foreground">Option 1</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled className="text-primary" />
              <span className="text-muted-foreground">Option 2</span>
            </label>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">Preview not available</p>;
    }
  };

  return <div className="mt-3">{renderInput()}</div>;
}
