import type { VendorPaymentConfig } from '../../data/vendorsData';
import type { PaymentMethodItem } from '../../data/paymentsData';

/** Validación y formato de los datos de cobro, separados de la pantalla para poder probarlos solos. */

export const digitsOnly = (s: string | undefined) => (s || '').replace(/\D/g, '');

/** Números y cuentas que vienen de ejemplo en el proyecto: no deben llegar a un cliente real. */
const SAMPLE_DIGITS = new Set(['999888777', '19398765432012', '00219300987654320114', '2003001234567', '00320001300123456728', '001101230200123456', '01112300020012345612']);
export const isSampleValue = (s: string | undefined) => {
  const d = digitsOnly(s);
  return !!d && SAMPLE_DIGITS.has(d);
};

/** Celular peruano: 9 dígitos que empiezan con 9 (acepta +51). Devuelve "987 654 321" o null si no es válido. */
export function normalizeMobile(input: string): string | null {
  let d = digitsOnly(input);
  if (d.length === 11 && d.startsWith('51')) d = d.slice(2);
  if (!/^9\d{8}$/.test(d)) return null;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

const ACCOUNT_CHARS = /^[\d\s-]+$/;
export function accountError(input: string, label: string): string | undefined {
  const v = input.trim();
  if (!v) return undefined;
  const d = digitsOnly(v);
  if (!ACCOUNT_CHARS.test(v)) return `${label}: usa solo números y guiones.`;
  if (d.length < 10 || d.length > 20) return `${label}: debe tener entre 10 y 20 dígitos.`;
  return undefined;
}
export function cciError(input: string): string | undefined {
  const v = input.trim();
  if (!v) return undefined;
  if (!ACCOUNT_CHARS.test(v)) return 'CCI: usa solo números y guiones.';
  if (digitsOnly(v).length !== 20) return 'El CCI tiene exactamente 20 dígitos.';
  return undefined;
}

export interface PaymentDraft {
  yapePhone: string;
  plinPhone: string;
  bcpAccount: string;
  bcpCci: string;
  interbankAccount: string;
  paymentInstructions: string;
  qrImageUrl: string;
}
export type PaymentErrors = Partial<Record<keyof PaymentDraft, string>>;

export const INSTRUCTIONS_MAX = 300;

export const draftFromConfig = (c: VendorPaymentConfig | undefined): PaymentDraft => ({
  yapePhone: c?.yapePhone || '',
  plinPhone: c?.plinPhone || '',
  bcpAccount: c?.bcpAccount || '',
  bcpCci: c?.bcpCci || '',
  interbankAccount: c?.interbankAccount || '',
  paymentInstructions: c?.paymentInstructions || '',
  qrImageUrl: c?.qrImageUrl || ''
});

export function validatePayments(d: PaymentDraft): PaymentErrors {
  const e: PaymentErrors = {};
  if (d.yapePhone.trim() && !normalizeMobile(d.yapePhone)) e.yapePhone = 'Escribe un celular de 9 dígitos que empiece con 9. Ejemplo: 987 654 321.';
  if (d.plinPhone.trim() && !normalizeMobile(d.plinPhone)) e.plinPhone = 'Escribe un celular de 9 dígitos que empiece con 9. Ejemplo: 987 654 321.';
  const bcp = accountError(d.bcpAccount, 'Cuenta BCP');
  if (bcp) e.bcpAccount = bcp;
  const cci = cciError(d.bcpCci);
  if (cci) e.bcpCci = cci;
  const ib = accountError(d.interbankAccount, 'Cuenta Interbank');
  if (ib) e.interbankAccount = ib;
  if (d.paymentInstructions.trim().length > INSTRUCTIONS_MAX) e.paymentInstructions = `Máximo ${INSTRUCTIONS_MAX} letras.`;
  return e;
}

/** Etiquetas que la tienda muestra como "aceptamos…". Se derivan de lo que realmente está lleno. */
const DERIVED = ['Yape', 'Plin', 'BCP', 'Interbank'];
export function labelsFromDraft(d: PaymentDraft, existing: string[]): string[] {
  const derived = [d.yapePhone.trim() && 'Yape', d.plinPhone.trim() && 'Plin', (d.bcpAccount.trim() || d.bcpCci.trim()) && 'BCP', d.interbankAccount.trim() && 'Interbank'].filter(Boolean) as string[];
  // Se conservan las etiquetas que no salen de ningún campo (p. ej. BBVA) para no borrarlas sin querer
  const others = existing.filter((l) => !DERIVED.includes(l));
  return [...derived, ...others];
}

/** Devuelve la configuración lista para guardar (celulares con formato 987 654 321, sin espacios sobrantes). */
export function configFromDraft(d: PaymentDraft, base: VendorPaymentConfig | undefined): VendorPaymentConfig {
  const mob = (v: string) => (v.trim() ? normalizeMobile(v) || v.trim() : undefined);
  const txt = (v: string) => v.trim() || undefined;
  const out: VendorPaymentConfig = {
    ...(base || {}),
    yapePhone: mob(d.yapePhone),
    plinPhone: mob(d.plinPhone),
    bcpAccount: txt(d.bcpAccount),
    bcpCci: txt(d.bcpCci),
    interbankAccount: txt(d.interbankAccount),
    paymentInstructions: txt(d.paymentInstructions),
    qrImageUrl: d.qrImageUrl || undefined
  };
  // No se guardan claves vacías
  (Object.keys(out) as (keyof VendorPaymentConfig)[]).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
}

export const isPaymentDirty = (a: PaymentDraft, b: PaymentDraft) => JSON.stringify(a) !== JSON.stringify(b);

// ---------------------------------------------------------------- métodos generales de la web (solo administración)
export const METHOD_TYPES: { value: PaymentMethodItem['type']; label: string }[] = [
  { value: 'wallet', label: 'Billetera digital' },
  { value: 'bank', label: 'Banco' },
  { value: 'other', label: 'Otro' }
];

export const slugId = (name: string, taken: string[]) => {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'metodo';
  let id = base;
  for (let i = 2; taken.includes(id); i++) id = `${base}-${i}`;
  return id;
};
