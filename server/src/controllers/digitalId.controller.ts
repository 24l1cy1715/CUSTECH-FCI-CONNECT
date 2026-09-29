import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { DigitalIdStatus, NotificationType } from '@prisma/client';
import { env } from '../config/env';

/**
 * Generates an immutable, non-sequential FCI Connect ID
 * Format: FCI-2026-[5-char uppercase alphanumeric hash]
 */
function generateFciId(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
  return `FCI-${year}-${randomHex}`;
}

/**
 * Generates a cryptographically secure verification token
 */
function generateVerificationToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export const digitalIdController = {
  // ── 1. Get My Digital ID (Auto-provisions if not exists) ──────────────────────
  getMyDigitalId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      // Fetch user with profile and skills
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          studentSkills: {
            include: { skill: true },
            take: 6,
          },
          userAchievements: {
            where: { status: 'VERIFIED' },
            include: { achievement: true },
            take: 6,
          },
        },
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Check if digital identity exists, else provision
      let digitalId = await prisma.digitalIdentity.findUnique({
        where: { userId },
      });

      if (!digitalId) {
        // Ensure unique FCI ID
        let fciId = generateFciId();
        let attempts = 0;
        while (attempts < 5) {
          const exists = await prisma.digitalIdentity.findUnique({ where: { fciId } });
          if (!exists) break;
          fciId = generateFciId();
          attempts++;
        }

        const verificationToken = generateVerificationToken();

        digitalId = await prisma.digitalIdentity.create({
          data: {
            userId,
            fciId,
            verificationToken,
            status: DigitalIdStatus.PENDING,
            showSkills: true,
            showAchievements: true,
            showPortfolio: true,
          },
        });
      }

      const clientUrl = env.APP_URL || 'http://localhost:5173';
      const verificationUrl = `${clientUrl}/verify/${digitalId.verificationToken}`;

      res.json({
        success: true,
        data: {
          id: digitalId.id,
          userId: user.id,
          fullName: user.profile?.fullName || 'FCI Student',
          username: user.profile?.username,
          avatarUrl: user.profile?.avatarUrl,
          department: user.profile?.department,
          level: user.profile?.level,
          fciId: digitalId.fciId,
          verificationToken: digitalId.verificationToken,
          status: digitalId.status,
          issuedAt: digitalId.createdAt ? digitalId.createdAt.toISOString() : null,
          verifiedAt: digitalId.verifiedAt ? digitalId.verifiedAt.toISOString() : null,
          suspendedAt: (digitalId as any).suspendedAt ? (digitalId as any).suspendedAt.toISOString() : null,
          revokedAt: (digitalId as any).revokedAt ? (digitalId as any).revokedAt.toISOString() : null,
          suspensionReason: digitalId.suspensionReason,
          revocationReason: digitalId.revocationReason,
          statusReason: digitalId.suspensionReason || digitalId.revocationReason || null,
          showSkills: digitalId.showSkills,
          showAchievements: digitalId.showAchievements,
          showPortfolio: digitalId.showPortfolio,
          showPortfolioLink: digitalId.showPortfolio,
          verificationUrl,
          disclaimer:
            'FCI Connect Digital ID serves as a verified platform identity for CUSTECH computing students and is not a legal replacement for a physical university ID card.',
          user: {
            id: user.id,
            fullName: user.profile?.fullName || 'FCI Student',
            username: user.profile?.username || 'student',
            avatarUrl: user.profile?.avatarUrl || null,
            role: (user as any).role || 'STUDENT',
            department: user.profile?.department || 'Faculty of Computing & Informatics',
            level: user.profile?.level ? parseInt(String(user.profile.level), 10) || 300 : 300,
            bio: user.profile?.bio || null,
          },
          skills: user.studentSkills.map((s) => ({
            id: s.skill?.id || s.id,
            name: s.skill?.name || 'Computing',
            proficiency: s.proficiency,
          })),
          achievements: user.userAchievements.map((ua) => ({
            id: ua.achievement?.id || ua.id,
            name: ua.achievement?.name || 'Verified Milestone',
            title: ua.achievement?.name || 'Verified Milestone',
            badgeIcon: ua.achievement?.badgeIcon || null,
            category: ua.achievement?.category || 'ACADEMIC',
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Request Verification Review ───────────────────────────────────────────
  requestVerification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      let digitalId = await prisma.digitalIdentity.findUnique({ where: { userId } });
      if (!digitalId) {
        const fciId = generateFciId();
        const verificationToken = generateVerificationToken();
        digitalId = await prisma.digitalIdentity.create({
          data: {
            userId,
            fciId,
            verificationToken,
            status: DigitalIdStatus.PENDING,
          },
        });
      } else if (digitalId.status === DigitalIdStatus.VERIFIED) {
        return res.json({
          success: true,
          message: 'Your Digital ID is already verified',
          data: digitalId,
        });
      } else if (digitalId.status === DigitalIdStatus.SUSPENDED || digitalId.status === DigitalIdStatus.REVOKED) {
        throw ApiError.forbidden('Your identity is currently suspended or revoked. Please contact faculty administration.');
      } else {
        digitalId = await prisma.digitalIdentity.update({
          where: { userId },
          data: { status: DigitalIdStatus.PENDING },
        });
      }

      res.json({
        success: true,
        message: 'Verification request submitted for administrative review',
        data: digitalId,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Update Public Visibility Toggles ──────────────────────────────────────
  updateVisibility: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { showSkills, showAchievements, showPortfolio, showPortfolioLink } = req.body;
      const portfolioVal = showPortfolio !== undefined ? showPortfolio : showPortfolioLink;

      const updated = await prisma.digitalIdentity.update({
        where: { userId },
        data: {
          showSkills: showSkills !== undefined ? showSkills : undefined,
          showAchievements: showAchievements !== undefined ? showAchievements : undefined,
          showPortfolio: portfolioVal !== undefined ? portfolioVal : undefined,
        },
      });

      res.json({
        success: true,
        message: 'Digital ID display preferences updated',
        data: {
          ...updated,
          showPortfolioLink: updated.showPortfolio,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Regenerate Verification Token ─────────────────────────────────────────
  regenerateToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const newToken = generateVerificationToken();

      const updated = await prisma.digitalIdentity.update({
        where: { userId },
        data: {
          verificationToken: newToken,
        },
      });

      const clientUrl = env.APP_URL || 'http://localhost:5173';
      const verificationUrl = `${clientUrl}/verify/${newToken}`;

      res.json({
        success: true,
        message: 'New verification token and QR code generated. Previous links are now revoked.',
        data: {
          verificationToken: newToken,
          verificationUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Public QR Verification ────────────────────────────────────────────────
  publicVerify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params.token as string;
      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = (req.headers['user-agent'] as string)?.slice(0, 255) || 'Unknown';

      // Anonymize IP with SHA-256 hash for privacy-safe audit logging
      const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 32);

      const identity = await prisma.digitalIdentity.findUnique({
        where: { verificationToken: token },
        include: {
          user: {
            include: {
              profile: true,
              studentSkills: {
                include: { skill: true },
                take: 6,
              },
              userAchievements: {
                where: { status: 'VERIFIED' },
                include: { achievement: true },
                take: 6,
              },
            },
          },
        },
      });

      if (!identity) {
        return res.status(404).json({
          success: false,
          verified: false,
          result: 'NOT_FOUND',
          message: 'Invalid or expired verification QR token. Identity record does not exist.',
        });
      }

      // Record audit log asynchronously
      prisma.verificationLog
        .create({
          data: {
            digitalId: identity.id,
            token,
            result: identity.status,
            ipHash,
            userAgent,
          },
        })
        .catch(() => {});

      if (identity.status === DigitalIdStatus.SUSPENDED) {
        return res.status(403).json({
          success: false,
          verified: false,
          result: 'SUSPENDED',
          message: 'This FCI Digital ID has been temporarily suspended by university administration.',
          fciId: identity.fciId,
          suspensionReason: identity.suspensionReason || 'Administrative hold',
        });
      }

      if (identity.status === DigitalIdStatus.REVOKED) {
        return res.status(403).json({
          success: false,
          verified: false,
          result: 'REVOKED',
          message: 'This FCI Digital ID has been revoked and is no longer valid.',
          fciId: identity.fciId,
        });
      }

      if (identity.status === DigitalIdStatus.PENDING) {
        return res.json({
          success: true,
          verified: false,
          result: 'PENDING',
          message: 'This identity is currently pending official administrative verification.',
          fciId: identity.fciId,
          fullName: identity.user.profile?.fullName,
          department: identity.user.profile?.department,
          level: identity.user.profile?.level,
        });
      }

      // Verified state: Return approved public verification data
      const studentPayload = {
        fciId: identity.fciId,
        fullName: identity.user.profile?.fullName || 'FCI Student',
        department: identity.user.profile?.department || 'Faculty of Computing & Informatics',
        level: identity.user.profile?.level ? parseInt(String(identity.user.profile.level), 10) || 300 : 300,
        avatarUrl: identity.user.profile?.avatarUrl || null,
        issuedAt: identity.createdAt ? identity.createdAt.toISOString() : null,
        verifiedAt: identity.verifiedAt ? identity.verifiedAt.toISOString() : null,
        status: 'Active',
        portfolioUrl: identity.showPortfolio && identity.user.profile?.username
          ? `/u/${identity.user.profile.username}`
          : null,
        skills: identity.showSkills
          ? identity.user.studentSkills.map((s) => ({
              id: s.skill?.id || s.id,
              name: s.skill.name,
              proficiency: s.proficiency,
            }))
          : [],
        achievements: identity.showAchievements
          ? identity.user.userAchievements.map((ua) => ({
              id: ua.achievement?.id || ua.id,
              title: ua.achievement.name,
              badgeIcon: ua.achievement.badgeIcon,
            }))
          : [],
      };

      res.json({
        success: true,
        verified: true,
        result: 'VERIFIED',
        status: 'VERIFIED',
        statusMessage: 'Official FCI Student Companion ID Verified',
        authority: 'Confluence University of Science & Technology — Faculty of Computing and Informatics',
        institution: 'Confluence University of Science & Technology',
        verificationTimestamp: new Date().toISOString(),
        student: studentPayload,
        data: studentPayload,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 6. Admin Management Endpoints ───────────────────────────────────────────
  adminListIdentities: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = req.query.status as DigitalIdStatus | undefined;
      const search = (req.query.search as string)?.trim();

      const where: any = {};
      if (status && Object.values(DigitalIdStatus).includes(status)) {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { fciId: { contains: search } },
          { user: { profile: { fullName: { contains: search } } } },
          { user: { profile: { username: { contains: search } } } },
          { user: { email: { contains: search } } },
        ];
      }

      const [total, identities] = await Promise.all([
        prisma.digitalIdentity.count({ where }),
        prisma.digitalIdentity.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
          include: {
            user: {
              select: {
                id: true,
                email: true,
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
            verifiedBy: {
              select: {
                profile: {
                  select: { fullName: true },
                },
              },
            },
            _count: {
              select: { logs: true },
            },
          },
        }),
      ]);

      const formattedIdentities = identities.map((item) => ({
        ...item,
        user: {
          ...item.user,
          fullName: (item.user as any)?.profile?.fullName || 'FCI Student',
          username: (item.user as any)?.profile?.username || '',
          department: (item.user as any)?.profile?.department || 'Computing Sciences',
          level: (item.user as any)?.profile?.level || 300,
          avatarUrl: (item.user as any)?.profile?.avatarUrl || null,
        },
      }));

      res.json({
        success: true,
        data: {
          identities: formattedIdentities,
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

  adminVerify: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const adminId = req.user!.userId;

      const identity = await prisma.digitalIdentity.findUnique({ where: { userId } });
      if (!identity) {
        throw ApiError.notFound('Digital Identity not found for this student');
      }

      const updated = await prisma.digitalIdentity.update({
        where: { userId },
        data: {
          status: DigitalIdStatus.VERIFIED,
          verifiedAt: new Date(),
          verifiedById: adminId,
          suspensionReason: null,
          revocationReason: null,
        },
      });

      // Send notification
      await prisma.notification.create({
        data: {
          userId,
          type: NotificationType.DIGITAL_ID_APPROVED,
          title: 'FCI Connect Digital ID Verified!',
          message: `Your FCI Connect Digital ID (${identity.fciId}) has been officially verified by faculty administration.`,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'DIGITAL_ID_VERIFIED',
          entityType: 'DIGITAL_ID',
          entityId: identity.id,
          metadata: { targetUserId: userId, fciId: identity.fciId },
        },
      }).catch(() => {});

      res.json({
        success: true,
        message: 'Digital ID successfully verified',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  adminSuspend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const adminId = req.user?.userId || 'SYSTEM';
      const { reason } = req.body;

      const updated = await prisma.digitalIdentity.update({
        where: { userId },
        data: {
          status: DigitalIdStatus.SUSPENDED,
          suspensionReason: reason,
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          type: NotificationType.DIGITAL_ID_SUSPENDED,
          title: 'Digital ID Suspended',
          message: `Your FCI Connect Digital ID verification has been suspended: ${reason}`,
        },
      });

      // Audit Log
      if (req.user?.userId) {
        await prisma.auditLog.create({
          data: {
            actorId: req.user.userId,
            action: 'DIGITAL_ID_SUSPENDED',
            entityType: 'DIGITAL_ID',
            entityId: updated.id,
            metadata: { targetUserId: userId, reason },
          },
        }).catch(() => {});
      }

      res.json({
        success: true,
        message: 'Digital ID suspended',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  adminRevoke: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const { reason } = req.body;

      const updated = await prisma.digitalIdentity.update({
        where: { userId },
        data: {
          status: DigitalIdStatus.REVOKED,
          revocationReason: reason,
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          type: NotificationType.DIGITAL_ID_REVOKED,
          title: 'Digital ID Revoked',
          message: `Your FCI Connect Digital ID verification has been revoked: ${reason}`,
        },
      });

      // Audit Log
      if (req.user?.userId) {
        await prisma.auditLog.create({
          data: {
            actorId: req.user.userId,
            action: 'DIGITAL_ID_REVOKED',
            entityType: 'DIGITAL_ID',
            entityId: updated.id,
            metadata: { targetUserId: userId, reason },
          },
        }).catch(() => {});
      }

      res.json({
        success: true,
        message: 'Digital ID revoked',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  adminRegenerate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const newToken = generateVerificationToken();
      const newFciId = generateFciId();

      const updated = await prisma.digitalIdentity.update({
        where: { userId },
        data: {
          fciId: newFciId,
          verificationToken: newToken,
        },
      });

      // Audit Log
      if (req.user?.userId) {
        await prisma.auditLog.create({
          data: {
            actorId: req.user.userId,
            action: 'DIGITAL_ID_REGENERATED',
            entityType: 'DIGITAL_ID',
            entityId: updated.id,
            metadata: { targetUserId: userId, newFciId },
          },
        }).catch(() => {});
      }

      res.json({
        success: true,
        message: 'Digital ID and verification token regenerated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  adminGetLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30));

      const [total, logs] = await Promise.all([
        prisma.verificationLog.count(),
        prisma.verificationLog.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            identity: {
              select: {
                fciId: true,
                user: {
                  select: {
                    profile: {
                      select: { fullName: true, department: true },
                    },
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
          logs,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
