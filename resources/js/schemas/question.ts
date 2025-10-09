import { z } from 'zod';

export const emailAnswerSchema = z.string().email('Invalid email address');

export const urlAnswerSchema = z.string().url('Invalid URL format');

export const phoneAnswerSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const numberAnswerSchema = z.coerce.number({
  required_error: 'Number is required',
  invalid_type_error: 'Must be a number',
});

export const dateAnswerSchema = z.string().refine((date) => {
  const parsed = Date.parse(date);
  return !isNaN(parsed);
}, 'Invalid date format');

export const shortTextAnswerSchema = z
  .string()
  .min(1, 'This field is required')
  .max(255, 'Text must be less than 255 characters');

export const longTextAnswerSchema = z
  .string()
  .min(1, 'This field is required')
  .max(10000, 'Text must be less than 10000 characters');

export const singleChoiceAnswerSchema = z.string().min(1, 'Please select an option');

export const multipleChoiceAnswerSchema = z
  .array(z.string())
  .min(1, 'Please select at least one option');

export function getQuestionSchema(type: string, required: boolean) {
  let schema: z.ZodTypeAny;

  switch (type) {
    case 'email':
      schema = emailAnswerSchema;
      break;
    case 'url':
      schema = urlAnswerSchema;
      break;
    case 'phone':
      schema = phoneAnswerSchema;
      break;
    case 'number':
      schema = numberAnswerSchema;
      break;
    case 'date':
      schema = dateAnswerSchema;
      break;
    case 'short-text':
      schema = shortTextAnswerSchema;
      break;
    case 'long-text':
      schema = longTextAnswerSchema;
      break;
    case 'dropdown':
    case 'radio':
      schema = singleChoiceAnswerSchema;
      break;
    case 'checkbox':
      schema = multipleChoiceAnswerSchema;
      break;
    default:
      schema = z.string().min(1, 'This field is required');
  }

  return required ? schema : schema.optional();
}

export type EmailAnswer = z.infer<typeof emailAnswerSchema>;
export type UrlAnswer = z.infer<typeof urlAnswerSchema>;
export type PhoneAnswer = z.infer<typeof phoneAnswerSchema>;
export type NumberAnswer = z.infer<typeof numberAnswerSchema>;
export type DateAnswer = z.infer<typeof dateAnswerSchema>;
export type ShortTextAnswer = z.infer<typeof shortTextAnswerSchema>;
export type LongTextAnswer = z.infer<typeof longTextAnswerSchema>;
export type SingleChoiceAnswer = z.infer<typeof singleChoiceAnswerSchema>;
export type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswerSchema>;
