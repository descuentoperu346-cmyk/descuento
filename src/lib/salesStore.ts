// Almacén compartido de ventas y clientes: todas las pantallas del panel leen del mismo lugar,
// así las cifras del Resumen, de Ventas, de Clientes y de Reportes siempre coinciden.
import { useSyncExternalStore } from 'react';
import type { Customer, Sale } from './salesMath';
import {
  insertCustomer,
  insertSale,
  loadSalesData,
  patchCustomer,
  patchSale,
  removeCustomerRow,
  removeSaleRow,
  type CustomerInput,
  type SaleInput,
  type SaveResult
} from './salesApi';

export interface SalesState {
  status: 'idle' | 'loading' | 'ready' | 'missing' | 'error';
  sales: Sale[];
  customers: Customer[];
  error: string | null;
  /** Hay más ventas en la base que las que se descargaron (tope de 5,000) */
  truncated: boolean;
}

const IDLE: SalesState = { status: 'idle', sales: [], customers: [], error: null, truncated: false };
let state: SalesState = IDLE;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const set = (next: SalesState) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const bySoldDesc = (a: Sale, b: Sale) => (a.soldAt < b.soldAt ? 1 : a.soldAt > b.soldAt ? -1 : b.number - a.number);
const byName = (a: Customer, b: Customer) => a.name.localeCompare(b.name, 'es');

export const useSales = (): SalesState => useSyncExternalStore(subscribe, () => state, () => state);
export const getSalesState = () => state;

/** Carga los datos una vez (o de nuevo si se pide). Es seguro llamarla desde varias pantallas a la vez. */
export function ensureSalesLoaded(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && (state.status === 'ready' || state.status === 'missing')) return Promise.resolve();
  set({ ...state, status: 'loading', error: null });
  inflight = loadSalesData()
    .then((r) => {
      if (r.status === 'ready') set({ status: 'ready', sales: [...r.sales].sort(bySoldDesc), customers: [...r.customers].sort(byName), error: null, truncated: r.truncated });
      else if (r.status === 'missing') set({ ...IDLE, status: 'missing' });
      else set({ ...IDLE, status: 'error', error: r.message });
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Al cerrar sesión se olvidan los datos: la siguiente persona no debe ver lo de la anterior. */
export function resetSales() {
  inflight = null;
  set(IDLE);
}

export async function saveSale(input: SaleInput, id?: string): Promise<SaveResult<Sale>> {
  const res = id ? await patchSale(id, input) : await insertSale(input);
  if (res.ok) {
    const rest = state.sales.filter((s) => s.id !== res.data.id);
    set({ ...state, sales: [res.data, ...rest].sort(bySoldDesc) });
  }
  return res;
}

export async function deleteSale(id: string): Promise<SaveResult<null>> {
  const res = await removeSaleRow(id);
  if (res.ok) set({ ...state, sales: state.sales.filter((s) => s.id !== id) });
  return res;
}

export async function saveCustomer(input: CustomerInput, id?: string): Promise<SaveResult<Customer>> {
  const res = id ? await patchCustomer(id, input) : await insertCustomer(input);
  if (res.ok) {
    const rest = state.customers.filter((c) => c.id !== res.data.id);
    // Si se cambió el nombre, las ventas guardan su propia copia: no se tocan (son el historial de lo que se vendió)
    set({ ...state, customers: [...rest, res.data].sort(byName) });
  }
  return res;
}

export async function deleteCustomer(id: string): Promise<SaveResult<null>> {
  const res = await removeCustomerRow(id);
  if (res.ok) {
    set({
      ...state,
      customers: state.customers.filter((c) => c.id !== id),
      // La base conserva las ventas y les quita el vínculo (customer_id = null): se refleja igual aquí
      sales: state.sales.map((s) => (s.customerId === id ? { ...s, customerId: null } : s))
    });
  }
  return res;
}
