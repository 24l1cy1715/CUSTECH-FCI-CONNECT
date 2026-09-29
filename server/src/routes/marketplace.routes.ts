import { Router } from 'express';
import { marketplaceController } from '../controllers/marketplace.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { marketplaceActionLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  createMarketplaceServiceSchema,
  updateMarketplaceServiceSchema,
  createMarketplaceInquirySchema,
  updateInquiryStatusSchema,
} from '../validators/marketplace.validator';

export const marketplaceRouter = Router();

marketplaceRouter.get('/', optionalAuthenticate, marketplaceController.listServices);
marketplaceRouter.post(
  '/',
  authenticate,
  marketplaceActionLimiter,
  validate(createMarketplaceServiceSchema),
  marketplaceController.createService
);
marketplaceRouter.get('/inquiries/my', authenticate, marketplaceController.listMyInquiries);
marketplaceRouter.get('/:slugOrId', optionalAuthenticate, marketplaceController.getService);
marketplaceRouter.patch('/:id', authenticate, validate(updateMarketplaceServiceSchema), marketplaceController.updateService);
marketplaceRouter.post(
  '/:serviceId/inquire',
  authenticate,
  marketplaceActionLimiter,
  validate(createMarketplaceInquirySchema),
  marketplaceController.createInquiry
);
marketplaceRouter.patch('/inquiries/:inquiryId/status', authenticate, validate(updateInquiryStatusSchema), marketplaceController.updateInquiryStatus);

export default marketplaceRouter;
