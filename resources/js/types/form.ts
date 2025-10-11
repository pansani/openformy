export interface SubInput {
  id: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'url' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
}

export interface Question {
  id: string;
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

export interface Form {
  id: number;
  title: string;
  description?: string;
  slug: string;
  published: boolean;
  display_mode?: string;
  edges: {
    questions?: Question[];
  };
}
