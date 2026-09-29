import { Router } from 'express';
import { announcementController } from '../controllers/announcement.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validators/announcement.validator';

export const announcementRouter = Router();

announcementRouter.get('/', optionalAuthenticate, announcementController.listAnnouncements);
announcementRouter.post(
  '/',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  validate(createAnnouncementSchema),
  announcementController.createAnnouncement
);
announcementRouter.get('/:slugOrId', optionalAuthenticate, announcementController.getAnnouncement);
announcementRouter.post('/:id/read', authenticate, announcementController.markAsRead);
announcementRouter.patch(
  '/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']),
  validate(updateAnnouncementSchema),
  announcementController.updateAnnouncement
);

export default announcementRouter;
