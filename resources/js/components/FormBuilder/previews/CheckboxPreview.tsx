import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function CheckboxPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox disabled id="option-1" />
        <Label htmlFor="option-1" className="text-sm text-muted-foreground">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox disabled id="option-2" />
        <Label htmlFor="option-2" className="text-sm text-muted-foreground">Option 2</Label>
      </div>
    </div>
  );
}
