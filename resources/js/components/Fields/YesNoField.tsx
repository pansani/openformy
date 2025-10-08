import { Button } from '@/components/ui/button';

interface YesNoFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function YesNoField({ 
  value = '', 
  onChange, 
  disabled = true 
}: YesNoFieldProps) {
  return (
    <div className="flex gap-3">
      <Button 
        type="button"
        variant={value === 'yes' ? 'default' : 'outline'} 
        onClick={() => !disabled && onChange?.('yes')}
        disabled={disabled}
      >
        Yes
      </Button>
      <Button 
        type="button"
        variant={value === 'no' ? 'default' : 'outline'} 
        onClick={() => !disabled && onChange?.('no')}
        disabled={disabled}
      >
        No
      </Button>
    </div>
  );
}
