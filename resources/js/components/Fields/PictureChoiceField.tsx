import { Image } from 'lucide-react';

export function PictureChoiceField() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="border-2 border-input rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
          <div className="aspect-video bg-muted rounded flex items-center justify-center mb-2">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-center">Option {num}</p>
        </div>
      ))}
    </div>
  );
}
