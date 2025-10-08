import { Input } from '@/components/ui/input';

interface DateInputFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function DateInputField({ value = '', onChange, disabled = true, error }: DateInputFieldProps) {
  return (
    <Input 
      type="date" 
      value={value} 
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
  );
}
