import { z } from 'zod';

const safeUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  );

export const createResearchProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  abstract: z.string().optional(),
  problemStatement: z.string().optional(),
  objectives: z.string().optional(),
  methodology: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  department: z.enum([
    'COMPUTER_SCIENCE',
    'INFORMATION_TECHNOLOGY',
    'CYBER_SECURITY',
    'SOFTWARE_ENGINEERING',
    'DATA_SCIENCE',
    'COMPUTER_ENGINEERING',
    'INFORMATION_SYSTEMS',
    'LIBRARY_INFORMATION_SCIENCE',
  ]).optional(),
  researchStatus: z.enum([
    'IDEA',
    'PROPOSAL',
    'PLANNING',
    'IN_PROGRESS',
    'UNDER_REVIEW',
    'COMPLETED',
    'PUBLISHED',
    'ARCHIVED',
  ]).default('IDEA'),
  visibility: z.enum(['PUBLIC', 'FCI_ONLY', 'PRIVATE']).default('PUBLIC'),
  mentorId: z.string().uuid().optional(),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  targetDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  githubUrl: safeUrlSchema.optional().or(z.literal('')),
  paperUrl: safeUrlSchema.optional().or(z.literal('')),
  datasetUrl: safeUrlSchema.optional().or(z.literal('')),
  publicationUrl: safeUrlSchema.optional().or(z.literal('')),
  coverImage: safeUrlSchema.optional().or(z.literal('')),
});

export const updateResearchProjectSchema = createResearchProjectSchema.partial();

export const addResearchMemberSchema = z.object({
  userId: z.string().uuid('Valid user ID required'),
  role: z.enum([
    'LEAD',
    'RESEARCHER',
    'DEVELOPER',
    'DATA_ANALYST',
    'WRITER',
    'DESIGNER',
    'ASSISTANT',
    'OTHER',
  ]).default('RESEARCHER'),
});

export const createResearchIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
});

export const addResearchIdeaCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export const createResearchPublicationSchema = z.object({
  title: z.string().min(3).max(255),
  authors: z.string().min(3).max(500),
  abstract: z.string().optional(),
  publicationDate: z.string().optional(),
  journalOrConference: z.string().max(255).optional(),
  doi: z.string().max(100).optional(),
  paperUrl: safeUrlSchema.optional().or(z.literal('')),
  repositoryUrl: safeUrlSchema.optional().or(z.literal('')),
});
