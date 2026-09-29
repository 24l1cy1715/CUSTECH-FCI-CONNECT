import { Router } from 'express';
import { assessmentController } from '../controllers/assessment.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { assessmentSubmitLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { submitAttemptSchema } from '../validators/assessment.validator';

export const assessmentRouter = Router();

assessmentRouter.get('/', optionalAuthenticate, assessmentController.listAssessments);
assessmentRouter.get('/my-attempts', authenticate, assessmentController.getMyAttempts);
assessmentRouter.get('/:slugOrId', optionalAuthenticate, assessmentController.getAssessment);
assessmentRouter.post(
  '/:id/submit',
  authenticate,
  assessmentSubmitLimiter,
  validate(submitAttemptSchema),
  assessmentController.submitAttempt
);

export default assessmentRouter;
