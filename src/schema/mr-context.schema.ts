import { z } from 'zod';

export const FileDiffSchema = z.object({
  path: z.string(),
  language: z.string().optional(),
  diff: z.string(),
});

export const MRContextSchema = z.object({
  title: z.string(),
  description: z.string(),
  sourceBranch: z.string(),
  targetBranch: z.string(),
  files: z.array(FileDiffSchema),
});

export type FileDiff = z.infer<typeof FileDiffSchema>;
export type MRContext = z.infer<typeof MRContextSchema>;
