// Libro de Reclamaciones (tabla complaints y función submit_complaint, SQL 15).
//  · submitComplaint → lo usa cualquier visitante (con o sin cuenta) para registrar su hoja.
//  · El resto lo usa solo el equipo administrador en el panel: leer las hojas y escribir la respuesta.
import { useSyncExternalStore } from 'react';
import { CONTENT_DB_ENABLED } from './contentEnv';
import { LEGAL_VERSION } from './legal';
import { complaintPayload, type Complaint, type ComplaintDraft, type ComplaintReceipt } from './complaintsLogic';

type Db = { message?: string; code?: string } | null;
const isMissing = (e: Db) => !!e && (['PGRST205', '42P01', 'PGRST202', '42883'].includes(e.code || '') || /could not find the (table|function)|does not exist/i.test(e.message || ''));
const isNetwork = (e: Db) => /Failed to fetch|NetworkError|fetch failed|Load failed/i.test(e?.message || '');

const FIELD_LABEL: Record<string, string> = {
  kind: 'el tipo (reclamo o queja)',
  consumer_name: 'tu nombre',
  doc_type: 'el tipo de documento',
  doc_number: 'el número de documento',
  address: 'tu domicilio',
  phone: 'tu teléfono',
  email: 'tu correo',
  guardian_name: 'el nombre de tu padre, madre o representante',
  guardian_doc: 'el documento de tu representante',
  good_type: 'si es un producto o un servicio',
  good_description: 'qué compraste',
  amount: 'el monto',
  order_ref: 'el número de pedido',
  detail: 'el detalle de lo que pasó',
  request: 'tu pedido',
  reply_via: 'cómo quieres recibir la respuesta',
  conformity: 'la casilla de conformidad'
};

export function complaintError(e: Db, fallback = 'No se pudo guardar. Inténtalo de nuevo.'): string {
  const msg = e?.message || '';
  const field = /invalid:(\w+)/.exec(msg)?.[1];
  if (field) return `Revisa ${FIELD_LABEL[field] || 'los datos de la hoja'}: no es válido.`;
  if (e?.code === '54000' || /rate_limited/.test(msg)) return 'Ya enviaste varias hojas con este correo hoy, o hay demasiados envíos ahora mismo. Inténtalo más tarde.';
  if (isMissing(e)) return 'El Libro de Reclamaciones todavía no está activo en el servidor.';
  if (isNetwork(e)) return 'No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.';
  if (e?.code === '42501' || /row-level security|permission denied/i.test(msg)) return 'Tu cuenta no tiene permiso para hacer esto.';
  if (/JWT/i.test(msg)) return 'Tu sesión venció. Vuelve a iniciar sesión.';
  return fallback;
}

const client = async () => (await import('./supabaseBrowser')).sb();

// ---------------------------------------------------------------- registrar una hoja (público)
export type SubmitResult = { ok: true; receipt: ComplaintReceipt } | { ok: false; error: string; unavailable?: boolean };

export async function submitComplaint(draft: ComplaintDraft): Promise<SubmitResult> {
  if (!CONTENT_DB_ENABLED) return { ok: false, unavailable: true, error: 'El Libro de Reclamaciones no está disponible en este momento.' };
  try {
    const { data, error } = await (await client()).rpc('submit_complaint', { p: complaintPayload(draft, LEGAL_VERSION) });
    if (error) return { ok: false, unavailable: isMissing(error), error: complaintError(error) };
    const r = (data || {}) as Record<string, any>;
    if (!r.id || r.number == null || !r.created_at || !r.due_at) return { ok: false, error: 'No se pudo confirmar el registro de la hoja. Inténtalo de nuevo.' };
    return { ok: true, receipt: { id: r.id, number: Number(r.number), createdAt: r.created_at, dueAt: r.due_at } };
  } catch {
    return { ok: false, error: complaintError({ message: 'Failed to fetch' }) };
  }
}

// ---------------------------------------------------------------- panel del equipo
export interface ComplaintsState {
  status: 'idle' | 'loading' | 'ready' | 'missing' | 'error';
  items: Complaint[];
  error: string | null;
}
export interface ComplaintResult {
  ok: boolean;
  error?: string;
}

const COLS =
  'id, number, created_at, kind, consumer_name, doc_type, doc_number, address, phone, email, is_minor, guardian_name, guardian_doc, good_type, good_description, amount, order_ref, detail, request, reply_via, due_at, status, response, responded_at';

const toComplaint = (r: Record<string, any>): Complaint => ({
  id: r.id,
  number: Number(r.number),
  createdAt: r.created_at,
  kind: r.kind,
  consumerName: r.consumer_name,
  docType: r.doc_type,
  docNumber: r.doc_number,
  address: r.address,
  phone: r.phone,
  email: r.email,
  isMinor: !!r.is_minor,
  guardianName: r.guardian_name ?? null,
  guardianDoc: r.guardian_doc ?? null,
  goodType: r.good_type,
  goodDescription: r.good_description,
  amount: r.amount == null ? null : Number(r.amount),
  orderRef: r.order_ref ?? null,
  detail: r.detail,
  request: r.request,
  replyVia: r.reply_via,
  dueAt: r.due_at,
  status: r.status,
  response: r.response ?? null,
  respondedAt: r.responded_at ?? null
});

const IDLE: ComplaintsState = { status: 'idle', items: [], error: null };
let state: ComplaintsState = IDLE;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const set = (next: ComplaintsState) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useComplaints = (): ComplaintsState => useSyncExternalStore(subscribe, () => state, () => state);

export function ensureComplaintsLoaded(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && (state.status === 'ready' || state.status === 'missing')) return Promise.resolve();
  set({ ...state, status: 'loading', error: null });
  inflight = (async () => {
    try {
      const { data, error } = await (await client()).from('complaints').select(COLS).order('created_at', { ascending: false }).limit(1000);
      if (error) {
        if (isMissing(error)) set({ ...IDLE, status: 'missing' });
        else set({ ...IDLE, status: 'error', error: complaintError(error, 'No se pudieron cargar las hojas de reclamación.') });
        return;
      }
      set({ status: 'ready', items: (data || []).map(toComplaint), error: null });
    } catch {
      set({ ...IDLE, status: 'error', error: complaintError({ message: 'Failed to fetch' }) });
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Al cerrar sesión se olvidan las hojas: la siguiente persona no debe verlas. */
export function resetComplaints() {
  inflight = null;
  set(IDLE);
}

async function patch(id: string, values: Record<string, unknown>): Promise<ComplaintResult> {
  try {
    const { data, error } = await (await client()).from('complaints').update(values).eq('id', id).select(COLS);
    if (error) return { ok: false, error: complaintError(error) };
    if (!data || data.length === 0) return { ok: false, error: 'No se pudo guardar: la hoja ya no existe o no tienes permiso para cambiarla.' };
    const c = toComplaint(data[0]);
    set({ ...state, status: 'ready', items: state.items.map((x) => (x.id === c.id ? c : x)) });
    return { ok: true };
  } catch {
    return { ok: false, error: complaintError({ message: 'Failed to fetch' }) };
  }
}

/** Guarda la respuesta y marca la hoja como respondida (la fecha la pone la base). */
export const answerComplaint = (id: string, response: string) => patch(id, { status: 'answered', response: response.trim() });
/** Vuelve a dejar la hoja como «sin responder» (conserva el texto de la respuesta anterior). */
export const reopenComplaint = (id: string) => patch(id, { status: 'pending' });
