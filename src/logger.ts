import pino from 'pino';
import { mkdirSync, createWriteStream, WriteStream } from 'fs';
import { join } from 'path';
import { Writable } from 'stream';
import { randomUUID } from 'crypto';
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

/**
 * Standard DEDO event types. Use these strings (not free text) so logs
 * across tools can be aggregated and grepped uniformly. Add new ones
 * here when a tool needs something tool-specific — don't hardcode raw
 * strings at call sites.
 */
export const EVENT = {
  TOOL_START: 'tool_start',
  TOOL_STOP: 'tool_stop',
  LLM_CALL: 'llm_call',
  HTTP_REQUEST: 'http_request',
  SCHEDULED_RUN: 'scheduled_run',
  EXTERNAL_FETCH: 'external_fetch',
  USER_QUERY: 'user_query',
  ERROR: 'error',
} as const;

export type EventType = (typeof EVENT)[keyof typeof EVENT] | (string & {});

/**
 * Structured event emitter. Every "something happened" log line should
 * go through this — not `log.info` directly — so event_type is always
 * present and fields stay consistent across tools.
 *
 *   logEvent(EVENT.SCHEDULED_RUN, { job: 'daily_report', duration_ms: 1203 });
 */
export function logEvent(event_type: EventType, fields: Record<string, unknown> = {}): void {
  log.info({ event_type, ...fields }, event_type);
}

/**
 * Wrap an LLM call so the standard fields (model, tokens, duration, cost)
 * land in the log without every caller having to remember them. Pass a
 * function that performs the call and returns the result plus usage info.
 *
 *   const reply = await observeLLM({ model: 'claude-opus-4-6' }, async () => {
 *     const r = await anthropic.messages.create({...});
 *     return {
 *       result: r,
 *       tokens_in: r.usage.input_tokens,
 *       tokens_out: r.usage.output_tokens,
 *     };
 *   });
 *
 * Errors are logged as EVENT.ERROR with the same correlation fields and
 * then re-thrown — the caller still decides how to recover.
 */
export async function observeLLM<T>(
  meta: { model: string; purpose?: string },
  fn: () => Promise<{ result: T; tokens_in?: number; tokens_out?: number; cost_usd?: number }>
): Promise<T> {
  const started = Date.now();
  try {
    const { result, tokens_in, tokens_out, cost_usd } = await fn();
    logEvent(EVENT.LLM_CALL, {
      model: meta.model,
      purpose: meta.purpose,
      duration_ms: Date.now() - started,
      tokens_in,
      tokens_out,
      cost_usd,
      ok: true,
    });
    return result;
  } catch (err) {
    logEvent(EVENT.ERROR, {
      source: EVENT.LLM_CALL,
      model: meta.model,
      purpose: meta.purpose,
      duration_ms: Date.now() - started,
      err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    });
    throw err;
  }
}

/**
 * Record one natural-language query the user sent to the tool, and the
 * response the tool gave back. The point of this log is NOT performance —
 * it's to find functionality gaps: when users keep rephrasing the same
 * question in a single session, the tool probably can't answer it well.
 *
 * Session strategy is the caller's responsibility — pass a stable
 * `session_id` that groups queries from the same intent window:
 *
 *   - Web UI: a cookie that rotates after ~30 min idle is a good default
 *   - CLI: one invocation of the CLI = one session (use a fresh UUID per run)
 *
 * Raw `query_text` and `response_text` are stored intentionally — analysis
 * needs to read them later. If a particular tool handles sensitive data
 * and can't store raw text, redact BEFORE calling this function; do not
 * add a "redact" flag here.
 *
 * Returns the generated `query_id` so the caller can correlate this
 * query with downstream events (e.g. an `observeLLM` call made while
 * answering it — pass the id as `purpose` or a custom field).
 */
export function logQuery(args: {
  session_id: string;
  query_text: string;
  response_text: string;
  llm_call_id?: string;
  meta?: Record<string, unknown>;
}): string {
  const query_id = randomUUID();
  logEvent(EVENT.USER_QUERY, {
    query_id,
    session_id: args.session_id,
    query_text: args.query_text,
    response_text: args.response_text,
    llm_call_id: args.llm_call_id,
    ...args.meta,
  });
  return query_id;
}
