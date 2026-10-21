import { useCallback, useEffect, useRef, useState } from 'react';
import type { LeakArticle } from '../data/leaksData';
import { CONTENT_DB_ENABLED } from '../lib/contentEnv';
import { enqueueSave, friendlyError, setRemoteStatus } from '../lib/remoteStatus';

/**
 * Los artículos pesan ~95 kB (≈32 kB comprimidos) y solo se usan en Leaks y en el panel admin.
 * Se cargan bajo demanda para que quien visita el inicio o el catálogo no los descargue.
 * Con base de datos configurada se leen de Supabase; si no responde, de la copia incluida en el código.
 * Devuelve `null` mientras cargan.
 */
export function useLeakArticles(needed: boolean) {
  const [articles, setArticles] = useState<LeakArticle[] | null>(null);
  const latest = useRef<LeakArticle[] | null>(null);
  const remoteReady = useRef(false); // true si la lista actual salió de la base de datos

  const commit = useCallback((list: LeakArticle[]) => {
    latest.current = list;
    setArticles(list);
  }, []);

  useEffect(() => {
    if (!needed || articles) return;
    let cancelled = false;
    (async () => {
      let list: LeakArticle[] | null = null;
      if (CONTENT_DB_ENABLED) {
        const m = await import('../lib/leaksDb');
        list = await m.fetchLeaksFromDb();
        remoteReady.current = list !== null;
      }
      if (!list) {
        // Sin base de datos, o la base no respondió: copia incluida en el código
        const m = await import('../data/leaksData');
        list = m.getStoredLeakArticles();
      }
      if (!cancelled) commit(list);
    })().catch((e) => console.warn('No se pudieron cargar los leaks', e));
    return () => {
      cancelled = true;
    };
  }, [needed, articles, commit]);

  const update = useCallback(
    (updated: LeakArticle[]) => {
      const prev = latest.current ?? [];
      commit(updated);

      if (!CONTENT_DB_ENABLED) {
        import('../data/leaksData')
          .then((m) => m.saveStoredLeakArticles(updated))
          .catch((e) => console.warn('No se pudieron guardar los leaks', e));
        return;
      }
      if (!remoteReady.current) {
        setRemoteStatus({
          state: 'error',
          message: 'La base de datos aún no tiene los leaks. Ejecuta los pasos 2 y 3 de supabase/LEEME.md antes de editar desde el panel.'
        });
        return;
      }
      setRemoteStatus({ state: 'saving', message: 'Guardando leaks…' });
      enqueueSave(async () => {
        const m = await import('../lib/supabaseBrowser');
        return m.syncLeaks(prev, updated);
      })
        .then((normalized) => {
          commit(normalized);
          setRemoteStatus({ state: 'saved', message: 'Leaks guardados en la base de datos.' });
        })
        .catch((e) => setRemoteStatus({ state: 'error', message: friendlyError(e) }));
    },
    [commit]
  );

  /** Sustituye la lista por la que ve el staff (incluye borradores); la marca como proveniente de la base. */
  const replace = useCallback(
    (list: LeakArticle[]) => {
      remoteReady.current = true;
      commit(list);
    },
    [commit]
  );

  return { articles, update, replace };
}
