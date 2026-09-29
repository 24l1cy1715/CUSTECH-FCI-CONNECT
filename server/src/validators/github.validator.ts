import { z } from 'zod';

export const connectGithubSchema = z.object({
  githubUsername: z
    .string()
    .min(1, 'GitHub username is required')
    .max(100)
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid GitHub username format'),
});

export const updateGithubPrivacySchema = z.object({
  showOnProfile: z.boolean().optional(),
  showRepositories: z.boolean().optional(),
  showActivity: z.boolean().optional(),
});
