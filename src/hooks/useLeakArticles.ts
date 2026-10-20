import { useCallback, useEffect, useState } from 'react';
import type { LeakArticle } from '../data/leaksData';

// Si hay base de datos configurada, los leaks se leen de ahí; si no, de la copia incluida en el código.
const DB_ON = Boolean(import.meta.env.VITE_LEAKS_SUPABASE_URL && import.meta.env.VITE_LEAKS_SUPABASE_ANON_KEY);

/**
 * Los artículos pesan ~95 kB (≈32 kB comprimidos) y solo se usan en Leaks y en el panel admin.
 * Se cargan bajo demanda para que quien visita el inicio o el catálogo no los descargue.
 * Devuelve `null` mientras cargan.
 */
export function useLeakArticles(needed: boolean) {
  const [articles, setArticles] = useState<LeakArticle[] | null>(null);

  useEffect(() => {
    if (!needed || articles) return;
    let cancelled = false;
    (async () => {
      let list: LeakArticle[] | null = null;
      if (DB_ON) {
        const { fetchLeaksFromDb } = await import('../lib/leaksDb');
        list = await fetchLeaksFromDb();
      }
      if (!list) {
        // Sin base de datos, o la base no respondió: copia incluida en el código
        const m = await import('../data/leaksData');
        list = m.getStoredLeakArticles();
      }
      if (!cancelled) setArticles(list);
    })().catch((e) => console.warn('No se pudieron cargar los leaks', e));
    return () => {
      cancelled = true;
    };
  }, [needed, articles]);

  const update = useCallback((updated: LeakArticle[]) => {
    setArticles(updated);
    import('../data/leaksData')
      .then((m) => m.saveStoredLeakArticles(updated))
      .catch((e) => console.warn('No se pudieron guardar los leaks', e));
  }, []);

  return { articles, update };
}
