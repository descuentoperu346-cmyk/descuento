import type { LeakArticle } from '../data/leaksData';

/**
 * Lectura de los leaks desde Supabase (solo lectura, con la clave PÚBLICA).
 * Variables (se escriben en .env y en Vercel > Settings > Environment Variables):
 *   VITE_LEAKS_SUPABASE_URL        https://<proyecto>.supabase.co
 *   VITE_LEAKS_SUPABASE_ANON_KEY   la clave "anon" o "publishable" (NUNCA la service_role / secret)
 * Lo que decide qué se ve es la política de seguridad de la base (RLS): solo filas publicadas.
 */
const URL_BASE = ((import.meta.env.VITE_LEAKS_SUPABASE_URL as string | undefined) || '').trim().replace(/\/+$/, '');
const KEY = ((import.meta.env.VITE_LEAKS_SUPABASE_ANON_KEY as string | undefined) || '').trim();

export const LEAKS_DB_ENABLED = Boolean(URL_BASE && KEY);

/** Seguro anti-error: una clave de administrador nunca debe viajar al navegador. */
function isForbiddenKey(key: string): boolean {
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

interface LeakRow {
  id: string;
  data: LeakArticle;
}

const looksLikeArticle = (a: unknown): a is LeakArticle => {
  const x = a as LeakArticle;
  return !!x && typeof x.title === 'string' && typeof x.slug === 'string' && Array.isArray(x.content);
};

let cached: Promise<LeakArticle[] | null> | null = null;

/**
 * Devuelve los leaks publicados (ya ordenados), o null si no se pudo leer
 * (en ese caso la web usa la copia incluida en el código).
 */
export function fetchLeaksFromDb(): Promise<LeakArticle[] | null> {
  if (!LEAKS_DB_ENABLED) return Promise.resolve(null);
  if (cached) return cached;

  cached = (async () => {
    if (isForbiddenKey(KEY)) {
      console.error('[leaks] La clave configurada es de administrador. No se usa: pon la clave pública (anon/publishable).');
      return null;
    }
    try {
      const headers: Record<string, string> = { apikey: KEY, Accept: 'application/json' };
      // Las claves "publishable" nuevas no son JWT: solo se envían como apikey.
      if (KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${KEY}`;

      const qs = new URLSearchParams({ select: 'id,data', order: 'sort_order.asc' });
      const res = await fetch(`${URL_BASE}/rest/v1/leaks?${qs.toString()}`, { headers });
      if (!res.ok) return null;
      const rows = (await res.json()) as LeakRow[];
      if (!Array.isArray(rows)) return null;
      const articles = rows.filter((r) => looksLikeArticle(r?.data)).map((r) => ({ ...r.data, id: r.id }));
      return articles.length > 0 ? articles : null;
    } catch {
      return null;
    }
  })();

  // Si falló, permite reintentar en la próxima visita a Leaks
  cached.then((r) => {
    if (r === null) cached = null;
  });
  return cached;
}
