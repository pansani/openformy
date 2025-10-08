import { Input } from '@/components/ui/input';

interface SignatureFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function SignatureField({ value = '', onChange, disabled = true, error }: SignatureFieldProps) {
  return (
    <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
      <p className="text-sm text-muted-foreground mb-2">Sign here</p>
      <Input 
        placeholder="Type your name to sign" 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
    </div>
  );
}
