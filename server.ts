import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { db, initializeDatabase } from './server/db.ts';
import { seedInitialData } from './server/seed.ts';
import { registerRoutes } from './server/routes.ts';

async function startServer(): Promise<void> {
  initializeDatabase();
  seedInitialData();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '6mb' }));

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Uploaded images directory
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // SEO endpoints: robots.txt and dynamic sitemap.xml
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

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`adaptaTO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start adaptaTO server:', err);
  process.exit(1);
});
