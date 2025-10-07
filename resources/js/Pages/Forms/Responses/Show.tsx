import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, Globe, Monitor } from 'lucide-react';

interface Question {
  id: number;
  type: string;
  title: string;
  description?: string;
  required: boolean;
}

interface Answer {
  id: number;
  value: string;
  created_at: string;
  edges: {
    question?: Question;
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
  edges: {
    questions?: Question[];
  };
}

interface Props {
  form: Form;
  response: Response;
}

export default function Show({ form, response }: Props) {
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

  const formatAnswerValue = (value: string, questionType: string) => {
    if (questionType === 'checkbox') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
      } catch {
        return value;
      }
    }
    return value;
  };

  const answerMap = new Map<number, string>();
  response.edges.answers?.forEach((answer) => {
    if (answer.edges.question) {
      answerMap.set(answer.edges.question.id, answer.value);
    }
  });

  return (
    <AppLayout>
      <Head title={`Response #${response.id} - ${form.title}`} />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/forms/${form.id}/responses`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Responses
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-bold">Response #{response.id}</h1>
            <p className="text-muted-foreground">{form.title}</p>
          </div>
        </div>

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

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Answers</h2>

          {form.edges.questions?.map((question) => {
            const answer = answerMap.get(question.id);
            const hasAnswer = answer !== undefined;

            return (
              <Card key={question.id} className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {question.title}
                      {question.required && <span className="text-red-500 text-sm">*</span>}
                    </h3>
                    {question.description && (
                      <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    {hasAnswer ? (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-base whitespace-pre-wrap break-words">
                          {formatAnswerValue(answer, question.type)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">
                        No answer provided
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {(!form.edges.questions || form.edges.questions.length === 0) && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No questions in this form</p>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
