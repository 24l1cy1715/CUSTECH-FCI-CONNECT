import { z } from 'zod';
import { AchievementCategory, AchievementVerificationStatus } from '@prisma/client';

export const submitEvidenceSchema = z.object({
  evidenceUrl: z.string().url('Must be a valid URL (e.g. GitHub link, credential URL)').optional().or(z.literal('')),
  evidenceNotes: z.string().max(2000, 'Notes must be under 2000 characters').optional(),
  issuer: z.string().max(100).optional(),
});

export const reviewSubmissionSchema = z.object({
  action: z.enum(['VERIFY', 'REJECT']),
  notes: z.string().max(1000).optional(),
});

export const createAchievementSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(100).optional(),
  description: z.string().min(10),
  category: z.nativeEnum(AchievementCategory),
  badgeIcon: z.string().default('Award'),
  points: z.number().int().min(5).max(1000),
  criteria: z.string().optional(),
});

export const updateAchievementSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  category: z.nativeEnum(AchievementCategory).optional(),
  badgeIcon: z.string().optional(),
  points: z.number().int().min(5).max(1000).optional(),
  criteria: z.string().optional(),
  isActive: z.boolean().optional(),
});
