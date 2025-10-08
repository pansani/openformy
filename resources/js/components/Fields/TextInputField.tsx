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
  const getInputProps = () => {
    const baseProps = {
      type: type === 'short-text' ? 'text' : type,
      placeholder: placeholder || `Enter ${type}...`,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value),
      disabled,
      className: error ? 'border-red-500' : '',
    };

    if (type === 'email') {
      return {
        ...baseProps,
        pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
        title: 'Please enter a valid email address',
      };
    }

    if (type === 'url') {
      return {
        ...baseProps,
        pattern: 'https?://.+',
        title: 'Please enter a valid URL starting with http:// or https://',
      };
    }

    return baseProps;
  };

  return <Input {...getInputProps()} />;
}
