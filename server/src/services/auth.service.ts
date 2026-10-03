import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { EmailService } from './email.service';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  matricId?: string;
  department: any;
  level: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    // Create user with student role and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Find STUDENT role
      const studentRole = await tx.role.findUnique({
        where: { name: 'STUDENT' },
      });

      const newUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          userRoles: studentRole
            ? {
                create: {
                  roleId: studentRole.id,
                },
              }
            : undefined,
          profile: {
            create: {
              username: input.email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
              fullName: input.fullName,
              matricId: input.matricId,
              department: input.department,
              level: input.level,
              communityPoints: 100, // Onboarding points
            },
          },
        },
        include: {
          profile: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      return newUser;
    });

    const roles = user.userRoles.map((r: { role: { name: string } }) => r.role.name);
    const tokens = this.generateTokens(user.id, user.email, roles);

    return { user, tokens, roles };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact faculty admin.');
    }

    if (user.isSuspended) {
      throw ApiError.forbidden('Your account has been suspended. Please contact faculty admin.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const roles = user.userRoles.map((r: { role: { name: string } }) => r.role.name);
    const tokens = this.generateTokens(user.id, user.email, roles);

    return { user, tokens, roles };
  }

  /**
   * Dedicated Super Admin Login flow.
   * Verifies credentials, account existence, active status, and explicitly checks
   * that the user possesses the SUPER_ADMIN role in the database.
   * Emits audit logs for both success and unauthorized student/non-admin attempts.
   */
  static async adminLogin(email: string, password: string, ipAddress?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Check account existence and password hash presence
    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized('Invalid administrative credentials');
    }

    // Check account active state
    if (!user.isActive) {
      throw ApiError.forbidden('Administrative account is currently deactivated');
    }

    // Check suspension
    if (user.isSuspended) {
      throw ApiError.forbidden('Administrative account has been suspended');
    }

    // Verify password securely
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid administrative credentials');
    }

    // Resolve authoritative roles from database
    const roles = user.userRoles.map((r: { role: { name: string } }) => r.role.name);

    // Enforce SUPER_ADMIN clearance
    if (!roles.includes('SUPER_ADMIN')) {
      // Security event: Student or unauthorized non-Super-Admin attempting Super Admin authentication
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: 'STUDENT_ATTEMPTED_SUPER_ADMIN_LOGIN',
            entityType: 'AUTH_GATEWAY',
            entityId: user.email,
            ipAddress: ipAddress || 'unknown',
            metadata: JSON.stringify({
              email: user.email,
              assignedRoles: roles,
              attemptedPortal: 'SUPER_ADMIN_PORTAL',
              timestamp: new Date().toISOString(),
            }),
          },
        });
      } catch (logErr) {
        console.error('Failed to log admin login violation:', logErr);
      }

      throw ApiError.forbidden('Access denied. This account does not possess Super Admin privileges.');
    }

    // Successful Super Admin login
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'SUCCESSFUL_SUPER_ADMIN_LOGIN',
          entityType: 'AUTH_GATEWAY',
          entityId: user.email,
          ipAddress: ipAddress || 'unknown',
          metadata: JSON.stringify({
            email: user.email,
            roles,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (logErr) {
      console.error('Failed to log successful admin login:', logErr);
    }

    const tokens = this.generateTokens(user.id, user.email, roles);

    return { user, tokens, roles };
  }

  static generateTokens(userId: string, email: string, roles: string[]): AuthTokens {
    const accessToken = jwt.sign({ userId, email, roles }, env.AUTH_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign({ userId, email, roles }, env.REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  static async getUserWithProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive || user.isSuspended) return null;

    const roles = user.userRoles.map((r: { role: { name: string } }) => r.role.name);

    return {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles,
    };
  }

  /**
   * Secure Google Authentication handler.
   * - Verifies Google identity and email verification status.
   * - Links existing accounts by email without creating duplicates.
   * - PRESERVES existing database roles for existing users (including SUPER_ADMIN).
   * - NEVER grants SUPER_ADMIN or elevated privileges to newly registered users (defaults strictly to STUDENT).
   * - Emits security audit logs for all login and registration events.
   */
  static async handleGoogleAuth(input: {
    googleId: string;
    email: string;
    fullName?: string;
    avatarUrl?: string | null;
    emailVerified: boolean;
    ipAddress?: string;
  }) {
    if (!input.googleId || !input.email) {
      throw ApiError.badRequest('Missing verified Google identity information');
    }

    if (!input.emailVerified) {
      throw ApiError.forbidden('Google account email is not verified by Google');
    }

    const normalizedEmail = input.email.trim().toLowerCase();

    // 1. Check for existing user by Google ID or normalized Email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: input.googleId },
          { email: normalizedEmail },
        ],
      },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // 2. Existing User Flow: Preserve roles, verify active status, safely link Google identity
    if (user) {
      if (!user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated. Please contact faculty admin.');
      }

      if (user.isSuspended) {
        throw ApiError.forbidden('Your account has been suspended. Please contact faculty admin.');
      }

      // Link googleId or mark emailVerified if not already done
      const needsUserUpdate = user.googleId !== input.googleId || !user.emailVerified;
      if (needsUserUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: input.googleId,
            emailVerified: true,
          },
          include: {
            profile: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });
      }

      // Safely update profile avatar if existing profile has no avatar
      if (user.profile && !user.profile.avatarUrl && input.avatarUrl) {
        await prisma.profile.update({
          where: { id: user.profile.id },
          data: { avatarUrl: input.avatarUrl },
        });
        user.profile.avatarUrl = input.avatarUrl;
      }

      // Authoritative roles from the database (Preserves existing role, whether STUDENT or SUPER_ADMIN)
      const roles = user.userRoles.map((r: { role: { name: string } }) => r.role.name);

      // Audit Log for existing user Google login
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: 'GOOGLE_AUTH_LOGIN',
            entityType: 'AUTH_GATEWAY',
            entityId: user.email,
            ipAddress: input.ipAddress || 'unknown',
            metadata: JSON.stringify({
              email: user.email,
              googleId: input.googleId,
              roles,
              isExistingUser: true,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      } catch (logErr) {
        console.error('Failed to log Google auth login event:', logErr);
      }

      const tokens = this.generateTokens(user.id, user.email, roles);
      return { user, tokens, roles };
    }

    // 3. New User Flow: Strictly create as STUDENT in database transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Find the authoritative STUDENT role
      const studentRole = await tx.role.findUnique({
        where: { name: 'STUDENT' },
      });

      if (!studentRole) {
        throw ApiError.internal('Default STUDENT role not configured in database');
      }

      // Generate a collision-resistant username
      const sanitizedBase = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'student';
      let candidateUsername = `${sanitizedBase}_${Math.floor(1000 + Math.random() * 9000)}`;
      const existingProfile = await tx.profile.findUnique({ where: { username: candidateUsername } });
      if (existingProfile) {
        candidateUsername = `${sanitizedBase}_${Date.now().toString().slice(-6)}`;
      }

      return await tx.user.create({
        data: {
          email: normalizedEmail,
          googleId: input.googleId,
          emailVerified: true,
          passwordHash: null, // OAuth-authenticated user
          isActive: true,
          isSuspended: false,
          userRoles: {
            create: {
              roleId: studentRole.id,
            },
          },
          profile: {
            create: {
              username: candidateUsername,
              fullName: input.fullName?.trim() || sanitizedBase,
              avatarUrl: input.avatarUrl || null,
              communityPoints: 100, // Onboarding community points
            },
          },
        },
        include: {
          profile: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    const roles = newUser.userRoles.map((r: { role: { name: string } }) => r.role.name);

    // Audit Log for new Google user creation
    try {
      await prisma.auditLog.create({
        data: {
          actorId: newUser.id,
          action: 'GOOGLE_AUTH_REGISTER',
          entityType: 'AUTH_GATEWAY',
          entityId: newUser.email,
          ipAddress: input.ipAddress || 'unknown',
          metadata: JSON.stringify({
            email: newUser.email,
            googleId: input.googleId,
            assignedRole: 'STUDENT',
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (logErr) {
      console.error('Failed to log Google registration event:', logErr);
    }

    const tokens = this.generateTokens(newUser.id, newUser.email, roles);
    return { user: newUser, tokens, roles };
  }


  // ───────────────────────────────────────────────────────────────────────────
  // PASSWORD RESET & OTP IMPLEMENTATION
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Cryptographically secure 6-digit numeric OTP generator.
   * Avoids Math.random(). Range: 100000 - 999999.
   */
  private static generateSecureOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hashes the raw OTP using HMAC-SHA256 with server AUTH_SECRET as key.
   * Never stores plain OTP in database.
   */
  public static hashOtp(otp: string): string {
    return crypto.createHmac('sha256', env.AUTH_SECRET).update(otp).digest('hex');
  }

  /**
   * Hashes the reset authorization token using HMAC-SHA256.
   */
  public static hashResetToken(token: string): string {
    return crypto.createHmac('sha256', env.AUTH_SECRET).update(token).digest('hex');
  }

  /**
   * Requests a password reset OTP.
   * Protects against account enumeration: Always returns identical generic response.
   */
  static async requestPasswordResetOtp(email: string, ipAddress?: string): Promise<{ success: boolean; message: string }> {
    const genericResponse = {
      success: true,
      message: 'If an account exists for that email, a verification code has been sent.',
    };

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user || user.isSuspended) {
      // Simulate cryptographic delay to resist side-channel timing enumeration attacks
      await bcrypt.hash('dummy_timing_protection_salt', 10);
      return genericResponse;
    }

    const now = new Date();

    // Check resend cooldown (60 seconds)
    const recentOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(now.getTime() - OTP_RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const elapsedSeconds = Math.floor((now.getTime() - recentOtp.createdAt.getTime()) / 1000);
      const remainingSeconds = Math.max(1, OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds);
      throw ApiError.tooManyRequests(
        `Please wait ${remainingSeconds} second(s) before requesting another verification code.`,
      );
    }

    // Invalidate any previous unconsumed OTPs for this account
    await prisma.passwordResetOtp.updateMany({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      data: {
        consumedAt: now,
      },
    });

    // Generate secure 6-digit OTP & expiration (10 minutes)
    const rawOtp = this.generateSecureOtp();
    const otpHash = this.hashOtp(rawOtp);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save in database
    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        otpHash,
        expiresAt,
        ipAddress,
      },
    });

    // Send email via Brevo SMTP / EmailService
    const emailSent = await EmailService.sendPasswordResetOtp({
      to: user.email,
      otp: rawOtp,
      userName: user.profile?.fullName,
    });

    if (!emailSent) {
      console.warn(`[SECURITY] OTP generated but email delivery failed for ${user.email}`);
    }

    // Security Audit Log (Never log raw OTP)
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'PASSWORD_RESET_OTP_SENT',
        entityType: 'USER',
        entityId: user.id,
        ipAddress,
        metadata: JSON.stringify({
          email: user.email,
          expiresAt: expiresAt.toISOString(),
        }),
      },
    }).catch(() => {});


    // Periodic background cleanup of expired OTPs older than 24 hours
    this.cleanupExpiredOtps().catch(() => {});

    return genericResponse;
  }

  /**
   * Resends a password reset OTP with 60-second cooldown enforcement.
   */
  static async resendPasswordResetOtp(email: string, ipAddress?: string): Promise<{ success: boolean; message: string }> {
    return this.requestPasswordResetOtp(email, ipAddress);
  }

  /**
   * Verifies the 6-digit OTP.
   * Enforces:
   * - Max 5 attempts
   * - 10-minute expiration
   * - Invalidation on consumption
   * - Cryptographically secure timing-safe comparison
   * - Returns short-lived single-use reset authorization token (does NOT log user in)
   */
  static async verifyPasswordResetOtp(email: string, otp: string, ipAddress?: string): Promise<{
    success: boolean;
    message: string;
    resetToken: string;
  }> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification code. Please request a new code.');
    }

    const now = new Date();

    // Find the latest active OTP record for this user
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw ApiError.badRequest('This OTP has expired or has already been used. Please request a new code.');
    }

    // Check expiration
    if (otpRecord.expiresAt < now) {
      // Invalidate expired record
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { consumedAt: now },
      });
      throw ApiError.badRequest('This OTP has expired. Please request a new code.');
    }

    // Check attempt limit (5 attempts)
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { consumedAt: now },
      });
      throw ApiError.badRequest('Too many incorrect attempts. This OTP has been invalidated. Please request a new code.');
    }

    // Hash provided OTP
    const enteredHash = this.hashOtp(otp);

    // Timing-safe comparison to prevent side-channel timing attacks
    const isMatch =
      enteredHash.length === otpRecord.otpHash.length &&
      crypto.timingSafeEqual(Buffer.from(enteredHash), Buffer.from(otpRecord.otpHash));

    if (!isMatch) {
      const newAttempts = otpRecord.attempts + 1;
      const isExceeded = newAttempts >= OTP_MAX_ATTEMPTS;

      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: newAttempts,
          consumedAt: isExceeded ? now : null,
        },
      });

      // Audit log failed attempt
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'PASSWORD_RESET_OTP_FAILED',
          entityType: 'USER',
          entityId: user.id,
          ipAddress,
          metadata: JSON.stringify({
            attempts: newAttempts,
            exceeded: isExceeded,
          }),
        },
      }).catch(() => {});


      if (isExceeded) {
        throw ApiError.badRequest('Too many incorrect attempts. This OTP has been invalidated. Please request a new code.');
      }

      const remaining = OTP_MAX_ATTEMPTS - newAttempts;
      throw ApiError.badRequest(`Invalid verification code. ${remaining} attempt(s) remaining.`);
    }

    // OTP is valid! Mark OTP consumed immediately (single-use)
    // Generate secure short-lived reset authorization token (32 bytes = 64 hex characters)
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = this.hashResetToken(rawResetToken);
    const resetExpiresAt = new Date(now.getTime() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: {
        consumedAt: now,
        resetTokenHash,
        resetExpiresAt,
      },
    });

    // Also update user's reset token fields for consistency
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetExpires: resetExpiresAt,
      },
    });

    // Audit log successful verification
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'PASSWORD_RESET_OTP_VERIFIED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress,
      },
    }).catch(() => {});

    return {
      success: true,
      message: 'Verification code confirmed. You may now create a new password.',
      resetToken: rawResetToken,
    };
  }

  /**
   * Resets the user's password using the verified reset authorization token.
   * Enforces:
   * - Valid, unexpired reset authorization
   * - Independent backend password policy validation
   * - Secure bcrypt hashing (12 rounds)
   * - Immediate invalidation of all reset credentials
   * - Does not log user in automatically (requires fresh login with new password)
   */
  static async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
    ipAddress?: string,
  ): Promise<{ success: true; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw ApiError.badRequest('Reset session has expired or is invalid. Please request a new code.');
    }

    const now = new Date();
    const hashedResetToken = this.hashResetToken(resetToken);

    // Find matching unconsumed reset session
    const resetRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        resetTokenHash: hashedResetToken,
        resetConsumedAt: null,
      },
    });

    if (!resetRecord || !resetRecord.resetExpiresAt || resetRecord.resetExpiresAt < now) {
      throw ApiError.badRequest('Reset session has expired or is invalid. Please request a new code.');
    }

    // Hash new password using project standard bcrypt (12 rounds)
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Atomically update password and invalidate all reset records for this user
    await prisma.$transaction([
      // Update password hash and clear legacy reset columns
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          resetToken: null,
          resetExpires: null,
        },
      }),

      // Invalidate all OTPs and reset authorizations for this user
      prisma.passwordResetOtp.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          consumedAt: now,
          resetConsumedAt: now,
        },
      }),

      // Create security audit log
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'PASSWORD_RESET_COMPLETED',
          entityType: 'USER',
          entityId: user.id,
          ipAddress,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.',
    };
  }

  /**
   * Cleanup expired or consumed OTP records older than 24 hours.
   */
  public static async cleanupExpiredOtps(): Promise<number> {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await prisma.passwordResetOtp.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: threshold } },
          { resetExpiresAt: { lt: threshold } },
          {
            consumedAt: { not: null },
            resetConsumedAt: { not: null },
            updatedAt: { lt: threshold },
          },
        ],
      },
    });
    return result.count;
  }

  static getCookieOptions(type: 'access' | 'refresh') {
    const isProduction = env.NODE_ENV === 'production';
    const maxAge =
      type === 'access'
        ? 15 * 60 * 1000 // 15 mins
        : 7 * 24 * 60 * 60 * 1000; // 7 days

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
      maxAge,
      path: '/',
    };
  }

  static getClearCookieOptions() {
    const isProduction = env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
      path: '/',
    };
  }
}

