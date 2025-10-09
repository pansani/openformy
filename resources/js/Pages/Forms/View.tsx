import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { FormQuestion } from '@/components/Forms/FormQuestion';
import { ConversationalForm } from '@/components/Forms/ConversationalForm';

interface Question {
  id: number;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: {
    items?: string[];
  };
}

interface Form {
  id: number;
  title: string;
  description?: string;
  slug: string;
  display_mode?: string;
  userIdentifier?: string;
  edges: {
    questions?: Question[];
  };
}

interface Props {
  form: Form;
}

type AnswerValue = string | string[];

export default function View({ form }: Props) {
  const questions = form.edges.questions?.sort((a, b) => a.order - b.order) || [];
  
  const { data, setData, post, processing, errors: formErrors, transform } = useForm<{
    answers: Record<number, AnswerValue>;
  }>({
    answers: {},
  });

  transform((data) => ({
    answers: JSON.stringify(data.answers),
  }));

  const handleAnswerChange = (questionId: number, value: AnswerValue) => {
    setData('answers', { ...data.answers, [questionId]: value });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const identifier = form.userIdentifier || window.location.pathname.split('/')[1];
    post(`/${identifier}/${form.slug}`, {
      forceFormData: true,
    });
  };

  const isConversational = form.display_mode === 'conversational';

  return (
    <>
      <Head title={form.title} />
      
      {isConversational ? (
        <ConversationalForm
          questions={questions}
          answers={data.answers}
          errors={Object.fromEntries(
            Object.entries(formErrors).map(([key, value]) => [
              key.replace('answers.', ''),
              value,
            ])
          )}
          onAnswerChange={handleAnswerChange}
          onSubmit={() => handleSubmit()}
          isSubmitting={processing}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-3">{form.title}</h1>
              {form.description && (
                <p className="text-lg text-muted-foreground">{form.description}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question) => (
                <FormQuestion
                  key={question.id}
                  question={question}
                  value={data.answers[question.id] || ''}
                  error={formErrors[`answers.${question.id}`]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              ))}

              <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" disabled={processing}>
                  <Send className="h-4 w-4 mr-2" />
                  {processing ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
