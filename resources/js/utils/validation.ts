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
  };
}

export interface ValidationResult {
  valid: boolean;
  error: string;
}

export function validateAnswer(
  question: Question,
  answer: string | string[] | undefined
): ValidationResult {
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
