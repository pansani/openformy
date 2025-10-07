import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

interface ResponsesHeaderProps {
  formTitle: string;
  formId: number;
}

export function ResponsesHeader({ formTitle, formId }: ResponsesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Link href="/forms">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </Link>
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="text-3xl font-bold">{formTitle}</h1>
          <p className="text-muted-foreground">Form Responses</p>
        </div>
      </div>

      <div className="flex gap-2">
        <a href={`/forms/${formId}/responses/export`} download>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </a>
      </div>
    </div>
  );
}
