import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { FieldTypesSidebar, FormPreview, FieldSettings } from '@/components/FormBuilder';

interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
}

interface Form {
  id: number;
  title: string;
  description?: string;
  slug: string;
  published: boolean;
  edges: {
    questions?: Question[];
  };
}

interface Props {
  form: Form;
}

export default function Edit({ form }: Props) {
  const [questions, setQuestions] = useState<Question[]>(
    form.edges.questions?.sort((a, b) => a.order - b.order) || []
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldSelect = (type: string) => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      type,
      title: '',
      description: '',
      placeholder: '',
      required: false,
      order: questions.length,
      options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    };

    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
  };

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setQuestions(questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)));
  };

  const handleQuestionDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
  };

  const handleReorder = (reorderedQuestions: Question[]) => {
    const updated = reorderedQuestions.map((q, index) => ({ ...q, order: index }));
    setQuestions(updated);
  };

  const handleSave = () => {
    setIsSaving(true);
    router.put(
      `/forms/${form.id}`,
      { questions: JSON.stringify(questions) },
      {
        forceFormData: true,
        onFinish: () => setIsSaving(false),
      }
    );
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  return (
    <AppLayout>
      <Head title={`Edit Form: ${form.title}`} />

      <div className="flex flex-col h-full bg-background -mt-16 pt-16">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center gap-4">
              <Link href="/forms">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="font-bold text-lg">{form.title}</h1>
                <p className="text-xs text-muted-foreground">/{form.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/f/${form.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <FieldTypesSidebar onFieldSelect={handleFieldSelect} />
          </div>

          <div className="flex-1 overflow-hidden">
            <FormPreview
              form={form}
              questions={questions}
              selectedQuestionId={selectedQuestionId}
              onQuestionSelect={setSelectedQuestionId}
              onQuestionDelete={handleQuestionDelete}
              onReorder={handleReorder}
            />
          </div>

          <div className="w-96 flex-shrink-0 overflow-hidden">
            <FieldSettings
              question={selectedQuestion}
              onUpdate={handleQuestionUpdate}
              onClose={() => setSelectedQuestionId(null)}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
