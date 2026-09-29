import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { AuthJwtPayload } from '../middleware/authenticate';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens, roles } = await AuthService.register(req.body);

      res.cookie('access_token', tokens.accessToken, AuthService.getCookieOptions('access'));
      res.cookie('refresh_token', tokens.refreshToken, AuthService.getCookieOptions('refresh'));

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            profile: user.profile,
            roles,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, tokens, roles } = await AuthService.login(email, password);

      res.cookie('access_token', tokens.accessToken, AuthService.getCookieOptions('access'));
      res.cookie('refresh_token', tokens.refreshToken, AuthService.getCookieOptions('refresh'));

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            profile: user.profile,
            roles,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) {
        throw ApiError.unauthorized('No refresh token provided');
      }

      const decoded = jwt.verify(refreshToken, env.REFRESH_SECRET) as AuthJwtPayload;
      const newTokens = AuthService.generateTokens(decoded.userId, decoded.email, decoded.roles);

      res.cookie('access_token', newTokens.accessToken, AuthService.getCookieOptions('access'));
      res.cookie('refresh_token', newTokens.refreshToken, AuthService.getCookieOptions('refresh'));

      res.json({ success: true, message: 'Token refreshed successfully' });
    } catch (error) {
      next(ApiError.unauthorized('Invalid or expired refresh token'));
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    const clearOpts = AuthService.getClearCookieOptions();
    res.clearCookie('access_token', clearOpts);
    res.clearCookie('refresh_token', clearOpts);
    res.json({ success: true, message: 'Logged out successfully' });
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getUserWithProfile(userId);
      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await AuthService.requestPasswordResetOtp(email, ip);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await AuthService.resendPasswordResetOtp(email, ip);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await AuthService.verifyPasswordResetOtp(email, otp, ip);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, resetToken, newPassword } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await AuthService.resetPassword(email, resetToken, newPassword, ip);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

