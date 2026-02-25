import { z } from 'zod';

export const ReviewCommentSchema = z.object({
  file: z.string(),
  line: z.number(),
  severity: z.enum(['critical', 'warning', 'suggestion']),
  comment: z.string(),
});

export const ReviewSchema = z.object({
  comments: z.array(ReviewCommentSchema),
});

export type ReviewComment = z.infer<typeof ReviewCommentSchema>;
export type Review = z.infer<typeof ReviewSchema>;
