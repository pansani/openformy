import { Textarea } from '@/components/ui/textarea';

interface TextareaFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function TextareaField({ 
  placeholder, 
  value = '', 
  onChange, 
  disabled = true,
  error 
}: TextareaFieldProps) {
  return (
    <Textarea
      placeholder={placeholder || 'Enter your answer...'}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      rows={4}
      className={error ? 'border-red-500' : ''}
    />
  );
}
