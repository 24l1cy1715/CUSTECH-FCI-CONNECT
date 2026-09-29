import { Router } from 'express';
import { intelligenceController } from '../controllers/intelligence.controller';
import { authenticate } from '../middleware/authenticate';

export const intelligenceRouter = Router();

intelligenceRouter.get('/my-fci', authenticate, intelligenceController.getMyFciSummary);
intelligenceRouter.get('/next-actions', authenticate, intelligenceController.getNextActions);
intelligenceRouter.get('/recommendations', authenticate, intelligenceController.getRecommendations);

export default intelligenceRouter;
