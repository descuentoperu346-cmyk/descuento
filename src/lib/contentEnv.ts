/**
 * Configuración del proyecto de Supabase de CONTENIDO PÚBLICO (leaks, catálogo, vendedores sin PIN, pagos, archivos).
 * Variables (se escriben en .env y en Vercel > Settings > Environment Variables):
 *   VITE_CONTENT_SUPABASE_URL        https://<proyecto>.supabase.co
 *   VITE_CONTENT_SUPABASE_ANON_KEY   la clave "anon" o "publishable" (NUNCA la service_role / secret)
 * (También se aceptan los nombres anteriores VITE_LEAKS_SUPABASE_URL / VITE_LEAKS_SUPABASE_ANON_KEY.)
 * Todo lo que empieza con VITE_ viaja al navegador: por eso solo va la clave pública.
 */
const env = import.meta.env as Record<string, string | undefined>;

const clean = (v: string | undefined) => (v || '').trim();

export const CONTENT_URL = clean(env.VITE_CONTENT_SUPABASE_URL || env.VITE_LEAKS_SUPABASE_URL).replace(/\/+$/, '');
const RAW_KEY = clean(env.VITE_CONTENT_SUPABASE_ANON_KEY || env.VITE_LEAKS_SUPABASE_ANON_KEY);

/** Seguro anti-error: una clave de administrador nunca debe viajar al navegador. */
export function isForbiddenKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.role === 'service_role';
  } catch {
    return false;
  }
}

const FORBIDDEN = RAW_KEY !== '' && isForbiddenKey(RAW_KEY);
if (FORBIDDEN) {
  console.error('[contenido] La clave configurada es de administrador. No se usa: pon la clave pública (anon/publishable).');
}

export const CONTENT_KEY = FORBIDDEN ? '' : RAW_KEY;

/** true si hay base de datos de contenido configurada con una clave válida */
export const CONTENT_DB_ENABLED = Boolean(CONTENT_URL && CONTENT_KEY);

/** Cabeceras para leer con la clave pública (las claves "publishable" nuevas no son JWT: solo van como apikey). */
export function publicHeaders(): Record<string, string> {
  const h: Record<string, string> = { apikey: CONTENT_KEY, Accept: 'application/json' };
  if (CONTENT_KEY.startsWith('eyJ')) h.Authorization = `Bearer ${CONTENT_KEY}`;
  return h;
}
