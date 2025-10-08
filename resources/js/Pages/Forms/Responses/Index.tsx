import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Response } from '@/types/response';
import { ResponsesHeader } from '@/components/Responses/ResponsesHeader';
import { ResponsesStats } from '@/components/Responses/ResponsesStats';
import { ResponsesSearch } from '@/components/Responses/ResponsesSearch';
import { ResponsesTable } from '@/components/Responses/ResponsesTable';
import { EmptyResponsesState } from '@/components/Responses/EmptyResponsesState';
import { NoSearchResults } from '@/components/Responses/NoSearchResults';

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
  userIdentifier: string;
}

export default function Index({ form, responses, totalResponses, completionRate, userIdentifier }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResponses = responses.filter((response) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      response.ip_address?.toLowerCase().includes(searchLower) ||
      response.user_agent?.toLowerCase().includes(searchLower) ||
      new Date(response.submitted_at).toLocaleDateString().includes(searchLower)
    );
  });

  return (
    <AppLayout>
      <Head title={`Responses - ${form.title}`} />

      <div className="container mx-auto py-8 px-4">
        <ResponsesHeader formTitle={form.title} formId={form.id} />

        <ResponsesStats 
          totalResponses={totalResponses} 
          completionRate={completionRate} 
          responses={responses}
        />

        {totalResponses > 0 && (
          <ResponsesSearch value={searchQuery} onChange={setSearchQuery} />
        )}

        {filteredResponses.length > 0 ? (
          <ResponsesTable responses={filteredResponses} formId={form.id} />
        ) : totalResponses > 0 ? (
          <NoSearchResults onClearSearch={() => setSearchQuery('')} />
        ) : (
          <EmptyResponsesState formSlug={form.slug} userIdentifier={userIdentifier} />
        )}
      </div>
    </AppLayout>
  );
}
