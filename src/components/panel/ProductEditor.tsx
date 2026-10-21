import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Images, Plus, Sparkles, Trash2, TriangleAlert, X } from 'lucide-react';
import type { ServiceItem } from '../../data/servicesData';
import { ServiceCard } from '../ServiceCard';
import { optimizeImage, dataUrlKb } from '../../lib/imageUpload';
import { deleteNote, useTrashReady } from '../../lib/vaultApi';
import { Card, PageHeader, primaryBtn, secondaryBtn } from './ui';
import { Disclosure, Field, Switch, inputCls } from './fields';
import { ConfirmDialog } from './Dialog';
import {
  CATEGORY_OPTIONS,
  LIMITS,
  MAX_PLANS,
  STOCK_OPTIONS,
  capFor,
  copyTitle,
  defaultKicker,
  draftFromService,
  emptyDraft,
  emptyPlan,
  hasErrors,
  isDirty,
  parsePrice,
  serviceFromDraft,
  validateDraft,
  withDefaultPlanName,
  type Category,
  type PlanDraft,
  type ProductDraft,
  type Stock
} from './productForm';
import type { PRODUCT_PRESETS } from './productPresets';

type Preset = (typeof PRODUCT_PRESETS)[number];

interface ProductEditorProps {
  /** Producto que se edita; null para crear uno nuevo */
  product: ServiceItem | null;
  presets: Preset[];
  gallery: { label: string; url: string }[];
  /** Tienda a la que se asigna un producto nuevo */
  ownerVendorId: string;
  assignedVendorIds: string[];
  existingTitles: string[];
  canDelete: boolean;
  /** Abre el producto como una copia nueva (nombre con "(copia)", oculto) */
  startAsCopy?: boolean;
  onSave: (service: ServiceItem, isNew: boolean) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onDirtyChange: (dirty: boolean) => void;
}

const PERIODS = ['mes', 'año', 'por consulta', 'de por vida', 'acceso permanente'];
const counter = (n: number, max: number) => (
  <span className={`ml-auto tabular-nums ${n > max ? 'text-rose-300' : 'text-zinc-400'}`}>
    {n}/{max}
  </span>
);
const countItems = (s: string, sep: RegExp) => s.split(sep).filter((x) => x.trim()).length;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const draftFromPreset = (p: Preset, keepActive: boolean): ProductDraft => ({
  ...emptyDraft(),
  title: p.title,
  category: p.category,
  categoryLabel: p.categoryLabel,
  badge: p.badge,
  description: p.description,
  subItemLabel: p.subItemLabel,
  image: p.customImageUrl,
  overview: p.overview,
  deliveryTime: p.deliveryTime,
  active: keepActive,
  plans: [emptyPlan({ name: p.planName, price: String(parsePrice(p.planPrice) ?? ''), period: p.planPeriod, perks: p.planPerks, popular: true })]
});

export const ProductEditor: React.FC<ProductEditorProps> = ({
  product,
  presets,
  gallery,
  ownerVendorId,
  assignedVendorIds,
  existingTitles,
  canDelete,
  startAsCopy = false,
  onSave,
  onCancel,
  onDelete,
  onDirtyChange
}) => {
  const initial = useMemo<ProductDraft>(() => {
    if (!product) return emptyDraft();
    const d = draftFromService(product);
    return startAsCopy ? { ...d, title: copyTitle(d.title, existingTitles), active: false } : d;
  }, [product, startAsCopy]);
  const trashReady = useTrashReady();
  const [copyMode, setCopyMode] = useState(startAsCopy);
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState('');
  const [pendingPreset, setPendingPreset] = useState<Preset | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  // Secciones plegables: solo "Planes" parte abierta cuando el producto ya tiene varios
  const [openPlans, setOpenPlans] = useState(initial.plans.length > 1);
  const [openDetail, setOpenDetail] = useState(false);
  const [openLook, setOpenLook] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Si se pasa a editar otro producto, el formulario parte de ese producto
  useEffect(() => {
    setDraft(initial);
    setCopyMode(startAsCopy);
    setSubmitted(false);
    setImgError('');
    setOpenPlans(initial.plans.length > 1);
    setOpenDetail(false);
    setOpenLook(false);
    setShowGallery(false);
  }, [initial]);

  const dirty = isDirty(draft, initial);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty]);
  useEffect(() => () => onDirtyChange(false), []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const ready = useMemo(() => withDefaultPlanName(draft), [draft]);
  const errors = useMemo(() => validateDraft(ready, product), [ready, product]);
  const shown = submitted ? errors : { plan: {} as typeof errors.plan };
  const multi = draft.plans.length > 1;
  const first = draft.plans[0];
  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setPlan = (key: string, patch: Partial<PlanDraft>) =>
    setDraft((d) => ({
      ...d,
      plans: d.plans.map((p) => {
        if (p.key === key) return { ...p, ...patch };
        // Solo un plan puede ser el recomendado
        return patch.popular ? { ...p, popular: false } : p;
      })
    }));

  const onCategory = (c: Category) =>
    setDraft((d) => ({ ...d, category: c, categoryLabel: !d.categoryLabel || d.categoryLabel === defaultKicker(d.category) ? defaultKicker(c) : d.categoryLabel }));

  const applyPreset = (p: Preset) => {
    setDraft(draftFromPreset(p, draft.active));
    setSubmitted(false);
    setPendingPreset(null);
    setOpenPlans(false);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImgBusy(true);
    setImgError('');
    const res = await optimizeImage(file, { maxSide: 1000 });
    setImgBusy(false);
    if (res.ok && res.dataUrl) set('image', res.dataUrl);
    else setImgError(res.error || 'No se pudo usar esa imagen.');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) {
      // Si el problema está dentro de una sección cerrada, se abre antes de llevar el cursor
      const planProblem = !!errors.plans || Object.values(errors.plan).some((pe) => pe.name || (multi && pe.price));
      if (planProblem) setOpenPlans(true);
      requestAnimationFrame(() => requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()));
      return;
    }
    const fresh = { id: `prod-${Date.now()}`, vendorId: ownerVendorId, assignedVendorIds };
    // Una copia conserva lo que el formulario no muestra (valoración, requisitos…) pero es un producto nuevo
    const base = product && copyMode ? { ...product, ...fresh } : product;
    onSave(serviceFromDraft(ready, base, fresh), isNew);
  };

  const duplicate = () => {
    setCopyMode(true);
    setDraft((d) => ({ ...d, title: copyTitle(d.title, existingTitles), active: false }));
  };

  const preview = useMemo(() => {
    const safe: ProductDraft = {
      ...ready,
      title: ready.title.trim() || 'Nombre del producto',
      plans: ready.plans.map((p) => ({ ...p, price: parsePrice(p.price) === null ? '0' : p.price, name: p.name || 'Plan' }))
    };
    return serviceFromDraft(safe, product, { id: product?.id ?? 'preview', vendorId: ownerVendorId, assignedVendorIds });
  }, [ready, product, ownerVendorId, assignedVendorIds]);

  const isNew = !product || copyMode;
  const errorCount = (shown.title ? 1 : 0) + (shown.description ? 1 : 0) + (shown.plans ? 1 : 0) + Object.keys(shown.plan).length;

  const priceField = (p: PlanDraft, error?: string) => (
    <Field label="Precio en soles" required error={error}>
      {(a) => (
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
            S/
          </span>
          <input {...a} inputMode="decimal" value={p.price} onChange={(e) => setPlan(p.key, { price: e.target.value })} placeholder="12.00" className={`${inputCls} pl-8`} />
        </div>
      )}
    </Field>
  );
  const periodField = (p: PlanDraft) => (
    <Field label="Se cobra cada">
      {(a) => (
        <>
          <input {...a} list={`pe-per-${p.key}`} value={p.period} onChange={(e) => setPlan(p.key, { period: e.target.value })} maxLength={LIMITS.period} className={inputCls} />
          <datalist id={`pe-per-${p.key}`}>
            {PERIODS.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </>
      )}
    </Field>
  );

  const stockLabel = STOCK_OPTIONS.find((o) => o.value === draft.stock)?.label ?? '';
  const plansSummary = multi
    ? `${draft.plans.length} planes: el cliente elige uno`
    : `Un solo plan · ${plural(countItems(first.perks, /,/), 'beneficio incluido', 'beneficios incluidos')}`;
  const detailSummary = `${draft.deliveryTime.trim() || 'Sin tiempo de entrega'} · ${plural(countItems(draft.features, /\n/), 'característica', 'características')}`;
  const lookSummary = `${stockLabel}${draft.badge.trim() ? ` · Insignia “${draft.badge.trim()}”` : ''}`;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title={!product ? 'Nuevo producto' : copyMode ? 'Copia de un producto' : 'Editar producto'}
        description={
          !product
            ? 'Con el nombre, el precio y una foto ya puedes publicarlo. Lo demás es opcional.'
            : copyMode
            ? `Se creará un producto nuevo a partir de “${product.title}”. El original no se toca.`
            : `Estás editando “${product.title}”. Los cambios se ven en la tienda al guardar.`
        }
        actions={
          <button type="button" onClick={() => (dirty ? setConfirmLeave(true) : onCancel())} className={secondaryBtn}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a la lista
          </button>
        }
      />

      {!product && (
        <Card className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Empezar desde una plantilla
          </p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Plantillas de producto">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => (dirty ? setPendingPreset(p) : applyPreset(p))}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <form ref={formRef} onSubmit={submit} noValidate className="space-y-3 lg:col-span-7" aria-label={isNew ? 'Formulario de producto nuevo' : 'Formulario de edición de producto'}>
          {submitted && errorCount > 0 && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-100">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
              Falta revisar {errorCount} {errorCount === 1 ? 'dato' : 'datos'} antes de guardar. Están marcados abajo.
            </p>
          )}

          {/* Lo esencial: todo lo que hace falta para publicar */}
          <Card as="section" aria-labelledby="pe-datos" className="space-y-4 p-5">
            <h2 id="pe-datos" className="text-base font-semibold text-white">
              Lo esencial
            </h2>
            <Field label="Nombre del producto" required error={shown.title}>
              {(a) => <input {...a} value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Ej.: Netflix Premium 4K" className={inputCls} />}
            </Field>
            <div className={`grid gap-4 ${multi ? '' : 'sm:grid-cols-[1fr_8rem_10rem]'}`}>
              <Field label="Categoría">
                {(a) => (
                  <select {...a} value={draft.category} onChange={(e) => onCategory(e.target.value as Category)} className={`${inputCls} cursor-pointer`}>
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              {!multi && (
                <>
                  {priceField(first, shown.plan[first.key]?.price)}
                  {periodField(first)}
                </>
              )}
            </div>
            {multi && (
              <p className="-mt-1 text-xs text-zinc-400">
                Este producto tiene {draft.plans.length} planes con su propio precio. Se editan en la sección “Planes y qué incluye”.
              </p>
            )}
            <Field label="Descripción corta" hint="Se ve en la tarjeta de la tienda: una o dos frases." error={shown.description}>
              {(a) => (
                <>
                  <textarea {...a} rows={2} value={draft.description} onChange={(e) => set('description', e.target.value)} className={inputCls} />
                  <p className="mt-1 flex text-xs">{counter(draft.description.trim().length, capFor(LIMITS.description, product?.description))}</p>
                </>
              )}
            </Field>

            {/* Foto */}
            <div>
              <p className="mb-2 text-[13px] font-medium text-zinc-200">Foto del producto</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-black">
                  {draft.image ? <img src={draft.image} alt="Foto elegida del producto" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-400">Sin foto propia</div>}
                </div>
                <div className="min-w-0 space-y-2">
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFile} className="sr-only" tabIndex={-1} aria-label="Elegir una foto desde tu equipo" data-testid="product-image-input" />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={imgBusy} className={secondaryBtn}>
                      <ImagePlus className="h-4 w-4" aria-hidden="true" /> {imgBusy ? 'Preparando…' : 'Subir una foto'}
                    </button>
                    <button type="button" aria-expanded={showGallery} aria-controls="pe-galeria" onClick={() => setShowGallery((v) => !v)} className={secondaryBtn}>
                      <Images className="h-4 w-4" aria-hidden="true" /> {showGallery ? 'Ocultar galería' : 'Elegir de la galería'}
                    </button>
                    {draft.image && (
                      <button type="button" onClick={() => set('image', '')} className={secondaryBtn}>
                        <X className="h-4 w-4" aria-hidden="true" /> Quitar foto
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400" role="status">
                    {draft.image.startsWith('data:') ? `Foto lista para guardar (${dataUrlKb(draft.image)} KB, ya reducida para que la tienda cargue rápido).` : 'La foto se reduce sola para que la tienda cargue rápido.'}
                  </p>
                  {imgError && (
                    <p role="alert" className="text-xs text-rose-300">
                      {imgError}
                    </p>
                  )}
                </div>
              </div>
              <div id="pe-galeria" hidden={!showGallery} className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="Galería de fotos">
                {gallery.map((g) => (
                  <button
                    key={g.url}
                    type="button"
                    aria-pressed={draft.image === g.url}
                    onClick={() => set('image', g.url)}
                    className={`overflow-hidden rounded-lg border p-1 text-left text-[11px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                      draft.image === g.url ? 'border-emerald-400 bg-emerald-400/10 text-emerald-100' : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <img loading="lazy" decoding="async" src={g.url} alt="" className="mb-1 h-12 w-full rounded object-cover" />
                    <span className="block truncate">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Publicación */}
            <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">
              <Switch checked={draft.active} label={draft.active ? 'Publicado en la tienda, pulsa para ocultarlo' : 'Oculto, pulsa para publicarlo'} onChange={() => set('active', !draft.active)} />
              <div>
                <p className="text-[13px] font-semibold text-white">{draft.active ? 'Publicado en la tienda' : 'Oculto de la tienda'}</p>
                <p className="text-xs text-zinc-400">{draft.active ? 'Los clientes lo ven apenas guardes.' : 'Nadie lo ve hasta que lo publiques.'}</p>
              </div>
            </div>
          </Card>

          {/* Opcional: planes */}
          <Disclosure id="pe-planes" title="Planes y qué incluye" summary={plansSummary} open={openPlans} onToggle={() => setOpenPlans((v) => !v)}>
            <p className="text-[13px] text-zinc-400">
              {multi ? 'Cada plan es una opción que el cliente puede elegir. La tarjeta muestra “Precio desde” con el plan más barato.' : 'Agrega más planes si vendes la misma cosa con distintos precios, por ejemplo 1 mes y 3 meses.'}
            </p>
            {shown.plans && (
              <p role="alert" className="text-xs text-rose-300">
                {shown.plans}
              </p>
            )}
            <div className="space-y-4">
              {draft.plans.map((p, i) => {
                const pe = shown.plan[p.key] || {};
                return (
                  <fieldset key={p.key} className={multi ? 'space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4' : 'space-y-3'}>
                    <legend className={multi ? 'px-1 text-[13px] font-semibold text-zinc-200' : 'sr-only'}>Plan {i + 1}</legend>
                    {multi ? (
                      <div className="grid gap-3 sm:grid-cols-[1fr_9rem_10rem]">
                        <Field label="Nombre del plan" required error={pe.name}>
                          {(a) => <input {...a} value={p.name} onChange={(e) => setPlan(p.key, { name: e.target.value })} maxLength={LIMITS.planName} placeholder="Ej.: Perfil privado (1 mes)" className={inputCls} />}
                        </Field>
                        {priceField(p, pe.price)}
                        {periodField(p)}
                      </div>
                    ) : (
                      <Field label="Nombre del plan" hint="Si lo dejas vacío se llama “Plan estándar”." error={pe.name}>
                        {(a) => <input {...a} value={p.name} onChange={(e) => setPlan(p.key, { name: e.target.value })} maxLength={LIMITS.planName} placeholder="Ej.: Perfil privado (1 mes)" className={inputCls} />}
                      </Field>
                    )}
                    <Field label="Qué incluye" hint="Separa cada beneficio con una coma.">
                      {(a) => <input {...a} value={p.perks} onChange={(e) => setPlan(p.key, { perks: e.target.value })} maxLength={LIMITS.perks} placeholder="1 pantalla, Calidad 4K, Garantía 30 días" className={inputCls} />}
                    </Field>
                    {multi && (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-zinc-200">
                          <input type="checkbox" checked={p.popular} onChange={(e) => setPlan(p.key, { popular: e.target.checked })} className="h-4 w-4 cursor-pointer accent-[#00ff88]" />
                          Destacar como “recomendado”
                        </label>
                        <button
                          type="button"
                          onClick={() => set('plans', draft.plans.filter((x) => x.key !== p.key))}
                          aria-label={`Quitar plan ${i + 1}${p.name ? `: ${p.name}` : ''}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/10 focus-visible:outline-2 focus-visible:outline-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Quitar plan
                        </button>
                      </div>
                    )}
                  </fieldset>
                );
              })}
            </div>
            <button type="button" disabled={draft.plans.length >= MAX_PLANS} onClick={() => set('plans', [...draft.plans, emptyPlan()])} className={secondaryBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Agregar otro plan
            </button>
          </Disclosure>

          {/* Opcional: lo que se lee al abrir el producto */}
          <Disclosure id="pe-detalle" title="Entrega y detalle del producto" summary={detailSummary} open={openDetail} onToggle={() => setOpenDetail((v) => !v)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tiempo de entrega" hint="Ejemplo: Entrega en 5 a 15 minutos.">
                {(a) => <input {...a} value={draft.deliveryTime} onChange={(e) => set('deliveryTime', e.target.value)} maxLength={LIMITS.deliveryTime} className={inputCls} />}
              </Field>
              <Field label="Garantía o nota de soporte">
                {(a) => <input {...a} value={draft.supportNote} onChange={(e) => set('supportNote', e.target.value)} maxLength={LIMITS.supportNote} className={inputCls} />}
              </Field>
            </div>
            <Field label="Descripción completa" hint="Se lee al abrir el producto. Si la dejas vacía se usa la descripción corta.">
              {(a) => (
                <>
                  <textarea {...a} rows={4} value={draft.overview} onChange={(e) => set('overview', e.target.value)} className={inputCls} />
                  <p className="mt-1 flex text-xs">{counter(draft.overview.trim().length, LIMITS.overview)}</p>
                </>
              )}
            </Field>
            <Field label="Características" hint="Una por línea. Aparecen como lista con visto al abrir el producto.">
              {(a) => <textarea {...a} rows={4} value={draft.features} onChange={(e) => set('features', e.target.value)} placeholder={'Activación inmediata\nSoporte directo por Telegram'} className={inputCls} />}
            </Field>
          </Disclosure>

          {/* Opcional: cómo se ve la tarjeta y si hay stock */}
          <Disclosure id="pe-apariencia" title="Insignia y disponibilidad" summary={lookSummary} open={openLook} onToggle={() => setOpenLook((v) => !v)}>
            <Field label="Disponibilidad" className="sm:max-w-xs">
              {(a) => (
                <select {...a} value={draft.stock} onChange={(e) => set('stock', e.target.value as Stock)} className={`${inputCls} cursor-pointer`}>
                  {STOCK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Insignia (opcional)" hint="Ejemplos: MÁS VENDIDO, NUEVO, OFERTA. Aparece sobre la foto.">
              {(a) => <input {...a} value={draft.badge} onChange={(e) => set('badge', e.target.value)} maxLength={LIMITS.badge} className={inputCls} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Etiqueta sobre el nombre" hint="Texto pequeño que aparece encima del nombre en la tarjeta.">
                {(a) => <input {...a} value={draft.categoryLabel} onChange={(e) => set('categoryLabel', e.target.value)} maxLength={40} className={inputCls} />}
              </Field>
              <Field label="Línea al pie de la tarjeta" hint="Ejemplo: Perfiles privados y cuentas completas.">
                {(a) => <input {...a} value={draft.subItemLabel} onChange={(e) => set('subItemLabel', e.target.value)} maxLength={LIMITS.subItem} className={inputCls} />}
              </Field>
            </div>
          </Disclosure>

          {/* Barra de acciones */}
          <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-700 bg-[#14141a]/95 p-3 shadow-xl backdrop-blur">
            <button type="submit" className={primaryBtn}>
              {!product ? 'Guardar producto' : copyMode ? 'Guardar copia' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => (dirty ? setConfirmLeave(true) : onCancel())} className={secondaryBtn}>
              Cancelar
            </button>
            {product && !copyMode && (
              <button type="button" onClick={duplicate} className={secondaryBtn} title="Pone el nombre con “(copia)” y lo deja oculto. Al guardar se crea un producto aparte.">
                Guardar como copia
              </button>
            )}
            {product && !copyMode && canDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] font-semibold text-rose-200 hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-rose-300">
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
              </button>
            )}
            <span role="status" className={`text-xs ${dirty ? 'text-amber-200' : 'text-zinc-400'} ${product && !copyMode && canDelete ? '' : 'ml-auto'}`}>
              {dirty ? 'Tienes cambios sin guardar' : product && !copyMode ? 'Sin cambios pendientes' : ''}
            </span>
          </div>
        </form>

        {/* Vista previa tal como la ve el cliente */}
        <aside className="space-y-3 lg:sticky lg:top-20 lg:col-span-5" aria-label="Vista previa">
          <p className="text-sm font-semibold text-white">Así se verá en la tienda</p>
          <div inert aria-hidden="true" className="pointer-events-none select-none">
            <ServiceCard service={preview} onOpenDetails={() => {}} vendors={[]} />
          </div>
          <p className="text-xs text-zinc-400">
            {draft.active ? 'Está marcado como publicado.' : 'Está oculto: los clientes no lo verán todavía.'} Precio desde el plan más barato.
          </p>
        </aside>
      </div>

      <ConfirmDialog
        open={pendingPreset !== null}
        title="¿Reemplazar lo que escribiste?"
        message={`Al usar la plantilla “${pendingPreset?.label ?? ''}” se cambian los textos y planes que ya llenaste.`}
        confirmLabel="Usar la plantilla"
        onConfirm={() => pendingPreset && applyPreset(pendingPreset)}
        onCancel={() => setPendingPreset(null)}
      />
      <ConfirmDialog
        open={confirmLeave}
        title="Tienes cambios sin guardar"
        message="Si sales ahora, lo que cambiaste en este producto se pierde."
        confirmLabel="Salir sin guardar"
        danger
        onConfirm={() => {
          setConfirmLeave(false);
          onCancel();
        }}
        onCancel={() => setConfirmLeave(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar este producto?"
        message={`“${product?.title ?? ''}” dejará de verse en la tienda. ${deleteNote(trashReady)}`}
        confirmLabel="Eliminar producto"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (product) onDelete(product.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default ProductEditor;
