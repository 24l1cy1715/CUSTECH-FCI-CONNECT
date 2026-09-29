import { Router } from 'express';
import { learningController } from '../controllers/learning.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createLearningResourceSchema,
  submitStudentResourceSchema,
  updateLearningResourceSchema,
  reviewResourceSchema,
  updateProgressSchema,
  createLearningPathSchema,
  updateLearningPathSchema,
} from '../validators/learning.validator';

export const learningRouter = Router();

// ── Public / Semi-public student discovery routes ─────────────────────────────
learningRouter.get('/overview', optionalAuthenticate, learningController.getHubOverview);
learningRouter.get('/resources', optionalAuthenticate, learningController.listResources);
learningRouter.get('/resources/:slug', optionalAuthenticate, learningController.getBySlug);
learningRouter.get('/categories', learningController.getCategoriesAndTaxonomy);
learningRouter.get('/taxonomies', learningController.getCategoriesAndTaxonomy);
learningRouter.get('/paths', optionalAuthenticate, learningController.listPaths);
learningRouter.get('/paths/:slug', optionalAuthenticate, learningController.getPathBySlug);

// ── Authenticated student learning hub routes ─────────────────────────────────
learningRouter.post(
  '/resources/submissions',
  authenticate,
  validate(submitStudentResourceSchema),
  learningController.submitResource
);
learningRouter.post(
  '/resources/:id/progress',
  authenticate,
  validate(updateProgressSchema),
  learningController.updateProgress
);
learningRouter.patch(
  '/resources/:id/progress',
  authenticate,
  validate(updateProgressSchema),
  learningController.updateProgress
);
learningRouter.post('/resources/:id/save', authenticate, learningController.toggleSaveResource);
learningRouter.delete('/resources/:id/save', authenticate, learningController.toggleSaveResource);
learningRouter.get('/saved', authenticate, learningController.getSavedResources);
learningRouter.get('/continue', authenticate, learningController.getContinueLearning);
learningRouter.get('/recommendations', authenticate, learningController.getPersonalizedRecommendations);
learningRouter.post('/paths/:id/enroll', authenticate, learningController.enrollPath);

// ── Administrative / Moderator routes ─────────────────────────────────────────
learningRouter.get(
  '/admin/submissions',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'MODERATOR']),
  learningController.adminListSubmissions
);
learningRouter.patch(
  '/admin/submissions/:id/review',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'MODERATOR']),
  validate(reviewResourceSchema),
  learningController.adminReviewSubmission
);
learningRouter.post(
  '/admin/resources',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  validate(createLearningResourceSchema),
  learningController.adminCreateResource
);
learningRouter.patch(
  '/admin/resources/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  validate(updateLearningResourceSchema),
  learningController.adminUpdateResource
);
learningRouter.delete(
  '/admin/resources/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  learningController.adminDeleteResource
);
learningRouter.post(
  '/admin/paths',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  validate(createLearningPathSchema),
  learningController.adminCreatePath
);
learningRouter.patch(
  '/admin/paths/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  validate(updateLearningPathSchema),
  learningController.adminUpdatePath
);
learningRouter.delete(
  '/admin/paths/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  learningController.adminDeletePath
);
