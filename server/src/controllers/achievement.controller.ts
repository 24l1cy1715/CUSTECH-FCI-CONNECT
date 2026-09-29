import { Request, Response, NextFunction } from 'express';
import { AchievementService } from '../services/achievement.service';
import { ApiError } from '../middleware/errorHandler';
import { AchievementCategory, AchievementVerificationStatus } from '@prisma/client';
import {
  submitEvidenceSchema,
  reviewSubmissionSchema,
  createAchievementSchema,
  updateAchievementSchema,
} from '../validators/achievement.validator';

/**
 * GET /api/v1/achievements
 * Get user's achievements, stats, reputation progress, and catalog
 */
export async function getMyAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const data = await AchievementService.getUserAchievements(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/achievements/public/:userId
 * Public achievements for student digital portfolio or profile
 */
export async function getPublicAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = String(req.params.userId);
    const data = await AchievementService.getPublicUserAchievements(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/achievements/catalog
 * List all available platform achievements by category
 */
export async function getCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category } = req.query as { category?: AchievementCategory };
    const achievements = await AchievementService.getAllAchievements(category);
    res.json({ success: true, data: achievements });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/achievements/:achievementId/submit
 * Student submits evidence for verification
 */
export async function submitEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const achievementId = String(req.params.achievementId);

    const validated = submitEvidenceSchema.parse(req.body);
    const result = await AchievementService.submitEvidence(userId, achievementId, validated);

    res.json({
      success: true,
      message: 'Evidence submitted successfully. A faculty moderator will review your submission.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/achievements/leaderboard
 * Filterable reputation leaderboard
 */
export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { department, level, limit, page } = req.query;
    const result = await AchievementService.getLeaderboard({
      department: department as string,
      level: level as string,
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/achievements/admin/submissions
 * Admin: List pending submissions for review
 */
export async function getAdminSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page, limit } = req.query;
    const result = await AchievementService.getAdminSubmissions({
      status: (status as AchievementVerificationStatus) || AchievementVerificationStatus.PENDING,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/achievements/admin/submissions/:id/review
 * Admin: Verify or reject submission
 */
export async function reviewSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user!.userId;
    const id = String(req.params.id);

    const { action, notes } = reviewSubmissionSchema.parse(req.body);
    const result = await AchievementService.reviewSubmission(id, adminId, action, notes);

    res.json({
      success: true,
      message: action === 'VERIFY' ? 'Achievement verified and reputation points awarded!' : 'Submission rejected with feedback notes.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/achievements/admin
 * Admin: Create a new custom achievement
 */
export async function createAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = createAchievementSchema.parse(req.body);
    const result = await AchievementService.createAchievement(validated);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/achievements/admin/:id
 * Admin: Update achievement
 */
export async function updateAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const validated = updateAchievementSchema.parse(req.body);
    const result = await AchievementService.updateAchievement(id, validated);

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
