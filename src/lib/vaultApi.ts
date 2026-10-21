import { useSyncExternalStore } from 'react';

// Papelera (SQL 08), historial de cambios (SQL 09) y copia de seguridad (SQL 10).
// Quién puede qué lo decide la base de datos; aquí solo se pide y se traducen los errores.

type Db = { message?: string; code?: string } | null;
export type Loaded<T> = { status: 'ready'; data: T } | { status: 'missing' } | { status: 'error'; message: string };

const sbClient = async () => (await import('./supabaseBrowser')).sb();

/** Nombre en español de cada tabla de la base. */
export const TABLE_LABELS: Record<string, string> = {
  products: 'Producto',
  vendors: 'Tienda',
  payment_methods: 'Método de pago',
  leaks: 'Artículo',
  customers: 'Cliente',
  sales: 'Venta',
  staff: 'Equipo'
};
export const tableLabel = (t: string) => TABLE_LABELS[t] || t;

const isMissing = (e: Db) => ['PGRST202', 'PGRST205', '42P01', '42883'].includes(e?.code || '') || /could not find the (table|function)|does not exist|schema cache/i.test(e?.message || '');
/** Los mensajes de nuestras funciones SQL ya vienen en español: se muestran tal cual. */
const OWN_CODES = ['P0002', '23505', '42501', '22023'];

export function vaultError(e: Db, fallback = 'No se pudo completar. Inténtalo de nuevo.'): { status: 'missing' } | { status: 'error'; message: string } {
  if (isMissing(e)) return { status: 'missing' };
  const msg = e?.message || '';
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return { status: 'error', message: 'No hay conexión con el servidor. Revisa tu internet.' };
  if (/JWT/i.test(msg)) return { status: 'error', message: 'Tu sesión venció. Vuelve a iniciar sesión.' };
  if (/permission denied/i.test(msg)) return { status: 'error', message: 'Tu cuenta no tiene permiso para ver esto.' };
  if (e?.code && OWN_CODES.includes(e.code) && msg) return { status: 'error', message: msg };
  return { status: 'error', message: fallback };
}
const errText = (e: Db, fallback: string) => {
  const r = vaultError(e, fallback);
  return r.status === 'missing' ? 'Esta función todavía no está activada en la base de datos.' : r.message;
};

// ================================================================ papelera
export const TRASH_DAYS = 30;

export interface TrashItem {
  id: number;
  table: string;
  rowId: string;
  vendorId: string | null;
  label: string;
  deletedAt: string;
  deletedBy: string | null;
}

/** Días que le quedan en la papelera (nunca negativo). */
export const daysLeft = (deletedAt: string, now = Date.now()) =>
  Math.max(0, Math.ceil((new Date(deletedAt).getTime() + TRASH_DAYS * 86400000 - now) / 86400000));

// Si la papelera está instalada o no (para que los avisos de "borrar" digan la verdad)
type Ready = 'unknown' | 'ready' | 'missing';
let trashState: Ready = 'unknown';
const subs = new Set<() => void>();
const setTrashState = (s: Ready) => {
  if (s === trashState) return;
  trashState = s;
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => subs.delete(f);
};
/** true cuando la papelera ya está instalada en la base de datos. */
export const useTrashReady = () => useSyncExternalStore(subscribe, () => trashState === 'ready', () => false);
/** Frase que se agrega a los avisos de "¿Eliminar?": promete la papelera solo si existe. */
export const deleteNote = (trashReady: boolean) => (trashReady ? `Se guarda en la Papelera ${TRASH_DAYS} días y puedes recuperarlo.` : 'Esta acción no se puede deshacer.');

export async function probeTrash(): Promise<void> {
  try {
    const { error } = await (await sbClient()).from('trash').select('id').limit(1);
    setTrashState(error ? (isMissing(error) ? 'missing' : 'unknown') : 'ready');
  } catch {
    // sin conexión: se queda como estaba
  }
}

export async function loadTrash(): Promise<Loaded<TrashItem[]>> {
  try {
    const { data, error } = await (await sbClient())
      .from('trash')
      .select('id, source_table, row_id, vendor_id, label, deleted_at, deleted_by_name')
      .order('deleted_at', { ascending: false })
      .limit(300);
    if (error) {
      const r = vaultError(error, 'No se pudo cargar la papelera. Inténtalo de nuevo.');
      if (r.status === 'missing') setTrashState('missing');
      return r;
    }
    setTrashState('ready');
    const items = (data || []).map((r: any) => ({
      id: Number(r.id),
      table: String(r.source_table),
      rowId: String(r.row_id),
      vendorId: r.vendor_id ? String(r.vendor_id) : null,
      label: String(r.label || '(sin nombre)'),
      deletedAt: String(r.deleted_at),
      deletedBy: r.deleted_by_name ? String(r.deleted_by_name) : null
    }));
    return { status: 'ready', data: items };
  } catch (e) {
    return vaultError(e as Db, 'No se pudo cargar la papelera. Inténtalo de nuevo.');
  }
}

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

export async function restoreFromTrash(id: number): Promise<ActionResult<{ table: string; label: string }>> {
  try {
    const { data, error } = await (await sbClient()).rpc('restore_from_trash', { p_id: id });
    if (error) return { ok: false, error: errText(error, 'No se pudo restaurar. Inténtalo de nuevo.') };
    return { ok: true, data: { table: String(data?.table || ''), label: String(data?.label || '') } };
  } catch (e) {
    return { ok: false, error: errText(e as Db, 'No se pudo restaurar. Inténtalo de nuevo.') };
  }
}

export async function deleteForever(id: number): Promise<ActionResult> {
  try {
    const { error } = await (await sbClient()).rpc('trash_delete_forever', { p_id: id });
    if (error) return { ok: false, error: errText(error, 'No se pudo borrar. Inténtalo de nuevo.') };
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: errText(e as Db, 'No se pudo borrar. Inténtalo de nuevo.') };
  }
}

// ================================================================ historial
export interface AuditChange {
  antes: unknown;
  despues: unknown;
}
export interface AuditEntry {
  id: number;
  changedAt: string;
  actor: string;
  action: 'insert' | 'update' | 'delete';
  table: string;
  rowId: string | null;
  label: string;
  vendorId: string | null;
  changes: Record<string, AuditChange> | null;
}
export interface AuditFilter {
  table: string;
  action: 'all' | 'insert' | 'update' | 'delete';
  search: string;
}
export const AUDIT_PAGE = 50;

export const ACTION_LABEL: Record<AuditEntry['action'], string> = { insert: 'Creó', update: 'Cambió', delete: 'Borró' };

const FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  priceFrom: 'Precio desde',
  description: 'Descripción corta',
  active: 'Visible',
  stockStatus: 'Disponibilidad',
  customImageUrl: 'Foto',
  badge: 'Insignia',
  categoryLabel: 'Etiqueta',
  category: 'Categoría',
  subItemLabel: 'Línea al pie',
  buttonLabel: 'Texto del botón',
  popular: 'Destacado',
  'details.plans': 'Planes',
  'details.overview': 'Descripción completa',
  'details.features': 'Características',
  'details.deliveryTime': 'Tiempo de entrega',
  'details.supportNote': 'Garantía o soporte',
  name: 'Nombre',
  amount: 'Monto',
  status: 'Estado',
  customer_name: 'Cliente',
  product_title: 'Producto',
  payment_method: 'Medio de pago',
  sold_at: 'Fecha de venta',
  expires_at: 'Vence',
  duration_days: 'Duración (días)',
  notes: 'Notas',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  email: 'Correo',
  role: 'Rol',
  vendor_id: 'Tienda',
  display_name: 'Nombre',
  username: 'Usuario',
  sort_order: 'Orden',
  featured: 'Destacado',
  publish_at: 'Publicación',
  slug: 'Enlace'
};
/** "data.priceFrom" → "Precio desde". Lo que no se conoce se muestra con su nombre técnico. */
export const fieldLabel = (path: string) => {
  const p = path.replace(/^data\./, '');
  return FIELD_LABELS[p] || p;
};

/** Valor legible: sí/no, listas de planes en una línea, vacío como "(vacío)". */
export function valueText(v: unknown): string {
  if (v === null || v === undefined) return '(vacío)';
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (typeof v === 'string') return v === '' ? '(vacío)' : v;
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return '(vacío)';
    if (v.every((x) => x && typeof x === 'object' && 'price' in (x as object))) return v.map((x: any) => `${x.name || 'Plan'} ${x.price}`).join(' · ');
    if (v.every((x) => typeof x === 'string')) return (v as string[]).join(', ');
  }
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export async function loadAudit(filter: AuditFilter, beforeId?: number): Promise<Loaded<{ entries: AuditEntry[]; more: boolean }>> {
  try {
    let q = (await sbClient())
      .from('audit_log')
      .select('id, changed_at, actor_name, action, table_name, row_id, label, vendor_id, changes')
      .order('id', { ascending: false })
      .limit(AUDIT_PAGE + 1);
    if (filter.table !== 'all') q = q.eq('table_name', filter.table);
    if (filter.action !== 'all') q = q.eq('action', filter.action);
    if (beforeId) q = q.lt('id', beforeId);
    // Las comas y paréntesis rompen el filtro de la API: se quitan del texto buscado
    const term = filter.search.replace(/[,()*%\\]/g, ' ').trim();
    if (term) q = q.or(`label.ilike.%${term}%,actor_name.ilike.%${term}%`);
    const { data, error } = await q;
    if (error) return vaultError(error, 'No se pudo cargar el historial. Inténtalo de nuevo.');
    const rows = data || [];
    const entries: AuditEntry[] = rows.slice(0, AUDIT_PAGE).map((r: any) => ({
      id: Number(r.id),
      changedAt: String(r.changed_at),
      actor: String(r.actor_name || 'Desconocido'),
      action: r.action,
      table: String(r.table_name),
      rowId: r.row_id ? String(r.row_id) : null,
      label: String(r.label || ''),
      vendorId: r.vendor_id ? String(r.vendor_id) : null,
      changes: r.changes && typeof r.changes === 'object' ? r.changes : null
    }));
    return { status: 'ready', data: { entries, more: rows.length > AUDIT_PAGE } };
  } catch (e) {
    return vaultError(e as Db, 'No se pudo cargar el historial. Inténtalo de nuevo.');
  }
}

// ================================================================ copia de seguridad
export const BACKUP_TABLES: { key: string; label: string }[] = [
  { key: 'products', label: 'Productos' },
  { key: 'vendors', label: 'Tiendas' },
  { key: 'payment_methods', label: 'Métodos de pago' },
  { key: 'leaks', label: 'Artículos' },
  { key: 'customers', label: 'Clientes' },
  { key: 'sales', label: 'Ventas' }
];

export interface BackupSummary {
  counts: Record<string, number>;
  total: number;
  createdAt: string | null;
}

/** Revisa que el archivo sea una copia de esta web y cuenta lo que trae. */
export function summarizeBackup(raw: unknown): { ok: true; summary: BackupSummary } | { ok: false; error: string } {
  const b = raw as any;
  if (!b || typeof b !== 'object' || b.format !== 'descuentos-peru-db' || !b.tables || typeof b.tables !== 'object') {
    return { ok: false, error: 'Ese archivo no es una copia de Descuentos Perú.' };
  }
  const counts: Record<string, number> = {};
  let total = 0;
  for (const t of BACKUP_TABLES) {
    const n = Array.isArray(b.tables[t.key]) ? b.tables[t.key].length : 0;
    counts[t.key] = n;
    total += n;
  }
  return { ok: true, summary: { counts, total, createdAt: typeof b.created_at === 'string' ? b.created_at : null } };
}

export const backupFileName = (d = new Date()) => `descuentos-peru-copia-${d.toISOString().slice(0, 10)}.json`;

const LAST_BACKUP_KEY = 'dp_last_backup';
export const getLastBackup = (): string | null => {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
};
const setLastBackup = (iso: string) => {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, iso);
  } catch {
    // no pasa nada: es solo un recordatorio de este navegador
  }
};

export async function exportBackup(): Promise<Loaded<{ backup: unknown; summary: BackupSummary }>> {
  try {
    const { data, error } = await (await sbClient()).rpc('export_backup');
    if (error) return vaultError(error, 'No se pudo preparar la copia. Inténtalo de nuevo.');
    const s = summarizeBackup(data);
    if (!s.ok) return { status: 'error', message: 'La base devolvió una copia con un formato inesperado.' };
    setLastBackup(new Date().toISOString());
    return { status: 'ready', data: { backup: data, summary: s.summary } };
  } catch (e) {
    return vaultError(e as Db, 'No se pudo preparar la copia. Inténtalo de nuevo.');
  }
}

export async function applyBackup(backup: unknown): Promise<ActionResult<Record<string, number>>> {
  try {
    const { data, error } = await (await sbClient()).rpc('restore_backup', { p_backup: backup });
    if (error) return { ok: false, error: errText(error, 'No se pudo recuperar la copia. Inténtalo de nuevo.') };
    const counts: Record<string, number> = {};
    for (const t of BACKUP_TABLES) if (data && typeof data[t.key] === 'number') counts[t.key] = data[t.key];
    return { ok: true, data: counts };
  } catch (e) {
    return { ok: false, error: errText(e as Db, 'No se pudo recuperar la copia. Inténtalo de nuevo.') };
  }
}
