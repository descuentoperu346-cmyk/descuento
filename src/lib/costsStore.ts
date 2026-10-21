// Costos de los productos (tabla product_costs, SQL 11). La base decide quién ve y edita qué: un vendedor solo ve los de su tienda.
import { useSyncExternalStore } from 'react';
import { costKey, type CostRow } from './gainsMath';

export interface CostsState {
  status: 'idle' | 'loading' | 'ready' | 'missing' | 'error';
  rows: CostRow[];
  error: string | null;
}
export interface CostChange {
  vendorId: string;
  productId: string;
  plan: string;
  /** null = quitar el costo */
  cost: number | null;
}

type Db = { message?: string; code?: string } | null;
const isMissing = (e: Db) => !!e && (['PGRST205', '42P01'].includes(e.code || '') || /could not find the table|does not exist/i.test(e.message || ''));
export function costsError(e: Db, fallback = 'No se pudo guardar. Inténtalo de nuevo.'): string {
  const msg = e?.message || '';
  if (isMissing(e)) return 'Falta activar los costos en la base de datos (ejecutar el SQL 11).';
  if (e?.code === '42501' || /row-level security|permission denied/i.test(msg)) return 'Tu cuenta no tiene permiso para hacer esto.';
  if (e?.code === '23514') return 'Un costo no es válido (debe estar entre 0 y 100,000).';
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return 'No hay conexión con el servidor. Revisa tu internet.';
  if (/JWT/i.test(msg)) return 'Tu sesión venció. Vuelve a iniciar sesión.';
  return fallback;
}

const IDLE: CostsState = { status: 'idle', rows: [], error: null };
let state: CostsState = IDLE;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const set = (next: CostsState) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useCosts = (): CostsState => useSyncExternalStore(subscribe, () => state, () => state);

const client = async () => (await import('./supabaseBrowser')).sb();

export function ensureCostsLoaded(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && (state.status === 'ready' || state.status === 'missing')) return Promise.resolve();
  set({ ...state, status: 'loading', error: null });
  inflight = (async () => {
    try {
      const { data, error } = await (await client()).from('product_costs').select('vendor_id, product_id, plan, cost').limit(5000);
      if (error) {
        if (isMissing(error)) set({ ...IDLE, status: 'missing' });
        else set({ ...IDLE, status: 'error', error: costsError(error, 'No se pudieron cargar los costos.') });
        return;
      }
      const rows: CostRow[] = (data || []).map((r: any) => ({ vendorId: String(r.vendor_id), productId: String(r.product_id), plan: String(r.plan ?? ''), cost: Number(r.cost) }));
      set({ status: 'ready', rows, error: null });
    } catch {
      set({ ...IDLE, status: 'error', error: 'No hay conexión con el servidor. Revisa tu internet.' });
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Al cerrar sesión se olvidan los costos: la siguiente persona no debe verlos. */
export function resetCosts() {
  inflight = null;
  set(IDLE);
}

/** Guarda varios cambios de costo de una vez (los que tienen valor se crean o actualizan; los null se quitan). */
export async function saveCostChanges(changes: CostChange[]): Promise<{ ok: boolean; error?: string }> {
  if (!changes.length) return { ok: true };
  try {
    const c = await client();
    const upserts = changes.filter((x) => x.cost !== null).map((x) => ({ vendor_id: x.vendorId, product_id: x.productId, plan: x.plan, cost: x.cost }));
    if (upserts.length) {
      const { error } = await c.from('product_costs').upsert(upserts, { onConflict: 'vendor_id,product_id,plan' });
      if (error) return { ok: false, error: costsError(error) };
    }
    for (const x of changes.filter((x) => x.cost === null)) {
      const { error } = await c.from('product_costs').delete().eq('vendor_id', x.vendorId).eq('product_id', x.productId).eq('plan', x.plan);
      if (error) return { ok: false, error: costsError(error) };
    }
    // La pantalla refleja lo guardado sin volver a pedirlo
    const next = new Map(state.rows.map((r) => [costKey(r.vendorId, r.productId, r.plan), r]));
    for (const x of changes) {
      const k = costKey(x.vendorId, x.productId, x.plan);
      if (x.cost === null) next.delete(k);
      else next.set(k, { vendorId: x.vendorId, productId: x.productId, plan: x.plan, cost: x.cost });
    }
    set({ status: 'ready', rows: [...next.values()], error: null });
    return { ok: true };
  } catch {
    return { ok: false, error: costsError({ message: 'Failed to fetch' }) };
  }
}
