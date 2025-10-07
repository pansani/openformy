import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NoSearchResultsProps {
  onClearSearch: () => void;
}

export function NoSearchResults({ onClearSearch }: NoSearchResultsProps) {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-2">No responses found</h3>
        <p className="text-muted-foreground mb-6">Try a different search</p>
        <Button onClick={onClearSearch} variant="outline">
          Clear search
        </Button>
      </div>
    </Card>
  );
}
