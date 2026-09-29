import { Router } from 'express';
import { getSkills, getSkillById, createSkill } from '../controllers/skills.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { skillQuerySchema, createSkillSchema } from '../validators/skills.validator';

export const skillsRouter = Router();

skillsRouter.get('/', validate(skillQuerySchema), getSkills);
skillsRouter.get('/:id', getSkillById);
skillsRouter.post(
  '/',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  validate(createSkillSchema),
  createSkill
);
