import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export function RatingPreview() {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((num) => (
        <Button
          key={num}
          variant="ghost"
          size="sm"
          disabled
          className="p-0 h-8 w-8"
        >
          <Star className="h-5 w-5 text-muted-foreground" />
        </Button>
      ))}
    </div>
  );
}
