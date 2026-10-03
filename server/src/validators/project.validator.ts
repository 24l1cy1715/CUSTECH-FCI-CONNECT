import { z } from 'zod';

const safeUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  );

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  githubUrl: safeUrlSchema.optional().or(z.literal('')),
  demoUrl: safeUrlSchema.optional().or(z.literal('')),
  technologies: z.array(z.string().min(1)).optional(),
  images: z.array(safeUrlSchema).optional(),
});
