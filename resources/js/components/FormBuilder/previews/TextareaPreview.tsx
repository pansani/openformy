import { Textarea } from '@/components/ui/textarea';

interface TextareaPreviewProps {
  placeholder?: string;
}

export function TextareaPreview({ placeholder }: TextareaPreviewProps) {
  return (
    <Textarea
      placeholder={placeholder || 'Enter your answer...'}
      disabled
      rows={4}
    />
  );
}
