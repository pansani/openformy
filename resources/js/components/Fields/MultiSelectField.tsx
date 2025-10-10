import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MultiSelectFieldProps {
  options?: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  questionId?: number;
}

export function MultiSelectField({ options = ['Option 1', 'Option 2', 'Option 3'], value = [], onChange, disabled = true, questionId = 0 }: MultiSelectFieldProps) {
  const safeOptions = Array.isArray(options) ? options : ['Option 1', 'Option 2', 'Option 3'];
  
  return (
    <div className="space-y-2">
      {safeOptions.map((option, idx) => {
        const isChecked = value.includes(option);
        return (
          <div key={idx} className="flex items-center space-x-2">
            <Checkbox
              id={`q${questionId}-opt${idx}`}
              checked={isChecked}
              disabled={disabled}
              onCheckedChange={(checked) => {
                if (!disabled) {
                  const newValues = checked
                    ? [...value, option]
                    : value.filter((v) => v !== option);
                  onChange?.(newValues);
                }
              }}
            />
            <Label htmlFor={`q${questionId}-opt${idx}`} className="font-normal">
              {option}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
