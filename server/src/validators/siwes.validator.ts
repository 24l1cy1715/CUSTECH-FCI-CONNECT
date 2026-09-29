import { z } from 'zod';

const safeUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  );

export const createPlacementSchema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(255),
  companyAddress: z.string().max(500).optional(),
  roleTitle: z.string().max(255).optional(),
  industrySupervisorName: z.string().max(150).optional(),
  industrySupervisorEmail: z.string().email().optional().or(z.literal('')),
  industrySupervisorPhone: z.string().max(50).optional(),
  academicSupervisorId: z.string().uuid().optional(),
  status: z.enum([
    'NOT_STARTED',
    'SEARCHING',
    'APPLIED',
    'INTERVIEW',
    'OFFER_RECEIVED',
    'PLACED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
  ]).default('SEARCHING'),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
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
});

export const updatePlacementSchema = createPlacementSchema.partial();

export const createWeeklyLogSchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  activities: z.string().min(10, 'Activities description must be at least 10 characters'),
  skillsLearned: z.string().optional(),
  challenges: z.string().optional(),
  supervisorComments: z.string().optional(),
  documentUrl: safeUrlSchema.optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED']).default('DRAFT'),
});

export const updateWeeklyLogSchema = createWeeklyLogSchema.partial();

export const createSiwesDocumentSchema = z.object({
  title: z.string().min(2).max(255),
  docType: z.enum([
    'ACCEPTANCE_LETTER',
    'PLACEMENT_LETTER',
    'CV',
    'LOGBOOK',
    'REPORT',
    'EVALUATION',
    'OTHER',
  ]).default('REPORT'),
  fileUrl: safeUrlSchema,
  fileSize: z.number().int().optional(),
  mimeType: z.string().max(100).optional(),
});
