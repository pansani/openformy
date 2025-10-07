import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
  FormHeader,
  FormTitleInput,
  FormDescriptionInput,
  FormActionButtons,
  FormTips,
} from '@/components/Forms';

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/forms', {
      forceFormData: true,
    });
  };

  return (
    <AppLayout>
      <Head title="Create Form" />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-12 px-4 max-w-4xl">
          <div className="mb-12">
            <Link href="/forms">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forms
              </Button>
            </Link>
            
            <FormHeader
              title="Create New Form"
              description="Start by giving your form a memorable title and description"
            />
          </div>

          <div className="grid gap-8">
            <Card className="p-8 shadow-lg border-2 hover:border-primary/20 transition-all duration-300">
              <form onSubmit={submit} className="space-y-8">
                <FormTitleInput
                  value={data.title}
                  onChange={(value) => setData('title', value)}
                  error={errors.title}
                  required
                />

                <FormDescriptionInput
                  value={data.description}
                  onChange={(value) => setData('description', value)}
                  error={errors.description}
                />

                <FormActionButtons
                  isSubmitting={processing}
                  cancelUrl="/forms"
                />
              </form>
            </Card>

            <FormTips />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
