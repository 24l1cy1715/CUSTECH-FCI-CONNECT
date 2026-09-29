import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(5),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).default('NORMAL'),
  category: z.enum([
    'ACADEMIC',
    'FACULTY',
    'EXAMINATION',
    'REGISTRATION',
    'EVENT',
    'INTERNSHIP',
    'COMPETITION',
    'SYSTEM',
    'EMERGENCY',
    'GENERAL',
  ]).default('GENERAL'),
  audience: z.enum(['ALL', 'FCI_ONLY', 'DEPARTMENT', 'LEVEL', 'ROLE', 'CUSTOM']).default('ALL'),
  targetDepartment: z.enum([
    'COMPUTER_SCIENCE',
    'INFORMATION_TECHNOLOGY',
    'CYBER_SECURITY',
    'SOFTWARE_ENGINEERING',
    'DATA_SCIENCE',
    'COMPUTER_ENGINEERING',
    'INFORMATION_SYSTEMS',
    'LIBRARY_INFORMATION_SCIENCE',
  ]).optional(),
  targetLevel: z.enum(['LEVEL_100', 'LEVEL_200', 'LEVEL_300', 'LEVEL_400', 'LEVEL_500', 'PGD', 'MSC', 'PHD']).optional(),
  isPinned: z.boolean().default(false),
  isActive: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  publishAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  expiresAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();
