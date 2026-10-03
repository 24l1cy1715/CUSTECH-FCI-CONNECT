import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { z } from 'zod';

// 1. Locate Root .env accurately (both from development tsx in server/src/config and production node in server/dist/config)
const candidateRootPaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '.env'),
];

const targetRootEnv = candidateRootPaths.find(p => fs.existsSync(p) && !p.includes(`${path.sep}server${path.sep}.env`));
const serverEnvPath = path.resolve(__dirname, '../../.env');

// Load Root .env first (authoritative source of truth)
if (targetRootEnv) {
  dotenv.config({ path: targetRootEnv });
} else if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

// Seamless fallback: If server/.env exists and contains non-empty credentials that root .env lacks, merge them
if (fs.existsSync(serverEnvPath) && serverEnvPath !== targetRootEnv) {
  try {
    const serverEnvContent = fs.readFileSync(serverEnvPath, 'utf8');
    const parsedServerEnv = dotenv.parse(serverEnvContent);
    for (const [key, value] of Object.entries(parsedServerEnv)) {
      const serverVal = typeof value === 'string' ? value : '';
      const currentVal = process.env[key];
      const isCurrentEmpty = !currentVal || currentVal.trim() === '' || currentVal === '""' || currentVal === "''";
      const hasServerValue = serverVal.trim() !== '' && serverVal !== '""' && serverVal !== "''";
      if (isCurrentEmpty && hasServerValue) {
        process.env[key] = serverVal.trim();
      }
    }
  } catch {
    // Non-fatal fallback
  }
}

const optionalString = z
  .string()
  .trim()
  .transform(val => {
    // Strip surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).trim();
    }
    return val.length > 0 ? val : undefined;
  })
  .optional();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  REFRESH_SECRET: z.string().min(32, 'REFRESH_SECRET must be at least 32 characters'),
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  GOOGLE_CALLBACK_URL: optionalString,
  GOOGLE_REDIRECT_URI: optionalString,
  APP_URL: z.string().url().default('http://localhost:5173'),
  API_URL: z.string().url().default('http://localhost:5000'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  UPLOAD_DIR: z.string().default('../uploads'),
  MAX_FILE_SIZE_MB: z.string().default('10'),
  AI_PROVIDER: z.enum(['mock', 'gemini', 'openai', 'ollama']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  AI_MODEL: z.string().optional(),
  COPILOT_DAILY_LIMIT: z.string().default('50'),
  COPILOT_MONTHLY_LIMIT: z.string().default('500'),
  BREVO_SMTP_HOST: z.string().default('smtp-relay.brevo.com'),
  BREVO_SMTP_PORT: z.string().default('587'),
  BREVO_SMTP_USER: z.string().optional(),
  BREVO_SMTP_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('no-reply@custech.edu.ng'),
  EMAIL_FROM_NAME: z.string().default('CUSTECH FCI Connect'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const rawData = parsed.data;

export const env = {
  ...rawData,
  // Guarantee callback URL resolution supporting both GOOGLE_CALLBACK_URL and GOOGLE_REDIRECT_URI
  GOOGLE_CALLBACK_URL: rawData.GOOGLE_CALLBACK_URL || rawData.GOOGLE_REDIRECT_URI || `${rawData.API_URL}/api/v1/auth/google/callback`,
};

