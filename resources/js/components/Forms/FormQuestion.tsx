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
      case 'short-text':
        return <Input {...commonInputProps} type="text" />;
      
      case 'long-text':
        return <Textarea {...commonTextareaProps} rows={4} />;
      
      case 'email':
        return <Input {...commonInputProps} type="email" />;
      
      case 'number':
        return <Input {...commonInputProps} type="number" />;
      
      case 'phone':
      case 'phone-number':
        return <Input {...commonInputProps} type="tel" />;
      
      case 'url':
      case 'link':
        return <Input {...commonInputProps} type="url" />;
      
      case 'date':
        return <Input {...commonInputProps} type="date" />;
      
      case 'time':
        return <Input {...commonInputProps} type="time" />;
      
      case 'textarea':
        return <Textarea {...commonTextareaProps} rows={4} />;
      
      case 'dropdown':
      case 'select-dropdown':
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
      
      case 'multi-select':
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
      
      case 'file':
      case 'file-upload':
        return (
          <Input 
            id={`question-${question.id}`}
            type="file" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file.name);
              }
            }}
            className={error ? 'border-red-500' : ''}
          />
        );
      
      case 'yesno':
        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange('yes')}
              className={`px-6 py-3 rounded-lg border-2 transition-all ${
                stringValue === 'yes'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input hover:border-primary/50'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onChange('no')}
              className={`px-6 py-3 rounded-lg border-2 transition-all ${
                stringValue === 'no'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input hover:border-primary/50'
              }`}
            >
              No
            </button>
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star.toString())}
                className={`text-4xl transition-all hover:scale-110 ${
                  parseInt(stringValue) >= star
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        );
      
      case 'opinion-scale':
        return (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num.toString())}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  stringValue === num.toString()
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:border-primary/50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        );
      
      case 'date-range':
        return (
          <div className="space-y-2">
            <Input {...commonInputProps} type="date" placeholder="Start date" />
            <Input {...commonInputProps} type="date" placeholder="End date" />
          </div>
        );
      
      case 'signature':
        return (
          <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Signature field (simplified for demo)</p>
            <Input {...commonInputProps} placeholder="Type your name to sign" className="mt-2" />
          </div>
        );
      
      case 'legal':
        return (
          <div className="flex items-start space-x-2">
            <Checkbox
              id={`question-${question.id}`}
              checked={stringValue === 'true'}
              onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
            />
            <Label htmlFor={`question-${question.id}`} className="font-normal leading-tight">
              {question.description || 'I agree to the terms and conditions'}
            </Label>
          </div>
        );
      
      case 'hidden':
        return <input type="hidden" value={stringValue} />;
      
      case 'statement':
        return null;
      
      default:
        return null;
    }
  };

  if (question.type === 'statement') {
    return (
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500">
        <div>
          <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
          {question.description && (
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
          )}
        </div>
      </Card>
    );
  }

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
