import { Router } from 'express';
import { digitalIdController } from '../controllers/digitalId.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAnyRole, requireSuperAdmin } from '../middleware/authorize';
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

// ── Super Admin Management endpoints ─────────────────────────────────────────
digitalIdRouter.get(
  '/admin',
  authenticate,
  requireSuperAdmin,
  digitalIdController.adminListIdentities
);
digitalIdRouter.post(
  '/admin/:userId/verify',
  authenticate,
  requireSuperAdmin,
  digitalIdController.adminVerify
);
digitalIdRouter.post(
  '/admin/:userId/suspend',
  authenticate,
  requireSuperAdmin,
  validate(adminSuspendDigitalIdSchema),
  digitalIdController.adminSuspend
);
digitalIdRouter.post(
  '/admin/:userId/revoke',
  authenticate,
  requireSuperAdmin,
  validate(adminRevokeDigitalIdSchema),
  digitalIdController.adminRevoke
);
digitalIdRouter.post(
  '/admin/:userId/regenerate',
  authenticate,
  requireSuperAdmin,
  digitalIdController.adminRegenerate
);
digitalIdRouter.get(
  '/admin/logs',
  authenticate,
  requireSuperAdmin,
  digitalIdController.adminGetLogs
);


import { digitalIdVerifyLimiter } from '../middleware/rateLimiter';

// ── Public verification router ────────────────────────────────────────────────
export const publicVerifyRouter = Router();
publicVerifyRouter.get('/:token', digitalIdVerifyLimiter, digitalIdController.publicVerify);
