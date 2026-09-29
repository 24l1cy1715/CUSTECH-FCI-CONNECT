import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthJwtPayload } from '../middleware/authenticate';

/**
 * Helper to optionally extract authenticated user from token without throwing
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
 * Public portfolio view by username or slug
 */
export async function getPublicPortfolio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usernameParam = req.params.username;

    if (!usernameParam) {
      throw ApiError.badRequest('Username is required');
    }

    const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;

    const profile = await prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        user: {
          select: {
            id: true,
            createdAt: true,
            isActive: true,
            isSuspended: true,
          },
        },
      },
    });

    if (!profile || !profile.user || !profile.user.isActive || profile.user.isSuspended) {
      throw ApiError.notFound('Student portfolio not found');
    }

    const currentUser = getOptionalUser(req);
    const isOwner = currentUser?.userId === profile.userId;

    // Check privacy settings
    if (profile.visibility === 'PRIVATE' && !isOwner) {
      throw ApiError.forbidden('This student portfolio is private.');
    }

    if (profile.visibility === 'FCI_ONLY' && !currentUser && !isOwner) {
      throw ApiError.unauthorized('Sign in with your FCI Connect account to view this portfolio.');
    }

    // Atomically increment aggregate view count (no visitor IP/cookie tracking)
    if (!isOwner) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { portfolioViewsCount: { increment: 1 } },
      }).catch(() => {});
    }

    // Fetch Skills (from Phase 1 Skill Graph)
    const studentSkills = await prisma.studentSkill.findMany({
      where: { userId: profile.userId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    // Fetch Public Approved Projects
    const projects = await prisma.project.findMany({
      where: {
        authorId: profile.userId,
        status: 'APPROVED',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        githubUrl: true,
        demoUrl: true,
        views: true,
        createdAt: true,
        images: {
          select: { url: true },
          orderBy: { orderIndex: 'asc' },
          take: 1,
        },
        skills: {
          select: {
            skill: {
              select: { id: true, name: true, slug: true, category: true },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Fetch Achievements
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: profile.userId },
      include: {
        achievement: {
          select: {
            id: true,
            name: true,
            description: true,
            badgeIcon: true,
            points: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
    });

    const customSections = (profile.customSections as Record<string, any>) || {};

    // Filter according to user custom section preferences
    const showSkills = customSections.showSkills !== false;
    const showProjects = customSections.showProjects !== false;
    const showAchievements = customSections.showAchievements !== false;
    const showContact = customSections.showContact !== false;

    res.json({
      success: true,
      data: {
        isOwner,
        profile: {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullName,
          department: profile.department,
          level: profile.level,
          avatarUrl: profile.avatarUrl,
          headline: profile.headline,
          location: profile.location,
          bio: profile.portfolioBio || profile.bio,
          githubUrl: profile.githubUrl,
          linkedinUrl: profile.linkedinUrl,
          portfolioUrl: profile.portfolioUrl,
          visibility: profile.visibility,
          communityPoints: profile.communityPoints,
          portfolioViewsCount: profile.portfolioViewsCount + (isOwner ? 0 : 1),
          memberSince: profile.user.createdAt,
          customSections: {
            showSkills,
            showProjects,
            showAchievements,
            showContact,
          },
        },
        skills: showSkills
          ? studentSkills.map((ss: any) => ({
              id: ss.id,
              skillId: ss.skill.id,
              name: ss.skill.name,
              slug: ss.skill.slug,
              category: ss.skill.category,
              proficiency: ss.proficiency,
              yearsOfExperience: ss.yearsOfExperience,
              isPrimary: ss.isPrimary,
            }))
          : [],
        projects: showProjects
          ? projects.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              description: p.description,
              category: p.category,
              githubUrl: p.githubUrl,
              demoUrl: p.demoUrl,
              views: p.views,
              likesCount: p._count.likes,
              commentsCount: p._count.comments,
              thumbnail: p.images[0]?.url || null,
              skills: p.skills.map((s: any) => s.skill),
              createdAt: p.createdAt,
            }))
          : [],
        achievements: showAchievements
          ? achievements.map((a: any) => ({
              id: a.achievement.id,
              name: a.achievement.name,
              description: a.achievement.description,
              badgeIcon: a.achievement.badgeIcon,
              points: a.achievement.points,
              earnedAt: a.earnedAt,
            }))
          : [],
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user's portfolio customization settings
 */
export async function getMyPortfolioSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw ApiError.notFound('Profile not found');
    }

    res.json({
      success: true,
      data: {
        username: profile.username,
        fullName: profile.fullName,
        department: profile.department,
        level: profile.level,
        avatarUrl: profile.avatarUrl,
        headline: profile.headline,
        location: profile.location,
        portfolioBio: profile.portfolioBio,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        portfolioUrl: profile.portfolioUrl,
        visibility: profile.visibility,
        portfolioViewsCount: profile.portfolioViewsCount,
        customSections: profile.customSections || {
          showSkills: true,
          showProjects: true,
          showAchievements: true,
          showContact: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user's portfolio customization
 */
export async function updateMyPortfolioSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      headline,
      location,
      portfolioBio,
      visibility,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      customSections,
    } = req.body;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw ApiError.notFound('Profile not found');
    }

    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        headline: headline !== undefined ? headline : profile.headline,
        location: location !== undefined ? location : profile.location,
        portfolioBio: portfolioBio !== undefined ? portfolioBio : profile.portfolioBio,
        visibility: visibility || profile.visibility,
        githubUrl: githubUrl !== undefined ? githubUrl : profile.githubUrl,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : profile.linkedinUrl,
        portfolioUrl: portfolioUrl !== undefined ? portfolioUrl : profile.portfolioUrl,
        customSections: customSections !== undefined ? customSections : profile.customSections,
      },
    });

    res.json({
      success: true,
      message: 'Portfolio customization updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit connection request through public portfolio without exposing student email
 */
export async function requestPortfolioConnect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usernameParam = req.params.username;
    const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;
    const { senderName, senderEmail, message, subject } = req.body;

    const profile = await prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
      select: { userId: true, fullName: true },
    });

    if (!profile) {
      throw ApiError.notFound('Student not found');
    }

    // Create in-app Notification for the student
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        type: 'PORTFOLIO_CONNECT_REQUEST',
        title: `Portfolio Inquiry from ${senderName}`,
        message: `${subject ? `Subject: ${subject}\n\n` : ''}${message}\n\nVisitor Reply Email: ${senderEmail}`,
      },
    });

    res.json({
      success: true,
      message: 'Your connection request has been securely forwarded to the student.',
    });
  } catch (error) {
    next(error);
  }
}
