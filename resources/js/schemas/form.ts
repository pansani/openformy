import { z } from 'zod';

export const formCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export const formUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  published: z.union([z.string(), z.boolean()]).optional(),
  display_mode: z.enum(['traditional', 'conversational']).optional(),
  questions: z.string().optional(),
});

export type FormCreateData = z.infer<typeof formCreateSchema>;
export type FormUpdateData = z.infer<typeof formUpdateSchema>;
