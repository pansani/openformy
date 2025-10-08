import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

interface TimeFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function TimeField({ value = '', onChange, disabled = true, error }: TimeFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Input 
        type="time" 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
    </div>
  );
}
