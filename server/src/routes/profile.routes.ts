import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/authenticate';
import { avatarUploadMiddleware } from '../middleware/upload';
import { uploadRateLimiter } from '../middleware/rateLimiter';

export const profileRouter = Router();

// Profile avatar management
profileRouter.post(
  '/avatar',
  authenticate,
  uploadRateLimiter,
  avatarUploadMiddleware.single('avatar'),
  ProfileController.uploadAvatar
);

profileRouter.delete(
  '/avatar',
  authenticate,
  ProfileController.deleteAvatar
);

// Profile data
profileRouter.get('/me', authenticate, ProfileController.getMyProfile);
