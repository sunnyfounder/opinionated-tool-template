import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { routes } from './routes.js';
import { log } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer() {
  const app = express();

  // EJS templates in src/web/views/, with partials in views/partials/.
  app.set('view engine', 'ejs');
  app.set('views', join(__dirname, 'views'));

  // Available in every rendered view via EJS locals. Override per-render
  // by passing the same keys in the second argument of res.render().
  app.locals.toolName = '{{TOOL_NAME}}';
  app.locals.navItems = [{ href: '/', label: '首頁' }];

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Silence favicon requests — browsers fire them on every page load and
  // they'd otherwise fill the request log with 404s.
  app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
  });

  app.use((req, _res, next) => {
    log.info(
      { event_type: 'http_request', method: req.method, path: req.path },
      'request'
    );
    next();
  });

  app.use('/', routes);

  // 404 — plain HTML, no view required
  app.use((_req, res) => {
    res
      .status(404)
      .type('html')
      .send('<h1>找不到頁面 / Page not found</h1>');
  });

  // 500 — plain HTML, logs the error
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      log.error({ err, event_type: 'http_error' }, 'Request failed');
      res
        .status(500)
        .type('html')
        .send(`<h1>發生錯誤 / Error</h1><pre>${escapeHtml(err.message)}</pre>`);
    }
  );

  return app;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
