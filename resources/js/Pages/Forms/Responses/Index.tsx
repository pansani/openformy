import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Download, Eye, BarChart3, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface Answer {
  id: number;
  value: string;
  created_at: string;
  edges: {
    question?: {
      id: number;
      title: string;
      type: string;
    };
  };
}

interface Response {
  id: number;
  submitted_at: string;
  completed: boolean;
  ip_address: string;
  user_agent: string;
  edges: {
    answers?: Answer[];
  };
}

interface Form {
  id: number;
  title: string;
  slug: string;
}

interface Props {
  form: Form;
  responses: Response[];
  totalResponses: number;
  completionRate: number;
}

export default function Index({ form, responses, totalResponses, completionRate }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResponses = responses.filter((response) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      response.ip_address?.toLowerCase().includes(searchLower) ||
      response.user_agent?.toLowerCase().includes(searchLower) ||
      new Date(response.submitted_at).toLocaleDateString().includes(searchLower)
    );
  });

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
    <AppLayout>
      <Head title={`Responses - ${form.title}`} />

      <div className="container mx-auto py-8 px-4">
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
              <h1 className="text-3xl font-bold">{form.title}</h1>
              <p className="text-muted-foreground">Form Responses</p>
            </div>
          </div>

          <div className="flex gap-2">
            <a href={`/forms/${form.id}/responses/export`} download>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{totalResponses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Per Day</p>
                <p className="text-2xl font-bold">
                  {responses.length > 0
                    ? Math.round(
                        responses.length /
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date().getTime() - new Date(responses[responses.length - 1].submitted_at).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          )
                      )
                    : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {totalResponses > 0 && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by IP, user agent, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 px-4 py-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
        )}

        {filteredResponses.length > 0 ? (
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
                {filteredResponses.map((response) => (
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
                      <Link href={`/forms/${form.id}/responses/${response.id}`}>
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
        ) : totalResponses > 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No responses found</h3>
              <p className="text-muted-foreground mb-6">Try a different search</p>
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear search
              </Button>
            </div>
          </Card>
        ) : (
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
                <a href={`/f/${form.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Form
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
