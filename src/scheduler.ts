import { log } from './logger.js';

/**
 * Scheduler. Called once from `src/index.ts` at startup.
 *
 * Add jobs by importing `node-cron` and calling `cron.schedule(...)` inside
 * `startScheduler()`. Keep each job's body tiny — delegate to functions in
 * `src/core/` so the same code can also be invoked from `src/cli.ts`.
 *
 * Cron times are interpreted in Asia/Taipei (set in `config.ts`).
 *
 * Syntax (node-cron): https://github.com/node-cron/node-cron#cron-syntax
 *   '0 9 * * 1'      every Monday at 09:00
 *   '0 */2 * * *'    every 2 hours
 *   '0 0 1,15 * *'   1st and 15th of the month
 *
 * Example:
 *   import cron from 'node-cron';
 *   cron.schedule('0 9 * * 1', async () => {
 *     log.info({ event_type: 'scheduled_run' }, 'weekly job firing');
 *     try {
 *       const { run } = await import('./core/weekly.js');
 *       await run();
 *     } catch (err) {
 *       log.error({ err, event_type: 'scheduled_run_failed' }, 'weekly job failed');
 *     }
 *   });
 */
export function startScheduler(): void {
  log.info({ event_type: 'scheduler_started', jobs: 0 }, 'Scheduler started');
}
