import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

import { corsOptions } from './config/cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { CampusService } from './services/campus.service';
import { ActivityService } from './services/activity.service';
import { apiRateLimiter } from './middleware/rateLimiter';
import { lockdownMiddleware } from './middleware/lockdown';
import { prisma } from './config/prisma';
import { StorageService } from './services/storage.service';

const app = express();

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:   ["'self'"],
      scriptSrc:    ["'self'", 'https://embed.tawk.to', 'https://*.tawk.to'],
      styleSrc:     ["'self'", "'unsafe-inline'", 'https://*.tawk.to'],
      imgSrc:       ["'self'", 'data:', 'blob:', 'https:', 'https://*.tawk.to'],
      fontSrc:      ["'self'", 'https://fonts.gstatic.com', 'https://*.tawk.to'],
      connectSrc:   ["'self'", env.APP_URL, env.API_URL, 'https://*.tawk.to', 'wss://*.tawk.to', 'https://api.github.com'],
      frameSrc:     ["'self'", 'https://*.tawk.to', 'https://accounts.google.com'],
      frameAncestors: ["'none'"],
      formAction:   ["'self'"],
      baseUri:      ["'self'"],
      objectSrc:    ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    } as Record<string, string[] | null>,
  },
  crossOriginEmbedderPolicy: false, // Allow embedded resources
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow uploads to be served cross-origin
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: {
    maxAge: 63_072_000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
}));

// ── Permissions Policy ────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()',
  );
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Static Files (uploads) ────────────────────────────────────────────────────
const uploadsDir = StorageService.ensureDir();
app.use('/uploads', express.static(uploadsDir));

// ── Global API Rate Limiting ──────────────────────────────────────────────────
app.use('/api/v1', apiRateLimiter);

// ── Global Student Portal Lockdown Enforcement ────────────────────────────────
app.use('/api/v1', lockdownMiddleware);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ── Health Check ──────────────────────────────────────────────────────────────
const healthHandler = async (_req: express.Request, res: express.Response) => {
  try {
    // Verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// ── Serve Frontend in Production ──────────────────────────────────────────────
if (env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export { app };

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = Number(env.PORT) || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 CUSTECH FCI Connect API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);

  // Phase 4: Seed campus locations and activity feed if not already seeded
  try {
    await CampusService.seedCampusLocations();
    await ActivityService.seedActivityFeed();
  } catch (err) {
    console.warn('⚠️  Data seeding skipped:', err);
  }
});

