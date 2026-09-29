import { z } from 'zod';
import { DigitalIdStatus } from '@prisma/client';

export const updateDigitalIdVisibilitySchema = z.object({
  body: z.object({
    showSkills: z.boolean().optional(),
    showAchievements: z.boolean().optional(),
    showPortfolio: z.boolean().optional(),
    showPortfolioLink: z.boolean().optional(),
  }),
});

export const adminVerifyDigitalIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(DigitalIdStatus).optional().default(DigitalIdStatus.VERIFIED),
    reason: z.string().max(1000).trim().optional(),
  }),
});

export const adminSuspendDigitalIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().min(3, 'Suspension reason is required').max(1000).trim(),
  }),
});

export const adminRevokeDigitalIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().min(3, 'Revocation reason is required').max(1000).trim(),
  }),
});
