import pino from 'pino';
import { mkdirSync, createWriteStream, WriteStream } from 'fs';
import { join } from 'path';
import { Writable } from 'stream';
import { config } from './config.js';

mkdirSync(config.logsDir, { recursive: true });

/**
 * Taipei-local YYYY-MM-DD stamp. `process.env.TZ` is set in config.ts
 * before this module is imported, so `new Date()` already reflects
 * Asia/Taipei — we just need to format it without hitting UTC via ISO.
 */
function todayStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Writable stream that rotates to a new `YYYY-MM-DD.jsonl` file whenever
 * the local date ticks over. Checks on every write, which is cheap because
 * log volume is low and the check is a string compare.
 *
 * Fixes the bug where the stream was locked at module load, so a process
 * running across midnight wrote day-2 entries into day-1's file.
 */
class DailyRotatingStream extends Writable {
  private current: WriteStream | null = null;
  private currentDate = '';

  _write(chunk: Buffer | string, _enc: BufferEncoding, cb: (err?: Error | null) => void): void {
    const date = todayStamp();
    if (date !== this.currentDate || !this.current) {
      if (this.current) this.current.end();
      this.current = createWriteStream(join(config.logsDir, `${date}.jsonl`), { flags: 'a' });
      this.currentDate = date;
    }
    this.current.write(chunk, cb);
  }
}

/**
 * Structured logger. Writes JSONL to `logs/YYYY-MM-DD.jsonl`, one object
 * per line, Taipei-local day boundaries.
 *
 * Usage:
 *   log.info({ event_type: 'something', ...fields }, 'message');
 *   log.warn({ err }, 'something happened');
 *   log.error({ err, context }, 'fatal');
 *
 * Conventional event fields:
 *   event_type, duration_ms, tokens_in, tokens_out, model, cost_usd, user_id
 */
export const log = pino(
  {
    level: config.logLevel,
    base: { tool_name: '{{TOOL_NAME}}' },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  new DailyRotatingStream()
);
