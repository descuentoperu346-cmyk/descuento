import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';

export interface ServerSession {
  id: string; // Identificador aleatorio y opaco (hex de 64 caracteres)
  userId: string;
  name: string;
  username: string;
  role: 'admin' | 'vendor';
  allowedCategories?: string[];
  allowedServiceIds?: string[];
  csrfToken: string;
  createdAt: number;
  expiresAt: number;
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
}

// Almacén seguro de sesiones en memoria del servidor
// Para múltiples réplicas se puede conectar a Redis sin cambiar la interfaz pública
const sessionStore = new Map<string, ServerSession>();

export const COOKIE_NAME = 'dp_session';

/**
 * Función para limpiar sesiones expiradas periódicamente
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessionStore.entries()) {
    if (session.expiresAt <= now) {
      sessionStore.delete(id);
    }
  }
}
setInterval(cleanupExpiredSessions, 15 * 60 * 1000); // Cada 15 minutos

/**
 * Parser ligero de cookies para no depender de paquetes externos con conflictos peer
 */
export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx !== -1) {
      const key = pair.substring(0, idx).trim();
      const val = pair.substring(idx + 1).trim();
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }
  return cookies;
}

/**
 * Crea una sesión segura, aleatoria y opaca en el servidor
 */
export function createSession(data: {
  userId: string;
  name: string;
  username: string;
  role: 'admin' | 'vendor';
  allowedCategories?: string[];
  allowedServiceIds?: string[];
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
}): ServerSession {
  const id = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const now = Date.now();

  const session: ServerSession = {
    id,
    userId: data.userId,
    name: data.name,
    username: data.username,
    role: data.role,
    allowedCategories: data.allowedCategories || [],
    allowedServiceIds: data.allowedServiceIds || [],
    csrfToken,
    createdAt: now,
    expiresAt: now + config.sessionTtlMs,
    supabaseAccessToken: data.supabaseAccessToken,
    supabaseRefreshToken: data.supabaseRefreshToken
  };

  sessionStore.set(id, session);
  return session;
}

/**
 * Recupera una sesión por su ID y valida su expiración
 */
export function getSession(sessionId: string): ServerSession | null {
  if (!sessionId) return null;
  const session = sessionStore.get(sessionId);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessionStore.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Invalida/destruye una sesión
 */
export function destroySession(sessionId: string): void {
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
}

/**
 * Escribe la cookie HttpOnly en la respuesta HTTP
 */
export function setSessionCookie(res: Response, sessionId: string): void {
  const maxAgeSeconds = Math.floor(config.sessionTtlMs / 1000);
  const secureFlag = config.isProduction ? '; Secure' : '';
  const cookieValue = `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secureFlag}`;
  
  res.setHeader('Set-Cookie', cookieValue);
}

/**
 * Elimina la cookie HttpOnly en la respuesta HTTP
 */
export function clearSessionCookie(res: Response): void {
  const secureFlag = config.isProduction ? '; Secure' : '';
  const cookieValue = `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secureFlag}`;
  
  res.setHeader('Set-Cookie', cookieValue);
}

/**
 * Extensión de la interfaz de Express Request para tipar el usuario autenticado
 */
export interface AuthenticatedRequest extends Request {
  sessionUser?: ServerSession;
}

/**
 * Middleware para extraer la sesión activa de la cookie sin bloquear
 */
export function sessionMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[COOKIE_NAME];
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      req.sessionUser = session;
    }
  }
  next();
}

/**
 * Middleware que exige sesión activa
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.sessionUser) {
    res.status(401).json({
      success: false,
      error: 'Sesión no válida o expirada. Por favor inicia sesión nuevamente.'
    });
    return;
  }
  next();
}

/**
 * Middleware que exige rol de Administrador
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.sessionUser || req.sessionUser.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado: se requieren privilegios de Administrador del sistema.'
    });
    return;
  }
  next();
}
