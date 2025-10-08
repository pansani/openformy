import { Head } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';

interface Props {
  formTitle: string;
}

export default function ThankYou({ formTitle }: Props) {
  return (
    <>
      <Head title="Thank You!" />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <CheckCircle className="h-24 w-24 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Thank You!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Your response to <span className="font-semibold text-foreground">{formTitle}</span> has been submitted successfully.
          </p>
          
          <div className="inline-block px-6 py-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              You can close this window now
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
