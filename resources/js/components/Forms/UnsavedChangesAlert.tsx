import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesAlertProps {
  hasUnsavedChanges: boolean;
}

export function UnsavedChangesAlert({ hasUnsavedChanges }: UnsavedChangesAlertProps) {
  if (!hasUnsavedChanges) return null;

  return (
    <Alert className="rounded-none border-l-0 border-r-0 border-t-0 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        You have unsaved changes. Click <strong>Save</strong> to keep your changes.
      </AlertDescription>
    </Alert>
  );
}
