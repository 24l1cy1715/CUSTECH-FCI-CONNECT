import { z } from 'zod';
import { CampusLocationCategory } from '@prisma/client';

const categoryEnum = z.nativeEnum(CampusLocationCategory);

export const createLocationSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  category: categoryEnum,
  building: z.string().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(500).optional(),
  floor: z.string().max(50).optional(),
  room: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  openingHours: z.record(z.string()).optional(),
  imageUrl: z.string().url().max(500).optional(),
});

export const updateLocationSchema = createLocationSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export const listLocationsSchema = z.object({
  category: categoryEnum.optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
