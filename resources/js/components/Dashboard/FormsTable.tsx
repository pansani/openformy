import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, BarChart2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FormStats {
  id: number;
  title: string;
  response_count: number;
  completion_rate: number;
  last_response: string | null;
  published: boolean;
}

interface FormsTableProps {
  forms: FormStats[];
}

export function FormsTable({ forms }: FormsTableProps) {
  if (forms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Forms</CardTitle>
          <CardDescription>Quick overview of all forms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No forms yet</p>
            <Link href="/forms/create">
              <Button className="mt-4" size="sm">
                Create Your First Form
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Forms</CardTitle>
        <CardDescription>{forms.length} total forms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forms.slice(0, 5).map((form) => (
            <div
              key={form.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/forms/${form.id}/edit`}
                    className="text-sm font-medium hover:underline truncate"
                  >
                    {form.title}
                  </Link>
                  <Badge variant={form.published ? 'default' : 'secondary'} className="text-xs">
                    {form.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{form.response_count} responses</span>
                  <span>•</span>
                  <span>{form.completion_rate.toFixed(0)}% completion</span>
                  {form.last_response && (
                    <>
                      <span>•</span>
                      <span>
                        Last: {formatDistanceToNow(new Date(form.last_response), { addSuffix: true })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/forms/${form.id}/responses`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/forms/${form.id}/edit`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
          {forms.length > 5 && (
            <Link href="/forms">
              <Button variant="outline" className="w-full mt-2">
                View All Forms ({forms.length})
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
