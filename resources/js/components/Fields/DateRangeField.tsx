import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateRangeFieldProps {
  value?: { start?: string; end?: string };
  onChange?: (value: { start?: string; end?: string }) => void;
  disabled?: boolean;
  error?: string;
}

export function DateRangeField({ value = {}, onChange, disabled = true, error }: DateRangeFieldProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-xs text-muted-foreground mb-1">Start Date</Label>
        <Input 
          type="date" 
          value={value.start || ''}
          onChange={(e) => onChange?.({ ...value, start: e.target.value })}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1">End Date</Label>
        <Input 
          type="date" 
          value={value.end || ''}
          onChange={(e) => onChange?.({ ...value, end: e.target.value })}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
        />
      </div>
    </div>
  );
}
