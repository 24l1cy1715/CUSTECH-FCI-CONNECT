import { Router } from 'express';
import { opportunityTrackerController } from '../controllers/opportunityTracker.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  trackOpportunitySchema,
  updateOpportunityTrackingSchema,
} from '../validators/opportunityTracker.validator';

const router = Router();

// User's private tracker list
router.get('/tracker', authenticate, opportunityTrackerController.getMyTrackedOpportunities);

// Upcoming deadlines
router.get('/tracker/upcoming', authenticate, opportunityTrackerController.getUpcomingDeadlines);

// Skill graph recommendations
router.get('/tracker/recommendations', authenticate, opportunityTrackerController.getRecommendations);

// Track / Untrack / Update
router.post('/:id/track', authenticate, validate(trackOpportunitySchema), opportunityTrackerController.trackOpportunity);
router.patch('/:id/track', authenticate, validate(updateOpportunityTrackingSchema), opportunityTrackerController.updateTracking);
router.delete('/:id/track', authenticate, opportunityTrackerController.untrackOpportunity);

export default router;
