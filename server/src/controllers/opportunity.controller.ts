import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthJwtPayload } from '../middleware/authenticate';

/**
 * Helper to optionally extract authenticated user from token
 */
function getOptionalUser(req: Request): AuthJwtPayload | null {
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) return null;

  try {
    return jwt.verify(token, env.AUTH_SECRET) as AuthJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Calculate dynamic deadline state in Nigerian context
 */
export function calculateDeadlineState(deadline: Date | null): {
  status: 'OPEN' | 'CLOSING_SOON' | 'DEADLINE_TODAY' | 'CLOSED' | 'ROLLING';
  daysLeft: number | null;
  label: string;
} {
  if (!deadline) {
    return { status: 'ROLLING', daysLeft: null, label: 'Rolling Admission' };
  }

  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'CLOSED', daysLeft: 0, label: 'Closed' };
  }
  if (diffDays === 0) {
    return { status: 'DEADLINE_TODAY', daysLeft: 0, label: 'Deadline Today' };
  }
  if (diffDays <= 3) {
    return { status: 'CLOSING_SOON', daysLeft: diffDays, label: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left` };
  }
  if (diffDays <= 7) {
    return { status: 'CLOSING_SOON', daysLeft: diffDays, label: `${diffDays} days left` };
  }

  return { status: 'OPEN', daysLeft: diffDays, label: `${diffDays} days left` };
}

/**
 * Calculate transparent skill relevance
 */
function calculateRelevance(
  requiredSkills: Array<{ skillId: string; priority: string; skill: { id: string; name: string } }>,
  userSkillMap: Map<string, string>
) {
  if (requiredSkills.length === 0) {
    return {
      percentage: 100,
      matchedSkills: [],
      missingSkills: [],
      note: 'Open to all FCI students',
    };
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let score = 0;
  let totalWeight = 0;

  for (const req of requiredSkills) {
    const weight = req.priority === 'REQUIRED' ? 2 : 1;
    totalWeight += weight;

    if (userSkillMap.has(req.skillId)) {
      score += weight;
      matchedSkills.push(req.skill.name);
    } else {
      missingSkills.push(req.skill.name);
    }
  }

  const percentage = Math.round((score / totalWeight) * 100);

  return {
    percentage,
    matchedSkills,
    missingSkills,
    note: `${matchedSkills.length} of ${requiredSkills.length} skills matched`,
  };
}

/**
 * List opportunities with server-side filtering, pagination, and skill relevance
 */
export async function getOpportunities(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      search,
      category,
      isRemote,
      deadlineStatus,
      featured,
      skills,
      status = 'APPROVED',
      page = 1,
      limit = 12,
    } = req.query as Record<string, any>;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const currentUser = getOptionalUser(req);
    const isStaff =
      currentUser?.roles.includes('ADMIN') ||
      currentUser?.roles.includes('SUPER_ADMIN') ||
      currentUser?.roles.includes('MODERATOR');

    // Build Prisma where filter
    const where: any = {};

    // Status filter
    if (status !== 'ALL') {
      if (!isStaff && status !== 'APPROVED') {
        where.status = 'APPROVED';
      } else {
        where.status = status;
      }
    } else if (!isStaff) {
      where.status = 'APPROVED';
    }

    if (category) {
      where.category = category;
    }

    if (isRemote !== undefined) {
      where.isRemote = isRemote === 'true' || isRemote === true;
    }

    if (featured !== undefined) {
      where.isFeatured = featured === 'true' || featured === true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { organization: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const now = new Date();
    if (deadlineStatus === 'OPEN') {
      where.OR = [{ deadline: { gte: now } }, { deadline: null }];
    } else if (deadlineStatus === 'CLOSING_SOON') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      where.deadline = { gte: now, lte: nextWeek };
    } else if (deadlineStatus === 'CLOSED') {
      where.deadline = { lt: now };
    }

    if (skills) {
      const skillIds = String(skills).split(',').filter(Boolean);
      where.requiredSkills = {
        some: { skillId: { in: skillIds } },
      };
    }

    // Fetch total and records
    const [total, opportunities] = await Promise.all([
      prisma.opportunity.count({ where }),
      prisma.opportunity.findMany({
        where,
        include: {
          requiredSkills: {
            include: {
              skill: {
                select: { id: true, name: true, slug: true, category: true },
              },
            },
          },
          savedBy: currentUser
            ? {
                where: { userId: currentUser.userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limitNum,
      }),
    ]);

    // Fetch current user skills if authenticated for skill matching
    let userSkillMap = new Map<string, string>();
    if (currentUser) {
      const userSkills = await prisma.studentSkill.findMany({
        where: { userId: currentUser.userId },
        select: { skillId: true, proficiency: true },
      });
      userSkillMap = new Map<string, string>(userSkills.map((s: any) => [s.skillId, s.proficiency]));
    }

    const items = opportunities.map((opp: any) => {
      const deadlineState = calculateDeadlineState(opp.deadline);
      const skillRelevance = currentUser
        ? calculateRelevance(opp.requiredSkills, userSkillMap)
        : null;

      return {
        id: opp.id,
        slug: opp.slug,
        title: opp.title,
        description: opp.description,
        organization: opp.organization,
        category: opp.category,
        location: opp.location,
        isRemote: opp.isRemote,
        applicationUrl: opp.applicationUrl,
        deadline: opp.deadline,
        deadlineState,
        startDate: opp.startDate,
        endDate: opp.endDate,
        eligibility: opp.eligibility,
        status: opp.status,
        isFeatured: opp.isFeatured,
        viewsCount: opp.viewsCount,
        createdAt: opp.createdAt,
        isSaved: Boolean(opp.savedBy && opp.savedBy.length > 0),
        requiredSkills: opp.requiredSkills.map((rs: any) => ({
          skillId: rs.skill.id,
          name: rs.skill.name,
          slug: rs.skill.slug,
          category: rs.skill.category,
          priority: rs.priority,
          minLevel: rs.minLevel,
        })),
        skillRelevance,
      };
    });

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single opportunity by slug with full details and skill diagnostics
 */
export async function getOpportunityBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { slug: Array.isArray(slug) ? slug[0] : slug },
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
        requiredSkills: {
          include: {
            skill: {
              select: { id: true, name: true, slug: true, category: true, description: true },
            },
          },
        },
      },
    });

    if (!opportunity) {
      throw ApiError.notFound('Opportunity not found');
    }

    const currentUser = getOptionalUser(req);
    const isStaff =
      currentUser?.roles.includes('ADMIN') ||
      currentUser?.roles.includes('SUPER_ADMIN') ||
      currentUser?.roles.includes('MODERATOR');

    if (opportunity.status !== 'APPROVED' && !isStaff && opportunity.createdById !== currentUser?.userId) {
      throw ApiError.forbidden('This opportunity is pending administrative approval.');
    }

    // Atomically increment views
    await prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    // Check if saved
    let isSaved = false;
    let skillRelevance = null;

    if (currentUser) {
      const [saved, userSkills] = await Promise.all([
        prisma.savedOpportunity.findUnique({
          where: {
            userId_opportunityId: {
              userId: currentUser.userId,
              opportunityId: opportunity.id,
            },
          },
        }),
        prisma.studentSkill.findMany({
          where: { userId: currentUser.userId },
          select: { skillId: true, proficiency: true },
        }),
      ]);

      isSaved = Boolean(saved);
      const userSkillMap = new Map<string, string>(userSkills.map((s: any) => [s.skillId, s.proficiency]));
      skillRelevance = calculateRelevance(opportunity.requiredSkills, userSkillMap);
    }

    const deadlineState = calculateDeadlineState(opportunity.deadline);

    res.json({
      success: true,
      data: {
        id: opportunity.id,
        slug: opportunity.slug,
        title: opportunity.title,
        description: opportunity.description,
        organization: opportunity.organization,
        category: opportunity.category,
        location: opportunity.location,
        isRemote: opportunity.isRemote,
        applicationUrl: opportunity.applicationUrl,
        applicationProcess: opportunity.applicationProcess,
        deadline: opportunity.deadline,
        deadlineState,
        startDate: opportunity.startDate,
        endDate: opportunity.endDate,
        eligibility: opportunity.eligibility,
        status: opportunity.status,
        isFeatured: opportunity.isFeatured,
        viewsCount: opportunity.viewsCount + 1,
        createdAt: opportunity.createdAt,
        updatedAt: opportunity.updatedAt,
        creator: opportunity.creator.profile,
        isSaved,
        requiredSkills: opportunity.requiredSkills.map((rs: any) => ({
          skillId: rs.skill.id,
          name: rs.skill.name,
          slug: rs.skill.slug,
          category: rs.skill.category,
          description: rs.skill.description,
          priority: rs.priority,
          minLevel: rs.minLevel,
        })),
        skillRelevance,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Save an opportunity for current user
 */
export async function saveOpportunity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: Array.isArray(opportunityId) ? opportunityId[0] : opportunityId },
    });

    if (!opportunity) {
      throw ApiError.notFound('Opportunity not found');
    }

    await prisma.savedOpportunity.upsert({
      where: {
        userId_opportunityId: { userId, opportunityId: opportunity.id },
      },
      update: {},
      create: { userId, opportunityId: opportunity.id },
    });

    res.json({
      success: true,
      message: 'Opportunity saved to your profile',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unsave an opportunity for current user
 */
export async function unsaveOpportunity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;

    await prisma.savedOpportunity.deleteMany({
      where: { userId, opportunityId: Array.isArray(opportunityId) ? opportunityId[0] : opportunityId },
    });

    res.json({
      success: true,
      message: 'Opportunity removed from saved list',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all saved opportunities for current user
 */
export async function getSavedOpportunities(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const saved = await prisma.savedOpportunity.findMany({
      where: { userId },
      include: {
        opportunity: {
          include: {
            requiredSkills: {
              include: {
                skill: {
                  select: { id: true, name: true, slug: true, category: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = saved.map((s: any) => {
      const opp = s.opportunity;
      return {
        id: opp.id,
        slug: opp.slug,
        title: opp.title,
        organization: opp.organization,
        category: opp.category,
        location: opp.location,
        isRemote: opp.isRemote,
        applicationUrl: opp.applicationUrl,
        deadline: opp.deadline,
        deadlineState: calculateDeadlineState(opp.deadline),
        status: opp.status,
        savedAt: s.createdAt,
        requiredSkills: opp.requiredSkills.map((rs: any) => ({
          skillId: rs.skill.id,
          name: rs.skill.name,
          priority: rs.priority,
        })),
      };
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create/submit a new opportunity
 */
export async function createOpportunity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const {
      title,
      description,
      organization,
      category,
      location,
      isRemote,
      applicationUrl,
      applicationProcess,
      deadline,
      startDate,
      endDate,
      eligibility,
      isFeatured,
      requiredSkills = [],
    } = req.body;

    const isStaff =
      roles.includes('ADMIN') ||
      roles.includes('SUPER_ADMIN') ||
      roles.includes('MODERATOR') ||
      roles.includes('EDITOR');

    // Auto-approve if created by staff, otherwise pending review
    const initialStatus = isStaff ? 'APPROVED' : 'PENDING_REVIEW';

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const opportunity = await prisma.opportunity.create({
      data: {
        slug: uniqueSlug,
        title,
        description,
        organization,
        category,
        location,
        isRemote: Boolean(isRemote),
        applicationUrl,
        applicationProcess,
        deadline: deadline ? new Date(deadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        eligibility,
        isFeatured: isStaff ? Boolean(isFeatured) : false,
        status: initialStatus,
        createdById: userId,
        requiredSkills: {
          create: requiredSkills.map((rs: any) => ({
            skillId: rs.skillId,
            priority: rs.priority || 'REQUIRED',
            minLevel: rs.minLevel || null,
          })),
        },
      },
      include: {
        requiredSkills: {
          include: { skill: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: isStaff
        ? 'Opportunity created and published successfully'
        : 'Opportunity submitted for review. It will be live once verified by moderators.',
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Report an opportunity
 */
export async function reportOpportunity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reporterId = req.user!.userId;
    const { id: opportunityId } = req.params;
    const { reason, description } = req.body;

    const opp = await prisma.opportunity.findUnique({
      where: { id: Array.isArray(opportunityId) ? opportunityId[0] : opportunityId },
    });

    if (!opp) {
      throw ApiError.notFound('Opportunity not found');
    }

    const report = await prisma.opportunityReport.create({
      data: {
        opportunityId: opp.id,
        reporterId,
        reason,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reporting. Our moderation team has been notified.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin/Moderator moderation endpoint
 */
export async function moderateOpportunity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    const updated = await prisma.opportunity.update({
      where: { id: Array.isArray(id) ? id[0] : id },
      data: {
        status: status || undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
      },
    });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.userId,
          action: `OPPORTUNITY_MODERATED_${updated.status}`,
          entityType: 'OPPORTUNITY',
          entityId: updated.id,
          metadata: { status: updated.status, isFeatured: updated.isFeatured },
        },
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: `Opportunity status updated to ${updated.status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
