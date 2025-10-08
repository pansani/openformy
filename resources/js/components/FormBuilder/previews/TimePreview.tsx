import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

export function TimePreview() {
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Input type="time" disabled />
    </div>
  );
}
