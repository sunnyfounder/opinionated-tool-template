import { Router } from 'express';

export const routes = Router();

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
