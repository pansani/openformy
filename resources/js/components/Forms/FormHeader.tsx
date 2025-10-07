import { Sparkles } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  description: string;
}

export function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-lg text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
