import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { StorageService } from '../services/storage.service';
import { verifyImageMagicBytes } from '../middleware/upload';

export class ProfileController {
  /**
   * Upload or replace authenticated student's profile picture.
   * Enforces server-side identity, file size, and magic byte validation.
   */
  static async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized('Authentication required.');
      }

      const file = req.file;
      if (!file || !file.buffer) {
        throw ApiError.badRequest('Please select an image file to upload.');
      }

      // Verify file binary signature (magic bytes) to prevent disguise attacks
      const signature = verifyImageMagicBytes(file.buffer);
      if (!signature.valid) {
        throw ApiError.badRequest('Invalid or corrupted image format. Please upload a valid JPG, PNG, or WebP image.');
      }

      // Fetch user profile
      const currentProfile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (!currentProfile) {
        throw ApiError.notFound('Student profile not found.');
      }

      // Safely delete previous uploaded avatar to avoid disk clutter
      if (currentProfile.avatarUrl) {
        await StorageService.deleteFileByUrl(currentProfile.avatarUrl);
      }

      // Save new avatar file
      const avatarUrl = await StorageService.saveAvatar(userId, file.buffer, signature.ext);

      // Persist in MySQL
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: { avatarUrl },
      });

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully.',
        data: {
          avatarUrl: updatedProfile.avatarUrl,
          profile: updatedProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove profile picture and restore default initials avatar.
   */
  static async deleteAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized('Authentication required.');
      }

      const currentProfile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (!currentProfile) {
        throw ApiError.notFound('Student profile not found.');
      }

      if (currentProfile.avatarUrl) {
        await StorageService.deleteFileByUrl(currentProfile.avatarUrl);
      }

      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: { avatarUrl: null },
      });

      res.status(200).json({
        success: true,
        message: 'Profile picture removed successfully. Default initials restored.',
        data: {
          avatarUrl: null,
          profile: updatedProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get caller's own profile.
   */
  static async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized('Authentication required.');
      }

      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              userRoles: {
                select: {
                  role: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      if (!profile) {
        throw ApiError.notFound('Profile not found.');
      }

      res.json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }
}
