import { z } from 'zod';
import { OpportunityTrackStatus } from '@prisma/client';
import { safeUrlSchema } from './community.validator';

export const trackOpportunitySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(OpportunityTrackStatus).optional().default(OpportunityTrackStatus.SAVED),
    appliedAt: z.string().datetime().optional().nullable(),
    followUpDate: z.string().datetime().optional().nullable(),
    notes: z.string().max(10000).trim().optional().nullable(),
    applicationUrl: safeUrlSchema.optional().or(z.literal('')),
    result: z.string().max(255).trim().optional().nullable(),
    documentTypes: z.array(z.string().max(50)).optional(),
    remindDaysBefore: z.number().int().min(0).max(60).optional().default(7),
    linkedLabProjectId: z.string().uuid().optional().nullable(),
  }),
});

export const updateOpportunityTrackingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(OpportunityTrackStatus).optional(),
    appliedAt: z.string().datetime().optional().nullable(),
    followUpDate: z.string().datetime().optional().nullable(),
    notes: z.string().max(10000).trim().optional().nullable(),
    applicationUrl: safeUrlSchema.optional().or(z.literal('')),
    result: z.string().max(255).trim().optional().nullable(),
    documentTypes: z.array(z.string().max(50)).optional(),
    remindDaysBefore: z.number().int().min(0).max(60).optional(),
    linkedLabProjectId: z.string().uuid().optional().nullable(),
  }),
});
