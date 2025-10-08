import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function MultiSelectPreview() {
  return (
    <div className="space-y-3">
      {['Option 1', 'Option 2', 'Option 3'].map((option, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Checkbox disabled id={`multi-${idx}`} />
          <Label htmlFor={`multi-${idx}`} className="text-sm text-muted-foreground">{option}</Label>
        </div>
      ))}
    </div>
  );
}
