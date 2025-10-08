import { Input } from '@/components/ui/input';

interface TextInputFieldProps {
  type: 'short-text' | 'email' | 'number' | 'phone' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function TextInputField({ 
  type, 
  placeholder, 
  value = '', 
  onChange, 
  disabled = true,
  error 
}: TextInputFieldProps) {
  return (
    <Input
      type={type === 'short-text' ? 'text' : type}
      placeholder={placeholder || `Enter ${type}...`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
    />
  );
}
