import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Plus, GripVertical } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
}

interface FieldSettingsProps {
  question: Question | null;
  onUpdate: (question: Question) => void;
  onClose: () => void;
}

export function FieldSettings({ question, onUpdate, onClose }: FieldSettingsProps) {
  if (!question) {
    return (
      <div className="h-full flex flex-col bg-background border-l">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-2">Field Settings</h2>
          <p className="text-sm text-muted-foreground">
            Click on a field in the preview to edit its settings
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <X className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No field selected
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSelectionField = ['dropdown', 'radio', 'checkbox'].includes(question.type);

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Field Settings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your field
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-sm font-semibold">
            Question Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            value={question.title}
            onChange={(e) => onUpdate({ ...question, title: e.target.value })}
            placeholder="e.g. What is your name?"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-semibold">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="description"
            value={question.description || ''}
            onChange={(e) => onUpdate({ ...question, description: e.target.value })}
            placeholder="Add a description to help respondents..."
            rows={3}
          />
        </div>

        {!isSelectionField && (
          <div className="space-y-3">
            <Label htmlFor="placeholder" className="text-sm font-semibold">
              Placeholder Text <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="placeholder"
              type="text"
              value={question.placeholder || ''}
              onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
              placeholder="e.g. Type your answer here..."
            />
          </div>
        )}

        {isSelectionField && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Options <span className="text-red-500">*</span>
            </Label>
            <OptionsEditor
              options={question.options || ['Option 1', 'Option 2']}
              onChange={(options) => onUpdate({ ...question, options })}
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="required" className="text-sm font-semibold">
                Required Field
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Respondents must answer this question
              </p>
            </div>
            <Switch
              id="required"
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium mb-1">Field Type</p>
            <p className="text-sm capitalize">{question.type.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionsEditor({ options, onChange }: { options: string[]; onChange: (options: string[]) => void }) {
  const addOption = () => {
    onChange([...options, `Option ${options.length + 1}`]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      onChange(options.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <Card key={index} className="p-2 flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="flex-1 h-8"
            placeholder={`Option ${index + 1}`}
          />
          {options.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeOption(index)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </Card>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>
    </div>
  );
}
