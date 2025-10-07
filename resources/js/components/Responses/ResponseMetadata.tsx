import { Card } from '@/components/ui/card';
import { Calendar, Globe, Monitor } from 'lucide-react';
import { Response } from '@/types/response';

interface ResponseMetadataProps {
  response: Response;
}

export function ResponseMetadata({ response }: ResponseMetadataProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
            <p className="text-base font-semibold mt-1">{formatDate(response.submitted_at)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">IP Address</p>
            <p className="text-base font-semibold mt-1">{response.ip_address || 'Unknown'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 md:col-span-2">
        <div className="flex items-start gap-3">
          <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">User Agent</p>
            <p className="text-base font-semibold mt-1 break-all">{response.user_agent || 'Unknown'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                response.completed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              }`}
            >
              {response.completed ? 'Completed' : 'Partial'}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Answers</p>
          <p className="text-2xl font-bold mt-1">{response.edges.answers?.length || 0}</p>
        </div>
      </Card>
    </div>
  );
}
