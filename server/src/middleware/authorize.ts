import { Request, Response, NextFunction } from 'express';
import { RoleName } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from './errorHandler';

/**
 * Resolves the authenticated user from the database to ensure roles
 * and account status are strictly authoritative and not solely reliant on JWT payload.
 */
async function resolveAuthoritativeUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isActive: true,
      isSuspended: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
              rolePermissions: {
                select: {
                  permission: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Log unauthorized access attempts to the security audit trail.
 */
async function logSecurityViolation(
  actorId: string,
  action: string,
  req: Request,
  metadata: Record<string, any>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType: 'SECURITY_GATEWAY',
        entityId: req.originalUrl || req.baseUrl,
        ipAddress: req.ip || (req.socket?.remoteAddress as string) || 'unknown',
        metadata: JSON.stringify(metadata),
      },
    });
  } catch (err) {
    // Fail-open for logging error so request failure handling continues
    console.error('Failed to write security audit log:', err);
  }
}

/**
 * Enforces that the authenticated user possesses a specific role in the database.
 * If role is 'SUPER_ADMIN', only users with active SUPER_ADMIN role in DB pass.
 * For other roles, SUPER_ADMIN automatically satisfies clearance.
 */
export function requireRole(role: RoleName | string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.user.userId) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    try {
      const dbUser = await resolveAuthoritativeUser(req.user.userId);

      if (!dbUser) {
        return next(ApiError.unauthorized('User identity not found in database'));
      }

      if (!dbUser.isActive) {
        return next(ApiError.forbidden('Account is currently deactivated'));
      }

      if (dbUser.isSuspended) {
        return next(ApiError.forbidden('Account has been suspended'));
      }

      const authoritativeRoles = dbUser.userRoles.map((ur) => ur.role.name);
      // Synchronize req.user with authoritative server state
      req.user.roles = authoritativeRoles;

      const isAuthorized =
        (authoritativeRoles as string[]).includes(role) ||
        (role !== 'SUPER_ADMIN' && authoritativeRoles.includes('SUPER_ADMIN'));

      if (!isAuthorized) {
        if (role === 'SUPER_ADMIN') {
          await logSecurityViolation(
            req.user.userId,
            'UNAUTHORIZED_SUPER_ADMIN_API_ACCESS',
            req,
            {
              method: req.method,
              path: req.originalUrl,
              assignedRoles: authoritativeRoles,
              requiredRole: role,
            }
          );
        }

        return next(ApiError.forbidden(`Access forbidden: requires ${role} clearance`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Strict helper requiring specifically the SUPER_ADMIN role.
 */
export const requireSuperAdmin = requireRole('SUPER_ADMIN');

/**
 * Enforces that the authenticated user possesses at least one of the specified roles in the database.
 */
export function requireAnyRole(roles: (RoleName | string)[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.user.userId) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    try {
      const dbUser = await resolveAuthoritativeUser(req.user.userId);

      if (!dbUser) {
        return next(ApiError.unauthorized('User identity not found in database'));
      }

      if (!dbUser.isActive) {
        return next(ApiError.forbidden('Account is currently deactivated'));
      }

      if (dbUser.isSuspended) {
        return next(ApiError.forbidden('Account has been suspended'));
      }

      const authoritativeRoles = dbUser.userRoles.map((ur) => ur.role.name);
      req.user.roles = authoritativeRoles;

      const hasPermission =
        roles.some((r) => (authoritativeRoles as string[]).includes(r)) ||
        authoritativeRoles.includes('SUPER_ADMIN');


      if (!hasPermission) {
        if (roles.includes('SUPER_ADMIN')) {
          await logSecurityViolation(
            req.user.userId,
            'UNAUTHORIZED_ADMIN_API_ACCESS',
            req,
            {
              method: req.method,
              path: req.originalUrl,
              assignedRoles: authoritativeRoles,
              requiredRoles: roles,
            }
          );
        }

        return next(ApiError.forbidden('Access forbidden: insufficient clearance'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Enforces fine-grained permission check against database role permissions.
 */
export function requirePermission(permissionName: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.user.userId) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    try {
      const dbUser = await resolveAuthoritativeUser(req.user.userId);

      if (!dbUser || !dbUser.isActive || dbUser.isSuspended) {
        return next(ApiError.forbidden('Account is unavailable'));
      }

      const authoritativeRoles = dbUser.userRoles.map((ur) => ur.role.name);
      req.user.roles = authoritativeRoles;

      // SUPER_ADMIN has implicit full permissions
      if (authoritativeRoles.includes('SUPER_ADMIN')) {
        return next();
      }

      const permissions = new Set<string>();
      dbUser.userRoles.forEach((ur) => {
        ur.role.rolePermissions.forEach((rp) => {
          permissions.add(rp.permission.name);
        });
      });

      if (!permissions.has(permissionName)) {
        return next(ApiError.forbidden(`Access forbidden: missing permission ${permissionName}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

