import rateLimit from 'express-rate-limit';

// ── Authentication endpoints (login, register, password reset) ─────────────────
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
  skipSuccessfulRequests: false,
});

// ── General API (all non-auth endpoints) ──────────────────────────────────────
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 120,             // 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Request rate limit exceeded. Please slow down.',
    },
  },
  skip: (req) => req.method === 'OPTIONS',
});

// ── AI / Copilot endpoints (expensive, model inference) ───────────────────────
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,              // 10 AI requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'AI request limit reached. Please wait a moment before trying again.',
    },
  },
});

// ── File upload endpoints ─────────────────────────────────────────────────────
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Upload rate limit exceeded. Please wait before uploading again.',
    },
  },
});

// ── Public Digital ID Verification ────────────────────────────────────────────
export const digitalIdVerifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 verification checks per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many verification attempts. Please wait before scanning again.',
    },
  },
});

// ── Skill Assessment submission ───────────────────────────────────────────────
export const assessmentSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                  // Max 15 submissions per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Assessment attempt limit reached. Please wait before submitting again.',
    },
  },
});

// ── Report & Flagging endpoints ───────────────────────────────────────────────
export const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Report submission rate limit reached. Please wait before submitting another report.',
    },
  },
});

// ── Voice Poll & Suggestion voting ────────────────────────────────────────────
export const voiceVoteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Voting rate limit exceeded. Please wait a moment.',
    },
  },
});

// ── Marketplace Actions ───────────────────────────────────────────────────────
export const marketplaceActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Marketplace action rate limit exceeded. Please wait a few minutes.',
    },
  },
});

