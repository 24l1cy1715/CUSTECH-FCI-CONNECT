import { z } from 'zod';

const SkillCategoryEnum = z.enum([
  'PROGRAMMING',
  'WEB_DEVELOPMENT',
  'MOBILE_DEVELOPMENT',
  'CYBERSECURITY',
  'NETWORKING',
  'CLOUD',
  'AI_MACHINE_LEARNING',
  'DATA_SCIENCE',
  'DATABASE',
  'UI_UX',
  'GRAPHIC_DESIGN',
  'DEVOPS',
  'HARDWARE',
  'LEADERSHIP',
  'COMMUNICATION',
  'ENTREPRENEURSHIP',
  'OTHER',
]);

const SkillProficiencyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

export const skillQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: SkillCategoryEnum.optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const createSkillSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Skill name must be at least 2 characters').max(100).trim(),
    category: SkillCategoryEnum,
    description: z.string().max(1000).optional(),
  }),
});

export const addStudentSkillSchema = z.object({
  body: z.object({
    skillId: z.string().uuid('Invalid skill ID').or(z.string().min(1)),
    proficiency: SkillProficiencyEnum.default('INTERMEDIATE'),
    yearsOfExperience: z.number().int().min(0).max(40).optional(),
    isPrimary: z.boolean().default(false),
  }),
  params: z.object({
    userId: z.string().min(1),
  }),
});

export const updateStudentSkillSchema = z.object({
  body: z.object({
    proficiency: SkillProficiencyEnum.optional(),
    yearsOfExperience: z.number().int().min(0).max(40).optional(),
    isPrimary: z.boolean().optional(),
  }),
  params: z.object({
    userId: z.string().min(1),
    skillId: z.string().min(1),
  }),
});

export const deleteStudentSkillSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
    skillId: z.string().min(1),
  }),
});
