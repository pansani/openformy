import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function LegalPreview() {
  return (
    <div className="flex items-start gap-3 p-4 border border-input rounded-lg bg-muted/20">
      <Checkbox disabled id="legal-consent" className="mt-0.5" />
      <div>
        <Label htmlFor="legal-consent" className="text-sm font-medium cursor-pointer">
          I agree to the terms and conditions
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          By checking this box, you agree to our privacy policy and terms of service.
        </p>
      </div>
    </div>
  );
}
