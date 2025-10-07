export interface Answer {
  id: number;
  value: string;
  created_at: string;
  edges: {
    question?: {
      id: number;
      title: string;
      type: string;
    };
  };
}

export interface Response {
  id: number;
  submitted_at: string;
  completed: boolean;
  ip_address: string;
  user_agent: string;
  edges: {
    answers?: Answer[];
  };
}
