import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { config } from './config.js';
import { log } from './logger.js';

const DB_PATH = join(config.dataDir, '{{TOOL_NAME}}.db');

let db: Database.Database | null = null;

/**
 * Initialize the SQLite database. Creates `data/` if missing, opens (or
 * creates) the DB file, runs migrations. Call once at startup from
 * `src/index.ts` and `src/cli.ts`.
 */
export function initDb(): Database.Database {
  if (db) return db;

  mkdirSync(config.dataDir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);

  log.info({ path: DB_PATH }, 'Database initialized');
  return db;
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

/**
 * Schema migrations. Runs on every startup — keep each statement idempotent.
 *
 * Additive changes (new table, new column):
 *   - `CREATE TABLE IF NOT EXISTS ...` — safe to repeat
 *   - `ALTER TABLE x ADD COLUMN y ...` — NOT idempotent on SQLite; gate it
 *     on a version row in `_scaffold_meta` so it runs exactly once
 *
 * Destructive changes (rename/retype/drop column) — SQLite has no direct
 * support, use the rebuild-rename-swap pattern inside a transaction:
 *
 *   BEGIN;
 *   CREATE TABLE x_new (...new schema...);
 *   INSERT INTO x_new (cols) SELECT cols FROM x;
 *   DROP TABLE x;
 *   ALTER TABLE x_new RENAME TO x;
 *   COMMIT;
 *
 * Gate destructive migrations on a version row so they run exactly once.
 */
function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _scaffold_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
