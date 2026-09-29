import { z } from 'zod';
import { ActivityType } from '@prisma/client';

export const listActivitySchema = z.object({
  type: z.nativeEnum(ActivityType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
