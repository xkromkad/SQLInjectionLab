import { z } from 'zod';

/**
 * Schema for a single input field of a task, mirroring the original
 * tasks.json shape (text / number / dropdown).
 */
export const inputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['text', 'number', 'dropdown']),
  label: z.string().min(1),
  options: z.array(z.string()).optional(),
});

/**
 * Schema for a single task. `id` may arrive as a number (legacy tasks.json)
 * or string; it is normalised to a stable string `taskId`.
 */
export const taskSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((v) => String(v)),
  caption: z.string().min(1),
  task: z.string().min(1),
  query: z.string().min(1),
  checkQuery: z.string().optional(),
  correctAnswer: z.string(),
  inputs: z.array(inputSchema).default([]),
});

/** A task set is an ordered, non-empty list of tasks. */
export const taskListSchema = z.array(taskSchema).min(1, 'At least one task is required');

/** Payload accepted when importing a custom task set. */
export const importTaskSetSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  language: z.enum(['sk', 'en']).default('sk'),
  visibility: z.enum(['private', 'public']).default('private'),
  tasks: taskListSchema,
});

export type InputDef = z.infer<typeof inputSchema>;
export type TaskDef = z.infer<typeof taskSchema>;
export type ImportTaskSetInput = z.infer<typeof importTaskSetSchema>;
