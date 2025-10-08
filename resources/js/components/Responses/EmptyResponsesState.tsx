import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Eye } from 'lucide-react';

interface EmptyResponsesStateProps {
  formSlug: string;
  userIdentifier: string;
}

export function EmptyResponsesState({ formSlug, userIdentifier }: EmptyResponsesStateProps) {
  return (
    <Card className="p-16 text-center border-2 border-dashed">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <FileSpreadsheet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-3">No responses yet</h3>
        <p className="text-muted-foreground text-lg mb-8">
          Share your form to start collecting responses
        </p>
        <div className="flex gap-3 justify-center">
          <a href={`/${userIdentifier}/${formSlug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Form
            </Button>
          </a>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${userIdentifier}/${formSlug}`);
            }}
          >
            Copy Link
          </Button>
        </div>
      </div>
    </Card>
  );
}
