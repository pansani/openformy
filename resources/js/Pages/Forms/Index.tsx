import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface Form {
  id: number;
  title: string;
  description: string;
  published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  forms: Form[];
}

export default function Index({ forms }: Props) {
  return (
    <AppLayout>
      <Head title="Forms" />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Forms</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your forms
            </p>
          </div>
          
          <Link href="/forms/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Form
            </Button>
          </Link>
        </div>

        {forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{form.title}</h3>
                    {form.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      form.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {form.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link href={`/forms/${form.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/forms/${form.id}`} className="flex-1">
                    <Button variant="default" className="w-full">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Plus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No forms yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first form
              </p>
              <Link href="/forms/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Form
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
