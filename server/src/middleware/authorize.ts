import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

export function requireRole(role: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!req.user.roles.includes(role) && !req.user.roles.includes('SUPER_ADMIN')) {
      return next(ApiError.forbidden(`Requires ${role} permission`));
    }

    next();
  };
}

export function requireAnyRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const hasPermission =
      roles.some((r) => req.user?.roles.includes(r)) ||
      req.user.roles.includes('SUPER_ADMIN');

    if (!hasPermission) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
}
