import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Response } from '@/types/response';
import { ResponseHeader } from '@/components/Responses/ResponseHeader';
import { ResponseMetadata } from '@/components/Responses/ResponseMetadata';
import { ResponseAnswers } from '@/components/Responses/ResponseAnswers';

interface Question {
  id: number;
  type: string;
  title: string;
  description?: string;
  required: boolean;
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

  return (
    <AppLayout>
      <Head title={`Response #${response.id} - ${form.title}`} />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <ResponseHeader 
          responseId={response.id} 
          formId={form.id} 
          formTitle={form.title} 
        />

        <ResponseMetadata response={response} />

        <ResponseAnswers 
          response={response} 
          questions={form.edges.questions} 
        />
      </div>
    </AppLayout>
  );
}
