import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  VoicePollStatus,
  VoiceSuggestionStatus,
  ActivityType,
  ActivityVisibility,
} from '@prisma/client';
import { createActivity } from '../services/activity.service';

export const voiceController = {
  // ── 1. Polls ────────────────────────────────────────────────────────────────
  listPolls: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { status = 'ACTIVE' } = req.query;

      // Seed a starter poll if none exists
      const count = await prisma.voicePoll.count();
      if (count === 0 && userId) {
        await prisma.voicePoll.create({
          data: {
            question: 'Which emerging technical track would you like FCI to expand next semester?',
            description: 'Help the faculty prioritize upcoming workshop certifications, lab equipment, and faculty resources.',
            options: [
              { id: '1', text: 'Cloud Architecture & DevOps (AWS / Docker / Kubernetes)' },
              { id: '2', text: 'Offensive Cybersecurity & Ethical Hacking Labs' },
              { id: '3', text: 'Applied Generative AI & Large Language Models' },
              { id: '4', text: 'Mobile Systems & Cross-Platform (Flutter / React Native)' },
            ],
            status: VoicePollStatus.ACTIVE,
            createdById: userId,
            totalVotes: 0,
          },
        });
      }

      const polls = await prisma.voicePoll.findMany({
        where: status ? { status: status as VoicePollStatus } : {},
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { profile: { select: { fullName: true, avatarUrl: true } } },
          },
          votes: userId
            ? {
                where: { userId },
                select: { optionIndex: true },
              }
            : false,
        },
      });

      // Calculate vote counts per option
      const pollStats = await Promise.all(
        polls.map(async (poll) => {
          const allVotes = await prisma.voicePollVote.findMany({
            where: { pollId: poll.id },
            select: { optionIndex: true },
          });

          const counts: Record<number, number> = {};
          allVotes.forEach((v) => {
            counts[v.optionIndex] = (counts[v.optionIndex] || 0) + 1;
          });

          const userVotedOption = poll.votes?.[0]?.optionIndex ?? null;

          return {
            ...poll,
            userVotedOption,
            voteBreakdown: counts,
            totalVotes: allVotes.length,
          };
        })
      );

      res.json({ success: true, data: pollStats });
    } catch (error) {
      next(error);
    }
  },

  votePoll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const pollId = req.params.pollId as string;
      const { optionIndex } = req.body;

      const poll = await prisma.voicePoll.findUnique({ where: { id: pollId } });
      if (!poll) throw ApiError.notFound('Poll not found');
      if (poll.status !== VoicePollStatus.ACTIVE) throw ApiError.badRequest('This poll is closed');

      // Check if user already voted
      const existingVote = await prisma.voicePollVote.findUnique({
        where: { pollId_userId: { pollId, userId } },
      });
      if (existingVote) {
        throw ApiError.conflict('You have already voted in this poll');
      }

      await prisma.voicePollVote.create({
        data: { pollId, userId, optionIndex },
      });

      await prisma.voicePoll.update({
        where: { id: pollId },
        data: { totalVotes: { increment: 1 } },
      });

      res.json({ success: true, message: 'Vote recorded successfully', optionIndex });
    } catch (error) {
      next(error);
    }
  },

  createPoll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const { question, description, options, startDate, endDate, isAnonymous } = req.body;

      const formattedOptions = options.map((opt: string, idx: number) => ({
        id: `${idx + 1}`,
        text: opt,
      }));

      const poll = await prisma.voicePoll.create({
        data: {
          question,
          description: description || null,
          options: formattedOptions,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          isAnonymous: isAnonymous || false,
          createdById: userId,
          status: VoicePollStatus.ACTIVE,
        },
      });

      // Post activity
      await createActivity({
        actorId: userId,
        type: ActivityType.VOICE_POLL_CREATED,
        entityType: 'VOICE_POLL',
        title: `Community Poll Opened: "${poll.question}"`,
        description: 'Cast your vote in FCI Student Voice.',
        entityId: poll.id,
        visibility: ActivityVisibility.PUBLIC,
      }).catch(() => null);

      res.status(201).json({ success: true, message: 'Poll created', data: poll });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Suggestions ──────────────────────────────────────────────────────────
  listSuggestions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { category, status, search, page = '1', limit = '15' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {};
      if (category) whereClause.category = category as string;
      if (status) whereClause.status = status as VoiceSuggestionStatus;
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
        ];
      }

      const [suggestions, total] = await Promise.all([
        prisma.voiceSuggestion.findMany({
          where: whereClause,
          skip,
          take: limitNum,
          orderBy: [{ upvotesCount: 'desc' }, { createdAt: 'desc' }],
          include: {
            author: {
              select: {
                id: true,
                profile: { select: { fullName: true, avatarUrl: true, department: true } },
              },
            },
            votes: userId ? { where: { userId }, select: { userId: true } } : false,
          },
        }),
        prisma.voiceSuggestion.count({ where: whereClause }),
      ]);

      const formatted = suggestions.map((s) => ({
        ...s,
        isUpvoted: Boolean(s.votes && s.votes.length > 0),
        author: s.isAnonymous
          ? { id: 'anonymous', profile: { fullName: 'FCI Student', avatarUrl: null } }
          : s.author,
      }));

      res.json({
        success: true,
        data: {
          suggestions: formatted,
          pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  createSuggestion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const { title, description, category, isAnonymous } = req.body;

      const suggestion = await prisma.voiceSuggestion.create({
        data: {
          title,
          description,
          category: category || 'GENERAL',
          isAnonymous: Boolean(isAnonymous),
          authorId: userId,
          status: VoiceSuggestionStatus.SUBMITTED,
        },
      });

      res.status(201).json({ success: true, message: 'Suggestion submitted', data: suggestion });
    } catch (error) {
      next(error);
    }
  },

  upvoteSuggestion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const suggestionId = req.params.suggestionId as string;

      const existingVote = await prisma.voiceSuggestionVote.findUnique({
        where: { suggestionId_userId: { suggestionId, userId } },
      });

      if (existingVote) {
        await prisma.voiceSuggestionVote.delete({ where: { id: existingVote.id } });
        await prisma.voiceSuggestion.update({
          where: { id: suggestionId },
          data: { upvotesCount: { decrement: 1 } },
        });
        return res.json({ success: true, message: 'Upvote removed', isUpvoted: false });
      } else {
        await prisma.voiceSuggestionVote.create({
          data: { suggestionId, userId },
        });
        await prisma.voiceSuggestion.update({
          where: { id: suggestionId },
          data: { upvotesCount: { increment: 1 } },
        });
        return res.json({ success: true, message: 'Upvoted suggestion', isUpvoted: true });
      }
    } catch (error) {
      next(error);
    }
  },

  respondSuggestion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const suggestionId = req.params.suggestionId as string;
      const { status, adminResponse } = req.body;

      const updated = await prisma.voiceSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: status as VoiceSuggestionStatus,
          adminResponse,
          respondedAt: new Date(),
        },
      });

      res.json({ success: true, message: 'Response recorded', data: updated });
    } catch (error) {
      next(error);
    }
  },
};
