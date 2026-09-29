import { z } from 'zod';

export const analyzeProjectSchema = z.object({
  body: z.object({
    projectTitle: z.string().max(255).trim().optional(),
    description: z.string().min(5, 'Description must be at least 5 characters').max(3000).trim(),
  }),
});

export const findMatchesSchema = z.object({
  body: z.object({
    projectTitle: z.string().min(2, 'Project title is required').max(255).trim(),
    description: z.string().max(3000).optional(),
    requiredSkills: z.array(z.string().min(1)).optional(),
    preferredSkills: z.array(z.string().min(1)).optional().default([]),
    skills: z
      .array(
        z.object({
          skillId: z.string().optional(),
          skillName: z.string().min(1),
          priority: z.enum(['REQUIRED', 'PREFERRED']).optional(),
          minProficiency: z.string().optional(),
        }),
      )
      .optional(),
    targetRoles: z.array(z.string().min(1)).optional().default([]),
    preferredDepartment: z.string().optional(),
    department: z.string().optional(),
    preferredLevel: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional().default(20),
  }),
});

export const createInvitationSchema = z.object({
  body: z.object({
    receiverId: z.string().optional(),
    recipientId: z.string().optional(),
    projectId: z.string().optional(),
    teamId: z.string().optional(),
    projectTitle: z.string().max(255).optional(),
    role: z.string().min(2, 'Role is required').max(100),
    message: z.string().max(1000).optional(),
  }),
});

export const updateInvitationSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'DECLINED']),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
