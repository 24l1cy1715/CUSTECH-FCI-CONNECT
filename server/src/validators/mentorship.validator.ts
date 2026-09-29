import { z } from 'zod';
import {
  MentorshipSessionFormat,
  MentorshipGoalStatus,
  MentorshipSessionStatus,
  CommunityResourceType,
} from '@prisma/client';
import { safeUrlSchema } from './community.validator';

export const upsertMentorProfileSchema = z.object({
  body: z.object({
    headline: z.string().min(3, 'Headline must be at least 3 characters').max(255).trim(),
    bio: z.string().max(3000).optional(),
    areas: z.array(z.string().min(1)).min(1, 'Please select at least one mentoring area'),
    availability: z.string().min(2, 'Availability schedule is required').max(255).trim(),
    languages: z.array(z.string().min(1)).optional().default(['English']),
    maxMentees: z.number().int().min(1).max(20).optional().default(3),
    sessionFormat: z.nativeEnum(MentorshipSessionFormat).optional().default(MentorshipSessionFormat.CHAT),
    isAvailable: z.boolean().optional().default(true),
  }),
});

export const updateMentorProfileStatusSchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export const createMentorshipRequestSchema = z.object({
  body: z.object({
    mentorId: z.string().min(1, 'Mentor ID is required'),
    goal: z.string().min(10, 'Please describe your learning goal in at least 10 characters').max(3000).trim(),
  }),
});

export const respondMentorshipRequestSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'DECLINED', 'CANCELLED']),
    rejectionReason: z.string().max(1000).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Goal title is required').max(255).trim(),
    target: z.string().max(1000).optional(),
    progress: z.number().int().min(0).max(100).optional().default(0),
    status: z.nativeEnum(MentorshipGoalStatus).optional().default(MentorshipGoalStatus.NOT_STARTED),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateGoalSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255).trim().optional(),
    target: z.string().max(1000).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    status: z.nativeEnum(MentorshipGoalStatus).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
    goalId: z.string().min(1),
  }),
});

export const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Session title is required').max(255).trim(),
    description: z.string().max(2000).optional(),
    scheduledAt: z.string().min(1, 'Scheduled time is required'),
    duration: z.number().int().min(15).max(300).optional().default(60),
    meetingUrl: safeUrlSchema.optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateSessionSchema = z.object({
  body: z.object({
    status: z.nativeEnum(MentorshipSessionStatus).optional(),
    title: z.string().min(3).max(255).trim().optional(),
    description: z.string().max(2000).optional(),
    scheduledAt: z.string().min(1).optional(),
    duration: z.number().int().min(15).max(300).optional(),
    meetingUrl: safeUrlSchema.optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().min(1),
    sessionId: z.string().min(1),
  }),
});

export const createMentorshipResourceSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required').max(255).trim(),
    description: z.string().max(1000).optional(),
    url: safeUrlSchema,
    type: z.nativeEnum(CommunityResourceType).optional().default(CommunityResourceType.ARTICLE),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
