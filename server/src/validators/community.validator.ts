import { z } from 'zod';
import {
  CommunityCategory,
  CommunityVisibility,
  CommunityStatus,
  CommunityMemberRole,
  CommunityMembershipStatus,
  CommunityResourceType,
  ReportReason,
} from '@prisma/client';

export const safeUrlSchema = z.string().trim().refine(
  (val) => {
    if (!val) return true;
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'Must be a valid URL with http or https protocol' }
);

export const createCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255).trim(),
    description: z.string().max(5000).optional(),
    category: z.nativeEnum(CommunityCategory).optional().default(CommunityCategory.OTHER),
    logo: safeUrlSchema.optional().or(z.literal('')),
    coverImage: safeUrlSchema.optional().or(z.literal('')),
    visibility: z.nativeEnum(CommunityVisibility).optional().default(CommunityVisibility.PUBLIC),
  }),
});

export const updateCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255).trim().optional(),
    description: z.string().max(5000).optional(),
    category: z.nativeEnum(CommunityCategory).optional(),
    logo: safeUrlSchema.optional().or(z.literal('')),
    coverImage: safeUrlSchema.optional().or(z.literal('')),
    visibility: z.nativeEnum(CommunityVisibility).optional(),
    status: z.nativeEnum(CommunityStatus).optional(),
    isFeatured: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().max(255).trim().optional(),
    content: z.string().min(1, 'Post content is required').max(10000).trim(),
    isAnnouncement: z.boolean().optional().default(false),
    isPinned: z.boolean().optional().default(false),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000).trim(),
  }),
  params: z.object({
    id: z.string().min(1),
    postId: z.string().min(1),
  }),
});

export const createResourceSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required').max(255).trim(),
    description: z.string().max(1000).optional(),
    url: safeUrlSchema,
    type: z.nativeEnum(CommunityResourceType).optional().default(CommunityResourceType.ARTICLE),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(CommunityMemberRole).optional(),
    status: z.nativeEnum(CommunityMembershipStatus).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    reason: z.nativeEnum(ReportReason),
    description: z.string().max(2000).optional(),
    postId: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});
