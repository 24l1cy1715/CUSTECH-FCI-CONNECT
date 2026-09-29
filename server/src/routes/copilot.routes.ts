import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { aiRateLimiter } from '../middleware/rateLimiter';
import {
  getConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
  submitFeedback,
  getUsage,
} from '../controllers/copilot.controller';

export const copilotRouter = Router();

// All Copilot endpoints require authentication and dedicated AI rate limiting
copilotRouter.use(authenticate);
copilotRouter.use(aiRateLimiter);

copilotRouter.get('/conversations', getConversations);
copilotRouter.post('/conversations', createConversation);
copilotRouter.get('/conversations/:id', getConversation);
copilotRouter.delete('/conversations/:id', deleteConversation);
copilotRouter.post('/conversations/:id/messages', sendMessage);

copilotRouter.post('/feedback', submitFeedback);
copilotRouter.get('/usage', getUsage);
