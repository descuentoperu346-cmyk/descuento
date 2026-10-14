import { Router, Response } from 'express';
import {
  AuthenticatedRequest,
  createSession,
  destroySession,
  setSessionCookie,
  clearSessionCookie,
  parseCookies,
  COOKIE_NAME
} from '../session';
import { serverSupabase } from '../supabase';

export const authRouter = Router();

// Credenciales base del administrador central
const ADMIN_USERNAME = 'admin';
const ADMIN_PIN = 'admin2026';

/**
 * POST /api/auth/login
 * Autentica usuario o vendedor y emite una cookie de sesión opaca HttpOnly
 */
authRouter.post('/login', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, pin } = req.body || {};

    if (!username || !pin) {
      res.status(400).json({
        success: false,
        error: 'El nombre de usuario y el PIN son obligatorios.'
      });
      return;
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPin = String(pin).trim();

    // 1. Verificación de Administrador Central
    if (cleanUsername === ADMIN_USERNAME && cleanPin === ADMIN_PIN) {
      const session = createSession({
        userId: 'admin-master',
        name: 'Administrador Central (SOC)',
        username: 'admin',
        role: 'admin',
        allowedCategories: ['streaming', 'investigacion', 'educacion', 'leaks']
      });

      setSessionCookie(res, session.id);

      res.json({
        success: true,
        user: {
          id: session.userId,
          name: session.name,
          username: session.username,
          role: session.role,
          csrfToken: session.csrfToken
        }
      });
      return;
    }

    // 2. Verificación de Vendedor contra la base de datos de Supabase desde el Servidor
    try {
      const { data: vendor, error } = await serverSupabase
        .from('vendors')
        .select('*')
        .ilike('username', cleanUsername)
        .single();

      if (!error && vendor) {
        if (String(vendor.pin).trim() === cleanPin && vendor.active !== false) {
          const session = createSession({
            userId: vendor.id,
            name: vendor.name,
            username: vendor.username,
            role: (vendor.role as 'admin' | 'vendor') || 'vendor',
            allowedCategories: vendor.allowed_categories || [],
            allowedServiceIds: vendor.allowed_service_ids || []
          });

          setSessionCookie(res, session.id);

          res.json({
            success: true,
            user: {
              id: session.userId,
              name: session.name,
              username: session.username,
              role: session.role,
              allowedCategories: session.allowedCategories,
              csrfToken: session.csrfToken
            }
          });
          return;
        }
      }
    } catch {
      // Si la tabla no está creada aún en Supabase, continúa con validación de fallback local
    }

    // 3. Fallback de vendedores iniciales si Supabase está offline o no inicializado
    const FALLBACK_VENDORS = [
      { id: 'vendedor-central', name: 'Descuentos Perú Central', username: 'central', pin: '1234', role: 'admin' as const },
      { id: 'vendedor-whisky', name: 'Whisky Perú', username: 'whiskyper', pin: '1234', role: 'vendor' as const },
      { id: 'vendedor-abby', name: 'Abbys Perú', username: 'abbysperu', pin: '1234', role: 'vendor' as const },
      { id: 'vendedor-nano', name: 'El Nano VIP', username: 'elnanovip', pin: '1234', role: 'vendor' as const },
      { id: 'vendedor-tino', name: 'Tin9o', username: 'tin9o', pin: '1234', role: 'vendor' as const }
    ];

    const matchedLocal = FALLBACK_VENDORS.find(
      (v) => v.username.toLowerCase() === cleanUsername && v.pin === cleanPin
    );

    if (matchedLocal) {
      const session = createSession({
        userId: matchedLocal.id,
        name: matchedLocal.name,
        username: matchedLocal.username,
        role: matchedLocal.role,
        allowedCategories: ['streaming', 'investigacion', 'educacion', 'leaks']
      });

      setSessionCookie(res, session.id);

      res.json({
        success: true,
        user: {
          id: session.userId,
          name: session.name,
          username: session.username,
          role: session.role,
          csrfToken: session.csrfToken
        }
      });
      return;
    }

    // Credenciales incorrectas
    res.status(401).json({
      success: false,
      error: 'Usuario o PIN incorrectos. Verifica tus credenciales.'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error interno de autenticación en el servidor.'
    });
  }
});

/**
 * POST /api/auth/logout
 * Invalida la sesión en el servidor y limpia la cookie
 */
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response): void => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[COOKIE_NAME];
  if (sessionId) {
    destroySession(sessionId);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: 'Sesión cerrada correctamente.' });
});

/**
 * GET /api/auth/me
 * Retorna los datos del usuario en sesión activa sin exponer tokens
 */
authRouter.get('/me', (req: AuthenticatedRequest, res: Response): void => {
  if (!req.sessionUser) {
    res.status(200).json({
      success: false,
      authenticated: false,
      user: null
    });
    return;
  }

  res.json({
    success: true,
    authenticated: true,
    user: {
      id: req.sessionUser.userId,
      name: req.sessionUser.name,
      username: req.sessionUser.username,
      role: req.sessionUser.role,
      allowedCategories: req.sessionUser.allowedCategories,
      allowedServiceIds: req.sessionUser.allowedServiceIds,
      csrfToken: req.sessionUser.csrfToken
    }
  });
});
