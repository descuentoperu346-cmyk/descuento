import type { ServiceItem, ServicePlan } from '../../data/servicesData';

/** Lógica del formulario de producto, separada de la pantalla para poder probarla sola. */

export type Category = ServiceItem['category'];
export type Stock = NonNullable<ServiceItem['stockStatus']>;

export interface PlanDraft {
  key: string;
  name: string;
  /** Lo que escribe la persona: "12", "12.50" o "S/ 12.00" */
  price: string;
  period: string;
  /** Beneficios separados por coma */
  perks: string;
  popular: boolean;
}

export interface ProductDraft {
  title: string;
  category: Category;
  categoryLabel: string;
  badge: string;
  description: string;
  subItemLabel: string;
  buttonLabel: string;
  image: string;
  overview: string;
  deliveryTime: string;
  supportNote: string;
  /** Una característica por línea */
  features: string;
  stock: Stock;
  active: boolean;
  plans: PlanDraft[];
}

export const CATEGORY_OPTIONS: { value: Category; label: string; kicker: string }[] = [
  { value: 'streaming', label: 'Streaming y entretenimiento', kicker: 'STREAMING 4K' },
  { value: 'educacion', label: 'Tecnología y educación', kicker: 'TECNOLOGÍA EDUCATIVA' },
  { value: 'investigacion', label: 'Investigación digital', kicker: 'INTELIGENCIA DIGITAL' },
  { value: 'leaks', label: 'Leaks y ciberseguridad', kicker: 'LEAKS & CYBER INTEL' }
];
export const defaultKicker = (c: Category) => CATEGORY_OPTIONS.find((o) => o.value === c)?.kicker ?? c.toUpperCase();

export const STOCK_OPTIONS: { value: Stock; label: string }[] = [
  { value: 'in_stock', label: 'Disponible' },
  { value: 'few_left', label: 'Pocas unidades' },
  { value: 'preorder', label: 'Preventa' }
];

export const LIMITS = { title: 80, badge: 24, description: 220, overview: 1200, deliveryTime: 60, supportNote: 200, subItem: 60, planName: 60, period: 40, perks: 300 };
export const MAX_PRICE = 100000;
export const MAX_PLANS = 8;

let planSeq = 0;
export const newPlanKey = () => `plan-${Date.now().toString(36)}-${planSeq++}`;

export const emptyPlan = (over: Partial<PlanDraft> = {}): PlanDraft => ({ key: newPlanKey(), name: '', price: '', period: 'mes', perks: '', popular: false, ...over });

export function emptyDraft(): ProductDraft {
  return {
    title: '',
    category: 'streaming',
    categoryLabel: defaultKicker('streaming'),
    badge: '',
    description: '',
    subItemLabel: '',
    buttonLabel: 'Ver planes →',
    image: '',
    overview: '',
    deliveryTime: 'Entrega en 5 a 15 minutos',
    supportNote: 'Garantía y reposición durante todo el periodo contratado.',
    features: '',
    stock: 'in_stock',
    active: true,
    plans: [emptyPlan({ name: 'Plan estándar', popular: true })]
  };
}

// ---------------------------------------------------------------- precios
/** Convierte lo escrito ("12", "12,5", "S/ 12.00") en número. Devuelve null si no es un precio válido. */
export function parsePrice(input: string): number | null {
  const cleaned = (input || '').replace(/s\/\.?/gi, '').replace(/\s/g, '');
  if (!cleaned) return null;
  if (!/^\d+([.,]\d{1,2})?$/.test(cleaned)) return null;
  const n = parseFloat(cleaned.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
export const formatPrice = (n: number) => `S/ ${n.toFixed(2)}`;

// ---------------------------------------------------------------- producto <-> formulario
const splitList = (s: string, sep: RegExp) => s.split(sep).map((x) => x.trim()).filter(Boolean);

/** "S/ 12.00" → "12.00" (el formulario ya muestra "S/" al lado). Si el texto no es un precio, se deja tal cual para que se vea y se corrija. */
const priceForForm = (price: string | undefined) => {
  const n = parsePrice(price || '');
  return n === null ? price || '' : n.toFixed(2);
};

export function draftFromService(s: ServiceItem): ProductDraft {
  const plans = s.details?.plans?.length
    ? s.details.plans.map((p) => emptyPlan({ name: p.name, price: priceForForm(p.price), period: p.period, perks: (p.perks || []).join(', '), popular: !!p.popular }))
    : [emptyPlan({ name: 'Plan estándar', price: priceForForm(s.priceFrom), popular: true })];
  return {
    title: s.title,
    category: s.category,
    categoryLabel: s.categoryLabel,
    badge: s.badge || '',
    description: s.description,
    subItemLabel: s.subItemLabel || '',
    buttonLabel: s.buttonLabel || 'Ver planes →',
    image: s.customImageUrl || '',
    overview: s.details?.overview || '',
    deliveryTime: s.details?.deliveryTime || '',
    supportNote: s.details?.supportNote || '',
    features: (s.details?.features || []).join('\n'),
    stock: s.stockStatus || 'in_stock',
    active: s.active !== false,
    plans
  };
}

export interface FieldErrors {
  title?: string;
  description?: string;
  plans?: string;
  /** Errores por plan, por la clave del plan */
  plan: Record<string, { name?: string; price?: string }>;
}

/** Al editar un producto ya publicado, su texto actual siempre se acepta aunque sea más largo que el límite para los nuevos. */
export const capFor = (limit: number, original?: string) => Math.max(limit, (original || '').length);

export function validateDraft(d: ProductDraft, base?: ServiceItem | null): FieldErrors {
  const e: FieldErrors = { plan: {} };
  const titleMax = capFor(LIMITS.title, base?.title);
  const descMax = capFor(LIMITS.description, base?.description);
  if (!d.title.trim()) e.title = 'Escribe el nombre del producto.';
  else if (d.title.trim().length > titleMax) e.title = `Máximo ${titleMax} letras.`;
  if (d.description.trim().length > descMax) e.description = `Máximo ${descMax} letras.`;
  if (d.plans.length === 0) e.plans = 'Agrega al menos un plan con su precio.';
  for (const p of d.plans) {
    const pe: { name?: string; price?: string } = {};
    if (!p.name.trim()) pe.name = 'Ponle un nombre al plan.';
    const price = parsePrice(p.price);
    if (!p.price.trim()) pe.price = 'Escribe el precio.';
    else if (price === null) pe.price = 'Usa solo números, por ejemplo 12 o 12.50.';
    else if (price > MAX_PRICE) pe.price = 'El precio es demasiado alto.';
    if (pe.name || pe.price) e.plan[p.key] = pe;
  }
  return e;
}
/** Con un solo plan no se le pide nombre a la persona: si queda vacío se usa "Plan estándar". */
export const withDefaultPlanName = (d: ProductDraft): ProductDraft =>
  d.plans.length === 1 && !d.plans[0].name.trim() ? { ...d, plans: [{ ...d.plans[0], name: 'Plan estándar' }] } : d;

export const hasErrors = (e: FieldErrors) => !!(e.title || e.description || e.plans || Object.keys(e.plan).length);

/**
 * Arma el producto a guardar. Si se está editando, parte del producto original para NO perder
 * lo que el formulario no muestra (valoración, vendedores asignados, requisitos, etc.).
 */
export function serviceFromDraft(d: ProductDraft, base: ServiceItem | null, fresh: { id: string; vendorId: string; assignedVendorIds: string[] }): ServiceItem {
  const plans: ServicePlan[] = d.plans.map((p) => {
    const price = parsePrice(p.price) ?? 0;
    return {
      name: p.name.trim(),
      price: formatPrice(price),
      period: p.period.trim() || 'mes',
      perks: splitList(p.perks, /,/),
      ...(p.popular ? { popular: true } : {})
    };
  });
  // Solo un plan puede ir marcado como "popular"
  let seen = false;
  for (const p of plans) {
    if (p.popular) {
      if (seen) delete p.popular;
      seen = true;
    }
  }
  const lowest = d.plans.map((p) => parsePrice(p.price) ?? Infinity).reduce((a, b) => Math.min(a, b), Infinity);
  const features = splitList(d.features, /\n/);
  const overview = d.overview.trim() || d.description.trim();
  const original = base?.details;

  const out: ServiceItem = {
    ...(base || {
      id: fresh.id,
      vendorId: fresh.vendorId,
      assignedVendorIds: fresh.assignedVendorIds,
      visualType: d.category,
      rating: 5,
      popular: false
    }),
    category: d.category,
    categoryLabel: d.categoryLabel.trim() || defaultKicker(d.category),
    title: d.title.trim(),
    description: d.description.trim() || 'Producto digital con activación garantizada.',
    subItemLabel: d.subItemLabel.trim() || 'Activación inmediata',
    buttonLabel: d.buttonLabel.trim() || 'Ver planes →',
    visualType: d.category,
    customImageUrl: d.image || undefined,
    badge: d.badge.trim() || undefined,
    priceFrom: Number.isFinite(lowest) ? formatPrice(lowest) : base?.priceFrom,
    stockStatus: d.stock,
    active: d.active,
    details: {
      ...(original || { features: [] }),
      overview,
      features: features.length ? features : original?.features?.length ? original.features : ['Activación inmediata', 'Soporte directo por Telegram', 'Garantía de reposición'],
      plans,
      deliveryTime: d.deliveryTime.trim() || 'Entrega en 5 a 15 minutos',
      supportNote: d.supportNote.trim() || 'Garantía y reposición durante todo el periodo contratado.'
    }
  };
  return out;
}

/** Nombre libre para una copia: "Netflix" → "Netflix (copia)", "Netflix (copia)" → "Netflix (copia 2)". */
export function copyTitle(title: string, existing: string[]): string {
  const base = title.replace(/\s*\(copia(?: \d+)?\)\s*$/i, '').trim();
  const taken = new Set(existing.map((t) => t.toLowerCase()));
  let candidate = `${base} (copia)`;
  for (let i = 2; taken.has(candidate.toLowerCase()); i++) candidate = `${base} (copia ${i})`;
  return candidate;
}

export const isDirty = (a: ProductDraft, b: ProductDraft) => JSON.stringify({ ...a, plans: a.plans.map(({ key: _k, ...r }) => r) }) !== JSON.stringify({ ...b, plans: b.plans.map(({ key: _k, ...r }) => r) });
