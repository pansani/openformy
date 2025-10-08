import { GripVertical } from 'lucide-react';

export function RankingField() {
  return (
    <div className="space-y-2">
      {['Option 1', 'Option 2', 'Option 3'].map((option, idx) => (
        <div key={idx} className="flex items-center gap-2 p-3 border border-input rounded-lg bg-background">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{option}</span>
        </div>
      ))}
    </div>
  );
}
