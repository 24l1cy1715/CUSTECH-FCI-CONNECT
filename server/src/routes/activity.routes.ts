import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthJwtPayload } from '../middleware/authenticate';
import { listActivity, getActivity } from '../controllers/activity.controller';

export const activityRouter = Router();

// ── Optional authentication middleware ────────────────────────────────────────
// Attaches req.user if a valid token is present, but does NOT reject if missing.
function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (token) {
    try {
      const decoded = jwt.verify(token, env.AUTH_SECRET) as AuthJwtPayload;
      req.user = decoded;
    } catch {
      // Invalid/expired token — treat as unauthenticated (public visibility only)
    }
  }
  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────
activityRouter.get('/', optionalAuth, listActivity);
activityRouter.get('/:id', optionalAuth, getActivity);
