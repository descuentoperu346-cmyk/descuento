import type { LeakArticle } from '../data/leaksData';
import type { ServiceItem } from '../data/servicesData';
import type { Vendor } from '../data/vendorsData';
import type { PaymentMethodItem } from '../data/paymentsData';
import { CONTENT_DB_ENABLED, CONTENT_URL, publicHeaders } from './contentEnv';

/**
 * Lectura del contenido (leaks, catálogo, vendedores, métodos de pago) desde Supabase.
 * Aquí se lee con la clave PÚBLICA: lo que se ve lo decide la seguridad de la base (RLS).
 * Si algo falla devuelve null y la web usa la copia incluida en el código.
 */
export interface Row<T> {
  id: string;
  active?: boolean;
  data: T;
}

// ---- Conversión de filas de la base a los objetos que usa la web (compartido con el panel)
const looksLikeArticle = (a: unknown): a is LeakArticle => {
  const x = a as LeakArticle;
  return !!x && typeof x.title === 'string' && typeof x.slug === 'string' && Array.isArray(x.content);
};

export const mapLeaks = (rows: Row<LeakArticle>[] | null): LeakArticle[] | null => {
  const list = (rows || []).filter((r) => looksLikeArticle(r?.data)).map((r) => ({ ...r.data, id: r.id }));
  return list.length > 0 ? list : null;
};

export const mapProducts = (rows: Row<ServiceItem>[] | null): ServiceItem[] | null => {
  const list = (rows || [])
    .filter((r) => r?.data && typeof r.data.title === 'string')
    .map((r) => ({ ...r.data, id: r.id, active: r.active !== false }));
  return list.length > 0 ? list : null;
};

export const mapVendors = (rows: Row<Vendor>[] | null): Vendor[] | null => {
  const list = (rows || [])
    .filter((r) => r?.data && typeof r.data.name === 'string')
    .map((r) => ({ ...r.data, id: r.id, active: r.active !== false, pin: '' }));
  return list.length > 0 ? list : null;
};

export const mapPaymentMethods = (rows: Row<PaymentMethodItem>[] | null): PaymentMethodItem[] | null => {
  const list = (rows || [])
    .filter((r) => r?.data && typeof r.data.name === 'string')
    .map((r) => ({ ...r.data, id: r.id, active: r.active !== false }));
  return list.length > 0 ? list : null;
};

// ---- Lectura pública
async function readRows<T>(table: string, select = 'id,active,data'): Promise<Row<T>[] | null> {
  if (!CONTENT_DB_ENABLED) return null;
  try {
    const qs = new URLSearchParams({ select, order: 'sort_order.asc' });
    const res = await fetch(`${CONTENT_URL}/rest/v1/${table}?${qs.toString()}`, { headers: publicHeaders() });
    if (!res.ok) return null;
    const rows = (await res.json()) as Row<T>[];
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

const once = <T>(fn: () => Promise<T | null>) => {
  let p: Promise<T | null> | null = null;
  return () => {
    if (!p) {
      p = fn();
      p.then((r) => {
        if (r === null) p = null; // si falló, permite reintentar
      });
    }
    return p;
  };
};

export const fetchLeaksFromDb = once<LeakArticle[]>(async () => mapLeaks(await readRows<LeakArticle>('leaks', 'id,data')));
export const fetchProductsFromDb = once<ServiceItem[]>(async () => mapProducts(await readRows<ServiceItem>('products')));
export const fetchVendorsFromDb = once<Vendor[]>(async () => mapVendors(await readRows<Vendor>('vendors')));
export const fetchPaymentMethodsFromDb = once<PaymentMethodItem[]>(async () =>
  mapPaymentMethods(await readRows<PaymentMethodItem>('payment_methods'))
);
