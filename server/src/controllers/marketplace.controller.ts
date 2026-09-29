import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  ServiceStatus,
  ServicePricingType,
  InquiryStatus,
  NotificationType,
  ActivityType,
  ActivityVisibility,
} from '@prisma/client';
import { createActivity } from '../services/activity.service';

const generateSlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${Date.now().toString(36)}`;
};

export const marketplaceController = {
  // ── 1. List Services ────────────────────────────────────────────────────────
  listServices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, pricingType, search, page = '1', limit = '12' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = { status: ServiceStatus.ACTIVE };
      if (category) whereClause.category = category as string;
      if (pricingType) whereClause.pricingType = pricingType as ServicePricingType;
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
        ];
      }

      const [services, total] = await Promise.all([
        prisma.marketplaceService.findMany({
          where: whereClause,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: {
                id: true,
                profile: {
                  select: { username: true, fullName: true, avatarUrl: true, department: true },
                },
              },
            },
            _count: { select: { inquiries: true } },
          },
        }),
        prisma.marketplaceService.count({ where: whereClause }),
      ]);

      res.json({
        success: true,
        data: {
          services,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Create Service ───────────────────────────────────────────────────────
  createService: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const data = req.body;
      const slug = generateSlug(data.title);

      const service = await prisma.marketplaceService.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          category: data.category,
          skills: data.skills || [],
          ownerId: userId,
          pricingType: data.pricingType as ServicePricingType || ServicePricingType.FIXED,
          startingPrice: data.startingPrice !== undefined ? data.startingPrice : null,
          deliveryDays: data.deliveryDays !== undefined ? data.deliveryDays : null,
          coverImage: data.coverImage || null,
          status: ServiceStatus.ACTIVE,
        },
        include: {
          owner: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      // Post activity feed
      await createActivity({
        actorId: userId,
        type: ActivityType.MARKETPLACE_SERVICE_POSTED,
        entityType: 'MARKETPLACE',
        title: `Offered new service: "${service.title}"`,
        description: service.description.substring(0, 150),
        entityId: service.id,
        visibility: ActivityVisibility.PUBLIC,
      }).catch(() => null);

      res.status(201).json({ success: true, message: 'Service listed successfully', data: service });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Get Service Detail ───────────────────────────────────────────────────
  getService: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slugOrId = req.params.slugOrId as string;

      const service = await prisma.marketplaceService.findFirst({
        where: {
          OR: [{ id: slugOrId }, { slug: slugOrId }],
        },
        include: {
          owner: {
            select: {
              id: true,
              profile: {
                select: {
                  username: true,
                  fullName: true,
                  avatarUrl: true,
                  department: true,
                  bio: true,
                  githubUrl: true,
                  portfolioUrl: true,
                },
              },
            },
          },
          _count: { select: { inquiries: true } },
        },
      });

      if (!service) throw ApiError.notFound('Service not found');

      // Increment views count non-blockingly
      prisma.marketplaceService
        .update({ where: { id: service.id }, data: { viewsCount: { increment: 1 } } })
        .catch(() => null);

      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Update Service ───────────────────────────────────────────────────────
  updateService: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const existing = await prisma.marketplaceService.findUnique({ where: { id } });
      if (!existing) throw ApiError.notFound('Service not found');
      if (existing.ownerId !== userId) {
        throw ApiError.forbidden('Only the service provider can edit this listing');
      }

      const {
        title,
        description,
        category,
        skills,
        pricingType,
        startingPrice,
        deliveryDays,
        coverImage,
      } = req.body;

      const updated = await prisma.marketplaceService.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          category: category !== undefined ? category : undefined,
          skills: skills !== undefined ? skills : undefined,
          pricingType: pricingType !== undefined ? pricingType : undefined,
          startingPrice: startingPrice !== undefined ? startingPrice : undefined,
          deliveryDays: deliveryDays !== undefined ? deliveryDays : undefined,
          coverImage: coverImage !== undefined ? coverImage : undefined,
        },
      });

      res.json({ success: true, message: 'Service updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Inquiries ────────────────────────────────────────────────────────────
  createInquiry: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.userId;
      if (!clientId) throw ApiError.unauthorized('Authentication required');

      const serviceId = req.params.serviceId as string;
      const { message, requirements, budget } = req.body;

      const service = await prisma.marketplaceService.findUnique({ where: { id: serviceId } });
      if (!service) throw ApiError.notFound('Service not found');
      if (service.ownerId === clientId) {
        throw ApiError.badRequest('You cannot send an inquiry for your own service');
      }

      const inquiry = await prisma.marketplaceInquiry.create({
        data: {
          serviceId,
          clientId,
          message,
          requirements: requirements || null,
          budget: budget || null,
          status: InquiryStatus.NEW,
        },
        include: {
          client: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      // Notify seller
      await prisma.notification.create({
        data: {
          userId: service.ownerId,
          type: NotificationType.MARKETPLACE_INQUIRY,
          title: `New Service Inquiry: ${service.title}`,
          message: `A client inquired about your service: "${message.substring(0, 100)}"`,
          entityType: 'MARKETPLACE',
          entityId: inquiry.id,
        },
      }).catch(() => null);

      res.status(201).json({ success: true, message: 'Inquiry sent to provider', data: inquiry });
    } catch (error) {
      next(error);
    }
  },

  listMyInquiries: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const { role = 'seller' } = req.query; // 'seller' | 'buyer'

      let inquiries;
      if (role === 'buyer') {
        inquiries = await prisma.marketplaceInquiry.findMany({
          where: { clientId: userId },
          orderBy: { createdAt: 'desc' },
          include: {
            service: {
              select: {
                id: true,
                title: true,
                slug: true,
                owner: {
                  select: { profile: { select: { fullName: true, avatarUrl: true } } },
                },
              },
            },
          },
        });
      } else {
        inquiries = await prisma.marketplaceInquiry.findMany({
          where: { service: { ownerId: userId } },
          orderBy: { createdAt: 'desc' },
          include: {
            client: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, avatarUrl: true } },
              },
            },
            service: { select: { id: true, title: true, slug: true } },
          },
        });
      }

      res.json({ success: true, data: inquiries });
    } catch (error) {
      next(error);
    }
  },

  updateInquiryStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const inquiryId = req.params.inquiryId as string;
      const { status } = req.body;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const inquiry = await prisma.marketplaceInquiry.findUnique({
        where: { id: inquiryId },
        include: { service: true },
      });
      if (!inquiry) throw ApiError.notFound('Inquiry not found');

      // Either service owner or client can update status
      if (inquiry.service.ownerId !== userId && inquiry.clientId !== userId) {
        throw ApiError.forbidden('Unauthorized to update this inquiry');
      }

      const updated = await prisma.marketplaceInquiry.update({
        where: { id: inquiryId },
        data: { status: status as InquiryStatus },
      });

      res.json({ success: true, message: 'Inquiry status updated', data: updated });
    } catch (error) {
      next(error);
    }
  },
};
