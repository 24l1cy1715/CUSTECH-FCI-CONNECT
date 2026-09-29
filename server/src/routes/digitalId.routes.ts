import { Router } from 'express';
import { digitalIdController } from '../controllers/digitalId.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  updateDigitalIdVisibilitySchema,
  adminSuspendDigitalIdSchema,
  adminRevokeDigitalIdSchema,
} from '../validators/digitalId.validator';

export const digitalIdRouter = Router();

// ── Student Digital ID endpoints ──────────────────────────────────────────────
digitalIdRouter.get('/', authenticate, digitalIdController.getMyDigitalId);
digitalIdRouter.post('/request', authenticate, digitalIdController.requestVerification);
digitalIdRouter.patch(
  '/visibility',
  authenticate,
  validate(updateDigitalIdVisibilitySchema),
  digitalIdController.updateVisibility
);
digitalIdRouter.post('/regenerate', authenticate, digitalIdController.regenerateToken);

// ── Admin Management endpoints ────────────────────────────────────────────────
digitalIdRouter.get(
  '/admin',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  digitalIdController.adminListIdentities
);
digitalIdRouter.post(
  '/admin/:userId/verify',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  digitalIdController.adminVerify
);
digitalIdRouter.post(
  '/admin/:userId/suspend',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  validate(adminSuspendDigitalIdSchema),
  digitalIdController.adminSuspend
);
digitalIdRouter.post(
  '/admin/:userId/revoke',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  validate(adminRevokeDigitalIdSchema),
  digitalIdController.adminRevoke
);
digitalIdRouter.post(
  '/admin/:userId/regenerate',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  digitalIdController.adminRegenerate
);
digitalIdRouter.get(
  '/admin/logs',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  digitalIdController.adminGetLogs
);

import { digitalIdVerifyLimiter } from '../middleware/rateLimiter';

// ── Public verification router ────────────────────────────────────────────────
export const publicVerifyRouter = Router();
publicVerifyRouter.get('/:token', digitalIdVerifyLimiter, digitalIdController.publicVerify);
