import { Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Response } from '@/types/response';

interface ResponsesTableProps {
  responses: Response[];
  formId: number;
}

export function ResponsesTable({ responses, formId }: ResponsesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAnswerPreview = (response: Response) => {
    const answers = response.edges.answers || [];
    if (answers.length === 0) return 'No answers';
    
    const firstAnswer = answers[0];
    const preview = firstAnswer.value.substring(0, 50);
    return answers.length > 1 
      ? `${preview}... (+${answers.length - 1} more)` 
      : preview;
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell className="font-medium">
                {formatDate(response.submitted_at)}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    response.completed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}
                >
                  {response.completed ? 'Completed' : 'Partial'}
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {getAnswerPreview(response)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {response.ip_address || 'Unknown'}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/forms/${formId}/responses/${response.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
