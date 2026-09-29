import { Router } from 'express';
import {
  getOpportunities,
  getOpportunityBySlug,
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
  createOpportunity,
  reportOpportunity,
  moderateOpportunity,
} from '../controllers/opportunity.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createOpportunitySchema,
  reportOpportunitySchema,
  moderateOpportunitySchema,
  queryOpportunitiesSchema,
} from '../validators/opportunity.validator';

export const opportunityRouter = Router();

// Public / Authenticated listing & search
opportunityRouter.get('/', validate(queryOpportunitiesSchema), getOpportunities);

// Saved opportunities for logged in student
opportunityRouter.get('/saved', authenticate, getSavedOpportunities);

// Detail page by slug
opportunityRouter.get('/:slug', getOpportunityBySlug);

// Submit / Create new opportunity
opportunityRouter.post(
  '/',
  authenticate,
  validate(createOpportunitySchema),
  createOpportunity
);

// Save / Bookmark opportunity
opportunityRouter.post('/:id/save', authenticate, saveOpportunity);
opportunityRouter.delete('/:id/save', authenticate, unsaveOpportunity);

// Report suspicious / broken opportunity
opportunityRouter.post(
  '/:id/report',
  authenticate,
  validate(reportOpportunitySchema),
  reportOpportunity
);

// Admin / Moderator moderation
opportunityRouter.patch(
  '/:id/moderate',
  authenticate,
  requireAnyRole(['ADMIN', 'MODERATOR', 'SUPER_ADMIN']),
  validate(moderateOpportunitySchema),
  moderateOpportunity
);
