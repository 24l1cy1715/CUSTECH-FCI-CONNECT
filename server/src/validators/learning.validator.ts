import { z } from 'zod';
import {
  LearningResourceType,
  LearningResourceCategory,
  LearningProgressStatus,
  LearningPathDifficulty,
  ResourceSubmissionStatus,
  Department,
  Level,
} from '@prisma/client';
import { safeUrlSchema } from './community.validator';

const levelSchema = z.preprocess((val) => {
  if (typeof val === 'number') return `LEVEL_${val}`;
  if (typeof val === 'string') {
    if (val.startsWith('LEVEL_')) return val;
    if (/^\d{3}$/.test(val)) return `LEVEL_${val}`;
  }
  return val;
}, z.nativeEnum(Level).optional());

const departmentSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    const formatted = val.toUpperCase().replace(/[\s-]+/g, '_');
    return formatted;
  }
  return val;
}, z.nativeEnum(Department).optional());

// ── 1. Create/Submit Resource ────────────────────────────────────────────────
export const createLearningResourceSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(255).trim(),
    slug: z.string().max(255).trim().optional(),
    description: z.string().max(10000).trim().optional(),
    resourceType: z.nativeEnum(LearningResourceType),
    category: z.nativeEnum(LearningResourceCategory),
    subject: z.string().max(255).trim().optional(),
    courseCode: z.string().max(50).trim().optional(),
    department: departmentSchema,
    level: levelSchema,
    semester: z.string().max(20).trim().optional(),
    url: safeUrlSchema.optional().or(z.literal('')),
    fileUrl: safeUrlSchema.optional().or(z.literal('')),
    thumbnail: safeUrlSchema.optional().or(z.literal('')),
    isPublished: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    skillIds: z.array(z.string()).optional(),
  }),
});

export const submitStudentResourceSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(255).trim(),
    description: z.string().max(5000).trim().optional(),
    resourceType: z.nativeEnum(LearningResourceType),
    category: z.nativeEnum(LearningResourceCategory),
    subject: z.string().max(255).trim().optional(),
    courseCode: z.string().max(50).trim().optional(),
    department: departmentSchema,
    level: levelSchema,
    semester: z.string().max(20).trim().optional(),
    url: safeUrlSchema.optional().or(z.literal('')),
    fileUrl: safeUrlSchema.optional().or(z.literal('')),
    thumbnail: safeUrlSchema.optional().or(z.literal('')),
    skillIds: z.array(z.string()).optional(),
  }),
});

// ── 2. Update Resource ────────────────────────────────────────────────────────
export const updateLearningResourceSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(255).trim().optional(),
    description: z.string().max(10000).trim().optional(),
    resourceType: z.nativeEnum(LearningResourceType).optional(),
    category: z.nativeEnum(LearningResourceCategory).optional(),
    subject: z.string().max(255).trim().optional(),
    courseCode: z.string().max(50).trim().optional(),
    department: z.nativeEnum(Department).optional(),
    level: z.nativeEnum(Level).optional(),
    semester: z.string().max(20).trim().optional(),
    url: safeUrlSchema.optional().or(z.literal('')),
    fileUrl: safeUrlSchema.optional().or(z.literal('')),
    thumbnail: safeUrlSchema.optional().or(z.literal('')),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    status: z.nativeEnum(ResourceSubmissionStatus).optional(),
    rejectionReason: z.string().max(2000).optional(),
    skillIds: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── 3. Review Resource (Approve / Reject) ────────────────────────────────────
export const reviewResourceSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().max(2000).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── 4. Progress Update ────────────────────────────────────────────────────────
export const updateProgressSchema = z.object({
  body: z.object({
    progressPercentage: z.number().int().min(0, 'Minimum progress is 0%').max(100, 'Maximum progress is 100%'),
    status: z.nativeEnum(LearningProgressStatus).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── 5. Learning Paths ─────────────────────────────────────────────────────────
export const createLearningPathSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Path title must be at least 3 characters').max(255).trim(),
    slug: z.string().max(255).trim().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').trim(),
    category: z.nativeEnum(LearningResourceCategory),
    difficulty: z.nativeEnum(LearningPathDifficulty).optional().default(LearningPathDifficulty.BEGINNER),
    estimatedDuration: z.string().max(100).trim().optional(),
    thumbnail: safeUrlSchema.optional().or(z.literal('')),
    isPublished: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    items: z.array(
      z.object({
        resourceId: z.string().min(1),
        position: z.number().int().min(0).optional(),
        isRequired: z.boolean().optional().default(true),
      })
    ).optional(),
  }),
});

export const updateLearningPathSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255).trim().optional(),
    description: z.string().min(10).trim().optional(),
    category: z.nativeEnum(LearningResourceCategory).optional(),
    difficulty: z.nativeEnum(LearningPathDifficulty).optional(),
    estimatedDuration: z.string().max(100).trim().optional(),
    thumbnail: safeUrlSchema.optional().or(z.literal('')),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    items: z.array(
      z.object({
        resourceId: z.string().min(1),
        position: z.number().int().min(0).optional(),
        isRequired: z.boolean().optional().default(true),
      })
    ).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
