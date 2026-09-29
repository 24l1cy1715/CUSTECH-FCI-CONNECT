import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthJwtPayload } from './authenticate';
import { SystemSettingService } from '../services/systemSetting.service';

/**
 * Global Student Portal Lockdown Enforcement Middleware.
 * 
 * When STUDENT_PORTAL_LOCKDOWN is enabled in MySQL:
 * - Allows SUPER_ADMIN and ADMIN access unconditionally to all routes.
 * - Allows access to administrative routes, authentication routes, health endpoints, and system status.
 * - Strictly rejects all student routes and general community endpoints with HTTP 423 (Locked).
 */
export async function lockdownMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Check if lockdown is active in the database
    const lockdown = await SystemSettingService.getLockdownStatus();
    if (!lockdown.enabled) {
      return next();
    }

    // 2. Unconditionally allow system, administrative, and auth paths
    const path = req.path;

    // Direct system and health bypass
    if (
      path === '/health' ||
      path === '/api/health' ||
      path.startsWith('/system/lockdown') ||
      path.startsWith('/api/v1/system/lockdown')
    ) {
      return next();
    }

    // Authentication bypass (Allows Admins to log in, rotate tokens, and log out)
    if (path.startsWith('/auth') || path.startsWith('/api/v1/auth')) {
      return next();
    }

    // Administrative console bypass
    if (path.startsWith('/admin') || path.startsWith('/api/v1/admin')) {
      return next();
    }

    // 3. Check caller credentials (check req.user or decode token if available)
    let user = req.user;

    if (!user) {
      const token =
        req.cookies?.access_token ||
        req.cookies?.accessToken ||
        (req.headers.authorization?.startsWith('Bearer ')
          ? req.headers.authorization.substring(7)
          : null);

      if (token) {
        try {
          const decoded = jwt.verify(token, env.AUTH_SECRET) as AuthJwtPayload;
          if (decoded) {
            user = decoded;
          }
        } catch {
          // Token invalid, user remains undefined
        }
      }
    }

    // If caller is an elevated administrator (ADMIN or SUPER_ADMIN), allow access
    if (user && (user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN'))) {
      return next();
    }

    // 4. Caller is a student or unauthenticated user trying to access the student portal during lockdown
    return res.status(423).json({
      success: false,
      code: 'STUDENT_PORTAL_LOCKED',
      message:
        lockdown.message ||
        'The FCI Connect student portal is temporarily locked for administrative maintenance.',
      locked: true,
      updatedAt: lockdown.updatedAt,
    });
  } catch (error) {
    console.error('[LockdownMiddleware] Error checking system status:', error);
    // On unexpected check failure, fail open to next middleware rather than breaking the app
    next();
  }
}
