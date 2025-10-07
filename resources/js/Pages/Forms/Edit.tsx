import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
  formId: string;
}

export default function Edit({ formId }: Props) {
  return (
    <AppLayout>
      <Head title="Edit Form" />
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <Link href="/forms">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold">Form Builder</h1>
          <p className="text-muted-foreground mt-2">
            Form ID: {formId}
          </p>
        </div>

        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Form builder coming soon...
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
