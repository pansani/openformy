import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
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
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerChange = (questionId: number, value: AnswerValue) => {
    setAnswers({ ...answers, [questionId]: value });
    if (errors[questionId]) {
      setErrors({ ...errors, [questionId]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<number, string> = {};
    
    questions.forEach((q) => {
      const answer = answers[q.id];
      
      if (q.required && !answer) {
        newErrors[q.id] = 'This field is required';
      }

      if (answer && typeof answer === 'string') {
        if (q.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(answer)) {
            newErrors[q.id] = 'Invalid email';
          }
        }

        if (q.type === 'url') {
          try {
            new URL(answer);
          } catch {
            newErrors[q.id] = 'Invalid URL';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const identifier = form.userIdentifier || window.location.pathname.split('/')[1];
    router.post(
      `/${identifier}/${form.slug}`,
      { answers: JSON.stringify(answers) },
      {
        onFinish: () => setIsSubmitting(false),
        forceFormData: true,
      }
    );
  };

  const isConversational = form.display_mode === 'conversational';

  return (
    <>
      <Head title={form.title} />
      
      {isConversational ? (
        <ConversationalForm
          questions={questions}
          answers={answers}
          errors={errors}
          onAnswerChange={handleAnswerChange}
          onSubmit={() => handleSubmit()}
          isSubmitting={isSubmitting}
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
                  value={answers[question.id] || ''}
                  error={errors[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              ))}

              <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
