import { Pen } from 'lucide-react';

export function SignaturePreview() {
  return (
    <div className="border-2 border-dashed border-input rounded-lg p-8 text-center bg-muted/30">
      <Pen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Sign here</p>
    </div>
  );
}
