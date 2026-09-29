import { Router } from 'express';
import {
  getPublicPortfolio,
  getMyPortfolioSettings,
  updateMyPortfolioSettings,
  requestPortfolioConnect,
} from '../controllers/portfolio.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  updatePortfolioSchema,
  portfolioConnectRequestSchema,
} from '../validators/portfolio.validator';

export const portfolioRouter = Router();

// Public portfolio access (with optional user context for privacy check)
portfolioRouter.get('/public/:username', getPublicPortfolio);

// Authenticated user settings
portfolioRouter.get('/me', authenticate, getMyPortfolioSettings);
portfolioRouter.patch(
  '/me',
  authenticate,
  validate(updatePortfolioSchema),
  updateMyPortfolioSettings
);

// Secure visitor contact
portfolioRouter.post(
  '/:username/connect',
  validate(portfolioConnectRequestSchema),
  requestPortfolioConnect
);
