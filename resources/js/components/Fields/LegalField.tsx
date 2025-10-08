import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LegalFieldProps {
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  questionId?: number;
}

export function LegalField({ description = 'I agree to the terms and conditions', value = '', onChange, disabled = true, questionId = 0 }: LegalFieldProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id={`question-${questionId}`}
        checked={value === 'true'}
        disabled={disabled}
        onCheckedChange={(checked) => !disabled && onChange?.(checked ? 'true' : 'false')}
      />
      <Label htmlFor={`question-${questionId}`} className="font-normal leading-tight">
        {description}
      </Label>
    </div>
  );
}
