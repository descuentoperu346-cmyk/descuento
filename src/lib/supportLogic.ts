// Garantías y soporte: reglas de los casos de clientes. Funciones puras (sin red ni pantalla).
import { daysBetween, limaDay, todayLima, type Sale } from './salesMath';

export type CaseStatus = 'open' | 'in_progress' | 'resolved';
export type CaseKind = 'problem' | 'replacement' | 'refund' | 'question';

export interface SupportCase {
  id: string;
  number: number;
  vendorId: string;
  saleId: string | null;
  customerId: string | null;
  customerName: string;
  productTitle: string | null;
  kind: CaseKind;
  status: CaseStatus;
  description: string;
  resolution: string | null;
  warrantyUntil: string | null;
  dueAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const KIND_LABEL: Record<CaseKind, string> = {
  problem: 'Problema con el producto',
  replacement: 'Pedido de reposición',
  refund: 'Pedido de reembolso',
  question: 'Consulta'
};
export const STATUS_LABEL: Record<CaseStatus, string> = { open: 'Abierto', in_progress: 'En proceso', resolved: 'Resuelto' };
export const DESCRIPTION_MAX = 2000;
export const RESOLUTION_MAX = 2000;
export const NAME_MAX = 120;

export interface CaseDraft {
  vendorId: string;
  saleId: string | null;
  customerId: string | null;
  customerName: string;
  productTitle: string;
  kind: CaseKind;
  description: string;
  warrantyUntil: string | null;
  /** Día límite "AAAA-MM-DD" (hora de Lima); vacío si no hay */
  dueDay: string;
}

export const emptyCaseDraft = (vendorId: string): CaseDraft => ({
  vendorId,
  saleId: null,
  customerId: null,
  customerName: '',
  productTitle: '',
  kind: 'problem',
  description: '',
  warrantyUntil: null,
  dueDay: ''
});

/** Datos del caso que se pueden sacar de una venta: cliente, producto y hasta cuándo dura la garantía. */
export function applySale(d: CaseDraft, s: Sale): CaseDraft {
  return {
    ...d,
    vendorId: s.vendorId,
    saleId: s.id,
    customerId: s.customerId,
    customerName: s.customerName,
    productTitle: `${s.productTitle}${s.plan ? ` (${s.plan})` : ''}`,
    warrantyUntil: s.expiresAt
  };
}

export const draftFromCase = (c: SupportCase): CaseDraft => ({
  vendorId: c.vendorId,
  saleId: c.saleId,
  customerId: c.customerId,
  customerName: c.customerName,
  productTitle: c.productTitle || '',
  kind: c.kind,
  description: c.description,
  warrantyUntil: c.warrantyUntil,
  dueDay: c.dueAt ? limaDay(c.dueAt) : ''
});

/** El día límite termina a las 23:59 de Lima de ese día. */
export function dueIso(dueDay: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDay)) return null;
  const d = new Date(`${dueDay}T23:59:59-05:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export interface CaseErrors {
  customerName?: string;
  description?: string;
  dueDay?: string;
}
export function validateCase(d: CaseDraft, now: number = Date.now()): CaseErrors {
  const e: CaseErrors = {};
  if (!d.customerName.trim()) e.customerName = 'Escribe el nombre del cliente.';
  else if (d.customerName.trim().length > NAME_MAX) e.customerName = `Máximo ${NAME_MAX} letras.`;
  if (!d.description.trim()) e.description = 'Cuenta qué pasó con el producto.';
  else if (d.description.trim().length > DESCRIPTION_MAX) e.description = `Máximo ${DESCRIPTION_MAX} letras.`;
  if (d.dueDay && !dueIso(d.dueDay)) e.dueDay = 'La fecha no es válida.';
  else if (d.dueDay && d.dueDay < todayLima(now)) e.dueDay = 'La fecha límite no puede ser anterior a hoy.';
  return e;
}
export const hasCaseErrors = (e: CaseErrors) => !!(e.customerName || e.description || e.dueDay);

export type WarrantyInfo = { state: 'none' } | { state: 'active' | 'expired'; days: number };
/** Garantía de la venta: vigente (días que faltan) o vencida (días desde que venció). */
export function warrantyInfo(c: Pick<SupportCase, 'warrantyUntil'>, now: number = Date.now()): WarrantyInfo {
  if (!c.warrantyUntil) return { state: 'none' };
  const days = daysBetween(todayLima(now), limaDay(c.warrantyUntil));
  return days >= 0 ? { state: 'active', days } : { state: 'expired', days: -days };
}

export const isPending = (c: Pick<SupportCase, 'status'>) => c.status !== 'resolved';
export const isOverdue = (c: Pick<SupportCase, 'status' | 'dueAt'>, now: number = Date.now()) => isPending(c) && !!c.dueAt && new Date(c.dueAt).getTime() < now;

/** Primero lo pendiente (lo atrasado arriba, luego lo que lleva más tiempo esperando); al final lo resuelto, lo más reciente primero. */
export function sortCases(list: SupportCase[], now: number = Date.now()): SupportCase[] {
  return [...list].sort((a, b) => {
    const pa = isPending(a) ? 0 : 1;
    const pb = isPending(b) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    if (pa === 0) {
      const oa = isOverdue(a, now) ? 0 : 1;
      const ob = isOverdue(b, now) ? 0 : 1;
      if (oa !== ob) return oa - ob;
      return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.number - b.number;
    }
    const ra = a.resolvedAt || a.updatedAt;
    const rb = b.resolvedAt || b.updatedAt;
    return ra < rb ? 1 : ra > rb ? -1 : b.number - a.number;
  });
}

export interface CaseCounts {
  open: number;
  inProgress: number;
  pending: number;
  overdue: number;
  resolvedRecent: number;
}
export function caseCounts(list: SupportCase[], now: number = Date.now()): CaseCounts {
  const since = now - 30 * 86400000;
  return {
    open: list.filter((c) => c.status === 'open').length,
    inProgress: list.filter((c) => c.status === 'in_progress').length,
    pending: list.filter(isPending).length,
    overdue: list.filter((c) => isOverdue(c, now)).length,
    resolvedRecent: list.filter((c) => c.status === 'resolved' && new Date(c.resolvedAt || c.updatedAt).getTime() >= since).length
  };
}
