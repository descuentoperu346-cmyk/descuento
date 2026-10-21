import type { ServiceItem } from '../../data/servicesData';
import type { Vendor } from '../../data/vendorsData';
import type { PaymentMethodItem } from '../../data/paymentsData';
import type { PanelNavId } from './panelNav';

export type Severity = 'critical' | 'warning' | 'info';
export type ProductFilter = 'all' | 'published' | 'hidden' | 'noimage' | 'noprice';

export interface AttentionItem {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  actionLabel?: string;
  target?: PanelNavId;
  productFilter?: ProductFilter;
}

/** Número que viene en los datos de ejemplo del proyecto: nunca debería llegar a un cliente real. */
const PLACEHOLDER_DIGITS = '999888777';
const digits = (v?: string) => (v || '').replace(/\D/g, '');

export function productPrice(s: ServiceItem): string | null {
  return s.priceFrom || s.details?.plans?.[0]?.price || null;
}
export const isPublished = (s: ServiceItem) => s.active !== false;
export const hasOwnImage = (s: ServiceItem) => !!s.customImageUrl;

/** Convierte "S/ 12.00" en 12 para poder ordenar. Devuelve null si no hay precio. */
export function priceNumber(s: ServiceItem): number | null {
  const p = productPrice(s);
  if (!p) return null;
  const n = parseFloat(p.replace(/[^\d.,]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function matchesProductFilter(s: ServiceItem, f: ProductFilter): boolean {
  switch (f) {
    case 'published':
      return isPublished(s);
    case 'hidden':
      return !isPublished(s);
    case 'noimage':
      return !hasOwnImage(s);
    case 'noprice':
      return productPrice(s) === null;
    default:
      return true;
  }
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const listNames = (names: string[]) => new Intl.ListFormat('es', { style: 'long', type: 'conjunction' }).format(names);

interface HealthInput {
  services: ServiceItem[];
  vendors: Vendor[];
  paymentMethods: PaymentMethodItem[];
  serverOk: boolean;
  isSuperAdmin: boolean;
}

/** Revisa los datos reales del catálogo y devuelve lo que conviene corregir, de lo más grave a lo menos grave. */
export function computeAttention({ services, vendors, paymentMethods, serverOk, isSuperAdmin }: HealthInput): AttentionItem[] {
  const out: AttentionItem[] = [];

  if (!serverOk) {
    out.push({
      id: 'sin-conexion',
      severity: 'critical',
      title: 'Sin conexión con la base de datos',
      detail: 'Mientras no haya conexión, los cambios que hagas podrían no guardarse.'
    });
  }

  const samplePayments = paymentMethods.filter((m) => m.active && digits(m.phoneNumber) === PLACEHOLDER_DIGITS);
  if (samplePayments.length) {
    out.push({
      id: 'pago-ejemplo',
      severity: 'critical',
      title: `${plural(samplePayments.length, 'método de pago usa', 'métodos de pago usan')} un número de ejemplo`,
      detail: `${listNames(samplePayments.map((m) => m.name))} ${samplePayments.length === 1 ? 'muestra' : 'muestran'} 999 888 777. Cámbialo por el número real antes de cobrar.`,
      actionLabel: 'Corregir pagos',
      target: 'pagos'
    });
  }

  const sampleVendors = vendors.filter(
    (v) => v.active && (digits(v.paymentConfig?.yapePhone) === PLACEHOLDER_DIGITS || digits(v.paymentConfig?.plinPhone) === PLACEHOLDER_DIGITS)
  );
  if (sampleVendors.length) {
    out.push({
      id: 'vendedor-pago-ejemplo',
      severity: 'critical',
      title: `${plural(sampleVendors.length, 'tienda tiene', 'tiendas tienen')} Yape/Plin de ejemplo`,
      detail: `${listNames(sampleVendors.map((v) => v.name))}: el número 999 888 777 no es real.`,
      actionLabel: isSuperAdmin ? 'Revisar tiendas' : 'Corregir pagos',
      target: isSuperAdmin ? 'gestion-vendedores' : 'pagos'
    });
  }

  const noPay = vendors.filter((v) => v.active && v.paymentMethods.length === 0);
  if (noPay.length) {
    out.push({
      id: 'sin-metodos-pago',
      severity: 'warning',
      title: `${plural(noPay.length, 'tienda', 'tiendas')} sin métodos de pago`,
      detail: `${listNames(noPay.map((v) => v.name))}: los clientes no sabrían cómo pagar.`,
      actionLabel: isSuperAdmin ? 'Revisar tiendas' : 'Revisar mi perfil',
      target: isSuperAdmin ? 'gestion-vendedores' : 'perfil'
    });
  }

  const noTelegram = vendors.filter((v) => v.active && !v.telegramUrl?.trim());
  if (noTelegram.length) {
    out.push({
      id: 'sin-telegram',
      severity: 'warning',
      title: `${plural(noTelegram.length, 'tienda', 'tiendas')} sin enlace de Telegram`,
      detail: `${listNames(noTelegram.map((v) => v.name))}: el botón de comprar no tendría a dónde llevar.`,
      actionLabel: isSuperAdmin ? 'Revisar tiendas' : 'Revisar mi perfil',
      target: isSuperAdmin ? 'gestion-vendedores' : 'perfil'
    });
  }

  const noPrice = services.filter((s) => productPrice(s) === null);
  if (noPrice.length) {
    out.push({
      id: 'sin-precio',
      severity: 'warning',
      title: `${plural(noPrice.length, 'producto', 'productos')} sin precio`,
      detail: 'Un producto sin precio genera dudas al cliente. Agrega al menos un plan con precio.',
      actionLabel: 'Ver productos',
      target: 'productos',
      productFilter: 'noprice'
    });
  }

  const noImage = services.filter((s) => !hasOwnImage(s));
  if (noImage.length) {
    out.push({
      id: 'sin-imagen',
      severity: 'warning',
      title: `${plural(noImage.length, 'producto', 'productos')} sin imagen propia`,
      detail: 'Se muestra una imagen genérica. Una foto propia vende más.',
      actionLabel: 'Ver productos',
      target: 'productos',
      productFilter: 'noimage'
    });
  }

  const hidden = services.filter((s) => !isPublished(s));
  if (hidden.length) {
    out.push({
      id: 'ocultos',
      severity: 'info',
      title: `${plural(hidden.length, 'producto está oculto', 'productos están ocultos')}`,
      detail: 'No aparecen en la tienda pública hasta que los publiques.',
      actionLabel: 'Ver ocultos',
      target: 'productos',
      productFilter: 'hidden'
    });
  }

  const few = services.filter((s) => isPublished(s) && s.stockStatus === 'few_left');
  if (few.length) {
    out.push({
      id: 'pocas-unidades',
      severity: 'info',
      title: `${plural(few.length, 'producto marcado', 'productos marcados')} con pocas unidades`,
      detail: `${few
        .slice(0, 3)
        .map((s) => s.title)
        .join(', ')}${few.length > 3 ? '…' : ''}. Revisa si hay que reponer.`,
      actionLabel: 'Ver productos',
      target: 'productos'
    });
  }

  const rank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
