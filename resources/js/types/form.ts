export interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
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
