import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { OpportunityTrackStatus } from '@prisma/client';

export const calculateDeadlineStatus = (deadline: Date | null): {
  daysRemaining: number | null;
  status: 'CLOSED' | 'URGENT' | 'APPROACHING' | 'UPCOMING' | 'NO_DEADLINE';
} => {
  if (!deadline) return { daysRemaining: null, status: 'NO_DEADLINE' };

  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return { daysRemaining, status: 'CLOSED' };
  if (daysRemaining <= 3) return { daysRemaining, status: 'URGENT' };
  if (daysRemaining <= 10) return { daysRemaining, status: 'APPROACHING' };
  return { daysRemaining, status: 'UPCOMING' };
};

export const opportunityTrackerController = {
  // ── 1. Get My Tracked Opportunities ────────────────────────────────────────
  getMyTrackedOpportunities: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;

      const whereClause: any = { userId };
      if (status && status !== 'ALL') {
        whereClause.status = status as OpportunityTrackStatus;
      }

      const tracked = await prisma.opportunityApplication.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        include: {
          opportunity: {
            include: {
              requiredSkills: {
                include: {
                  skill: { select: { id: true, name: true, category: true } },
                },
              },
            },
          },
          linkedLabProject: {
            select: {
              id: true,
              slug: true,
              title: true,
              status: true,
            },
          },
        },
      });

      const formatted = tracked.map((item) => {
        const deadlineMeta = calculateDeadlineStatus(item.opportunity.deadline);
        return {
          ...item,
          deadlineMeta,
        };
      });

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Track Opportunity (Upsert) ──────────────────────────────────────────
  trackOpportunity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const opportunityId = req.params.id as string;
      const {
        status = OpportunityTrackStatus.SAVED,
        appliedAt,
        followUpDate,
        notes,
        applicationUrl,
        result,
        documentTypes = [],
        remindDaysBefore = 7,
        linkedLabProjectId,
      } = req.body;

      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
      });

      if (!opportunity) throw ApiError.notFound('Opportunity');

      const record = await prisma.opportunityApplication.upsert({
        where: {
          userId_opportunityId: { userId, opportunityId },
        },
        update: {
          status,
          appliedAt: appliedAt ? new Date(appliedAt) : undefined,
          followUpDate: followUpDate ? new Date(followUpDate) : undefined,
          notes: notes !== undefined ? notes : undefined,
          applicationUrl: applicationUrl || undefined,
          result: result || undefined,
          documentTypes: documentTypes || undefined,
          remindDaysBefore,
          linkedLabProjectId: linkedLabProjectId || undefined,
        },
        create: {
          userId,
          opportunityId,
          status,
          appliedAt: appliedAt ? new Date(appliedAt) : status === OpportunityTrackStatus.APPLIED ? new Date() : undefined,
          followUpDate: followUpDate ? new Date(followUpDate) : undefined,
          notes: notes || undefined,
          applicationUrl: applicationUrl || undefined,
          result: result || undefined,
          documentTypes: documentTypes || [],
          remindDaysBefore,
          linkedLabProjectId: linkedLabProjectId || undefined,
        },
        include: {
          opportunity: { select: { id: true, title: true, deadline: true, organization: true } },
          linkedLabProject: { select: { id: true, title: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: record,
        message: `Opportunity tracking updated to ${status}!`,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Update Tracking Record ──────────────────────────────────────────────
  updateTracking: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const opportunityId = req.params.id as string;

      const existing = await prisma.opportunityApplication.findUnique({
        where: { userId_opportunityId: { userId, opportunityId } },
      });

      if (!existing) throw ApiError.notFound('Tracking record');

      const updated = await prisma.opportunityApplication.update({
        where: { userId_opportunityId: { userId, opportunityId } },
        data: {
          ...req.body,
          appliedAt: req.body.appliedAt !== undefined ? (req.body.appliedAt ? new Date(req.body.appliedAt) : null) : undefined,
          followUpDate: req.body.followUpDate !== undefined ? (req.body.followUpDate ? new Date(req.body.followUpDate) : null) : undefined,
        },
        include: {
          opportunity: true,
          linkedLabProject: true,
        },
      });

      res.json({
        success: true,
        data: updated,
        message: 'Tracking preferences saved.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Untrack Opportunity ─────────────────────────────────────────────────
  untrackOpportunity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const opportunityId = req.params.id as string;

      await prisma.opportunityApplication.deleteMany({
        where: { userId, opportunityId },
      });

      res.json({
        success: true,
        message: 'Opportunity removed from your personal tracker.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Upcoming Deadlines ──────────────────────────────────────────────────
  getUpcomingDeadlines: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const tracked = await prisma.opportunityApplication.findMany({
        where: {
          userId,
          status: { in: [OpportunityTrackStatus.SAVED, OpportunityTrackStatus.INTERESTED, OpportunityTrackStatus.APPLYING] },
          opportunity: { deadline: { not: null } },
        },
        include: {
          opportunity: {
            select: {
              id: true,
              slug: true,
              title: true,
              organization: true,
              deadline: true,
              category: true,
            },
          },
        },
        orderBy: {
          opportunity: { deadline: 'asc' },
        },
      });

      const deadlines = tracked
        .map((t) => ({
          ...t,
          deadlineMeta: calculateDeadlineStatus(t.opportunity.deadline),
        }))
        .filter((t) => t.deadlineMeta.status !== 'CLOSED');

      res.json({
        success: true,
        data: deadlines,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 6. Skill Graph Personalized Recommendations ───────────────────────────
  getRecommendations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const [userSkills, userProfile, opportunities] = await Promise.all([
        prisma.studentSkill.findMany({
          where: { userId },
          include: { skill: true },
        }),
        prisma.profile.findUnique({
          where: { userId },
          select: { department: true, level: true, interests: true },
        }),
        prisma.opportunity.findMany({
          where: { status: 'APPROVED' },
          include: {
            requiredSkills: { include: { skill: true } },
          },
          take: 20,
        }),
      ]);

      const userSkillIds = new Set(userSkills.map((s) => s.skillId));

      const recommendations = opportunities
        .map((opp) => {
          let score = 0;
          const matchingSkills: string[] = [];

          opp.requiredSkills.forEach((reqSkill) => {
            if (userSkillIds.has(reqSkill.skillId)) {
              score += 3;
              matchingSkills.push(reqSkill.skill.name);
            }
          });

          // Department & Category affinity
          if (
            (userProfile?.department === 'CYBER_SECURITY' && opp.category === 'HACKATHON') ||
            (userProfile?.department === 'SOFTWARE_ENGINEERING' && opp.category === 'JOB')
          ) {
            score += 2;
          }

          let reason = 'Curated career opportunity for computing students.';
          if (matchingSkills.length > 0) {
            reason = `Recommended because it matches your skills in ${matchingSkills.slice(0, 2).join(' & ')}.`;
          } else if (userProfile?.department) {
            reason = `Recommended for ${userProfile.department.replace(/_/g, ' ')} undergraduates.`;
          }

          return {
            opportunity: opp,
            score,
            reason,
          };
        })
        .filter((rec) => rec.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  },
};
