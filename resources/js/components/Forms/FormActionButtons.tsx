import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface FormActionButtonsProps {
  isSubmitting: boolean;
  submitText?: string;
  submittingText?: string;
  cancelUrl: string;
  cancelText?: string;
}

export function FormActionButtons({ 
  isSubmitting, 
  submitText = 'Create Form & Start Building',
  submittingText = 'Creating...',
  cancelUrl,
  cancelText = 'Cancel'
}: FormActionButtonsProps) {
  return (
    <div className="flex items-center gap-4 pt-6 border-t">
      <Button 
        type="submit" 
        disabled={isSubmitting}
        size="lg"
        className="px-8"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            {submittingText}
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            {submitText}
          </>
        )}
      </Button>
      <Link href={cancelUrl}>
        <Button type="button" variant="outline" size="lg">
          {cancelText}
        </Button>
      </Link>
    </div>
  );
}
