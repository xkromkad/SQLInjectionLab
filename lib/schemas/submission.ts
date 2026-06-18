import { z } from 'zod';

export const submissionInputSchema = z.object({
  taskId: z.string().min(1),
  inputs: z.record(z.string(), z.string()),
  finalQuery: z.string(),
  result: z.unknown().optional(),
  isCorrect: z.boolean(),
});

export type SubmissionInput = z.infer<typeof submissionInputSchema>;
