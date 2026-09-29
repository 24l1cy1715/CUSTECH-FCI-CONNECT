import { Router } from 'express';
import { projectLabController } from '../controllers/projectLab.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createLabProjectSchema,
  updateLabProjectSchema,
  inviteMemberSchema,
  respondInvitationSchema,
  createTaskSchema,
  updateTaskSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  createDiscussionSchema,
  createLabResourceSchema,
  submitToShowcaseSchema,
} from '../validators/projectLab.validator';

const router = Router();

// ── Project Lab Core ─────────────────────────────────────────────────────────
router.get('/', optionalAuthenticate, projectLabController.listProjects);
router.post('/', authenticate, validate(createLabProjectSchema), projectLabController.createProject);
router.get('/:id', optionalAuthenticate, projectLabController.getProjectDetail);
router.patch('/:id', authenticate, validate(updateLabProjectSchema), projectLabController.updateProject);

// ── Team Members ─────────────────────────────────────────────────────────────
router.post('/:id/members', authenticate, validate(inviteMemberSchema), projectLabController.inviteMember);
router.patch('/:id/members/respond', authenticate, validate(respondInvitationSchema), projectLabController.respondInvitation);
router.delete('/:id/members/:memberId', authenticate, projectLabController.removeMember);

// ── Tasks ────────────────────────────────────────────────────────────────────
router.post('/:id/tasks', authenticate, validate(createTaskSchema), projectLabController.createTask);
router.patch('/:id/tasks/:taskId', authenticate, validate(updateTaskSchema), projectLabController.updateTask);
router.delete('/:id/tasks/:taskId', authenticate, projectLabController.deleteTask);

// ── Milestones ───────────────────────────────────────────────────────────────
router.post('/:id/milestones', authenticate, validate(createMilestoneSchema), projectLabController.createMilestone);
router.patch('/:id/milestones/:milestoneId', authenticate, validate(updateMilestoneSchema), projectLabController.updateMilestone);

// ── Discussions ──────────────────────────────────────────────────────────────
router.get('/:id/discussions', optionalAuthenticate, projectLabController.getDiscussions);
router.post('/:id/discussions', authenticate, validate(createDiscussionSchema), projectLabController.createDiscussion);

// ── Resources ────────────────────────────────────────────────────────────────
router.post('/:id/resources', authenticate, validate(createLabResourceSchema), projectLabController.addResource);

// ── Showcase Submission ──────────────────────────────────────────────────────
router.post('/:id/showcase-submit', authenticate, validate(submitToShowcaseSchema), projectLabController.submitToShowcase);

export default router;
