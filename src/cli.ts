// config.ts first — sets TZ before any Date work
import './config.js';
import { log } from './logger.js';
import { initDb } from './db.js';

/**
 * CLI entry point. Add commands to the `commands` map below.
 *
 * Usage:  npm run cli -- <command> [args...]
 *
 * The dispatcher is intentionally tiny — no yargs, no commander. When you
 * genuinely need subcommand parsing, flags, and help text, swap in a real
 * CLI framework then. Until that's earned, `process.argv[2]` is enough.
 */
const commands: Record<string, (args: string[]) => Promise<void> | void> = {
  hello: () => {
    log.info({ event_type: 'cli_invocation', command: 'hello' }, 'hello');
    console.log('hello from {{TOOL_NAME}}');
  },

  'db:info': () => {
    const db = initDb();
    const row = db
      .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table'")
      .get() as { n: number };
    console.log(`tables: ${row.n}`);
  },
};

async function run() {
  const [, , cmd, ...rest] = process.argv;

  if (!cmd || !(cmd in commands)) {
    const list = Object.keys(commands).map((c) => `  ${c}`).join('\n');
    console.log(`Usage: npm run cli -- <command>\n\nAvailable commands:\n${list}`);
    process.exit(cmd ? 1 : 0);
  }

  await commands[cmd](rest);
}

run().catch((err) => {
  log.error({ err }, 'CLI run failed');
  process.exit(1);
});
