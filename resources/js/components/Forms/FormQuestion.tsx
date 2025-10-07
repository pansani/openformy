import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

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

interface FormQuestionProps {
  question: Question;
  value: string | string[];
  error?: string;
  onChange: (value: string | string[]) => void;
}

export function FormQuestion({ question, value, error, onChange }: FormQuestionProps) {
  const stringValue = typeof value === 'string' ? value : '';
  const arrayValue = Array.isArray(value) ? value : [];

  const commonInputProps = {
    id: `question-${question.id}`,
    placeholder: question.placeholder || '',
    value: stringValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    className: error ? 'border-red-500' : '',
  };

  const commonTextareaProps = {
    id: `question-${question.id}`,
    placeholder: question.placeholder || '',
    value: stringValue,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    className: error ? 'border-red-500' : '',
  };

  const commonSelectProps = {
    id: `question-${question.id}`,
    value: stringValue,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
    className: `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${error ? 'border-red-500' : ''}`,
  };

  const renderField = () => {
    switch (question.type) {
      case 'text':
        return <Input {...commonInputProps} type="text" />;
      
      case 'email':
        return <Input {...commonInputProps} type="email" />;
      
      case 'number':
        return <Input {...commonInputProps} type="number" />;
      
      case 'phone':
        return <Input {...commonInputProps} type="tel" />;
      
      case 'url':
        return <Input {...commonInputProps} type="url" />;
      
      case 'date':
        return <Input {...commonInputProps} type="date" />;
      
      case 'textarea':
        return <Textarea {...commonTextareaProps} rows={4} />;
      
      case 'dropdown':
        return (
          <select {...commonSelectProps}>
            <option value="">Select an option</option>
            {question.options?.items?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.items?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`q${question.id}-opt${idx}`}
                  name={`question-${question.id}`}
                  value={option}
                  checked={stringValue === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`q${question.id}-opt${idx}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.items?.map((option, idx) => {
              const isChecked = arrayValue.includes(option);
              return (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`q${question.id}-opt${idx}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...arrayValue, option]
                        : arrayValue.filter((v) => v !== option);
                      onChange(newValues);
                    }}
                  />
                  <Label htmlFor={`q${question.id}-opt${idx}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor={`question-${question.id}`} className="text-base font-semibold">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {question.description}
            </p>
          )}
        </div>

        <div>{renderField()}</div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Card>
  );
}
