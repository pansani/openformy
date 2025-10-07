import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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
      
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/forms">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold">Create New Form</h1>
          <p className="text-muted-foreground mt-2">
            Start by giving your form a title and description
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title *</Label>
              <Input
                id="title"
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="e.g. Customer Satisfaction Survey"
                required
                autoFocus
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Describe the purpose of your form"
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create Form'}
              </Button>
              <Link href="/forms">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
