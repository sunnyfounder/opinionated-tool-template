# CLAUDE.md — Contract for editing this tool

**You are Claude, and you have been asked to modify this tool. Read this file first, every time, before making any changes.**

## Rule 1: BUSINESS_LOGIC.md is the source of truth

Before touching any code in this repository, read `BUSINESS_LOGIC.md`. It describes *why* this tool exists, what rules it enforces, what edge cases matter, and where those rules came from. The code is an implementation of those rules — if you change the code without understanding the rules, you will break something the user cares about without realizing it.

If the change the user is asking for is consistent with the existing `BUSINESS_LOGIC.md`, proceed.

If the change modifies a business rule, **update `BUSINESS_LOGIC.md` in the same commit**. Code and business logic must never drift. Changing one without the other is defined as a broken commit.

If the change introduces a new business rule not covered in `BUSINESS_LOGIC.md`, **add it** in the same commit. Capture not just *what* the rule is, but *why* — which decision, which person, which constraint it came from. The `why` is more valuable than the `what` over time.

## Rule 2: The stack is fixed

This tool uses a standard Sunnyfounder DEDO stack. Do not introduce alternatives without a real reason and a note in the commit message.

- **Language**: TypeScript, run via `tsx` in dev, ESM modules
- **Database**: SQLite via `better-sqlite3` — one `.db` file per tool, lives in `data/`, never in git
- **Web framework**: Express with EJS templates and HTMX for interactivity — no React, no bundler, no build step for v1
- **Logging**: pino writing JSONL to `logs/YYYY-MM-DD.jsonl` — daily rotation, structured events, never in git
- **Scheduling** (if needed): `node-cron` — pure Node, no system cron
- **Scraping** (if needed): `playwright` with headless Chromium
- **Config**: `dotenv` loading `.env`, documented in `.env.example`

If the user asks for React, a build system, a different DB, or a different web framework, push back: this tool is meant to be runnable by non-technical users with minimum setup. Stack changes defeat that purpose. If there's a genuine reason (e.g., a library only exists for another stack), discuss it with the user explicitly before adding it.

## Rule 3: Isolation

This tool owns its own data and does not reach into other tools' data. Specifically:

- Never read from another tool's SQLite file
- Never write to any path outside this tool's folder
- Never import from another tool's `src/`
- The only acceptable external data sources are: the user's own accounts and APIs, public websites, Data Team published data marts (read-only)

If the user asks for something that would require cross-tool data access, it's no longer a tool — it's a system, and it needs DEDO's involvement. Tell the user and stop.

## Rule 4: User-facing text is Traditional Chinese

Any string that appears in the web UI, CLI output, or error messages that the user sees — write in Traditional Chinese. Code comments, variable names, file names, and log messages stay in English.

## Rule 5: Preserve the default project structure

The layout of `src/`, `data/`, `logs/`, the entry points in `src/index.ts` and `src/cli.ts`, the database setup in `src/db.ts`, and the logger setup in `src/logger.ts` — all of these are DEDO conventions. Modify the *contents* of these files freely, but don't rename or restructure them without a reason. Future Claude sessions, and future humans reading the tool, expect to find things where the scaffold put them.

## Rule 6: Check the log before blaming the code

When something isn't working, the first thing to look at is `logs/YYYY-MM-DD.jsonl` (the current day's log file). The logger writes structured events for every major operation. Reading the log is faster than re-reading the code.

## What to do when this tool is first opened

If you are opening this tool for the first time and `src/core/` is empty, that means the tool has just been scaffolded and the business logic has not been implemented yet. Your job is to:

1. Read `BUSINESS_LOGIC.md` to understand what the tool should do
2. Read `README.md` to understand how the user will run it
3. Implement the business logic in `src/core/`
4. Wire `src/core/` into `src/web/routes.ts` (for the web UI) and `src/cli.ts` (for command-line invocation)
5. Update `README.md` with any tool-specific usage instructions
6. Test that `npm run dev` starts the web UI and shows something meaningful
7. Commit

If `src/core/` is not empty, the tool has been worked on before. Read `BUSINESS_LOGIC.md` and any existing code, then proceed with whatever the user asked for.
