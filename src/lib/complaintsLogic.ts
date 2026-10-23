// Libro de Reclamaciones: reglas de la hoja. Funciones puras (sin red ni pantalla).
// La hoja de reclamación sigue el formato del Reglamento del Libro de Reclamaciones (D.S. N.º 011-2011-PCM y sus cambios).
import { daysBetween, limaDay, todayLima } from './salesMath';

export type ComplaintKind = 'reclamo' | 'queja';
export type DocType = 'DNI' | 'CE' | 'PASAPORTE' | 'OTRO';
export type GoodType = 'producto' | 'servicio';
export type ReplyVia = 'email' | 'phone';
export type ComplaintStatus = 'pending' | 'answered';

/** Una hoja ya registrada (la ve solo el equipo administrador). */
export interface Complaint {
  id: string;
  number: number;
  createdAt: string;
  kind: ComplaintKind;
  consumerName: string;
  docType: DocType;
  docNumber: string;
  address: string;
  phone: string;
  email: string;
  isMinor: boolean;
  guardianName: string | null;
  guardianDoc: string | null;
  goodType: GoodType;
  goodDescription: string;
  amount: number | null;
  orderRef: string | null;
  detail: string;
  request: string;
  replyVia: ReplyVia;
  dueAt: string;
  status: ComplaintStatus;
  response: string | null;
  respondedAt: string | null;
}

/** Lo que la persona escribe en el formulario (todo como texto, tal cual lo teclea). */
export interface ComplaintDraft {
  kind: ComplaintKind;
  consumerName: string;
  docType: DocType;
  docNumber: string;
  address: string;
  phone: string;
  email: string;
  isMinor: boolean;
  guardianName: string;
  guardianDoc: string;
  goodType: GoodType;
  goodDescription: string;
  amount: string;
  orderRef: string;
  detail: string;
  request: string;
  replyVia: ReplyVia;
  conformity: boolean;
}

export const emptyComplaintDraft = (): ComplaintDraft => ({
  kind: 'reclamo',
  consumerName: '',
  docType: 'DNI',
  docNumber: '',
  address: '',
  phone: '',
  email: '',
  isMinor: false,
  guardianName: '',
  guardianDoc: '',
  goodType: 'producto',
  goodDescription: '',
  amount: '',
  orderRef: '',
  detail: '',
  request: '',
  replyVia: 'email',
  conformity: false
});

/** Datos de la hoja que la base devuelve al registrarla. */
export interface ComplaintReceipt {
  id: string;
  number: number;
  createdAt: string;
  dueAt: string;
}

export const KIND_LABEL: Record<ComplaintKind, string> = { reclamo: 'Reclamo', queja: 'Queja' };
export const KIND_HELP: Record<ComplaintKind, string> = {
  reclamo: 'Disconformidad con el producto o servicio que contrataste.',
  queja: 'Malestar o descontento por la atención, no relacionado con el producto o servicio.'
};
export const DOC_LABEL: Record<DocType, string> = { DNI: 'DNI', CE: 'Carné de extranjería', PASAPORTE: 'Pasaporte', OTRO: 'Otro documento' };
export const GOOD_LABEL: Record<GoodType, string> = { producto: 'Producto', servicio: 'Servicio' };
export const REPLY_LABEL: Record<ReplyVia, string> = { email: 'Por correo electrónico', phone: 'Por teléfono o mensaje' };
export const STATUS_LABEL: Record<ComplaintStatus, string> = { pending: 'Sin responder', answered: 'Respondido' };

export const LIMITS = { name: 150, address: 200, phone: 20, email: 120, doc: 20, good: 300, order: 80, detail: 2000, request: 1000, response: 3000 } as const;

/** Número de la hoja como se muestra: «000123». */
export const complaintNumber = (n: number) => String(n).padStart(6, '0');

export type ComplaintErrors = Partial<Record<keyof ComplaintDraft, string>>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const len = (s: string) => s.trim().length;

/** Revisa el formulario con las mismas reglas que aplica la base (la base vuelve a revisar todo). */
export function validateComplaint(d: ComplaintDraft): ComplaintErrors {
  const e: ComplaintErrors = {};
  if (len(d.consumerName) < 3) e.consumerName = 'Escribe tu nombre completo.';
  else if (len(d.consumerName) > LIMITS.name) e.consumerName = `Máximo ${LIMITS.name} letras.`;

  const doc = d.docNumber.trim();
  if (d.docType === 'DNI') {
    if (!/^\d{8}$/.test(doc)) e.docNumber = 'El DNI tiene 8 números.';
  } else if (doc.length < 4 || doc.length > LIMITS.doc) e.docNumber = `Escribe el número del documento (de 4 a ${LIMITS.doc} caracteres).`;

  if (len(d.address) < 5) e.address = 'Escribe tu domicilio.';
  else if (len(d.address) > LIMITS.address) e.address = `Máximo ${LIMITS.address} letras.`;

  const phoneDigits = d.phone.replace(/\D/g, '');
  if (len(d.phone) < 6 || len(d.phone) > LIMITS.phone || phoneDigits.length < 6) e.phone = 'Escribe un teléfono válido.';
  if (!EMAIL_RE.test(d.email.trim()) || d.email.trim().length > LIMITS.email) e.email = 'Escribe un correo válido (ejemplo: nombre@correo.com).';

  if (d.isMinor) {
    if (len(d.guardianName) < 3) e.guardianName = 'Escribe el nombre de tu padre, madre o representante.';
    if (d.guardianDoc.trim() && (d.guardianDoc.trim().length < 4 || d.guardianDoc.trim().length > LIMITS.doc)) e.guardianDoc = 'Revisa el número del documento.';
  }

  if (len(d.goodDescription) < 3) e.goodDescription = 'Cuéntanos qué compraste o qué servicio recibiste.';
  else if (len(d.goodDescription) > LIMITS.good) e.goodDescription = `Máximo ${LIMITS.good} letras.`;
  if (d.amount.trim() && !/^\d{1,8}([.,]\d{1,2})?$/.test(d.amount.trim())) e.amount = 'Escribe solo números, por ejemplo 25 o 25.50.';
  if (d.orderRef.trim().length > LIMITS.order) e.orderRef = `Máximo ${LIMITS.order} letras.`;

  if (len(d.detail) < 10) e.detail = 'Cuéntanos qué pasó (mínimo 10 letras).';
  else if (len(d.detail) > LIMITS.detail) e.detail = `Máximo ${LIMITS.detail} letras.`;
  if (len(d.request) < 5) e.request = 'Escribe qué solución esperas.';
  else if (len(d.request) > LIMITS.request) e.request = `Máximo ${LIMITS.request} letras.`;

  if (!d.conformity) e.conformity = 'Marca esta casilla para enviar la hoja.';
  return e;
}
export const hasComplaintErrors = (e: ComplaintErrors) => Object.keys(e).length > 0;

/** Lo que se envía a la base (la función submit_complaint vuelve a revisarlo todo). */
export function complaintPayload(d: ComplaintDraft, legalVersion: string): Record<string, unknown> {
  return {
    kind: d.kind,
    consumer_name: d.consumerName.trim(),
    doc_type: d.docType,
    doc_number: d.docNumber.trim(),
    address: d.address.trim(),
    phone: d.phone.trim(),
    email: d.email.trim().toLowerCase(),
    is_minor: d.isMinor,
    guardian_name: d.isMinor ? d.guardianName.trim() : '',
    guardian_doc: d.isMinor ? d.guardianDoc.trim() : '',
    good_type: d.goodType,
    good_description: d.goodDescription.trim(),
    amount: d.amount.trim().replace(',', '.'),
    order_ref: d.orderRef.trim(),
    detail: d.detail.trim(),
    request: d.request.trim(),
    reply_via: d.replyVia,
    conformity: d.conformity,
    legal_version: legalVersion
  };
}

/** Día y hora de Lima, por ejemplo «22/10/2026 15:04». */
export function formatDateTimeLima(iso: string | Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const parts = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? '';
  return `${p('day')}/${p('month')}/${p('year')} ${p('hour')}:${p('minute')}`;
}

export const isPending = (c: Pick<Complaint, 'status'>) => c.status === 'pending';

/** Días corridos hasta la fecha límite (negativo = ya venció). Solo sirve para avisar; el plazo exacto lo calcula la base. */
export function daysToDue(c: Pick<Complaint, 'dueAt'>, now: number = Date.now()): number {
  return daysBetween(todayLima(now), limaDay(c.dueAt));
}
export const isOverdue = (c: Pick<Complaint, 'status' | 'dueAt'>, now: number = Date.now()) => isPending(c) && new Date(c.dueAt).getTime() < now;
/** Faltan 3 días o menos para el plazo (y todavía no venció). */
export const isDueSoon = (c: Pick<Complaint, 'status' | 'dueAt'>, now: number = Date.now()) => isPending(c) && !isOverdue(c, now) && daysToDue(c, now) <= 3;

export interface ComplaintCounts {
  pending: number;
  overdue: number;
  dueSoon: number;
  answered: number;
}
export function complaintCounts(list: Complaint[], now: number = Date.now()): ComplaintCounts {
  return {
    pending: list.filter(isPending).length,
    overdue: list.filter((c) => isOverdue(c, now)).length,
    dueSoon: list.filter((c) => isDueSoon(c, now)).length,
    answered: list.filter((c) => c.status === 'answered').length
  };
}

/** Las que vencen antes, primero; las respondidas, al final (las más recientes arriba). */
export function sortComplaints(list: Complaint[]): Complaint[] {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    if (a.status === 'pending') return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** Enlace «mailto:» con la respuesta lista para enviar a la persona (el equipo solo pulsa Enviar). */
export function replyMailto(c: Pick<Complaint, 'email' | 'number'>, body: string): string {
  const subject = `Respuesta a tu hoja de reclamación N.º ${complaintNumber(c.number)} - Descuentos Perú`;
  return `mailto:${encodeURIComponent(c.email).replace(/%40/g, '@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
