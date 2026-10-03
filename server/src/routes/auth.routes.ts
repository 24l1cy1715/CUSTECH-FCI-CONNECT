import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

export const authRouter = Router();

// Rate limiter for login / register to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 15,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for forgot-password & resend-otp (prevent email bombing/spamming)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset requests. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for OTP verification attempts
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many verification attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for final password reset submission
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset requests. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter strictly for Super Admin login (max 5 attempts per 15 minutes)
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many administrative login attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
authRouter.post('/register', authLimiter, validate(registerSchema), AuthController.register);
authRouter.post('/login', authLimiter, validate(loginSchema), AuthController.login);
authRouter.post('/admin/login', adminAuthLimiter, validate(loginSchema), AuthController.adminLogin);
authRouter.post('/refresh-token', AuthController.refreshToken);
authRouter.post('/logout', AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);

// Google OAuth 2.0 routes
authRouter.get('/google', AuthController.initiateGoogleAuth);
authRouter.get('/google/callback', AuthController.handleGoogleCallback);
authRouter.post('/google/verify', AuthController.verifyGoogleToken);


// Password Reset & OTP routes
authRouter.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);
authRouter.post(
  '/resend-otp',
  forgotPasswordLimiter,
  validate(resendOtpSchema),
  AuthController.resendOtp,
);
authRouter.post(
  '/verify-otp',
  otpVerifyLimiter,
  validate(verifyOtpSchema),
  AuthController.verifyOtp,
);
authRouter.post(
  '/reset-password',
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

