import { z } from 'zod';
import {
  ProjectCategory,
  Department,
  LabProjectVisibility,
  LabProjectStatus,
  LabTeamRole,
  LabMemberStatus,
  LabTaskStatus,
  LabTaskPriority,
  LabMilestoneStatus,
} from '@prisma/client';
import { safeUrlSchema } from './community.validator';

// ── 1. Create Lab Project ────────────────────────────────────────────────────
export const createLabProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255).trim(),
    description: z.string().min(10, 'Description must be at least 10 characters').trim(),
    category: z.nativeEnum(ProjectCategory),
    problemStatement: z.string().max(5000).trim().optional(),
    objectives: z.string().max(5000).trim().optional(),
    department: z.nativeEnum(Department).optional(),
    visibility: z.nativeEnum(LabProjectVisibility).optional().default(LabProjectVisibility.FCI_ONLY),
    startDate: z.string().datetime().optional(),
    targetDate: z.string().datetime().optional(),
    githubUrl: safeUrlSchema.optional().or(z.literal('')),
    liveDemoUrl: safeUrlSchema.optional().or(z.literal('')),
    documentationUrl: safeUrlSchema.optional().or(z.literal('')),
    coverImage: safeUrlSchema.optional().or(z.literal('')),
    opportunityId: z.string().uuid().optional(),
    mentorId: z.string().uuid().optional(),
  }),
});

// ── 2. Update Lab Project ────────────────────────────────────────────────────
export const updateLabProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(3).max(255).trim().optional(),
    description: z.string().min(10).trim().optional(),
    category: z.nativeEnum(ProjectCategory).optional(),
    problemStatement: z.string().max(5000).trim().optional(),
    objectives: z.string().max(5000).trim().optional(),
    department: z.nativeEnum(Department).optional(),
    visibility: z.nativeEnum(LabProjectVisibility).optional(),
    status: z.nativeEnum(LabProjectStatus).optional(),
    startDate: z.string().datetime().optional().nullable(),
    targetDate: z.string().datetime().optional().nullable(),
    githubUrl: safeUrlSchema.optional().or(z.literal('')),
    liveDemoUrl: safeUrlSchema.optional().or(z.literal('')),
    documentationUrl: safeUrlSchema.optional().or(z.literal('')),
    coverImage: safeUrlSchema.optional().or(z.literal('')),
    opportunityId: z.string().uuid().optional().nullable(),
    mentorId: z.string().uuid().optional().nullable(),
  }),
});

// ── 3. Team Member Management ────────────────────────────────────────────────
export const inviteMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    userId: z.string().min(1, 'Target user ID is required'),
    role: z.nativeEnum(LabTeamRole).optional().default(LabTeamRole.DEVELOPER),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    memberId: z.string().min(1),
  }),
  body: z.object({
    role: z.nativeEnum(LabTeamRole),
  }),
});

export const respondInvitationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    action: z.enum(['ACCEPT', 'DECLINE']),
  }),
});

// ── 4. Task Management ───────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(2, 'Task title is required').max(255).trim(),
    description: z.string().max(5000).trim().optional(),
    status: z.nativeEnum(LabTaskStatus).optional().default(LabTaskStatus.TODO),
    priority: z.nativeEnum(LabTaskPriority).optional().default(LabTaskPriority.MEDIUM),
    assigneeId: z.string().uuid().optional().nullable(),
    milestoneId: z.string().uuid().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    position: z.number().int().min(0).optional().default(0),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    taskId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(2).max(255).trim().optional(),
    description: z.string().max(5000).trim().optional().nullable(),
    status: z.nativeEnum(LabTaskStatus).optional(),
    priority: z.nativeEnum(LabTaskPriority).optional(),
    assigneeId: z.string().uuid().optional().nullable(),
    milestoneId: z.string().uuid().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    position: z.number().int().min(0).optional(),
  }),
});

// ── 5. Milestone Management ──────────────────────────────────────────────────
export const createMilestoneSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(2, 'Milestone title is required').max(255).trim(),
    description: z.string().max(5000).trim().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    position: z.number().int().min(0).optional().default(0),
  }),
});

export const updateMilestoneSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    milestoneId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(2).max(255).trim().optional(),
    description: z.string().max(5000).trim().optional().nullable(),
    status: z.nativeEnum(LabMilestoneStatus).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    position: z.number().int().min(0).optional(),
  }),
});

// ── 6. Discussions ───────────────────────────────────────────────────────────
export const createDiscussionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    content: z.string().min(1, 'Discussion content cannot be empty').max(10000).trim(),
    parentId: z.string().uuid().optional().nullable(),
  }),
});

// ── 7. Resources ─────────────────────────────────────────────────────────────
export const createLabResourceSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(2, 'Resource title is required').max(255).trim(),
    url: safeUrlSchema,
    type: z.string().max(50).optional().default('DOCUMENTATION'),
    learningResourceId: z.string().uuid().optional().nullable(),
  }),
});

// ── 8. Submit to Showcase ────────────────────────────────────────────────────
export const submitToShowcaseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(3).max(255).trim().optional(),
    description: z.string().min(10).trim().optional(),
    category: z.nativeEnum(ProjectCategory).optional(),
    githubUrl: safeUrlSchema.optional().or(z.literal('')),
    demoUrl: safeUrlSchema.optional().or(z.literal('')),
    imageUrls: z.array(safeUrlSchema).optional(),
  }),
});
