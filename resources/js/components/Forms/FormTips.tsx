import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface FormTipsProps {
  tips?: string[];
}

const defaultTips = [
  'Use clear, descriptive titles that tell respondents what to expect',
  'Add a description to provide context and increase completion rates',
  'You can customize your form\'s design and branding later',
];

export function FormTips({ tips = defaultTips }: FormTipsProps) {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Quick Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            {tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
