import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/authorize';
import { SystemSettingService } from '../services/systemSetting.service';

export const systemRouter = Router();

/**
 * GET /api/v1/system/lockdown
 * Public status endpoint: returns current student portal lockdown status and message.
 */
systemRouter.get('/lockdown', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await SystemSettingService.getLockdownStatus();
    res.json({
      success: true,
      data: {
        locked: status.enabled,
        message: status.message,
        updatedAt: status.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/system/lockdown
 * Protected Super Admin action: toggles student portal lockdown on/off.
 */
systemRouter.post(
  '/lockdown',
  authenticate,
  requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { enabled, message } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Field "enabled" (boolean) is required.',
          },
        });
      }

      const adminUserId = req.user?.userId;
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

      const updated = await SystemSettingService.setLockdownStatus(
        enabled,
        message,
        adminUserId,
        ipAddress
      );

      res.json({
        success: true,
        message: enabled
          ? 'Global Student Portal Lockdown has been ENGAGED.'
          : 'Global Student Portal Lockdown has been DISENGAGED. Student access restored.',
        data: {
          locked: updated.enabled,
          message: updated.message,
          updatedAt: updated.updatedAt,
          updatedBy: updated.updatedBy,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
