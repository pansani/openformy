import { Card } from '@/components/ui/card';
import { Response, Answer } from '@/types/response';

interface Question {
  id: number;
  type: string;
  title: string;
  description?: string;
  required: boolean;
}

interface ResponseAnswersProps {
  response: Response;
  questions?: Question[];
}

export function ResponseAnswers({ response, questions }: ResponseAnswersProps) {
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

  if (!questions || questions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No questions in this form</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Answers</h2>

      {questions.map((question) => {
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
    </div>
  );
}
