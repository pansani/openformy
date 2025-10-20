import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubInput } from '@/types/form';

interface MultiInputFieldProps {
  subInputs?: SubInput[];
  values?: Record<string, string>;
  onChange?: (values: Record<string, string>) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

export function MultiInputField({ 
  subInputs = [], 
  values = {}, 
  onChange, 
  disabled = true,
  errors = {}
}: MultiInputFieldProps) {
  const handleInputChange = (subInputId: string, value: string) => {
    if (onChange) {
      onChange({ ...values, [subInputId]: value });
    }
  };

  const getInputType = (type: SubInput['type']) => {
    if (type === 'text') return 'text';
    if (type === 'date') return 'date';
    if (type === 'time') return 'time';
    return type;
  };

  const getInputPattern = (type: SubInput['type']) => {
    if (type === 'email') return '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
    if (type === 'url') return 'https?://.+';
    return undefined;
  };

  if (subInputs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No sub-inputs configured
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subInputs.map((subInput) => (
        <div key={subInput.id} className="space-y-2">
          <Label htmlFor={subInput.id}>
            {subInput.label}
            {subInput.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={subInput.id}
            type={getInputType(subInput.type)}
            placeholder={subInput.placeholder || `Enter ${subInput.label.toLowerCase()}...`}
            value={values[subInput.id] || ''}
            onChange={(e) => handleInputChange(subInput.id, e.target.value)}
            disabled={disabled}
            pattern={getInputPattern(subInput.type)}
            required={subInput.required}
            className={errors[subInput.id] ? 'border-red-500' : ''}
          />
          {errors[subInput.id] && (
            <p className="text-xs text-red-500">{errors[subInput.id]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
