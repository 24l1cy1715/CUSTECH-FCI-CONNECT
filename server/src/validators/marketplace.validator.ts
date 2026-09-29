import { z } from 'zod';

const safeUrlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  );

export const createMarketplaceServiceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(2, 'Category is required'),
  skills: z.array(z.string()).optional(),
  pricingType: z.enum(['FIXED', 'HOURLY', 'NEGOTIABLE', 'CONTACT_FOR_PRICE']).default('FIXED'),
  startingPrice: z.number().int().min(0).optional(),
  deliveryDays: z.number().int().min(1).max(365).optional(),
  coverImage: safeUrlSchema.optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
});

export const updateMarketplaceServiceSchema = createMarketplaceServiceSchema.partial();

export const createMarketplaceInquirySchema = z.object({
  message: z.string().min(5, 'Message must be at least 5 characters'),
  requirements: z.string().optional(),
  budget: z.number().int().min(0).optional(),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_DISCUSSION', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED']),
});
