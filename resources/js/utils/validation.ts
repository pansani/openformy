interface SubInput {
  id: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'url' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
}

interface Question {
  id: number;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: {
    items?: string[];
    subInputs?: SubInput[];
  };
}

export interface ValidationResult {
  valid: boolean;
  error: string;
}

export function validateAnswer(
  question: Question,
  answer: string | string[] | Record<string, string> | undefined
): ValidationResult {
  if (question.type === 'multi-input') {
    const subInputs = question.options?.subInputs || [];
    const values = (answer && typeof answer === 'object' && !Array.isArray(answer)) ? answer : {};
    
    for (const subInput of subInputs) {
      if (subInput.required && !values[subInput.id]) {
        return { valid: false, error: `${subInput.label} is required` };
      }
      
      const value = values[subInput.id];
      if (value) {
        if (subInput.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return { valid: false, error: `Invalid email in ${subInput.label}` };
          }
        }
        
        if (subInput.type === 'url') {
          try {
            new URL(value);
          } catch {
            return { valid: false, error: `Invalid URL in ${subInput.label}` };
          }
        }
      }
    }
    return { valid: true, error: '' };
  }
  
  if (
    !answer ||
    (Array.isArray(answer) && answer.length === 0) ||
    (typeof answer === 'string' && answer.length === 0)
  ) {
    if (question.required) {
      return { valid: false, error: 'This field is required' };
    }
    return { valid: true, error: '' };
  }

  if (typeof answer === 'string') {
    if (question.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer)) {
        return { valid: false, error: 'Invalid email' };
      }
    }

    if (question.type === 'url') {
      try {
        new URL(answer);
      } catch {
        return { valid: false, error: 'Invalid URL' };
      }
    }
  }

  return { valid: true, error: '' };
}
