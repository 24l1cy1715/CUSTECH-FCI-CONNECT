import multer from 'multer';
import { Request } from 'express';
import { ApiError } from './errorHandler';

// 5 MB maximum file size limit
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

// Allowed image MIME types and extensions
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * Multer memory storage to allow magic-byte inspection before writing to disk.
 */
const storage = multer.memoryStorage();

export const avatarUploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 1. Check MIME type declared by client
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      return cb(ApiError.badRequest('Please upload a JPG, PNG, or WebP image under 5 MB.'));
    }

    // 2. Check file extension
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(ApiError.badRequest('Please upload a JPG, PNG, or WebP image under 5 MB.'));
    }

    cb(null, true);
  },
});

/**
 * Verify actual file binary signature (magic bytes) to prevent executable/HTML/SVG disguised as an image.
 */
export function verifyImageMagicBytes(buffer: Buffer): { valid: boolean; ext: string; mime: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false, ext: '', mime: '' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: 'png', mime: 'image/png' };
  }

  // WebP: RIFF [4 bytes] WEBP
  const isRiff =
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46;   // F

  const isWebp =
    buffer[8] === 0x57 &&  // W
    buffer[9] === 0x45 &&  // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50;   // P

  if (isRiff && isWebp) {
    return { valid: true, ext: 'webp', mime: 'image/webp' };
  }

  return { valid: false, ext: '', mime: '' };
}
