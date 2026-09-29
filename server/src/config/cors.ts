import cors from 'cors';
import { env } from './env';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // In production, strictly enforce allowed origins
    if (env.NODE_ENV === 'production') {
      if (
        !origin ||
        origin === env.APP_URL ||
        origin.endsWith('.up.railway.app') ||
        origin.endsWith('.trycloudflare.com')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
      return;
    }

    // Development / test: allow local and same-host origins
    if (
      !origin ||
      origin === env.APP_URL ||
      origin.endsWith('.trycloudflare.com') ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count'],
};
