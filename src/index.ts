// config.ts must be first — it sets process.env.TZ before anything else
// touches `new Date()` (logger rotation, scheduler cron, etc.).
import { config } from './config.js';
import { createServer } from './web/server.js';
import { log } from './logger.js';
import { initDb } from './db.js';
import { startScheduler } from './scheduler.js';

async function main() {
  initDb();
  startScheduler();

  const app = createServer();
  const server = app.listen(config.port, () => {
    log.info(
      { event_type: 'server_started', port: config.port, tz: config.tz },
      `{{TOOL_NAME}} web UI running on http://localhost:${config.port}`
    );
  });

  const shutdown = (signal: string) => {
    log.info({ event_type: 'shutdown', signal }, 'Shutting down');
    server.close(() => {
      log.info('HTTP server closed');
      process.exit(0);
    });
    // Hard-stop if close() hangs on a long request
    setTimeout(() => {
      log.warn('Forced exit after shutdown timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  log.error({ err }, 'Fatal error starting tool');
  process.exit(1);
});
