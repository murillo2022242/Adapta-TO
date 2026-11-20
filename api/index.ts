import type { IncomingMessage, ServerResponse } from 'node:http';
import { getExpressApp } from '../server/app.ts';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  try {
    // Reconstruct original path when Vercel rewrites /api/* -> /api/index?__vpath=...
    if (req.url) {
      const parsed = new URL(req.url, 'http://localhost');
      const vpath = parsed.searchParams.get('__vpath');
      if (vpath) {
        parsed.searchParams.delete('__vpath');
        const qs = parsed.searchParams.toString();
        const normalizedPath = vpath.startsWith('/') ? vpath : `/${vpath}`;
        req.url = qs ? `${normalizedPath}?${qs}` : normalizedPath;
      }
    }

    const app = getExpressApp();
    app(req as any, res as any);
  } catch (err: any) {
    console.error('Vercel serverless handler error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: 'Erro temporário ao inicializar o servidor da clínica.',
      })
    );
  }
}
