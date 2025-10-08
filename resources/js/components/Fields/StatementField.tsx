import { Card } from '@/components/ui/card';

interface StatementFieldProps {
  title?: string;
  description?: string;
}

export function StatementField({ title, description }: StatementFieldProps) {
  return (
    <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500">
      <div>
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {!title && !description && (
          <p className="text-sm text-muted-foreground italic">
            This is informational text. No answer required.
          </p>
        )}
      </div>
    </Card>
  );
}
