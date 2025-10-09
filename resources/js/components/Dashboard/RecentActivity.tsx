import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentResponse {
  form_title: string;
  submitted_at: string;
  completed: boolean;
  response_id: number;
  form_id: number;
}

interface RecentActivityProps {
  responses: RecentResponse[];
}

export function RecentActivity({ responses }: RecentActivityProps) {
  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest form responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No responses yet</p>
            <p className="text-xs mt-1">Responses will appear here once submitted</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest {responses.length} responses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {responses.map((response) => (
            <Link
              key={response.response_id}
              href={`/forms/${response.form_id}/responses/${response.response_id}`}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5">
                {response.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{response.form_title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(response.submitted_at), { addSuffix: true })}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {response.completed ? 'Completed' : 'Partial'}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
