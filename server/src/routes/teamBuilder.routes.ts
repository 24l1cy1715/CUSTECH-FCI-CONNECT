import { Router } from 'express';
import {
  analyzeProject,
  findMatches,
  sendInvitation,
  getInvitations,
  respondToInvitation,
} from '../controllers/teamBuilder.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  analyzeProjectSchema,
  findMatchesSchema,
  createInvitationSchema,
  updateInvitationSchema,
} from '../validators/teamBuilder.validator';

export const teamBuilderRouter = Router();

// Analyze project description with heuristic / NLP keyword extraction
teamBuilderRouter.post('/analyze', validate(analyzeProjectSchema), analyzeProject);

// Find matching collaborators with deterministic scoring engine
teamBuilderRouter.post('/matches', validate(findMatchesSchema), findMatches);

// Invitations management
teamBuilderRouter.post('/invitations', authenticate, validate(createInvitationSchema), sendInvitation);
teamBuilderRouter.get('/invitations', authenticate, getInvitations);
teamBuilderRouter.patch('/invitations/:id', authenticate, validate(updateInvitationSchema), respondToInvitation);
