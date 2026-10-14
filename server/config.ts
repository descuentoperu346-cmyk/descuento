import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el archivo .env de la raíz
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Credenciales privadas de Supabase - SOLO EN SERVIDOR
  supabaseUrl: process.env.SUPABASE_URL || 'https://mgoufbntqyksunablrzb.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Clave secreta para sesiones seguras
  sessionSecret: process.env.SESSION_SECRET || 'dp_secret_session_key_peru_2026',
  sessionTtlMs: 24 * 60 * 60 * 1000 // 24 horas
};

// Validación de inicio del servidor sin imprimir claves
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('[SERVER WARNING] Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY en el servidor.');
}
