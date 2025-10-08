import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DateRangePreview() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-xs text-muted-foreground mb-1">Start Date</Label>
        <Input type="date" disabled />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1">End Date</Label>
        <Input type="date" disabled />
      </div>
    </div>
  );
}
