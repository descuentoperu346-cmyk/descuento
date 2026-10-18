import { Request, Response, NextFunction } from 'express';

/**
 * Cache en memoria de respuestas PUBLICAS (sin sesion privilegiada).
 * Las respuestas de admin/vendedor nunca se guardan aqui ni se cachean en el navegador.
 * Se invalida completa ante cualquier escritura (POST/PUT/DELETE) sobre la API.
 */
const TTL_MS = 30_000;
const store = new Map<string, { at: number; body: unknown }>();

export function getCached<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL_MS) {
    store.delete(key);
    return undefined;
  }
  return hit.body as T;
}

export function setCached(key: string, body: unknown): void {
  store.set(key, { at: Date.now(), body });
}

export function invalidateOnWrite(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.on('finish', () => store.clear());
  }
  next();
}

/** Lectura publica: cacheable brevemente. Privada: nunca se guarda. */
export function setCacheHeaders(res: Response, isPublic: boolean): void {
  res.setHeader('Vary', 'Cookie');
  res.setHeader('Cache-Control', isPublic ? 'public, max-age=30, stale-while-revalidate=120' : 'private, no-store');
}
