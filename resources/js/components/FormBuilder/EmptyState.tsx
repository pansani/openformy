import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export function EmptyState() {
  return (
    <Card className="p-16 text-center border-2 border-dashed">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">No fields added yet</h3>
          <p className="text-sm text-muted-foreground">
            Add fields from the left panel to start building your form
          </p>
        </div>
      </div>
    </Card>
  );
}
