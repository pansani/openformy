import { Head } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';

interface Props {
  formTitle: string;
}

export default function ThankYou({ formTitle }: Props) {
  return (
    <>
      <Head title="Thank You!" />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-2xl w-full text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-8 flex justify-center">
            <CheckCircle className="h-24 w-24 text-green-600 dark:text-green-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Thank You!
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Your response to <span className="font-semibold text-slate-900 dark:text-slate-100">{formTitle}</span> has been submitted successfully.
          </p>
          
          <div className="inline-block px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You can close this window now
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
