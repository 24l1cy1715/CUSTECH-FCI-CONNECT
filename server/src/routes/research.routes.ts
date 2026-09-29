import { Router } from 'express';
import { researchController } from '../controllers/research.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createResearchProjectSchema,
  updateResearchProjectSchema,
  addResearchMemberSchema,
  createResearchIdeaSchema,
  addResearchIdeaCommentSchema,
  createResearchPublicationSchema,
} from '../validators/research.validator';

export const researchRouter = Router();

// Research Projects
researchRouter.get('/', optionalAuthenticate, researchController.listProjects);
researchRouter.post('/', authenticate, validate(createResearchProjectSchema), researchController.createProject);
researchRouter.get('/:idOrSlug', optionalAuthenticate, researchController.getProject);
researchRouter.patch('/:id', authenticate, validate(updateResearchProjectSchema), researchController.updateProject);

// Team Members
researchRouter.post('/:id/members', authenticate, validate(addResearchMemberSchema), researchController.addMember);
researchRouter.delete('/:id/members/:memberId', authenticate, researchController.removeMember);

// Publications
researchRouter.post('/:id/publications', authenticate, validate(createResearchPublicationSchema), researchController.addPublication);

// Ideas
researchRouter.get('/ideas/board', optionalAuthenticate, researchController.listIdeas);
researchRouter.post('/ideas', authenticate, validate(createResearchIdeaSchema), researchController.createIdea);
researchRouter.post('/ideas/:ideaId/like', authenticate, researchController.likeIdea);
researchRouter.post('/ideas/:ideaId/comments', authenticate, validate(addResearchIdeaCommentSchema), researchController.commentIdea);

export default researchRouter;
