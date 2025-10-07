import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
  FormHeader,
  FormTitleInput,
  FormDescriptionInput,
  FormActionButtons,
} from '@/components/Forms';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
            <div className="flex items-center justify-between mb-6">
              <Link href="/forms">
                <Button variant="ghost" size="sm" className="-ml-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forms
                </Button>
              </Link>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Quick Tips
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        Quick Tips
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Use clear, descriptive titles that tell respondents what to expect</p>
                      <p>• Add a description to provide context and increase completion rates</p>
                      <p>• You can customize your form's design and branding later</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
