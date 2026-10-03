import { z } from 'zod';

export const createVoicePollSchema = z
  .object({
    question: z.string().min(5, 'Question must be at least 5 characters').max(255).optional(),
    title: z.string().min(5, 'Title must be at least 5 characters').max(255).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    options: z.array(z.string().min(1, 'Option text is required')).min(2, 'Must have at least 2 options').max(10),
    startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    visibility: z.string().default('ALL'),
    isAnonymous: z.boolean().default(false),
  })
  .refine((data) => !!(data.question || data.title), {
    message: 'Question or title is required (at least 5 characters)',
    path: ['question'],
  });

export const votePollSchema = z.object({
  optionIndex: z.number().int().min(0),
});

export const createVoiceSuggestionSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(10),
  category: z.string().min(2).default('GENERAL'),
  isAnonymous: z.boolean().default(false),
});

export const respondVoiceSuggestionSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'RESOLVED', 'DECLINED']),
  adminResponse: z.string().min(2),
});
