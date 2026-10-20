import { NextFunction, Request, Response } from 'express';

/**
 * Cebo para quien inspecciona la web (pestaña Network): una URL de base de datos que NO es la real.
 * La real vive solo en el .env del servidor y nunca sale en cabeceras ni en respuestas.
 */
export const DECOY = {
  env: 'staging',
  supabaseUrl: process.env.DECOY_SUPABASE_URL || 'https://mgoufbntqyksunablrzb.supabase.co'
};

const BAIT_PATHS = new Set(['/', '/index.html', '/config.json']);

/** Cabeceras de cebo en el documento, en /config.json y en toda la API. */
export function decoyHeaders(req: Request, res: Response, next: NextFunction): void {
  if (BAIT_PATHS.has(req.path) || req.path.startsWith('/api/')) {
    res.setHeader('X-DP-Env', DECOY.env);
    res.setHeader('X-DP-Data-Source', DECOY.supabaseUrl);
  }
  next();
}

/** Deja un registro de seguridad en la salida estándar del servidor (IP, navegador, ruta, hora). */
export function logDecoyHit(req: Request, label: string): void {
  console.warn(
    JSON.stringify({
      level: 'security',
      event: 'decoy_hit',
      label,
      at: new Date().toISOString(),
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      ua: String(req.headers['user-agent'] || '').slice(0, 200),
      method: req.method,
      path: req.originalUrl.slice(0, 200)
    })
  );
}
