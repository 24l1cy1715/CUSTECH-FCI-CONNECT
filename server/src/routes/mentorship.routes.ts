import { Router } from 'express';
import { mentorshipController } from '../controllers/mentorship.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  upsertMentorProfileSchema,
  updateMentorProfileStatusSchema,
  createMentorshipRequestSchema,
  respondMentorshipRequestSchema,
  createGoalSchema,
  updateGoalSchema,
  createSessionSchema,
  updateSessionSchema,
  createMentorshipResourceSchema,
} from '../validators/mentorship.validator';

export const mentorshipRouter = Router();

// ── Mentor Discovery (Public / Semi-Public)
mentorshipRouter.get('/mentors', optionalAuthenticate, mentorshipController.listMentors);
mentorshipRouter.get('/mentors/:id', optionalAuthenticate, mentorshipController.getMentorById);

// ── Profile Management
mentorshipRouter.get('/profile/me', authenticate, mentorshipController.getMyProfile);
mentorshipRouter.post('/profile', authenticate, validate(upsertMentorProfileSchema), mentorshipController.upsertProfile);
mentorshipRouter.patch('/profile', authenticate, validate(upsertMentorProfileSchema), mentorshipController.upsertProfile);
mentorshipRouter.patch('/profile/availability', authenticate, validate(updateMentorProfileStatusSchema), mentorshipController.toggleAvailability);

// ── Dashboard
mentorshipRouter.get('/dashboard', authenticate, mentorshipController.getDashboard);

// ── Requests
mentorshipRouter.post('/requests', authenticate, validate(createMentorshipRequestSchema), mentorshipController.requestMentorship);
mentorshipRouter.get('/requests', authenticate, mentorshipController.getRequests);
mentorshipRouter.patch('/requests/:id', authenticate, validate(respondMentorshipRequestSchema), mentorshipController.respondToRequest);

// ── Relationships & Hub
mentorshipRouter.get('/relationships/:id', authenticate, mentorshipController.getRelationship);
mentorshipRouter.post('/relationships/:id/end', authenticate, mentorshipController.endRelationship);

// Goals
mentorshipRouter.post('/relationships/:id/goals', authenticate, validate(createGoalSchema), mentorshipController.createGoal);
mentorshipRouter.patch('/relationships/:id/goals/:goalId', authenticate, validate(updateGoalSchema), mentorshipController.updateGoal);
mentorshipRouter.delete('/relationships/:id/goals/:goalId', authenticate, mentorshipController.deleteGoal);

// Sessions
mentorshipRouter.post('/relationships/:id/sessions', authenticate, validate(createSessionSchema), mentorshipController.createSession);
mentorshipRouter.patch('/relationships/:id/sessions/:sessionId', authenticate, validate(updateSessionSchema), mentorshipController.updateSession);

// Resources
mentorshipRouter.post('/relationships/:id/resources', authenticate, validate(createMentorshipResourceSchema), mentorshipController.createResource);
mentorshipRouter.delete('/relationships/:id/resources/:resourceId', authenticate, mentorshipController.deleteResource);

// Reports & Safety
mentorshipRouter.post('/relationships/:id/reports', authenticate, mentorshipController.reportUser);
