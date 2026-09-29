import { Router } from 'express';
import { voiceController } from '../controllers/voice.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import { voiceVoteLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  createVoicePollSchema,
  votePollSchema,
  createVoiceSuggestionSchema,
  respondVoiceSuggestionSchema,
} from '../validators/voice.validator';

export const voiceRouter = Router();

// Polls
voiceRouter.get('/polls', optionalAuthenticate, voiceController.listPolls);
voiceRouter.post(
  '/polls',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'EDITOR']),
  validate(createVoicePollSchema),
  voiceController.createPoll
);
voiceRouter.post(
  '/polls/:pollId/vote',
  authenticate,
  voiceVoteLimiter,
  validate(votePollSchema),
  voiceController.votePoll
);

// Suggestions
voiceRouter.get('/suggestions', optionalAuthenticate, voiceController.listSuggestions);
voiceRouter.post(
  '/suggestions',
  authenticate,
  validate(createVoiceSuggestionSchema),
  voiceController.createSuggestion
);
voiceRouter.post(
  '/suggestions/:suggestionId/upvote',
  authenticate,
  voiceVoteLimiter,
  voiceController.upvoteSuggestion
);
voiceRouter.patch(
  '/suggestions/:suggestionId/respond',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']),
  validate(respondVoiceSuggestionSchema),
  voiceController.respondSuggestion
);

export default voiceRouter;
