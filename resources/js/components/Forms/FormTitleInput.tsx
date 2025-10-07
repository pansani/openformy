import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useState } from 'react';

interface FormTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function FormTitleInput({ value, onChange, error, required = false }: FormTitleInputProps) {
  const [focused, setFocused] = useState(false);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="space-y-3">
      <Label 
        htmlFor="title" 
        className={`text-base font-semibold transition-colors ${focused ? 'text-primary' : ''}`}
      >
        Form Title {required && '*'}
      </Label>
      <div className="relative">
        <Input
          id="title"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. Customer Satisfaction Survey"
          required={required}
          autoFocus
          className={`h-14 text-lg pl-12 transition-all duration-200 ${
            focused ? 'ring-2 ring-primary/20 border-primary' : ''
          }`}
        />
        <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
          focused ? 'text-primary' : 'text-muted-foreground'
        }`} />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
      {value && (
        <p className="text-xs text-muted-foreground">
          Your form will be accessible at: <span className="font-mono text-primary">/f/{generateSlug(value)}</span>
        </p>
      )}
    </div>
  );
}
