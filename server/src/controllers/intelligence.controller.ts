import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { IntelligenceService } from '../services/intelligence.service';

export const intelligenceController = {
  // ── 1. My FCI Dashboard Complete Command Center ─────────────────────────────
  getMyFciSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const [
        user,
        skills,
        attempts,
        labProjects,
        researchProjects,
        siwes,
        trackedApps,
        services,
        inquiries,
        nextActions,
        recommendations,
      ] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            githubProfile: true,
            _count: {
              select: {
                userAchievements: true,
                organizedEvents: true,
                communityMemberships: true,
              },
            },
          },
        }),
        prisma.studentSkill.findMany({
          where: { userId },
          include: { skill: true },
        }),
        prisma.assessmentAttempt.findMany({
          where: { userId },
        }),
        prisma.labProject.findMany({
          where: {
            OR: [
              { createdById: userId },
              { members: { some: { userId } } },
            ],
          },
          take: 4,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.researchProject.findMany({
          where: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } },
            ],
          },
          take: 4,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.siwesPlacement.findFirst({
          where: { studentId: userId },
          include: { _count: { select: { weeklyLogs: true, documents: true } } },
        }),
        prisma.opportunityApplication.findMany({
          where: { userId },
          include: { opportunity: true },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.marketplaceService.findMany({
          where: { ownerId: userId },
          take: 3,
        }),
        prisma.marketplaceInquiry.findMany({
          where: { service: { ownerId: userId }, status: 'NEW' },
        }),
        IntelligenceService.getSmartNextActions(userId),
        IntelligenceService.getRecommendations(userId),
      ]);

      // Calculate profile completion score
      let completionScore = 20; // base account
      if (user?.profile?.fullName) completionScore += 20;
      if (user?.profile?.avatarUrl) completionScore += 15;
      if (user?.profile?.bio) completionScore += 15;
      if (user?.profile?.department) completionScore += 15;
      if (skills.length > 0) completionScore += 15;
      completionScore = Math.min(100, completionScore);

      const verifiedSkillsCount = skills.filter((s) => s.isVerified).length;
      const passedAssessmentsCount = attempts.filter((a) => a.isPassed).length;

      res.json({
        success: true,
        data: {
          profile: {
            fullName: user?.profile?.fullName || 'FCI Student',
            username: user?.profile?.username || 'student',
            avatarUrl: user?.profile?.avatarUrl || null,
            department: user?.profile?.department || null,
            level: user?.profile?.level || null,
            communityPoints: user?.profile?.communityPoints || 0,
            completionPercentage: completionScore,
          },
          stats: {
            skillsCount: skills.length,
            verifiedSkillsCount,
            passedAssessmentsCount,
            activeLabProjectsCount: labProjects.length,
            activeResearchCount: researchProjects.length,
            achievementsCount: user?._count.userAchievements || 0,
            communitiesCount: user?._count.communityMemberships || 0,
            siwesStatus: siwes?.status || 'NOT_STARTED',
            siwesLogsCount: siwes?._count.weeklyLogs || 0,
            pendingInquiriesCount: inquiries.length,
          },
          github: user?.githubProfile
            ? {
                username: user.githubProfile.githubUsername,
                avatarUrl: user.githubProfile.avatarUrl,
                publicRepos: user.githubProfile.publicReposCount,
                followers: user.githubProfile.followersCount,
                isConnected: user.githubProfile.isConnected,
              }
            : null,
          recentLabProjects: labProjects,
          recentResearch: researchProjects,
          trackedApplications: trackedApps,
          myServices: services,
          nextActions,
          recommendations,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Get Next Actions ─────────────────────────────────────────────────────
  getNextActions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const actions = await IntelligenceService.getSmartNextActions(userId);
      res.json({ success: true, data: actions });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Get Recommendations ──────────────────────────────────────────────────
  getRecommendations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const recs = await IntelligenceService.getRecommendations(userId);
      res.json({ success: true, data: recs });
    } catch (error) {
      next(error);
    }
  },
};
