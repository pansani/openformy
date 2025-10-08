import { Input } from '@/components/ui/input';

interface FileUploadFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  questionId?: number;
}

export function FileUploadField({ value = '', onChange, disabled = true, error, questionId = 0 }: FileUploadFieldProps) {
  if (disabled) {
    return (
      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Click or drag file to upload</p>
      </div>
    );
  }

  return (
    <Input
      id={`question-${questionId}`}
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          onChange?.(file.name);
        }
      }}
      className={error ? 'border-red-500' : ''}
    />
  );
}
