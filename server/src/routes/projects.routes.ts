import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createProjectSchema } from '../validators/project.validator';

export const projectsRouter = Router();

projectsRouter.get('/', optionalAuthenticate, projectController.listProjects);
projectsRouter.get('/:slug', optionalAuthenticate, projectController.getProjectBySlug);
projectsRouter.post('/', authenticate, validate(createProjectSchema), projectController.createProject);
projectsRouter.post('/:id/like', authenticate, projectController.likeProject);

export default projectsRouter;
