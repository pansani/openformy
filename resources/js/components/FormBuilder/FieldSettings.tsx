import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, GripVertical } from 'lucide-react';
import React from 'react';

interface SubInput {
  id: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'url' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
}

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[] | {
    items?: string[];
    subInputs?: SubInput[];
  };
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

  const isSelectionField = ['dropdown', 'radio', 'checkbox', 'multi-select', 'picture-choice'].includes(question.type);
  const isContentField = ['statement', 'legal', 'hidden'].includes(question.type);
  const isMultiInputField = question.type === 'multi-input';
  const hasPlaceholder = !isSelectionField && !isContentField && !isMultiInputField;

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

        {hasPlaceholder && (
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
              options={question.options?.items || ['Option 1', 'Option 2']}
              onChange={(items) => onUpdate({ ...question, options: { items } })}
            />
          </div>
        )}

        {isMultiInputField && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Sub-Inputs <span className="text-red-500">*</span>
            </Label>
            <SubInputsEditor
              subInputs={typeof question.options === 'object' && question.options?.subInputs ? question.options.subInputs : []}
              onChange={(subInputs) => onUpdate({ ...question, options: { subInputs } })}
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
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOptions = [...options];
    const draggedOption = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(index, 0, draggedOption);

    setDraggedIndex(index);
    onChange(newOptions);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
          <Input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="flex-1"
            placeholder={`Option ${index + 1}`}
          />
          {options.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeOption(index)}
              className="h-10 w-10 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
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

function SubInputsEditor({ subInputs, onChange }: { subInputs: SubInput[]; onChange: (subInputs: SubInput[]) => void }) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const addSubInput = () => {
    onChange([...subInputs, {
      id: `sub_${Date.now()}`,
      type: 'text',
      label: `Input ${subInputs.length + 1}`,
      placeholder: '',
      required: false,
    }]);
  };

  const updateSubInput = (index: number, updates: Partial<SubInput>) => {
    const newSubInputs = [...subInputs];
    newSubInputs[index] = { ...newSubInputs[index], ...updates };
    onChange(newSubInputs);
  };

  const removeSubInput = (index: number) => {
    if (subInputs.length > 1) {
      onChange(subInputs.filter((_, i) => i !== index));
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSubInputs = [...subInputs];
    const draggedSubInput = newSubInputs[draggedIndex];
    newSubInputs.splice(draggedIndex, 1);
    newSubInputs.splice(index, 0, draggedSubInput);

    setDraggedIndex(index);
    onChange(newSubInputs);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (subInputs.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={addSubInput}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Sub-Input
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {subInputs.map((subInput, index) => (
        <div 
          key={subInput.id} 
          className="p-3 border rounded-lg space-y-3"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-center gap-2">
            <div className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              value={subInput.label}
              onChange={(e) => updateSubInput(index, { label: e.target.value })}
              placeholder="Label"
              className="flex-1"
            />
            {subInputs.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSubInput(index)}
                className="h-9 w-9 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select
                value={subInput.type}
                onValueChange={(value) => updateSubInput(index, { type: value as SubInput['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs">Required</Label>
              <div className="flex items-center h-10">
                <Switch
                  checked={subInput.required}
                  onCheckedChange={(checked) => updateSubInput(index, { required: checked })}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs">Placeholder</Label>
            <Input
              type="text"
              value={subInput.placeholder || ''}
              onChange={(e) => updateSubInput(index, { placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
            />
          </div>
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={addSubInput}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Sub-Input
      </Button>
    </div>
  );
}
