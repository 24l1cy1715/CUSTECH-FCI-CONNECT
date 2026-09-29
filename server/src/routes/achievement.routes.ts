import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import {
  getMyAchievements,
  getPublicAchievements,
  getCatalog,
  submitEvidence,
  getLeaderboard,
  getAdminSubmissions,
  reviewSubmission,
  createAchievement,
  updateAchievement,
} from '../controllers/achievement.controller';

export const achievementRouter = Router();

// Public routes
achievementRouter.get('/public/:userId', getPublicAchievements);
achievementRouter.get('/catalog', getCatalog);
achievementRouter.get('/leaderboard', getLeaderboard);

// Authenticated student routes
achievementRouter.get('/mine', authenticate, getMyAchievements);
achievementRouter.post('/:achievementId/submit', authenticate, submitEvidence);

// Admin & Moderator routes
achievementRouter.get(
  '/admin/submissions',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']),
  getAdminSubmissions,
);

achievementRouter.post(
  '/admin/submissions/:id/review',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']),
  reviewSubmission,
);

achievementRouter.post(
  '/admin',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  createAchievement,
);

achievementRouter.patch(
  '/admin/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  updateAchievement,
);
