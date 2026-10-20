import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el archivo .env de la raíz
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Credenciales privadas de Supabase - SOLO EN SERVIDOR
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Administrador central: el usuario puede ser público, el PIN NUNCA va en el código.
  // Genera el hash con: npm run admin:hash -- "tu clave"
  adminUsername: (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase(),
  adminPinHash: (process.env.ADMIN_PIN_HASH || '').trim(),

  // Accesos de demostración (vendedores con PIN 1234). Solo funcionan fuera de producción.
  allowDemoLogins: process.env.ALLOW_DEMO_LOGINS === 'true' && process.env.NODE_ENV !== 'production',

  // Si el servidor está detrás de un proxy (Render, Railway, Nginx...), indica cuántos saltos: TRUST_PROXY=1
  trustProxy: process.env.TRUST_PROXY ? parseInt(process.env.TRUST_PROXY, 10) : 0,

  // Clave secreta para sesiones seguras
  sessionSecret: process.env.SESSION_SECRET || 'dp_secret_session_key_peru_2026',
  sessionTtlMs: 24 * 60 * 60 * 1000 // 24 horas
};

// Validación de inicio del servidor sin imprimir claves
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('[SERVER WARNING] Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY en el servidor.');
}
if (!config.adminPinHash) {
  console.warn('[SERVER WARNING] ADMIN_PIN_HASH no está definido: el acceso de administrador central está desactivado. Genera uno con: npm run admin:hash -- "tu clave"');
}
