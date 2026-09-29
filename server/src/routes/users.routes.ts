import { Router } from 'express';
import {
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
} from '../controllers/skills.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  addStudentSkillSchema,
  updateStudentSkillSchema,
  deleteStudentSkillSchema,
} from '../validators/skills.validator';

import { ProfileController } from '../controllers/profile.controller';
import { avatarUploadMiddleware } from '../middleware/upload';
import { uploadRateLimiter } from '../middleware/rateLimiter';

export const usersRouter = Router();

// Profile avatar endpoints
usersRouter.post('/avatar', authenticate, uploadRateLimiter, avatarUploadMiddleware.single('avatar'), ProfileController.uploadAvatar);
usersRouter.delete('/avatar', authenticate, ProfileController.deleteAvatar);

// Student skills endpoints
usersRouter.get('/:userId/skills', getUserSkills);
usersRouter.post('/:userId/skills', authenticate, validate(addStudentSkillSchema), addUserSkill);
usersRouter.patch('/:userId/skills/:skillId', authenticate, validate(updateStudentSkillSchema), updateUserSkill);
usersRouter.delete('/:userId/skills/:skillId', authenticate, validate(deleteStudentSkillSchema), deleteUserSkill);
