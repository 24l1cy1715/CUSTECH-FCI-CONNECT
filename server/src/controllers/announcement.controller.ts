import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  AnnouncementPriority,
  AnnouncementCategory,
  AnnouncementAudience,
  AnnouncementStatus,
  NotificationType,
} from '@prisma/client';

const generateSlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${Date.now().toString(36)}`;
};

export const announcementController = {
  // ── 1. List Announcements ───────────────────────────────────────────────────
  listAnnouncements: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { priority, category, search, page = '1', limit = '10' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {
        isActive: true,
        status: AnnouncementStatus.PUBLISHED,
      };

      if (priority) whereClause.priority = priority as AnnouncementPriority;
      if (category) whereClause.category = category as AnnouncementCategory;
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string } },
          { content: { contains: search as string } },
        ];
      }

      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where: whereClause,
          skip,
          take: limitNum,
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          include: {
            creator: {
              select: {
                id: true,
                profile: { select: { fullName: true, avatarUrl: true } },
              },
            },
            reads: userId ? { where: { userId }, select: { readAt: true } } : false,
          },
        }),
        prisma.announcement.count({ where: whereClause }),
      ]);

      const formatted = announcements.map((a) => ({
        ...a,
        isRead: Boolean(a.reads && a.reads.length > 0),
      }));

      res.json({
        success: true,
        data: {
          announcements: formatted,
          pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Get Announcement Detail & Record Read ─────────────────────────────────
  getAnnouncement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slugOrId = req.params.slugOrId as string;
      const userId = req.user?.userId;

      const announcement = await prisma.announcement.findFirst({
        where: {
          OR: [{ id: slugOrId }, { slug: slugOrId }],
        },
        include: {
          creator: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      if (!announcement) throw ApiError.notFound('Announcement not found');

      // Record view count non-blockingly
      prisma.announcement
        .update({ where: { id: announcement.id }, data: { viewsCount: { increment: 1 } } })
        .catch(() => null);

      // If authenticated, record read receipt
      if (userId) {
        await prisma.announcementRead.upsert({
          where: {
            announcementId_userId: {
              announcementId: announcement.id,
              userId,
            },
          },
          update: { readAt: new Date() },
          create: {
            announcementId: announcement.id,
            userId,
          },
        }).catch(() => null);
      }

      res.json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Create Announcement (Admin / Editor) ─────────────────────────────────
  createAnnouncement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const data = req.body;
      const slug = generateSlug(data.title);

      const announcement = await prisma.announcement.create({
        data: {
          title: data.title,
          slug,
          content: data.content,
          priority: data.priority as AnnouncementPriority || AnnouncementPriority.NORMAL,
          category: data.category as AnnouncementCategory || AnnouncementCategory.GENERAL,
          audience: data.audience as AnnouncementAudience || AnnouncementAudience.ALL,
          targetDepartment: data.targetDepartment || null,
          targetLevel: data.targetLevel || null,
          isPinned: data.isPinned || false,
          isActive: data.isActive !== undefined ? data.isActive : true,
          status: data.status as AnnouncementStatus || AnnouncementStatus.PUBLISHED,
          publishAt: data.publishAt ? new Date(data.publishAt) : new Date(),
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          createdBy: userId,
        },
      });

      // If priority is URGENT, create notifications for active users
      if (announcement.priority === AnnouncementPriority.URGENT) {
        const users = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
          take: 100, // broadcast up to 100 users safely
        });

        await prisma.notification.createMany({
          data: users.map((u) => ({
            userId: u.id,
            type: NotificationType.ANNOUNCEMENT_URGENT,
            title: `URGENT NOTICE: ${announcement.title}`,
            message: announcement.content.substring(0, 140),
            entityType: 'ANNOUNCEMENT',
            entityId: announcement.id,
          })),
        }).catch(() => null);
      }

      res.status(201).json({ success: true, message: 'Announcement created', data: announcement });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Update Announcement ──────────────────────────────────────────────────
  updateAnnouncement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = req.body;

      const updated = await prisma.announcement.update({
        where: { id },
        data: {
          ...data,
          publishAt: data.publishAt ? new Date(data.publishAt) : undefined,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        },
      });

      res.json({ success: true, message: 'Announcement updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Mark As Read ─────────────────────────────────────────────────────────
  markAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      await prisma.announcementRead.upsert({
        where: {
          announcementId_userId: {
            announcementId: id,
            userId,
          },
        },
        update: { readAt: new Date() },
        create: {
          announcementId: id,
          userId,
        },
      });

      res.json({ success: true, message: 'Announcement marked as read' });
    } catch (error) {
      next(error);
    }
  },
};

