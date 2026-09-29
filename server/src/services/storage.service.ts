import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env';

/**
 * StorageService
 * 
 * Provides a clean storage abstraction for uploads (avatars, documents, assets).
 * Resolves paths reliably regardless of current working directory, prevents path traversal,
 * and maintains filesystem hygiene by cleaning up replaced or deleted files.
 */
export class StorageService {
  private static baseUploadDir: string = path.resolve(
    process.cwd(),
    env.UPLOAD_DIR || '../uploads'
  );

  /**
   * Ensure target upload subdirectory exists.
   */
  public static ensureDir(subDir: string = ''): string {
    const targetDir = path.join(this.baseUploadDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    return targetDir;
  }

  /**
   * Save a file buffer to the avatar directory with a unique, randomized filename.
   */
  public static async saveAvatar(
    userId: string,
    buffer: Buffer,
    ext: string
  ): Promise<string> {
    const avatarDir = this.ensureDir('avatars');
    const cleanExt = ext.replace(/^\./, '').toLowerCase();
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const filename = `avatar-${userId}-${Date.now()}-${randomSuffix}.${cleanExt}`;
    const filePath = path.join(avatarDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    // Return public relative path mapped to the /uploads static route
    return `/uploads/avatars/${filename}`;
  }

  /**
   * Safely delete a previously uploaded local file.
   * Protects against path traversal.
   */
  public static async deleteFileByUrl(fileUrl: string | null | undefined): Promise<boolean> {
    if (!fileUrl) return false;

    // Only delete files belonging to the /uploads directory
    if (!fileUrl.startsWith('/uploads/')) return false;

    try {
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      const fullPath = path.normalize(path.join(this.baseUploadDir, relativePath));

      // Security check: ensure resolved path is strictly within baseUploadDir
      if (!fullPath.startsWith(this.baseUploadDir)) {
        console.warn(`[StorageService] Blocked potential path traversal attempt: ${fileUrl}`);
        return false;
      }

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
    } catch (error) {
      console.error(`[StorageService] Failed to delete file ${fileUrl}:`, error);
    }

    return false;
  }
}
