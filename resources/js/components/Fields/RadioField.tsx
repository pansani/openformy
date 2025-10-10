import { Label } from '@/components/ui/label';

interface RadioFieldProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  questionId?: number;
}

export function RadioField({ options = ['Option 1', 'Option 2'], value = '', onChange, disabled = true, questionId = 0 }: RadioFieldProps) {
  const safeOptions = Array.isArray(options) ? options : ['Option 1', 'Option 2'];
  
  return (
    <div className="space-y-2">
      {safeOptions.map((option, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`q${questionId}-opt${idx}`}
            name={`question-${questionId}`}
            value={option}
            checked={value === option}
            onChange={(e) => !disabled && onChange?.(e.target.value)}
            disabled={disabled}
            className="h-4 w-4"
          />
          <Label htmlFor={`q${questionId}-opt${idx}`} className="font-normal">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}
