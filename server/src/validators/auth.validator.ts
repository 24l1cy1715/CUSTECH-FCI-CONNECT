import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100)
      .trim(),
    matricId: z.string().optional(),
    department: z.enum([
      'COMPUTER_SCIENCE',
      'INFORMATION_TECHNOLOGY',
      'CYBER_SECURITY',
      'SOFTWARE_ENGINEERING',
      'DATA_SCIENCE',
      'COMPUTER_ENGINEERING',
      'INFORMATION_SYSTEMS',
      'LIBRARY_INFORMATION_SCIENCE',
    ]),
    level: z.enum(['LEVEL_100', 'LEVEL_200', 'LEVEL_300', 'LEVEL_400', 'LEVEL_500', 'PGD', 'MSC', 'PHD']).default('LEVEL_100'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Verification code must be exactly 6 numeric digits'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email address').toLowerCase().trim(),
      resetToken: z.string().min(10, 'Invalid or missing reset authorization token'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

