import { Button } from '@/components/ui/button';

export function YesNoPreview() {
  return (
    <div className="flex gap-3">
      <Button variant="outline" disabled>
        Yes
      </Button>
      <Button variant="outline" disabled>
        No
      </Button>
    </div>
  );
}
