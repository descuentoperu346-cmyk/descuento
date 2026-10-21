// Conexión con las tablas "sales" y "customers" (SQL 06). Todas las reglas de permiso las exige la base de datos;
// aquí solo se traducen las filas y los errores a algo que el equipo entienda.
import type { Customer, Sale, SaleStatus } from './salesMath';

export type SaleInput = Omit<Sale, 'id' | 'number' | 'createdAt'>;
export type CustomerInput = Omit<Customer, 'id' | 'createdAt'>;

export type LoadResult =
  | { status: 'ready'; sales: Sale[]; customers: Customer[]; truncated: boolean }
  | { status: 'missing' }
  | { status: 'error'; message: string };
/** Resultado de guardar: si ok es true viene "data"; si no, viene "error" con un mensaje para la persona. */
export interface SaveResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const SALE_COLS = 'id, number, vendor_id, customer_id, customer_name, product_id, product_title, plan, amount, payment_method, status, sold_at, duration_days, expires_at, notes, created_at';
const CUSTOMER_COLS = 'id, vendor_id, name, telegram, whatsapp, email, notes, created_at';
const PAGE = 1000;
const MAX_PAGES = 5;

type Row = Record<string, any>;
const toSale = (r: Row): Sale => ({
  id: r.id,
  number: Number(r.number),
  vendorId: r.vendor_id,
  customerId: r.customer_id ?? null,
  customerName: r.customer_name,
  productId: r.product_id ?? null,
  productTitle: r.product_title,
  plan: r.plan ?? null,
  amount: Number(r.amount),
  paymentMethod: r.payment_method ?? null,
  status: r.status as SaleStatus,
  soldAt: r.sold_at,
  durationDays: r.duration_days ?? null,
  expiresAt: r.expires_at ?? null,
  notes: r.notes ?? null,
  createdAt: r.created_at
});
const toCustomer = (r: Row): Customer => ({
  id: r.id,
  vendorId: r.vendor_id,
  name: r.name,
  telegram: r.telegram ?? null,
  whatsapp: r.whatsapp ?? null,
  email: r.email ?? null,
  notes: r.notes ?? null,
  createdAt: r.created_at
});
const saleRow = (s: SaleInput) => ({
  vendor_id: s.vendorId,
  customer_id: s.customerId,
  customer_name: s.customerName.trim(),
  product_id: s.productId,
  product_title: s.productTitle.trim(),
  plan: s.plan?.trim() || null,
  amount: s.amount,
  payment_method: s.paymentMethod?.trim() || null,
  status: s.status,
  sold_at: s.soldAt,
  duration_days: s.durationDays,
  expires_at: s.expiresAt,
  notes: s.notes?.trim() || null
});
const customerRow = (c: CustomerInput) => ({
  vendor_id: c.vendorId,
  name: c.name.trim(),
  telegram: c.telegram?.trim() || null,
  whatsapp: c.whatsapp?.trim() || null,
  email: c.email?.trim() || null,
  notes: c.notes?.trim() || null
});

type DbError = { message?: string; code?: string; status?: number } | null;
const isMissingTable = (e: DbError) => !!e && (e.code === 'PGRST205' || e.code === '42P01' || /could not find the table|does not exist/i.test(e.message || ''));

/** Mensaje en español para un error de la base. */
export function friendlyError(e: DbError, fallback = 'No se pudo guardar. Inténtalo de nuevo.'): string {
  if (!e) return fallback;
  const code = e.code || '';
  const msg = e.message || '';
  if (isMissingTable(e)) return 'Falta activar el módulo de ventas en la base de datos (ejecutar el SQL 06).';
  if (code === '42501' || /row-level security|permission denied/i.test(msg)) return 'Tu cuenta no tiene permiso para hacer esto.';
  if (code === '23514') {
    if (/amount/i.test(msg)) return 'El monto no es válido (debe estar entre 0 y 100,000).';
    if (/duration/i.test(msg)) return 'La duración debe ser de 1 a 3650 días.';
    return 'Alguno de los datos no es válido. Revisa el formulario.';
  }
  if (code === '23502') return 'Falta un dato obligatorio.';
  if (code === '23503') return 'El cliente elegido ya no existe.';
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return 'No hay conexión con el servidor. Revisa tu internet.';
  if (e.status === 401 || /JWT/i.test(msg)) return 'Tu sesión venció. Vuelve a iniciar sesión.';
  return fallback;
}

async function client() {
  const m = await import('./supabaseBrowser');
  return m.sb();
}

async function fetchAll(table: 'sales' | 'customers', cols: string, orderCol: string, ascending: boolean) {
  const c = await client();
  const rows: Row[] = [];
  let truncated = false;
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await c.from(table).select(cols).order(orderCol, { ascending }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) return { error: error as DbError };
    rows.push(...((data as unknown as Row[]) || []));
    if (!data || data.length < PAGE) break;
    if (page === MAX_PAGES - 1) truncated = true;
  }
  return { rows, truncated };
}

export async function loadSalesData(): Promise<LoadResult> {
  try {
    const [s, c] = await Promise.all([fetchAll('sales', SALE_COLS, 'sold_at', false), fetchAll('customers', CUSTOMER_COLS, 'name', true)]);
    if ('error' in s && s.error) return isMissingTable(s.error) ? { status: 'missing' } : { status: 'error', message: friendlyError(s.error, 'No se pudieron cargar las ventas.') };
    if ('error' in c && c.error) return isMissingTable(c.error) ? { status: 'missing' } : { status: 'error', message: friendlyError(c.error, 'No se pudieron cargar los clientes.') };
    return {
      status: 'ready',
      sales: (s.rows || []).map(toSale),
      customers: (c.rows || []).map(toCustomer),
      truncated: !!s.truncated
    };
  } catch {
    return { status: 'error', message: 'No hay conexión con el servidor. Revisa tu internet.' };
  }
}

export async function insertSale(input: SaleInput): Promise<SaveResult<Sale>> {
  try {
    const { data, error } = await (await client()).from('sales').insert(saleRow(input)).select(SALE_COLS).single();
    if (error || !data) return { ok: false, error: friendlyError(error as DbError) };
    return { ok: true, data: toSale(data as Row) };
  } catch {
    return { ok: false, error: friendlyError({ message: 'Failed to fetch' }) };
  }
}

export async function patchSale(id: string, input: SaleInput): Promise<SaveResult<Sale>> {
  try {
    const { data, error } = await (await client()).from('sales').update(saleRow(input)).eq('id', id).select(SALE_COLS);
    if (error) return { ok: false, error: friendlyError(error as DbError) };
    if (!data || data.length === 0) return { ok: false, error: 'No se pudo guardar: la venta ya no existe o no tienes permiso para editarla.' };
    return { ok: true, data: toSale(data[0] as Row) };
  } catch {
    return { ok: false, error: friendlyError({ message: 'Failed to fetch' }) };
  }
}

export async function removeSaleRow(id: string): Promise<SaveResult<null>> {
  try {
    const { data, error } = await (await client()).from('sales').delete().eq('id', id).select('id');
    if (error) return { ok: false, error: friendlyError(error as DbError, 'No se pudo borrar.') };
    if (!data || data.length === 0) return { ok: false, error: 'No se pudo borrar: solo el administrador puede borrar ventas. Usa "Anular" si fue un error.' };
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: friendlyError({ message: 'Failed to fetch' }) };
  }
}

export async function insertCustomer(input: CustomerInput): Promise<SaveResult<Customer>> {
  try {
    const { data, error } = await (await client()).from('customers').insert(customerRow(input)).select(CUSTOMER_COLS).single();
    if (error || !data) return { ok: false, error: friendlyError(error as DbError) };
    return { ok: true, data: toCustomer(data as Row) };
  } catch {
    return { ok: false, error: friendlyError({ message: 'Failed to fetch' }) };
  }
}

export async function patchCustomer(id: string, input: CustomerInput): Promise<SaveResult<Customer>> {
  try {
    const { data, error } = await (await client()).from('customers').update(customerRow(input)).eq('id', id).select(CUSTOMER_COLS);
    if (error) return { ok: false, error: friendlyError(error as DbError) };
    if (!data || data.length === 0) return { ok: false, error: 'No se pudo guardar: el cliente ya no existe o no tienes permiso.' };
    return { ok: true, data: toCustomer(data[0] as Row) };
  } catch {
    return { ok: false, error: friendlyError({ message: 'Failed to fetch' }) };
  }
}

export async function removeCustomerRow(id: string): Promise<SaveResult<null>> {
  try {
    const { data, error } = await (await client()).from('customers').delete().eq('id', id).select('id');
    if (error) return { ok: false, error: friendlyError(error as DbError, 'No se pudo borrar.') };
    if (!data || data.length === 0) return { ok: false, error: 'No se pudo borrar: solo el administrador puede borrar clientes.' };
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: friendlyError({ message: 'Failed to fetch' }) };
  }
}
