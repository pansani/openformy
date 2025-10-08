import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Settings, Trash2 } from 'lucide-react';
import { QuestionPreview } from './QuestionPreview';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
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

export function QuestionCard({ 
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
