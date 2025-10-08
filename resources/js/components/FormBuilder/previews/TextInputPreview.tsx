import { Input } from '@/components/ui/input';

interface TextInputPreviewProps {
  type: 'short-text' | 'email' | 'number' | 'phone' | 'url';
  placeholder?: string;
}

export function TextInputPreview({ type, placeholder }: TextInputPreviewProps) {
  return (
    <Input
      type={type === 'short-text' ? 'text' : type}
      placeholder={placeholder || `Enter ${type}...`}
      disabled
    />
  );
}
