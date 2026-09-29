import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createCommunitySchema,
  updateCommunitySchema,
  createPostSchema,
  createCommentSchema,
  createResourceSchema,
  updateMemberRoleSchema,
  createReportSchema,
} from '../validators/community.validator';

export const communityRouter = Router();

// ── Public / Semi-public routes with optional user recognition
communityRouter.get('/', optionalAuthenticate, communityController.list);
communityRouter.get('/:slug', optionalAuthenticate, communityController.getBySlug);
communityRouter.get('/:id/members', communityController.getMembers);
communityRouter.get('/:id/posts', optionalAuthenticate, communityController.getPosts);
communityRouter.get('/:id/posts/:postId/comments', communityController.getComments);
communityRouter.get('/:id/resources', communityController.getResources);
communityRouter.get('/:id/projects', communityController.getProjects);
communityRouter.get('/:id/events', communityController.getEvents);

// ── Authenticated routes
communityRouter.post('/', authenticate, validate(createCommunitySchema), communityController.create);
communityRouter.patch('/:id', authenticate, validate(updateCommunitySchema), communityController.update);
communityRouter.post('/:id/join', authenticate, communityController.join);
communityRouter.delete('/:id/membership', authenticate, communityController.leave);
communityRouter.patch('/:id/members/:userId', authenticate, validate(updateMemberRoleSchema), communityController.updateMember);

// Posts & Discussions
communityRouter.post('/:id/posts', authenticate, validate(createPostSchema), communityController.createPost);
communityRouter.delete('/:id/posts/:postId', authenticate, communityController.deletePost);
communityRouter.post('/:id/posts/:postId/like', authenticate, communityController.toggleLike);

// Post Comments
communityRouter.post('/:id/posts/:postId/comments', authenticate, validate(createCommentSchema), communityController.createComment);
communityRouter.delete('/:id/posts/:postId/comments/:commentId', authenticate, communityController.deleteComment);

// Resources
communityRouter.post('/:id/resources', authenticate, validate(createResourceSchema), communityController.createResource);
communityRouter.delete('/:id/resources/:resourceId', authenticate, communityController.deleteResource);

// Project & Event association
communityRouter.post('/:id/projects', authenticate, communityController.associateProject);
communityRouter.post('/:id/projects/:projectId', authenticate, communityController.associateProject);
communityRouter.post('/:id/events', authenticate, communityController.associateEvent);
communityRouter.post('/:id/events/:eventId', authenticate, communityController.associateEvent);

// Reporting
communityRouter.post('/:id/reports', authenticate, validate(createReportSchema), communityController.createReport);

