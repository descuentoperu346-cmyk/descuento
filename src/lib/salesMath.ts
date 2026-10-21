// Lógica de negocio de ventas, clientes y vencimientos. Funciones puras (sin red ni pantalla) para poder probarlas.
// Todas las fechas se interpretan con la hora de Lima (UTC-5, sin horario de verano).

export type SaleStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Sale {
  id: string;
  number: number;
  vendorId: string;
  customerId: string | null;
  customerName: string;
  productId: string | null;
  productTitle: string;
  plan: string | null;
  amount: number;
  paymentMethod: string | null;
  status: SaleStatus;
  soldAt: string; // ISO
  durationDays: number | null;
  expiresAt: string | null; // ISO
  notes: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  vendorId: string;
  name: string;
  telegram: string | null;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
}

export const STATUS_LABEL: Record<SaleStatus, string> = {
  pending: 'Pendiente de pago',
  paid: 'Pagada',
  cancelled: 'Anulada',
  refunded: 'Reembolsada'
};

const DAY_MS = 24 * 3600 * 1000;
const LIMA_OFFSET_MS = 5 * 3600 * 1000;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// ---------------------------------------------------------------- fechas (Lima)
/** "2026-10-20" para cualquier instante, según el día en Lima. */
export function limaDay(d: Date | string | number): string {
  return new Date(new Date(d).getTime() - LIMA_OFFSET_MS).toISOString().slice(0, 10);
}
export const todayLima = (now: number = Date.now()) => limaDay(now);

/** Instante en que empieza ese día en Lima (00:00 hora de Lima). */
export function startOfLimaDay(day: string): Date {
  return new Date(`${day}T00:00:00-05:00`);
}
/** Mediodía de Lima: la hora que se guarda al elegir solo la fecha, para que nunca cambie de día por la zona horaria. */
export function noonOfLimaDay(day: string): Date {
  return new Date(`${day}T12:00:00-05:00`);
}
export function addDaysToDay(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function daysBetween(fromDay: string, toDay: string): number {
  const f = startOfLimaDay(fromDay).getTime();
  const t = startOfLimaDay(toDay).getTime();
  return Math.round((t - f) / DAY_MS);
}
export const isValidDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(startOfLimaDay(s).getTime());

/** "20 oct 2026" */
export function formatDay(d: string | Date | null | undefined, withYear = true): string {
  if (!d) return '—';
  const day = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : limaDay(d);
  const [y, m, dd] = day.split('-').map(Number);
  return `${dd} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ''}`;
}
export function monthKey(d: string | Date): string {
  return limaDay(d).slice(0, 7);
}
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

// ---------------------------------------------------------------- dinero
const moneyFmt = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money = (n: number) => `S/ ${moneyFmt.format(Number.isFinite(n) ? n : 0)}`;
/** Para ejes: 1.2K, 3.4M */
export function moneyCompact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1000) return `${+(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}
/** Convierte lo que se escribe en el formulario ("12,50", "S/ 12.50") en número, o null si no es válido. */
export function parseAmount(v: string): number | null {
  const cleaned = v.replace(/[^\d.,-]/g, '').replace(',', '.');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

// ---------------------------------------------------------------- ingresos
/** Solo cuentan como ingreso las ventas pagadas. Las pendientes, anuladas y reembolsadas no. */
export const isRevenue = (s: Sale) => s.status === 'paid';

export interface Totals {
  revenue: number;
  count: number;
  average: number;
  pendingAmount: number;
  pendingCount: number;
}
export function totals(sales: Sale[]): Totals {
  let revenue = 0;
  let count = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  for (const s of sales) {
    if (s.status === 'paid') {
      revenue += s.amount;
      count++;
    } else if (s.status === 'pending') {
      pendingAmount += s.amount;
      pendingCount++;
    }
  }
  return { revenue: round2(revenue), count, average: count ? round2(revenue / count) : 0, pendingAmount: round2(pendingAmount), pendingCount };
}
export const round2 = (n: number) => Math.round(n * 100) / 100;

export function inDayRange(s: Sale, fromDay: string, toDay: string): boolean {
  const d = limaDay(s.soldAt);
  return d >= fromDay && d <= toDay;
}

export interface DayPoint {
  day: string;
  revenue: number;
  count: number;
}
/** Un punto por día (incluye los días sin ventas, con 0). */
export function dailySeries(sales: Sale[], fromDay: string, toDay: string): DayPoint[] {
  const map = new Map<string, DayPoint>();
  const n = daysBetween(fromDay, toDay);
  for (let i = 0; i <= n; i++) {
    const day = addDaysToDay(fromDay, i);
    map.set(day, { day, revenue: 0, count: 0 });
  }
  for (const s of sales) {
    if (!isRevenue(s)) continue;
    const p = map.get(limaDay(s.soldAt));
    if (p) {
      p.revenue = round2(p.revenue + s.amount);
      p.count++;
    }
  }
  return [...map.values()];
}

export interface Group {
  key: string;
  revenue: number;
  count: number;
}
/** Suma de ingresos por categoría (producto, método de pago, tienda…), de mayor a menor. */
export function groupRevenue(sales: Sale[], keyOf: (s: Sale) => string | null): Group[] {
  const map = new Map<string, Group>();
  for (const s of sales) {
    if (!isRevenue(s)) continue;
    const key = keyOf(s) || 'Sin indicar';
    const g = map.get(key) || { key, revenue: 0, count: 0 };
    g.revenue = round2(g.revenue + s.amount);
    g.count++;
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue || b.count - a.count);
}

// ---------------------------------------------------------------- períodos de los reportes
export type PeriodId = 'today' | '7d' | '30d' | '90d' | 'month' | 'prev-month' | 'year' | 'all';
export interface Period {
  id: PeriodId;
  label: string;
  fromDay: string;
  toDay: string;
  /** Período anterior de la misma duración, para comparar (null si no tiene sentido) */
  prev: { fromDay: string; toDay: string; label: string } | null;
}
export const PERIOD_OPTIONS: { id: PeriodId; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'month', label: 'Este mes' },
  { id: 'prev-month', label: 'Mes anterior' },
  { id: '90d', label: '90 días' },
  { id: 'year', label: 'Este año' },
  { id: 'all', label: 'Todo' }
];

function firstOfMonth(day: string) {
  return day.slice(0, 8) + '01';
}
function lastOfMonth(day: string) {
  const [y, m] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}
export function prevMonthOf(day: string): { fromDay: string; toDay: string } {
  const first = firstOfMonth(day);
  const toDay = addDaysToDay(first, -1);
  return { fromDay: firstOfMonth(toDay), toDay };
}

export function resolvePeriod(id: PeriodId, now: number = Date.now(), earliestDay?: string): Period {
  const today = todayLima(now);
  const opt = PERIOD_OPTIONS.find((o) => o.id === id)!;
  const rolling = (n: number, label: string): Period => {
    const fromDay = addDaysToDay(today, -(n - 1));
    return { id, label: opt.label, fromDay, toDay: today, prev: { fromDay: addDaysToDay(fromDay, -n), toDay: addDaysToDay(fromDay, -1), label } };
  };
  switch (id) {
    case 'today':
      return { id, label: opt.label, fromDay: today, toDay: today, prev: { fromDay: addDaysToDay(today, -1), toDay: addDaysToDay(today, -1), label: 'ayer' } };
    case '7d':
      return rolling(7, 'los 7 días anteriores');
    case '30d':
      return rolling(30, 'los 30 días anteriores');
    case '90d':
      return rolling(90, 'los 90 días anteriores');
    case 'month': {
      const fromDay = firstOfMonth(today);
      const p = prevMonthOf(today);
      // Se compara con el mismo tramo del mes anterior (hasta el mismo día), para que la comparación sea justa
      const span = daysBetween(fromDay, today);
      const prevTo = addDaysToDay(p.fromDay, Math.min(span, daysBetween(p.fromDay, p.toDay)));
      return { id, label: opt.label, fromDay, toDay: today, prev: { fromDay: p.fromDay, toDay: prevTo, label: 'el mismo tramo del mes anterior' } };
    }
    case 'prev-month': {
      const p = prevMonthOf(today);
      const pp = prevMonthOf(p.fromDay);
      return { id, label: opt.label, fromDay: p.fromDay, toDay: p.toDay, prev: { fromDay: pp.fromDay, toDay: pp.toDay, label: 'el mes previo' } };
    }
    case 'year':
      return { id, label: opt.label, fromDay: `${today.slice(0, 4)}-01-01`, toDay: today, prev: null };
    default:
      return { id: 'all', label: opt.label, fromDay: earliestDay || `${today.slice(0, 4)}-01-01`, toDay: today, prev: null };
  }
}
export { lastOfMonth };

/** Variación porcentual contra el período anterior. null si no hay base para comparar. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ---------------------------------------------------------------- suscripciones (vencimientos)
export type SubState = 'active' | 'expiring' | 'expired';
export interface SubInfo {
  state: SubState;
  /** Días que faltan (negativo si ya venció) */
  daysLeft: number;
}
export const EXPIRING_DAYS = 7;

/** Estado de vencimiento de una venta pagada que tiene fecha de fin. null si no aplica. */
export function subscriptionInfo(s: Sale, now: number = Date.now()): SubInfo | null {
  if (s.status !== 'paid' || !s.expiresAt) return null;
  const daysLeft = daysBetween(todayLima(now), limaDay(s.expiresAt));
  const state: SubState = daysLeft < 0 ? 'expired' : daysLeft <= EXPIRING_DAYS ? 'expiring' : 'active';
  return { state, daysLeft };
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
export const customerKey = (s: Pick<Sale, 'customerId' | 'customerName'>) => s.customerId || `n:${norm(s.customerName)}`;
export const productKey = (s: Pick<Sale, 'productId' | 'productTitle'>) => s.productId || `t:${norm(s.productTitle)}`;

/**
 * Una suscripción por cliente y producto: su última venta pagada con vencimiento.
 * Así, si el cliente ya renovó, la venta anterior deja de aparecer como "vencida".
 */
export function latestSubscriptions(sales: Sale[]): Sale[] {
  const best = new Map<string, Sale>();
  for (const s of sales) {
    if (s.status !== 'paid' || !s.expiresAt) continue;
    const k = `${customerKey(s)}|${productKey(s)}`;
    const cur = best.get(k);
    if (!cur || new Date(s.expiresAt).getTime() > new Date(cur.expiresAt!).getTime()) best.set(k, s);
  }
  return [...best.values()];
}

export function relativeDays(daysLeft: number): string {
  if (daysLeft === 0) return 'hoy';
  if (daysLeft === 1) return 'mañana';
  if (daysLeft === -1) return 'ayer';
  return daysLeft > 0 ? `en ${daysLeft} días` : `hace ${-daysLeft} días`;
}

/** Duración en días según el texto del plan ("mes", "3 meses", "año"…). null si el plan no vence. */
export function durationFromPeriod(period: string | undefined | null): number | null {
  if (!period) return null;
  const p = period.toLowerCase().trim();
  const meses = /^(\d+)\s*mes(es)?$/.exec(p);
  if (meses) return Number(meses[1]) * 30;
  if (p === 'mes' || p === 'mensual') return 30;
  const anios = /^(\d+)\s*a[ñn]os?$/.exec(p);
  if (anios) return Number(anios[1]) * 365;
  if (p === 'año' || p === 'anual') return 365;
  const dias = /^(\d+)\s*d[ií]as?$/.exec(p);
  if (dias) return Number(dias[1]);
  return null;
}

/** Fecha en que vence una venta que empieza `soldDay` y dura `days` días (queda a mediodía de Lima). */
export function expiryFor(soldDay: string, days: number): Date {
  return noonOfLimaDay(addDaysToDay(soldDay, days));
}

// ---------------------------------------------------------------- clientes
export interface CustomerStats {
  purchases: number;
  spent: number;
  lastPurchase: string | null;
  activeSubs: number;
}
export function customerStats(customer: Customer, sales: Sale[], now: number = Date.now()): CustomerStats {
  const mine = sales.filter((s) => (s.customerId ? s.customerId === customer.id : norm(s.customerName) === norm(customer.name)));
  const paid = mine.filter(isRevenue);
  const last = paid.map((s) => s.soldAt).sort().pop() || null;
  const subs = latestSubscriptions(mine).filter((s) => {
    const i = subscriptionInfo(s, now);
    return i && i.state !== 'expired';
  });
  return { purchases: paid.length, spent: round2(paid.reduce((a, s) => a + s.amount, 0)), lastPurchase: last, activeSubs: subs.length };
}

// ---------------------------------------------------------------- contacto (WhatsApp / Telegram)
/** Número de WhatsApp para wa.me: solo dígitos con código de país. Un número peruano de 9 dígitos recibe el 51. */
export function whatsappDigits(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = raw.replace(/\D/g, '');
  if (d.length === 9) return `51${d}`;
  if (d.length >= 10 && d.length <= 15) return d;
  return null;
}
export function whatsappUrl(raw: string | null | undefined, text?: string): string | null {
  const d = whatsappDigits(raw);
  if (!d) return null;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
/** Usuario de Telegram sin @ (acepta "@usuario", "usuario" o "https://t.me/usuario"). null si no parece válido. */
export function telegramHandle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let h = raw.trim().replace(/^https?:\/\/(www\.)?(t\.me|telegram\.me)\//i, '').replace(/^@/, '').split(/[/?#]/)[0];
  h = h.trim();
  return /^[A-Za-z0-9_]{4,32}$/.test(h) ? h : null;
}
export const telegramUrl = (raw: string | null | undefined) => {
  const h = telegramHandle(raw);
  return h ? `https://t.me/${h}` : null;
};

export function reminderText(sale: Sale, storeName: string, now: number = Date.now()): string {
  const info = subscriptionInfo(sale, now);
  const what = `${sale.productTitle}${sale.plan ? ` (${sale.plan})` : ''}`;
  const when = !info || !sale.expiresAt ? '' : info.state === 'expired' ? `venció el ${formatDay(sale.expiresAt)}` : info.daysLeft === 0 ? 'vence hoy' : `vence el ${formatDay(sale.expiresAt)} (${relativeDays(info.daysLeft)})`;
  const first = sale.customerName.trim().split(/\s+/)[0] || 'cliente';
  return `Hola ${first}, te escribimos de ${storeName}. Tu ${what}${when ? ` ${when}` : ''}. ¿Quieres renovarlo${sale.amount ? ` por ${money(sale.amount)}` : ''}? Respóndenos por aquí y lo dejamos listo.`;
}

// ---------------------------------------------------------------- exportar a CSV (compatible con Excel)
/** Evita que una celda que empieza con = + - @ se ejecute como fórmula al abrirla en Excel o Sheets. */
export function safeCell(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = typeof v === 'number' ? String(v) : safeCell(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n');
}
