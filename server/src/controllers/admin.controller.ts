import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { AchievementService } from '../services/achievement.service';

export class AdminController {
  /**
   * Executive Command Center: System overview & KPIs
   */
  static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsers,
        totalProjects,
        pendingProjects,
        totalBusinesses,
        pendingBusinesses,
        totalRoommates,
        activeAnnouncements,
        pendingReports,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.project.count({ where: { status: 'PENDING' } }),
        prisma.business.count(),
        prisma.business.count({ where: { status: 'PENDING' } }),
        prisma.roommateListing.count({ where: { status: 'ACTIVE' } }),
        prisma.announcement.count({ where: { isActive: true } }),
        prisma.report.count({ where: { status: 'PENDING' } }),
      ]);

      res.json({
        success: true,
        data: {
          metrics: {
            totalUsers,
            totalProjects,
            pendingProjects,
            totalBusinesses,
            pendingBusinesses,
            totalRoommates,
            activeAnnouncements,
            pendingReports,
          },
          systemHealth: {
            status: 'HEALTHY',
            uptime: process.uptime(),
            dbLatencyMs: 12,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User & Role Management
   */
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const roleFilter = (req.query.role as string) || '';

      const users = await prisma.user.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { email: { contains: search } },
                    { profile: { fullName: { contains: search } } },
                    { profile: { username: { contains: search } } },
                    { profile: { matricId: { contains: search } } },
                  ],
                }
              : {},
            roleFilter
              ? {
                  userRoles: {
                    some: {
                      role: { name: roleFilter as any },
                    },
                  },
                }
              : {},
          ],
        },
        include: {
          profile: true,
          userRoles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              projects: true,
              businesses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const formatted = users.map((u) => ({
        id: u.id,
        email: u.email,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        roles: u.userRoles.map((ur) => ur.role.name),
        profile: u.profile,
        projectCount: u._count.projects,
        businessCount: u._count.businesses,
      }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign or replace user roles
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { roleName, action } = req.body; // action: 'ADD' | 'REMOVE'

      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        throw ApiError.badRequest(`Role '${roleName}' not recognized`);
      }

      if (action !== 'ADD' && action !== 'REMOVE') {
        throw ApiError.badRequest("Action must be 'ADD' or 'REMOVE'");
      }

      if (action === 'REMOVE' && roleName === 'SUPER_ADMIN') {
        const superAdminCount = await prisma.userRole.count({
          where: { role: { name: 'SUPER_ADMIN' } },
        });
        if (superAdminCount <= 1) {
          throw ApiError.badRequest('Cannot remove the last SUPER_ADMIN in the system');
        }
      }

      // Authorize that actor possesses SUPER_ADMIN in verified roles
      if (!req.user || !req.user.roles.includes('SUPER_ADMIN')) {
        throw ApiError.forbidden('Only verified Super Administrators can modify roles');
      }

      // Check target user existence
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true },
      });

      if (!targetUser) {
        throw ApiError.notFound('Target user not found');
      }

      if (action === 'ADD') {
        await prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId: id,
              roleId: role.id,
            },
          },
          create: { userId: id, roleId: role.id },
          update: {},
        });
      } else if (action === 'REMOVE') {
        await prisma.userRole.deleteMany({
          where: { userId: id, roleId: role.id },
        });
      }

      // Log action to security audit trail
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            actorId: req.user.userId,
            action: `ROLE_${action}`,
            entityType: 'USER',
            entityId: id,
            ipAddress: req.ip || (req.socket?.remoteAddress as string) || 'unknown',
            metadata: JSON.stringify({
              targetUserId: id,
              targetUserEmail: targetUser.email,
              targetRole: roleName,
              action,
              timestamp: new Date().toISOString(),
            }),
          },
        }).catch((err) => {
          console.error('Failed to log role change audit:', err);
        });
      }

      res.json({ success: true, message: `Role updated successfully` });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Adjust community points
   */
  static async adjustPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { pointsDelta, reason } = req.body;

      const profile = await prisma.profile.findUnique({
        where: { userId: id },
      });

      if (!profile) {
        throw ApiError.notFound('User profile not found');
      }

      const updated = await prisma.profile.update({
        where: { userId: id },
        data: {
          communityPoints: { increment: Number(pointsDelta) },
        },
      });

      if (req.user) {
        await prisma.auditLog.create({
          data: {
            actorId: req.user.userId,
            action: 'ADJUST_POINTS',
            entityType: 'USER',
            entityId: id,
            metadata: JSON.stringify({ delta: pointsDelta, reason, newBalance: updated.communityPoints }),
          },
        }).catch(() => {});

      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Projects Moderation Queue
   */
  static async getPendingProjects(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await prisma.project.findMany({
        where: { status: 'PENDING' },
        include: {
          author: {
            include: { profile: true },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  static async updateProjectStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { status, pointsReward = 100 } = req.body; // 'APPROVED' | 'REJECTED'

      const project = await prisma.project.update({
        where: { id },
        data: { status },
        include: { author: true },
      });

      // If approved, award community points to student author and check automatic first-project achievement
      if (status === 'APPROVED' && project.authorId) {
        await prisma.profile.updateMany({
          where: { userId: project.authorId },
          data: { communityPoints: { increment: pointsReward } },
        });

        await AchievementService.awardAutomaticAchievement(project.authorId, 'first-project', {
          type: 'PROJECT',
          id: project.id,
          description: `First Project Approved: ${project.title}`,
        });
      }

      if (req.user) {
        await prisma.auditLog.create({
          data: {
            actorId: req.user.userId,
            action: `PROJECT_${status}`,
            entityType: 'PROJECT',
            entityId: id,
            metadata: JSON.stringify({ title: project.title, pointsAwarded: status === 'APPROVED' ? pointsReward : 0 }),
          },
        }).catch(() => {});
      }

      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Businesses Verification Queue
   */
  static async getPendingBusinesses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const businesses = await prisma.business.findMany({
        where: { status: 'PENDING' },
        include: {
          owner: {
            include: { profile: true },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: businesses });
    } catch (error) {
      next(error);
    }
  }

  static async updateBusinessStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'SUSPENDED'

      const business = await prisma.business.update({
        where: { id },
        data: { status },
      });

      if (req.user) {
        await prisma.auditLog.create({
          data: {
            actorId: req.user.userId,
            action: `BUSINESS_${status}`,
            entityType: 'BUSINESS',
            entityId: id,
            metadata: JSON.stringify({ name: business.name }),
          },
        }).catch(() => {});
      }


      res.json({ success: true, data: business });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Announcements & System Broadcasts
   */
  static async getAnnouncements(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            include: { profile: true },
          },
        },
      });

      res.json({ success: true, data: announcements });
    } catch (error) {
      next(error);
    }
  }

  static async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw ApiError.unauthorized();
      }

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          createdBy: userId,
          isActive: true,
        },
      });

      res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  }

  static async toggleAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { isActive } = req.body;

      const updated = await prisma.announcement.update({
        where: { id },
        data: { isActive },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * System Audit Logs
   */
  static async getAuditLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
      });

      res.json({ success: true, data: logs });

    } catch (error) {
      next(error);
    }
  }
}
