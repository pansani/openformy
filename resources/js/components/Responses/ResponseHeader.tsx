import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ResponseHeaderProps {
  responseId: number;
  formId: number;
  formTitle: string;
}

export function ResponseHeader({ responseId, formId, formTitle }: ResponseHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link href={`/forms/${formId}/responses`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Responses
        </Button>
      </Link>
      <div className="h-6 w-px bg-border" />
      <div>
        <h1 className="text-3xl font-bold">Response #{responseId}</h1>
        <p className="text-muted-foreground">{formTitle}</p>
      </div>
    </div>
  );
}
