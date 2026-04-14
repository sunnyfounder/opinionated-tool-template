import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Force Taipei timezone for Date, log rotation, and the scheduler.
// Must run before anything else touches `new Date()`, which is why
// config.ts is the first import in index.ts and cli.ts.
process.env.TZ = process.env.TZ ?? 'Asia/Taipei';

const __filename = fileURLToPath(import.meta.url);
// src/config.ts → <repo root>
const TOOL_ROOT = dirname(dirname(__filename));

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) {
    throw new Error(`Env var ${name} must be an integer, got: ${raw}`);
  }
  return n;
}

/**
 * Resolved runtime config. Any new env var the tool needs should be added
 * here (with a default or a clear error message) AND to `.env.example` in
 * the same commit — never read `process.env` from anywhere else in `src/`.
 */
export const config = {
  toolRoot: TOOL_ROOT,
  dataDir: join(TOOL_ROOT, 'data'),
  logsDir: join(TOOL_ROOT, 'logs'),
  port: int('TOOL_PORT', 3000),
  // Strip trailing slash; empty string means mount at root (local dev default).
  basePath: (process.env.APP_BASE_PATH ?? '').replace(/\/$/, ''),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  tz: process.env.TZ!,
} as const;
