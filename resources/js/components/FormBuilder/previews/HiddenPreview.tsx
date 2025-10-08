import { EyeOff } from 'lucide-react';

export function HiddenPreview() {
  return (
    <div className="flex items-center gap-2 p-3 border border-dashed border-input rounded-lg bg-muted/10">
      <EyeOff className="h-4 w-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground italic">
        Hidden field - not visible to users
      </p>
    </div>
  );
}
