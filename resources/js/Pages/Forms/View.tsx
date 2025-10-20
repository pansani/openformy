import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { FormQuestion } from "@/components/Forms/FormQuestion";
import { ConversationalForm } from "@/components/Forms/ConversationalForm";
import { validateAnswer } from "@/utils/validation";
import { useMemo } from "react";

interface SubInput {
  id: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'url' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
}

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
    subInputs?: SubInput[];
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

interface BrandColors {
  button?: string;
  background?: string;
  text?: string;
}

interface Props {
  form: Form;
  brandColors?: BrandColors;
  userLogo?: string;
}

type AnswerValue = string | string[] | Record<string, string>;

function hexToRgb(hex: string): string {
  if (!hex || !hex.startsWith("#")) return "";

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `${r} ${g} ${b}`;
}

export default function View({ form, brandColors, userLogo }: Props) {
  const questions =
    form.edges.questions?.sort((a, b) => a.order - b.order) || [];

  const {
    data,
    setData,
    post,
    processing,
    errors: formErrors,
    transform,
  } = useForm<{
    answers: Record<number, AnswerValue>;
  }>({
    answers: {},
  });

  transform((data) => ({
    answers: JSON.stringify(data.answers),
  }));

  const handleAnswerChange = (questionId: number, value: AnswerValue) => {
    setData("answers", { ...data.answers, [questionId]: value });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const identifier =
      form.userIdentifier || window.location.pathname.split("/")[1];
    post(`/${identifier}/${form.slug}`, {
      forceFormData: true,
    });
  };

  const isConversational = form.display_mode === "conversational";


  const isFormValid = useMemo(() => {
    if (isConversational) {
      return true;
    }
    for (const question of questions) {
      const validation = validateAnswer(question, data.answers[question.id]);
      if (!validation.valid) {
        return false;
      }
    }
    return true;
  }, [isConversational, questions, data.answers]);

  const customStyles = brandColors?.button
    ? `
    :root {
      --primary: ${hexToRgb(brandColors.button)};
      ${brandColors.background ? `--background: ${hexToRgb(brandColors.background)};` : ""}
      ${brandColors.text ? `--primary-foreground: ${hexToRgb(brandColors.text)};` : ""}
    }
  `
    : "";

  return (
    <>
      <Head title={form.title}>
        {customStyles && <style>{customStyles}</style>}
      </Head>

      {isConversational ? (
        <>
          {userLogo && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40">
              <div className="h-12 flex items-center">
                <img src={userLogo} alt="Logo" className="h-full object-contain" />
              </div>
            </div>
          )}
          <ConversationalForm
            questions={questions}
            answers={data.answers}
            errors={Object.fromEntries(
              Object.entries(formErrors).map(([key, value]) => [
                key.replace("answers.", ""),
                value,
              ]),
            )}
            onAnswerChange={handleAnswerChange}
            onSubmit={() => handleSubmit()}
            isSubmitting={processing}
            brandColors={brandColors}
          />
        </>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {userLogo && (
              <div className="mb-8 flex justify-center">
                <div className="h-16 flex items-center">
                  <img src={userLogo} alt="Logo" className="h-full object-contain" />
                </div>
              </div>
            )}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-3">{form.title}</h1>
              {form.description && (
                <p className="text-lg text-muted-foreground">
                  {form.description}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question) => (
                <FormQuestion
                  key={question.id}
                  question={question}
                  value={data.answers[question.id] || (question.type === 'multi-input' ? {} : "")}
                  error={formErrors[`answers.${question.id}` as keyof typeof formErrors]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              ))}

              <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" disabled={!isFormValid || processing}>
                  <Send className="h-4 w-4 mr-2" />
                  {processing ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
