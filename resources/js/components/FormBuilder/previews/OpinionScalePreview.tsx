import { Button } from '@/components/ui/button';

export function OpinionScalePreview() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 - Not likely</span>
        <span>10 - Very likely</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <Button
            key={num}
            variant="outline"
            disabled
            className="flex-1 h-12"
          >
            {num}
          </Button>
        ))}
      </div>
    </div>
  );
}
