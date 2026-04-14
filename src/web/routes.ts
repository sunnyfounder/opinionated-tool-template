import { Router } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const routes = Router();

const { version } = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf-8')
);

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', tool: '{{TOOL_NAME}}', version });
});

/**
 * Home page. The scaffold ships a placeholder view — replace the contents
 * of `src/web/views/index.ejs` (between the PLACEHOLDER markers) and add
 * more handlers below as the tool grows.
 *
 * Keep business logic out of route handlers. Import from `src/core/` so
 * the same code is reachable from `src/cli.ts`.
 */
routes.get('/', (_req, res) => {
  res.render('index', { title: '首頁' });
});

// Example HTMX endpoint — returns an HTML fragment that HTMX swaps into
// the DOM where `hx-target` points.
//
// routes.get('/fragments/example', (_req, res) => {
//   res.type('html').send('<div>hello from the server</div>');
// });
