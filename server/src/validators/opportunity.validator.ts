import { z } from 'zod';

const safeHttpsUrl = z
  .string()
  .trim()
  .refine(
    (url) => /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url),
    { message: 'Application URL must start with https:// and be a valid web address' }
  );

export const opportunityCategories = [
  'INTERNSHIP',
  'JOB',
  'HACKATHON',
  'COMPETITION',
  'SCHOLARSHIP',
  'FELLOWSHIP',
  'CERTIFICATION',
  'WORKSHOP',
  'VOLUNTEERING',
  'FREELANCE',
  'OTHER',
] as const;

export const createOpportunitySchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    organization: z.string().min(2, 'Organization name is required').max(255),
    category: z.enum(opportunityCategories),
    location: z.string().max(255).optional().nullable(),
    isRemote: z.boolean().default(false),
    applicationUrl: safeHttpsUrl,
    applicationProcess: z.string().max(3000).optional().nullable(),
    deadline: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    eligibility: z.string().max(3000).optional().nullable(),
    isFeatured: z.boolean().optional(),
    requiredSkills: z
      .array(
        z.object({
          skillId: z.string().uuid(),
          priority: z.enum(['REQUIRED', 'PREFERRED']).default('REQUIRED'),
          minLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
        })
      )
      .optional(),
  }),
});

export const updateOpportunitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().min(10).optional(),
    organization: z.string().min(2).max(255).optional(),
    category: z.enum(opportunityCategories).optional(),
    location: z.string().max(255).optional().nullable(),
    isRemote: z.boolean().optional(),
    applicationUrl: safeHttpsUrl.optional(),
    applicationProcess: z.string().max(3000).optional().nullable(),
    deadline: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    eligibility: z.string().max(3000).optional().nullable(),
    status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
    isFeatured: z.boolean().optional(),
    requiredSkills: z
      .array(
        z.object({
          skillId: z.string().uuid(),
          priority: z.enum(['REQUIRED', 'PREFERRED']).default('REQUIRED'),
          minLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
        })
      )
      .optional(),
  }),
});

export const reportOpportunitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.enum(['SPAM', 'HARASSMENT', 'FRAUD', 'INAPPROPRIATE', 'MISLEADING', 'OTHER']),
    description: z.string().max(1000).optional().nullable(),
  }),
});

export const queryOpportunitiesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.enum(opportunityCategories).optional(),
    isRemote: z.string().transform((v) => v === 'true').optional(),
    deadlineStatus: z.enum(['OPEN', 'CLOSING_SOON', 'CLOSED', 'ALL']).optional(),
    featured: z.string().transform((v) => v === 'true').optional(),
    skills: z.string().optional(), // comma-separated skill IDs or names
    status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED', 'ALL']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('12'),
  }),
});

export const moderateOpportunitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'ARCHIVED']),
    moderationNote: z.string().max(500).optional(),
    isFeatured: z.boolean().optional(),
  }),
});
