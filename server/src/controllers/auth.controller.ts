import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
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

  static async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || (req.socket?.remoteAddress as string) || 'unknown';
      const { user, tokens, roles } = await AuthService.adminLogin(email, password, ipAddress);

      res.cookie('access_token', tokens.accessToken, AuthService.getCookieOptions('access'));
      res.cookie('refresh_token', tokens.refreshToken, AuthService.getCookieOptions('refresh'));

      res.json({
        success: true,
        message: 'Super Admin authentication successful',
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

  /**
   * Initiates Google OAuth 2.0 Authorization Flow.
   * Generates cryptographically secure CSRF state and redirects to Google.
   */
  static async initiateGoogleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        if (req.headers.accept?.includes('application/json')) {
          res.status(503).json({
            success: false,
            error: {
              code: 'OAUTH_NOT_CONFIGURED',
              message: 'Google OAuth is not configured on this server. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
            },
          });
          return;
        }

        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('Google authentication is not yet configured on this server. Please contact faculty admin.')}`);
        return;
      }

      // Generate cryptographically secure random state (32 bytes)
      const state = crypto.randomBytes(32).toString('hex');

      // Store in secure HttpOnly cookie for CSRF state validation (10 min lifetime)
      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
        path: '/',
      });

      const callbackUrl = env.GOOGLE_CALLBACK_URL || `${env.API_URL}/api/v1/auth/google/callback`;

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', callbackUrl);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'online');
      authUrl.searchParams.set('prompt', 'select_account');

      res.redirect(authUrl.toString());
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles Google OAuth callback redirect.
   * Validates CSRF state, exchanges authorization code for tokens,
   * retrieves verified identity from Google, and establishes an FCI Connect session.
   */
  static async handleGoogleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state, error } = req.query;
      const storedState = req.cookies?.oauth_state;

      // Always clear state cookie once received
      res.clearCookie('oauth_state', { path: '/' });

      if (error) {
        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('Google sign-in was cancelled or encountered an error.')}`);
        return;
      }

      if (!code || !state || !storedState || state !== storedState) {
        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('Security check failed (invalid or expired OAuth state). Please try again.')}`);
        return;
      }

      const callbackUrl = env.GOOGLE_CALLBACK_URL || `${env.API_URL}/api/v1/auth/google/callback`;

      // Exchange code for Google tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(code),
          client_id: env.GOOGLE_CLIENT_ID!,
          client_secret: env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errDetails = await tokenResponse.text().catch(() => '');
        console.error('Google token exchange failed:', errDetails);
        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('Failed to verify authorization with Google.')}`);
        return;
      }

      const tokenData = (await tokenResponse.json()) as { access_token?: string; id_token?: string };
      if (!tokenData.access_token) {
        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('No authorization token received from Google.')}`);
        return;
      }

      // Fetch user profile securely using the access token
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!profileResponse.ok) {
        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('Unable to retrieve user information from Google.')}`);
        return;
      }

      const googleProfile = (await profileResponse.json()) as {
        sub?: string;
        email?: string;
        email_verified?: boolean | string;
        name?: string;
        picture?: string;
      };

      if (!googleProfile.sub || !googleProfile.email) {
        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('Incomplete account information received from Google.')}`);
        return;
      }

      const isVerified = googleProfile.email_verified === true || googleProfile.email_verified === 'true';
      if (!isVerified) {
        res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent('Google account email is not verified.')}`);
        return;
      }

      const ipAddress = req.ip || (req.socket?.remoteAddress as string) || 'unknown';

      // Delegate to authoritative backend auth service
      const { tokens } = await AuthService.handleGoogleAuth({
        googleId: googleProfile.sub,
        email: googleProfile.email,
        fullName: googleProfile.name,
        avatarUrl: googleProfile.picture,
        emailVerified: true,
        ipAddress,
      });

      // Set HttpOnly session cookies
      res.cookie('access_token', tokens.accessToken, AuthService.getCookieOptions('access'));
      res.cookie('refresh_token', tokens.refreshToken, AuthService.getCookieOptions('refresh'));

      res.redirect(`${env.APP_URL}/auth/callback?status=success`);
    } catch (err: any) {
      console.error('Google OAuth callback error:', err);
      const message = err?.message || 'Authentication failed. Please try again.';
      res.redirect(`${env.APP_URL}/login?error=${encodeURIComponent(message)}`);
    }
  }

  /**
   * Verifies Google token or test identity directly.
   * Useful for API verification, client-side token submissions, and automated test suites.
   */
  static async verifyGoogleToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, mockIdentity } = req.body;

      // Allow simulated Google identity in development/test environment for automated test suites
      if ((env.NODE_ENV !== 'production' || process.env.NODE_ENV === 'test') && mockIdentity) {
        const ipAddress = req.ip || (req.socket?.remoteAddress as string) || 'unknown';
        const { user, tokens, roles } = await AuthService.handleGoogleAuth({
          googleId: mockIdentity.googleId,
          email: mockIdentity.email,
          fullName: mockIdentity.fullName,
          avatarUrl: mockIdentity.avatarUrl,
          emailVerified: mockIdentity.emailVerified !== false,
          ipAddress,
        });

        res.cookie('access_token', tokens.accessToken, AuthService.getCookieOptions('access'));
        res.cookie('refresh_token', tokens.refreshToken, AuthService.getCookieOptions('refresh'));

        res.json({
          success: true,
          message: 'Google authentication successful',
          data: {
            user: {
              id: user.id,
              email: user.email,
              profile: user.profile,
              roles,
            },
          },
        });
        return;
      }

      if (!idToken) {
        throw ApiError.badRequest('Missing Google ID token');
      }

      // Verify token with Google tokeninfo endpoint
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!verifyRes.ok) {
        throw ApiError.unauthorized('Invalid or expired Google ID token');
      }

      const tokenInfo = (await verifyRes.json()) as {
        sub?: string;
        email?: string;
        email_verified?: string | boolean;
        name?: string;
        picture?: string;
        aud?: string;
      };

      if (env.GOOGLE_CLIENT_ID && tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
        throw ApiError.unauthorized('Google ID token audience mismatch');
      }

      if (!tokenInfo.sub || !tokenInfo.email) {
        throw ApiError.unauthorized('Invalid Google user claims');
      }

      const isVerified = tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true;
      if (!isVerified) {
        throw ApiError.forbidden('Google account email is not verified');
      }

      const ipAddress = req.ip || (req.socket?.remoteAddress as string) || 'unknown';
      const { user, tokens, roles } = await AuthService.handleGoogleAuth({
        googleId: tokenInfo.sub,
        email: tokenInfo.email,
        fullName: tokenInfo.name,
        avatarUrl: tokenInfo.picture,
        emailVerified: true,
        ipAddress,
      });

      res.cookie('access_token', tokens.accessToken, AuthService.getCookieOptions('access'));
      res.cookie('refresh_token', tokens.refreshToken, AuthService.getCookieOptions('refresh'));

      res.json({
        success: true,
        message: 'Google authentication successful',
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

