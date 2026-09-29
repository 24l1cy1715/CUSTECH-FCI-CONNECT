import { z } from 'zod';

const safeHttpsUrl = z
  .string()
  .trim()
  .refine(
    (url) => !url || /^https:\/\/[^\s$.?#].[^\s]*$/i.test(url),
    { message: 'URL must start with https:// and be a valid web address' }
  )
  .optional()
  .nullable();

export const updatePortfolioSchema = z.object({
  body: z.object({
    headline: z.string().max(255).optional().nullable(),
    location: z.string().max(100).optional().nullable(),
    portfolioBio: z.string().max(3000).optional().nullable(),
    visibility: z.enum(['PUBLIC', 'FCI_ONLY', 'PRIVATE']).optional(),
    githubUrl: safeHttpsUrl,
    linkedinUrl: safeHttpsUrl,
    portfolioUrl: safeHttpsUrl,
    customSections: z
      .object({
        showSkills: z.boolean().optional(),
        showProjects: z.boolean().optional(),
        showAchievements: z.boolean().optional(),
        showExperience: z.boolean().optional(),
        showContact: z.boolean().optional(),
        featuredSkillIds: z.array(z.string().uuid()).optional(),
        featuredProjectIds: z.array(z.string().uuid()).optional(),
      })
      .optional()
      .nullable(),
  }),
});

export const portfolioConnectRequestSchema = z.object({
  body: z.object({
    senderName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    senderEmail: z.string().email('Valid email is required'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
    subject: z.string().max(150).optional(),
  }),
});

export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>['body'];
export type PortfolioConnectInput = z.infer<typeof portfolioConnectRequestSchema>['body'];
