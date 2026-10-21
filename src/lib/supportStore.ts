// Casos de garantía y soporte (tabla support_cases, SQL 12). La base decide quién ve y atiende qué.
import { useSyncExternalStore } from 'react';
import { dueIso, type CaseDraft, type CaseStatus, type SupportCase } from './supportLogic';

export interface SupportState {
  status: 'idle' | 'loading' | 'ready' | 'missing' | 'error';
  cases: SupportCase[];
  error: string | null;
}
export interface SupportResult {
  ok: boolean;
  error?: string;
}

type Db = { message?: string; code?: string } | null;
const COLS = 'id, number, vendor_id, sale_id, customer_id, customer_name, product_title, kind, status, description, resolution, warranty_until, due_at, resolved_at, created_at, updated_at';
const isMissing = (e: Db) => !!e && (['PGRST205', '42P01'].includes(e.code || '') || /could not find the table|does not exist/i.test(e.message || ''));

export function supportError(e: Db, fallback = 'No se pudo guardar. Inténtalo de nuevo.'): string {
  const msg = e?.message || '';
  if (isMissing(e)) return 'Falta activar garantías y soporte en la base de datos (ejecutar el SQL 12).';
  if (e?.code === '42501' || /row-level security|permission denied/i.test(msg)) return 'Tu cuenta no tiene permiso para hacer esto.';
  if (e?.code === '23514') return 'Alguno de los datos no es válido. Revisa el formulario.';
  if (e?.code === '23503') return 'La venta o el cliente elegido ya no existe.';
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return 'No hay conexión con el servidor. Revisa tu internet.';
  if (/JWT/i.test(msg)) return 'Tu sesión venció. Vuelve a iniciar sesión.';
  return fallback;
}

const toCase = (r: Record<string, any>): SupportCase => ({
  id: r.id,
  number: Number(r.number),
  vendorId: r.vendor_id,
  saleId: r.sale_id ?? null,
  customerId: r.customer_id ?? null,
  customerName: r.customer_name,
  productTitle: r.product_title ?? null,
  kind: r.kind,
  status: r.status,
  description: r.description,
  resolution: r.resolution ?? null,
  warrantyUntil: r.warranty_until ?? null,
  dueAt: r.due_at ?? null,
  resolvedAt: r.resolved_at ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});
const draftRow = (d: CaseDraft) => ({
  sale_id: d.saleId,
  customer_id: d.customerId,
  customer_name: d.customerName.trim(),
  product_title: d.productTitle.trim() || null,
  kind: d.kind,
  description: d.description.trim(),
  warranty_until: d.warrantyUntil,
  due_at: dueIso(d.dueDay)
});

const IDLE: SupportState = { status: 'idle', cases: [], error: null };
let state: SupportState = IDLE;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const set = (next: SupportState) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useSupport = (): SupportState => useSyncExternalStore(subscribe, () => state, () => state);

const client = async () => (await import('./supabaseBrowser')).sb();

export function ensureSupportLoaded(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && (state.status === 'ready' || state.status === 'missing')) return Promise.resolve();
  set({ ...state, status: 'loading', error: null });
  inflight = (async () => {
    try {
      const { data, error } = await (await client()).from('support_cases').select(COLS).order('created_at', { ascending: false }).limit(500);
      if (error) {
        if (isMissing(error)) set({ ...IDLE, status: 'missing' });
        else set({ ...IDLE, status: 'error', error: supportError(error, 'No se pudieron cargar los casos.') });
        return;
      }
      set({ status: 'ready', cases: (data || []).map(toCase), error: null });
    } catch {
      set({ ...IDLE, status: 'error', error: 'No hay conexión con el servidor. Revisa tu internet.' });
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Al cerrar sesión se olvidan los casos: la siguiente persona no debe verlos. */
export function resetSupport() {
  inflight = null;
  set(IDLE);
}

const upsertLocal = (c: SupportCase) => set({ ...state, status: 'ready', cases: [c, ...state.cases.filter((x) => x.id !== c.id)] });

export async function createCase(d: CaseDraft): Promise<SupportResult & { data?: SupportCase }> {
  try {
    const { data, error } = await (await client()).from('support_cases').insert({ vendor_id: d.vendorId, ...draftRow(d) }).select(COLS).single();
    if (error || !data) return { ok: false, error: supportError(error) };
    const c = toCase(data);
    upsertLocal(c);
    return { ok: true, data: c };
  } catch {
    return { ok: false, error: supportError({ message: 'Failed to fetch' }) };
  }
}

export async function editCase(id: string, d: CaseDraft): Promise<SupportResult> {
  return patch(id, draftRow(d));
}

/** Cambia el estado de un caso. Al resolver se puede dejar escrito cómo se resolvió. */
export async function setCaseStatus(id: string, status: CaseStatus, resolution?: string): Promise<SupportResult> {
  return patch(id, status === 'resolved' ? { status, resolution: (resolution || '').trim() || null } : { status });
}

async function patch(id: string, values: Record<string, unknown>): Promise<SupportResult> {
  try {
    const { data, error } = await (await client()).from('support_cases').update(values).eq('id', id).select(COLS);
    if (error) return { ok: false, error: supportError(error) };
    if (!data || data.length === 0) return { ok: false, error: 'No se pudo guardar: el caso ya no existe o no tienes permiso para cambiarlo.' };
    upsertLocal(toCase(data[0]));
    // el caso editado conserva su lugar en la lista cargada (la pantalla vuelve a ordenarla)
    return { ok: true };
  } catch {
    return { ok: false, error: supportError({ message: 'Failed to fetch' }) };
  }
}
