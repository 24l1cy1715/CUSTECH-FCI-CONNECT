import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  CommunityCategory,
  CommunityVisibility,
  CommunityStatus,
  CommunityMemberRole,
  CommunityMembershipStatus,
  NotificationType,
  ReportEntityType,
  ReportReason,
} from '@prisma/client';
import { ActivityService } from '../services/activity.service';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const communityController = {
  // ── 1. List Communities ──────────────────────────────────────────────────────
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
      const search = (req.query.search as string)?.trim();
      const category = req.query.category as CommunityCategory | undefined;
      const visibility = req.query.visibility as CommunityVisibility | undefined;
      const featured = req.query.featured === 'true';
      const currentUserId = req.user?.userId;

      const where: any = {
        status: CommunityStatus.ACTIVE,
      };

      if (category && Object.values(CommunityCategory).includes(category)) {
        where.category = category;
      }

      if (visibility && Object.values(CommunityVisibility).includes(visibility)) {
        where.visibility = visibility;
      } else {
        // By default, public list hides private communities unless viewer is a member
        where.visibility = { in: [CommunityVisibility.PUBLIC, CommunityVisibility.FCI_ONLY] };
      }

      if (featured) {
        where.isFeatured = true;
      }

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { slug: { contains: search } },
        ];
      }

      const [total, communities] = await Promise.all([
        prisma.community.count({ where }),
        prisma.community.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          include: {
            owner: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                members: { where: { status: CommunityMembershipStatus.ACTIVE } },
                posts: { where: { isHidden: false } },
                projects: true,
                events: true,
              },
            },
            members: currentUserId
              ? {
                  where: { userId: currentUserId },
                  select: { role: true, status: true },
                }
              : false,
          },
        }),
      ]);

      const items = communities.map((c) => {
        const userMembership = currentUserId && (c as any).members?.[0];
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          category: c.category,
          logo: c.logo,
          coverImage: c.coverImage,
          ownerId: c.ownerId,
          visibility: c.visibility,
          status: c.status,
          isFeatured: c.isFeatured,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          owner: {
            id: c.owner.id,
            fullName: c.owner.profile?.fullName,
            username: c.owner.profile?.username,
            avatarUrl: c.owner.profile?.avatarUrl,
          },
          memberCount: c._count.members,
          postCount: c._count.posts,
          projectCount: c._count.projects,
          eventCount: c._count.events,
          userMembership: userMembership
            ? {
                role: userMembership.role,
                status: userMembership.status,
                isMember: userMembership.status === CommunityMembershipStatus.ACTIVE,
              }
            : null,
        };
      });

      res.json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Get Single Community by Slug ──────────────────────────────────────────
  getBySlug: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const currentUserId = req.user?.userId;

      const community = await prisma.community.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
        },
        include: {
          owner: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                  department: true,
                },
              },
            },
          },
          members: {
            where: {
              status: CommunityMembershipStatus.ACTIVE,
              role: { in: [CommunityMemberRole.OWNER, CommunityMemberRole.ADMIN, CommunityMemberRole.MODERATOR] },
            },
            include: {
              user: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      fullName: true,
                      username: true,
                      avatarUrl: true,
                      department: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              members: { where: { status: CommunityMembershipStatus.ACTIVE } },
              posts: { where: { isHidden: false } },
              projects: true,
              events: true,
              resources: true,
            },
          },
        },
      });

      if (!community) {
        throw ApiError.notFound('Community not found');
      }

      // Check user membership if logged in
      let userMembership = null;
      if (currentUserId) {
        userMembership = await prisma.communityMembership.findUnique({
          where: {
            communityId_userId: {
              communityId: community.id,
              userId: currentUserId,
            },
          },
        });
      }

      // Visibility check: If PRIVATE, user must be active member or platform admin
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');
      if (
        community.visibility === CommunityVisibility.PRIVATE &&
        userMembership?.status !== CommunityMembershipStatus.ACTIVE &&
        !isPlatformAdmin
      ) {
        throw ApiError.forbidden('This is a private community accessible only to approved members');
      }

      res.json({
        success: true,
        data: {
          ...community,
          leadership: community.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            fullName: m.user.profile?.fullName,
            username: m.user.profile?.username,
            avatarUrl: m.user.profile?.avatarUrl,
            department: m.user.profile?.department,
          })),
          memberCount: community._count.members,
          postCount: community._count.posts,
          projectCount: community._count.projects,
          eventCount: community._count.events,
          resourceCount: community._count.resources,
          userMembership: userMembership
            ? {
                id: userMembership.id,
                role: userMembership.role,
                status: userMembership.status,
                joinedAt: userMembership.joinedAt,
                isMember: userMembership.status === CommunityMembershipStatus.ACTIVE,
                isManager: [
                  CommunityMemberRole.OWNER,
                  CommunityMemberRole.ADMIN,
                  CommunityMemberRole.MODERATOR,
                ].includes(userMembership.role as any),
              }
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Create Community ──────────────────────────────────────────────────────
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name, description, category, logo, coverImage, visibility } = req.body;

      let baseSlug = slugify(name);
      if (!baseSlug) baseSlug = 'community';
      let slug = baseSlug;
      let counter = 1;

      while (await prisma.community.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const community = await prisma.$transaction(async (tx) => {
        const created = await tx.community.create({
          data: {
            name,
            slug,
            description,
            category: category || CommunityCategory.OTHER,
            logo: logo || null,
            coverImage: coverImage || null,
            visibility: visibility || CommunityVisibility.PUBLIC,
            ownerId: userId,
          },
        });

        await tx.communityMembership.create({
          data: {
            communityId: created.id,
            userId,
            role: CommunityMemberRole.OWNER,
            status: CommunityMembershipStatus.ACTIVE,
          },
        });

        return created;
      });

      // Emit Live Activity item (only if public/FCI)
      if (community.visibility !== CommunityVisibility.PRIVATE) {
        ActivityService.onCommunityCreated(userId, community.id, community.name, community.logo || undefined).catch(
          (err) => console.error('Failed to broadcast community activity:', err)
        );
      }

      res.status(201).json({
        success: true,
        message: 'Community created successfully',
        data: community,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Update Community ──────────────────────────────────────────────────────
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const community = await prisma.community.findUnique({
        where: { id },
        include: {
          members: {
            where: {
              userId,
              role: { in: [CommunityMemberRole.OWNER, CommunityMemberRole.ADMIN] },
              status: CommunityMembershipStatus.ACTIVE,
            },
          },
        },
      });

      if (!community) {
        throw ApiError.notFound('Community not found');
      }

      if (!isPlatformAdmin && community.ownerId !== userId && community.members.length === 0) {
        throw ApiError.forbidden('You do not have permission to manage this community');
      }

      const { name, description, category, logo, coverImage, visibility, status, isFeatured } = req.body;

      const data: any = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (category !== undefined) data.category = category;
      if (logo !== undefined) data.logo = logo || null;
      if (coverImage !== undefined) data.coverImage = coverImage || null;
      if (visibility !== undefined) data.visibility = visibility;
      if (status !== undefined && isPlatformAdmin) data.status = status;
      if (isFeatured !== undefined && isPlatformAdmin) data.isFeatured = isFeatured;

      const updated = await prisma.community.update({
        where: { id },
        data,
      });

      res.json({
        success: true,
        message: 'Community updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Join Community ────────────────────────────────────────────────────────
  join: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;

      const community = await prisma.community.findUnique({ where: { id } });
      if (!community) {
        throw ApiError.notFound('Community not found');
      }

      if (community.status !== CommunityStatus.ACTIVE) {
        throw ApiError.badRequest('This community is currently inactive or suspended');
      }

      const existing = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      if (existing) {
        if (existing.status === CommunityMembershipStatus.BANNED) {
          throw ApiError.forbidden('You have been banned from this community');
        }
        if (existing.status === CommunityMembershipStatus.ACTIVE) {
          return res.json({
            success: true,
            message: 'You are already an active member of this community',
            data: existing,
          });
        }
        if (existing.status === CommunityMembershipStatus.PENDING) {
          return res.json({
            success: true,
            message: 'Your membership request is pending approval by community managers',
            data: existing,
          });
        }
        // If status was LEFT, rejoin
        const rejoined = await prisma.communityMembership.update({
          where: { id: existing.id },
          data: {
            status:
              community.visibility === CommunityVisibility.PRIVATE
                ? CommunityMembershipStatus.PENDING
                : CommunityMembershipStatus.ACTIVE,
            role: CommunityMemberRole.MEMBER,
          },
        });
        return res.json({
          success: true,
          message:
            community.visibility === CommunityVisibility.PRIVATE
              ? 'Membership request submitted'
              : 'Welcome back! You have rejoined the community',
          data: rejoined,
        });
      }

      const initialStatus =
        community.visibility === CommunityVisibility.PRIVATE
          ? CommunityMembershipStatus.PENDING
          : CommunityMembershipStatus.ACTIVE;

      const membership = await prisma.communityMembership.create({
        data: {
          communityId: id,
          userId,
          role: CommunityMemberRole.MEMBER,
          status: initialStatus,
        },
      });

      res.status(201).json({
        success: true,
        message:
          initialStatus === CommunityMembershipStatus.PENDING
            ? 'Membership request submitted for review'
            : 'Successfully joined community',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 6. Leave Community ───────────────────────────────────────────────────────
  leave: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;

      const community = await prisma.community.findUnique({ where: { id } });
      if (!community) {
        throw ApiError.notFound('Community not found');
      }

      if (community.ownerId === userId) {
        throw ApiError.badRequest(
          'As the community owner, you must transfer ownership before leaving the community'
        );
      }

      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      if (!membership || membership.status === CommunityMembershipStatus.LEFT) {
        throw ApiError.badRequest('You are not currently an active member of this community');
      }

      await prisma.communityMembership.update({
        where: { id: membership.id },
        data: { status: CommunityMembershipStatus.LEFT },
      });

      res.json({
        success: true,
        message: 'You have left the community',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 7. Get Members ───────────────────────────────────────────────────────────
  getMembers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = (req.query.search as string)?.trim();
      const role = req.query.role as CommunityMemberRole | undefined;

      const where: any = {
        communityId: id,
        status: CommunityMembershipStatus.ACTIVE,
      };

      if (role && Object.values(CommunityMemberRole).includes(role)) {
        where.role = role;
      }

      if (search) {
        where.user = {
          profile: {
            OR: [
              { fullName: { contains: search } },
              { username: { contains: search } },
            ],
          },
        };
      }

      const [total, members] = await Promise.all([
        prisma.communityMembership.count({ where }),
        prisma.communityMembership.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                    department: true,
                    level: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          members,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 8. Manage Member Role & Moderation ───────────────────────────────────────
  updateMember: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const targetUserId = req.params.userId as string;
      const currentUserId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const community = await prisma.community.findUnique({ where: { id } });
      if (!community) throw ApiError.notFound('Community not found');

      // Check requester permissions
      const requesterMembership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId: currentUserId } },
      });

      const isOwner = community.ownerId === currentUserId;
      const isCommunityAdmin = requesterMembership?.role === CommunityMemberRole.ADMIN;

      if (!isPlatformAdmin && !isOwner && !isCommunityAdmin) {
        throw ApiError.forbidden('Only community owners or admins can manage member permissions');
      }

      if (targetUserId === community.ownerId && !isPlatformAdmin) {
        throw ApiError.forbidden('Cannot alter the status or role of the community owner');
      }

      const targetMembership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId: targetUserId } },
      });

      if (!targetMembership) {
        throw ApiError.notFound('Membership record not found');
      }

      const { role, status } = req.body;
      const data: any = {};
      if (role && Object.values(CommunityMemberRole).includes(role)) {
        if (role === CommunityMemberRole.OWNER && !isOwner && !isPlatformAdmin) {
          throw ApiError.forbidden('Only the current owner or platform admin can transfer ownership');
        }
        data.role = role;
      }
      if (status && Object.values(CommunityMembershipStatus).includes(status)) {
        data.status = status;
      }

      const updated = await prisma.communityMembership.update({
        where: { id: targetMembership.id },
        data,
      });

      // Send moderation notification
      if (status === CommunityMembershipStatus.BANNED) {
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            type: NotificationType.COMMUNITY_MODERATION,
            title: `Membership suspended in ${community.name}`,
            message: `Your membership in ${community.name} has been suspended by community managers.`,
            entityType: 'community',
            entityId: community.id,
          },
        });
      }

      res.json({
        success: true,
        message: 'Member permissions updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 9. Get Discussions / Posts ───────────────────────────────────────────────
  getPosts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const announcementsOnly = req.query.announcements === 'true';
      const currentUserId = req.user?.userId;

      const where: any = {
        communityId: id,
        isHidden: false,
      };

      if (announcementsOnly) {
        where.isAnnouncement = true;
      }

      const [total, posts] = await Promise.all([
        prisma.communityPost.count({ where }),
        prisma.communityPost.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          include: {
            author: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                    department: true,
                  },
                },
              },
            },
            likes: currentUserId
              ? {
                  where: { userId: currentUserId },
                  select: { id: true },
                }
              : false,
          },
        }),
      ]);

      res.json({
        success: true,
        data: posts.map((p) => ({
          id: p.id,
          communityId: p.communityId,
          title: p.title,
          content: p.content,
          isAnnouncement: p.isAnnouncement,
          isPinned: p.isPinned,
          likesCount: p.likesCount,
          commentsCount: p.commentsCount,
          _count: {
            likes: p.likesCount,
            comments: p.commentsCount,
          },
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          author: {
            id: p.author.id,
            fullName: p.author.profile?.fullName,
            username: p.author.profile?.username,
            avatarUrl: p.author.profile?.avatarUrl,
            department: p.author.profile?.department,
          },
          hasLiked: currentUserId ? (p as any).likes?.length > 0 : false,
          isLiked: currentUserId ? (p as any).likes?.length > 0 : false,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 10. Create Post ──────────────────────────────────────────────────────────
  createPost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { title, content, isAnnouncement, isPinned } = req.body;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const community = await prisma.community.findUnique({ where: { id } });
      if (!community) throw ApiError.notFound('Community not found');

      // Check membership
      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      if (!isPlatformAdmin && (!membership || membership.status !== CommunityMembershipStatus.ACTIVE)) {
        throw ApiError.forbidden('You must be an active member to post in this community');
      }

      const isManager =
        isPlatformAdmin ||
        membership?.role === CommunityMemberRole.OWNER ||
        membership?.role === CommunityMemberRole.ADMIN ||
        membership?.role === CommunityMemberRole.MODERATOR;

      if ((isAnnouncement || isPinned) && !isManager) {
        throw ApiError.forbidden('Only community managers can create announcements or pin posts');
      }

      const post = await prisma.communityPost.create({
        data: {
          communityId: id,
          authorId: userId,
          title: title || null,
          content,
          isAnnouncement: !!isAnnouncement,
          isPinned: !!isPinned,
        },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                  department: true,
                },
              },
            },
          },
        },
      });

      // If announcement, notify active members
      if (isAnnouncement) {
        const members = await prisma.communityMembership.findMany({
          where: {
            communityId: id,
            status: CommunityMembershipStatus.ACTIVE,
            userId: { not: userId },
          },
          select: { userId: true },
          take: 100, // safety cap
        });

        if (members.length > 0) {
          const notifications = members.map((m) => ({
            userId: m.userId,
            type: NotificationType.COMMUNITY_ANNOUNCEMENT,
            title: `New announcement in ${community.name}`,
            message: title || content.slice(0, 120),
            entityType: 'community',
            entityId: community.id,
          }));
          await prisma.notification.createMany({ data: notifications }).catch(() => {});
        }
      }

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: {
          ...post,
          hasLiked: false,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 11. Delete Post ──────────────────────────────────────────────────────────
  deletePost: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const postId = req.params.postId as string;
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
        include: {
          community: true,
        },
      });

      if (!post || post.communityId !== id) {
        throw ApiError.notFound('Post not found');
      }

      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      const isManager =
        isPlatformAdmin ||
        membership?.role === CommunityMemberRole.OWNER ||
        membership?.role === CommunityMemberRole.ADMIN ||
        membership?.role === CommunityMemberRole.MODERATOR;

      if (post.authorId !== userId && !isManager) {
        throw ApiError.forbidden('You do not have permission to delete this post');
      }

      await prisma.communityPost.delete({ where: { id: postId } });

      res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 12. Toggle Like ──────────────────────────────────────────────────────────
  toggleLike: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const postId = req.params.postId as string;
      const userId = req.user!.userId;

      const post = await prisma.communityPost.findUnique({ where: { id: postId } });
      if (!post || post.communityId !== id) {
        throw ApiError.notFound('Post not found');
      }

      const existingLike = await prisma.communityPostLike.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      let liked = false;
      if (existingLike) {
        await prisma.$transaction([
          prisma.communityPostLike.delete({ where: { id: existingLike.id } }),
          prisma.communityPost.update({
            where: { id: postId },
            data: { likesCount: { decrement: 1 } },
          }),
        ]);
        liked = false;
      } else {
        await prisma.$transaction([
          prisma.communityPostLike.create({ data: { postId, userId } }),
          prisma.communityPost.update({
            where: { id: postId },
            data: { likesCount: { increment: 1 } },
          }),
        ]);
        liked = true;
      }

      const updatedPost = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { likesCount: true },
      });

      res.json({
        success: true,
        data: {
          liked,
          likesCount: updatedPost?.likesCount ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 13. Comments ─────────────────────────────────────────────────────────────
  getComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const postId = req.params.postId as string;

      const comments = await prisma.communityPostComment.findMany({
        where: { postId, isHidden: false, post: { communityId: id } },
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                  department: true,
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        data: comments.map((c) => ({
          id: c.id,
          postId: c.postId,
          content: c.content,
          createdAt: c.createdAt,
          author: {
            id: c.author.id,
            fullName: c.author.profile?.fullName,
            username: c.author.profile?.username,
            avatarUrl: c.author.profile?.avatarUrl,
            department: c.author.profile?.department,
          },
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  createComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const postId = req.params.postId as string;
      const userId = req.user!.userId;
      const { content } = req.body;

      const post = await prisma.communityPost.findUnique({ where: { id: postId } });
      if (!post || post.communityId !== id) {
        throw ApiError.notFound('Post not found');
      }

      const [comment] = await prisma.$transaction([
        prisma.communityPostComment.create({
          data: {
            postId,
            authorId: userId,
            content,
          },
          include: {
            author: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                    department: true,
                  },
                },
              },
            },
          },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { commentsCount: { increment: 1 } },
        }),
      ]);

      res.status(201).json({
        success: true,
        message: 'Comment added',
        data: {
          id: comment.id,
          postId: comment.postId,
          content: comment.content,
          createdAt: comment.createdAt,
          author: {
            id: comment.author.id,
            fullName: comment.author.profile?.fullName,
            username: comment.author.profile?.username,
            avatarUrl: comment.author.profile?.avatarUrl,
            department: comment.author.profile?.department,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  deleteComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const postId = req.params.postId as string;
      const commentId = req.params.commentId as string;
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const comment = await prisma.communityPostComment.findUnique({
        where: { id: commentId },
        include: { post: true },
      });

      if (!comment || comment.postId !== postId || comment.post.communityId !== id) {
        throw ApiError.notFound('Comment not found');
      }

      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      const isManager =
        isPlatformAdmin ||
        membership?.role === CommunityMemberRole.OWNER ||
        membership?.role === CommunityMemberRole.ADMIN ||
        membership?.role === CommunityMemberRole.MODERATOR;

      if (comment.authorId !== userId && comment.post.authorId !== userId && !isManager) {
        throw ApiError.forbidden('You do not have permission to delete this comment');
      }

      await prisma.$transaction([
        prisma.communityPostComment.delete({ where: { id: commentId } }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { commentsCount: { decrement: 1 } },
        }),
      ]);

      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 14. Resources ────────────────────────────────────────────────────────────
  getResources: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const resources = await prisma.communityResource.findMany({
        where: { communityId: id },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        data: resources.map((r: any) => ({
          id: r.id,
          communityId: r.communityId,
          title: r.title,
          description: r.description,
          url: r.url,
          type: r.type,
          createdAt: r.createdAt,
          creator: {
            id: r.creator?.id,
            fullName: r.creator?.profile?.fullName,
            username: r.creator?.profile?.username,
            avatarUrl: r.creator?.profile?.avatarUrl,
          },
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  createResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { title, description, url, type } = req.body;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      const isManager =
        isPlatformAdmin ||
        membership?.role === CommunityMemberRole.OWNER ||
        membership?.role === CommunityMemberRole.ADMIN ||
        membership?.role === CommunityMemberRole.MODERATOR;

      if (!isManager) {
        throw ApiError.forbidden('Only community managers can publish resources');
      }

      const resource = await prisma.communityResource.create({
        data: {
          communityId: id,
          title,
          description: description || null,
          url,
          type: type || 'ARTICLE',
          createdById: userId,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Resource published successfully',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const resourceId = req.params.resourceId as string;
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const resource = await prisma.communityResource.findUnique({ where: { id: resourceId } });
      if (!resource || resource.communityId !== id) {
        throw ApiError.notFound('Resource not found');
      }

      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      const isManager =
        isPlatformAdmin ||
        membership?.role === CommunityMemberRole.OWNER ||
        membership?.role === CommunityMemberRole.ADMIN;

      if (resource.createdById !== userId && !isManager) {
        throw ApiError.forbidden('You do not have permission to delete this resource');
      }

      await prisma.communityResource.delete({ where: { id: resourceId } });

      res.json({
        success: true,
        message: 'Resource deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 15. Projects ─────────────────────────────────────────────────────────────
  getProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const projects = await prisma.project.findMany({
        where: { communityId: id, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          images: { take: 1, orderBy: { orderIndex: 'asc' } },
          skills: { include: { skill: true } },
          projectTechnologies: { include: { technology: true } },
        },
      });

      res.json({
        success: true,
        data: projects.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          category: p.category,
          views: p.views,
          coverImage: p.images[0]?.url || null,
          githubUrl: p.githubUrl,
          demoUrl: p.demoUrl,
          createdAt: p.createdAt,
          author: {
            id: p.author.id,
            fullName: p.author.profile?.fullName,
            username: p.author.profile?.username,
            avatarUrl: p.author.profile?.avatarUrl,
          },
          technologies: p.projectTechnologies.map((t: any) => t.technology.name),
          skills: p.skills.map((s: any) => s.skill.name),
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  associateProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const projectId = (req.params.projectId || req.body?.projectId) as string;
      if (!projectId) throw ApiError.badRequest('Project ID is required');
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) throw ApiError.notFound('Project not found');

      const community = await prisma.community.findUnique({ where: { id } });
      if (!community) throw ApiError.notFound('Community not found');

      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      const isManager =
        isPlatformAdmin ||
        membership?.role === CommunityMemberRole.OWNER ||
        membership?.role === CommunityMemberRole.ADMIN;

      // Either project author or community manager can link
      if (project.authorId !== userId && !isManager) {
        throw ApiError.forbidden('Only project author or community managers can link projects');
      }

      const updated = await prisma.project.update({
        where: { id: projectId },
        data: { communityId: id },
      });

      res.json({
        success: true,
        message: 'Project linked to community',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 16. Events ───────────────────────────────────────────────────────────────
  getEvents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const events = await prisma.event.findMany({
        where: { communityId: id },
        orderBy: { date: 'asc' },
        include: {
          organizer: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: { select: { registrations: true } },
        },
      });

      res.json({
        success: true,
        data: events.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          eventType: e.eventType,
          date: e.date,
          endDate: e.endDate,
          location: e.location,
          coverImage: e.coverImage,
          status: e.status,
          attendeeCount: e._count.registrations,
          organizer: {
            id: e.organizer.id,
            fullName: e.organizer.profile?.fullName,
            username: e.organizer.profile?.username,
          },
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  associateEvent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const eventId = (req.params.eventId || req.body?.eventId) as string;
      if (!eventId) throw ApiError.badRequest('Event ID is required');
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) throw ApiError.notFound('Event not found');

      const community = await prisma.community.findUnique({ where: { id } });
      if (!community) throw ApiError.notFound('Community not found');

      const membership = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId: id, userId } },
      });

      const isManager =
        isPlatformAdmin ||
        membership?.role === CommunityMemberRole.OWNER ||
        membership?.role === CommunityMemberRole.ADMIN;

      if (event.organizerId !== userId && !isManager) {
        throw ApiError.forbidden('Only event organizer or community managers can link events');
      }

      const updated = await prisma.event.update({
        where: { id: eventId },
        data: { communityId: id },
      });

      res.json({
        success: true,
        message: 'Event linked to community',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 17. Reports ──────────────────────────────────────────────────────────────
  createReport: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const reporterId = req.user!.userId;
      const { reason, description, postId } = req.body;

      const report = await prisma.report.create({
        data: {
          reporterId,
          entityType: postId ? ReportEntityType.COMMUNITY_POST : ReportEntityType.COMMUNITY,
          entityId: postId || id,
          reason,
          description: description || null,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Report filed successfully and queued for administrative review',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },
};

