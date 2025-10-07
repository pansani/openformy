import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface FormDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}

export function FormDescriptionInput({ 
  value, 
  onChange, 
  error, 
  maxLength = 500 
}: FormDescriptionInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-3">
      <Label 
        htmlFor="description" 
        className={`text-base font-semibold transition-colors ${focused ? 'text-primary' : ''}`}
      >
        Description <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <div className="relative">
        <textarea
          id="description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Help respondents understand the purpose of this form..."
          rows={4}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border border-input rounded-lg bg-background resize-none transition-all duration-200 ${
            focused ? 'ring-2 ring-primary/20 border-primary' : ''
          }`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {value.length} / {maxLength} characters
      </p>
    </div>
  );
}
