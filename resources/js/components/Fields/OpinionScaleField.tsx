import { Button } from '@/components/ui/button';

interface OpinionScaleFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function OpinionScaleField({ 
  value = '', 
  onChange, 
  disabled = true 
}: OpinionScaleFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 - Not likely</span>
        <span>10 - Very likely</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <Button
            key={num}
            type="button"
            variant={value === num.toString() ? 'default' : 'outline'}
            onClick={() => onChange?.(num.toString())}
            disabled={disabled}
            className="flex-1 h-12"
          >
            {num}
          </Button>
        ))}
      </div>
    </div>
  );
}
