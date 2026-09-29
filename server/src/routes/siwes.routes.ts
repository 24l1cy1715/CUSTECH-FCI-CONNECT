import { Router } from 'express';
import { siwesController } from '../controllers/siwes.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  updatePlacementSchema,
  createWeeklyLogSchema,
  updateWeeklyLogSchema,
  createSiwesDocumentSchema,
} from '../validators/siwes.validator';

export const siwesRouter = Router();

// Student Placement
siwesRouter.get('/my-placement', authenticate, siwesController.getMyPlacement);
siwesRouter.patch('/my-placement', authenticate, validate(updatePlacementSchema), siwesController.updatePlacement);

// Weekly Logs
siwesRouter.post('/logs', authenticate, validate(createWeeklyLogSchema), siwesController.createWeeklyLog);
siwesRouter.patch('/logs/:logId', authenticate, validate(updateWeeklyLogSchema), siwesController.updateWeeklyLog);

// Documents
siwesRouter.post('/documents', authenticate, validate(createSiwesDocumentSchema), siwesController.addDocument);
siwesRouter.delete('/documents/:docId', authenticate, siwesController.deleteDocument);

export default siwesRouter;
