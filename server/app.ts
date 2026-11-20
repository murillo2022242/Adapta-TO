import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { UPLOADS_DIR, db, initializeDatabase } from './db.ts';
import { seedInitialData } from './seed.ts';
import { registerRoutes } from './routes.ts';

let cachedApp: Express | null = null;
let initialized = false;

export function ensureInitialized(): void {
  if (initialized) return;
  initializeDatabase();
  seedInitialData();
  initialized = true;
}

export function getExpressApp(): Express {
  if (cachedApp) return cachedApp;

  ensureInitialized();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '6mb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/robots.txt', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const staticPaths = [
      '/',
      '/sobre',
      '/especialidades',
      '/profissionais',
      '/agendamento',
      '/duvidas',
      '/contato',
      '/privacidade',
    ];

    const specRows = db
      .prepare('SELECT slug FROM specialties WHERE active = 1 ORDER BY sort_order ASC')
      .all() as Array<{ slug: string }>;

    const allUrls = [
      ...staticPaths.map((p) => `${origin}${p}`),
      ...specRows.map((s) => `${origin}/especialidades/${s.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls
      .map((u) => `  <url><loc>${u}</loc></url>`)
      .join('\n')}\n</urlset>`;

    res.type('application/xml').send(xml);
  });

  registerRoutes(app);

  // Ensure API errors always respond with clean JSON
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    if (req.path.startsWith('/api')) {
      res.status(err?.status || 500).json({
        error: err?.message || 'Erro interno no servidor.',
      });
      return;
    }
    res.status(500).send('Erro interno no servidor.');
  });

  cachedApp = app;
  return app;
}
