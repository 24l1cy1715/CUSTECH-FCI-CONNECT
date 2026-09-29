import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAnyRole } from '../middleware/authorize';
import {
  listLocations,
  getLocation,
  getCategories,
  adminListLocations,
  adminCreateLocation,
  adminUpdateLocation,
  adminDeleteLocation,
} from '../controllers/campus.controller';

export const campusRouter = Router();

// ── Public Routes ─────────────────────────────────────────────────────────────
campusRouter.get('/locations', listLocations);
campusRouter.get('/locations/:slug', getLocation);
campusRouter.get('/categories', getCategories);

// ── Admin Routes (ADMIN / SUPER_ADMIN only) ───────────────────────────────────
campusRouter.get(
  '/admin/locations',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  adminListLocations,
);

campusRouter.post(
  '/admin/locations',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  adminCreateLocation,
);

campusRouter.patch(
  '/admin/locations/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  adminUpdateLocation,
);

campusRouter.delete(
  '/admin/locations/:id',
  authenticate,
  requireAnyRole(['ADMIN', 'SUPER_ADMIN']),
  adminDeleteLocation,
);
