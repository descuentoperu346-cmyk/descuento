import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../Dialog';
import { Field, inputCls } from '../fields';
import { primaryBtn, secondaryBtn } from '../ui';
import { saveCustomer, saveSale } from '../../../lib/salesStore';
import {
  addDaysToDay,
  durationFromPeriod,
  formatDay,
  isValidDay,
  limaDay,
  money,
  noonOfLimaDay,
  parseAmount,
  STATUS_LABEL,
  todayLima,
  type Customer,
  type Sale,
  type SaleStatus
} from '../../../lib/salesMath';
import type { SaleDraft, SalesCtx } from './shared';
import { vendorName } from './shared';

interface SaleDialogProps {
  open: boolean;
  onClose: () => void;
  ctx: SalesCtx;
  customers: Customer[];
  /** Venta que se edita; si falta, se crea una nueva */
  sale?: Sale | null;
  draft?: SaleDraft | null;
  onSaved?: (sale: Sale, mode: 'created' | 'updated') => void;
}

const OTHER = '__other';
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

interface Form {
  vendorId: string;
  customerText: string;
  saveAsCustomer: boolean;
  newTelegram: string;
  newWhatsapp: string;
  productId: string;
  productText: string;
  plan: string;
  planText: string;
  amount: string;
  payment: string;
  paymentText: string;
  status: SaleStatus;
  soldDay: string;
  duration: string;
  expiresDay: string;
  notes: string;
}

const STATUSES: SaleStatus[] = ['paid', 'pending', 'cancelled', 'refunded'];

export const SaleDialog: React.FC<SaleDialogProps> = ({ open, onClose, ctx, customers, sale, draft, onSaved }) => {
  const editing = !!sale;
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const planOf = (productId: string, planName: string) => {
    const svc = ctx.services.find((s) => s.id === productId);
    return svc?.details?.plans?.find((p) => p.name === planName);
  };
  const renewBase = draft?.renewOf?.expiresAt ? limaDay(draft.renewOf.expiresAt) : null;
  const expiryFor = (soldDay: string, duration: string) => {
    const n = parseInt(duration, 10);
    if (!isValidDay(soldDay) || !Number.isFinite(n) || n < 1) return '';
    // Renovar antes de que venza no hace perder los días que sobraban
    const base = renewBase && renewBase > soldDay ? renewBase : soldDay;
    return addDaysToDay(base, n);
  };

  // Se arma el formulario cada vez que se abre
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setServerError('');
    setBusy(false);
    const payNames = ctx.paymentMethods.filter((m) => m.active).map((m) => m.name);
    if (sale) {
      const svc = ctx.services.find((s) => s.id === sale.productId);
      const planKnown = !!svc?.details?.plans?.some((p) => p.name === sale.plan);
      setForm({
        vendorId: sale.vendorId,
        customerText: customerLabelFor(customers, sale.customerId) || sale.customerName,
        saveAsCustomer: false,
        newTelegram: '',
        newWhatsapp: '',
        productId: svc ? svc.id : OTHER,
        productText: svc ? '' : sale.productTitle,
        plan: sale.plan ? (planKnown ? sale.plan : OTHER) : '',
        planText: sale.plan && !planKnown ? sale.plan : '',
        amount: String(sale.amount),
        payment: sale.paymentMethod ? (payNames.includes(sale.paymentMethod) ? sale.paymentMethod : OTHER) : '',
        paymentText: sale.paymentMethod && !payNames.includes(sale.paymentMethod) ? sale.paymentMethod : '',
        status: sale.status,
        soldDay: limaDay(sale.soldAt),
        duration: sale.durationDays ? String(sale.durationDays) : '',
        expiresDay: sale.expiresAt ? limaDay(sale.expiresAt) : '',
        notes: sale.notes || ''
      });
      return;
    }
    const d = draft || {};
    const vendorId = d.vendorId || ctx.currentVendor.id;
    const svc = d.productId ? ctx.services.find((s) => s.id === d.productId) : undefined;
    const planKnown = !!svc?.details?.plans?.some((p) => p.name === d.plan);
    const today = todayLima();
    const duration = d.durationDays ? String(d.durationDays) : '';
    const base = d.renewOf?.expiresAt ? limaDay(d.renewOf.expiresAt) : null;
    const n = parseInt(duration, 10);
    setForm({
      vendorId,
      customerText: customerLabelFor(customers, d.customerId) || d.customerName || '',
      saveAsCustomer: true,
      newTelegram: '',
      newWhatsapp: '',
      productId: svc ? svc.id : d.productTitle ? OTHER : '',
      productText: !svc && d.productTitle ? d.productTitle : '',
      plan: d.plan ? (planKnown ? d.plan : OTHER) : '',
      planText: d.plan && !planKnown ? d.plan : '',
      amount: d.amount !== undefined ? String(d.amount) : '',
      payment: d.paymentMethod ? (payNames.includes(d.paymentMethod) ? d.paymentMethod : OTHER) : '',
      paymentText: d.paymentMethod && !payNames.includes(d.paymentMethod) ? d.paymentMethod : '',
      status: 'paid',
      soldDay: today,
      duration,
      expiresDay: Number.isFinite(n) && n >= 1 ? addDaysToDay(base && base > today ? base : today, n) : '',
      notes: ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const vendorCustomers = useMemo(() => customers.filter((c) => !form || c.vendorId === form.vendorId), [customers, form?.vendorId]);
  const labels = useMemo(() => customerLabels(vendorCustomers), [vendorCustomers]);
  const matched = form ? vendorCustomers.find((c) => labels.get(c.id)!.toLowerCase() === form.customerText.trim().toLowerCase()) : undefined;
  const brandNew = !!form && !!form.customerText.trim() && !matched;

  if (!form) return null;
  const f = form;
  const set = (patch: Partial<Form>) => {
    setForm((cur) => (cur ? { ...cur, ...patch } : cur));
    // El aviso rojo de un campo desaparece apenas se empieza a corregir
    setErrors((cur) => {
      const next = { ...cur };
      Object.keys(patch).forEach((k) => delete next[k as keyof Form]);
      if ('productId' in patch) delete next.productText;
      return next;
    });
  };
  const svc = ctx.services.find((s) => s.id === f.productId);
  const plans = svc?.details?.plans || [];
  const payNames = ctx.paymentMethods.filter((m) => m.active).map((m) => m.name);

  const applyPlan = (productId: string, planName: string, soldDay = f.soldDay) => {
    const p = planOf(productId, planName);
    if (!p) return {};
    const amount = parseAmount(p.price);
    const dur = durationFromPeriod(p.period);
    const duration = dur ? String(dur) : '';
    return { plan: planName, amount: amount !== null ? String(amount) : f.amount, duration, expiresDay: expiryFor(soldDay, duration) };
  };

  const onProduct = (productId: string) => {
    if (productId === OTHER || !productId) return set({ productId, plan: '', planText: '' });
    const s = ctx.services.find((x) => x.id === productId);
    const first = s?.details?.plans?.find((p) => p.popular) || s?.details?.plans?.[0];
    set({ productId, productText: '', plan: '', planText: '', ...(first ? applyPlan(productId, first.name) : {}) });
  };
  const onPlan = (plan: string) => {
    if (plan === OTHER || !plan) return set({ plan });
    set(applyPlan(f.productId, plan));
  };
  const onSoldDay = (soldDay: string) => set({ soldDay, expiresDay: expiryFor(soldDay, f.duration) });
  const onDuration = (duration: string) => set({ duration, expiresDay: expiryFor(f.soldDay, duration) });

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.customerText.trim()) e.customerText = 'Escribe el nombre del cliente.';
    else if (f.customerText.trim().length > 120) e.customerText = 'El nombre es demasiado largo (máximo 120 letras).';
    if (!f.productId) e.productId = 'Elige un producto.';
    else if (f.productId === OTHER && !f.productText.trim()) e.productText = 'Escribe el nombre del producto.';
    const amount = parseAmount(f.amount);
    if (amount === null) e.amount = 'Escribe el monto cobrado, por ejemplo 12.50.';
    else if (amount < 0 || amount > 100000) e.amount = 'El monto debe estar entre 0 y 100,000.';
    if (!isValidDay(f.soldDay)) e.soldDay = 'Elige la fecha de la venta.';
    else if (f.soldDay > addDaysToDay(todayLima(), 1)) e.soldDay = 'La fecha de venta no puede ser futura.';
    if (f.duration.trim()) {
      const n = Number(f.duration);
      if (!Number.isInteger(n) || n < 1 || n > 3650) e.duration = 'Escribe de 1 a 3650 días, o deja vacío si no vence.';
    }
    if (f.expiresDay) {
      if (!isValidDay(f.expiresDay)) e.expiresDay = 'La fecha de vencimiento no es válida.';
      else if (isValidDay(f.soldDay) && f.expiresDay < f.soldDay) e.expiresDay = 'El vencimiento no puede ser anterior a la venta.';
    }
    if (f.notes.length > 1000) e.notes = 'Las notas son demasiado largas (máximo 1000 letras).';
    setErrors(e);
    return { ok: Object.keys(e).length === 0, amount };
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const { ok, amount } = validate();
    if (!ok || amount === null) return;
    setBusy(true);
    setServerError('');

    // 1) Cliente: el que ya existe, o uno nuevo si así se pidió
    let customerId: string | null = matched?.id ?? null;
    const customerName = matched ? matched.name : f.customerText.trim();
    if (!matched && !editing && f.saveAsCustomer) {
      const created = await saveCustomer({ vendorId: f.vendorId, name: customerName, telegram: f.newTelegram.trim() || null, whatsapp: f.newWhatsapp.trim() || null, email: null, notes: null });
      if (!created.ok) {
        setBusy(false);
        return setServerError(created.error);
      }
      customerId = created.data.id;
    }

    // 2) Venta
    const productTitle = svc ? svc.title : f.productText.trim();
    const planName = f.plan === OTHER ? f.planText.trim() : f.plan;
    const paymentMethod = f.payment === OTHER ? f.paymentText.trim() : f.payment;
    const today = todayLima();
    const keepSoldAt = editing && sale && limaDay(sale.soldAt) === f.soldDay;
    const soldAt = keepSoldAt ? sale!.soldAt : f.soldDay === today ? new Date().toISOString() : noonOfLimaDay(f.soldDay).toISOString();
    const keepExpires = editing && sale?.expiresAt && limaDay(sale.expiresAt) === f.expiresDay;
    const expiresAt = f.expiresDay ? (keepExpires ? sale!.expiresAt : noonOfLimaDay(f.expiresDay).toISOString()) : null;
    const res = await saveSale(
      {
        vendorId: f.vendorId,
        customerId,
        customerName,
        productId: svc ? svc.id : null,
        productTitle,
        plan: planName || null,
        amount,
        paymentMethod: paymentMethod || null,
        status: f.status,
        soldAt,
        durationDays: f.duration.trim() ? Number(f.duration) : null,
        expiresAt,
        notes: f.notes.trim() || null
      },
      sale?.id
    );
    setBusy(false);
    if (!res.ok) return setServerError(res.error);
    onSaved?.(res.data, editing ? 'updated' : 'created');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!busy}
      size="lg"
      title={editing ? `Editar venta N.º ${sale!.number}` : draft?.renewOf ? 'Renovar suscripción' : 'Registrar una venta'}
      description={editing ? 'Los cambios quedan guardados en el historial de la tienda.' : 'Anota la venta que acabas de cerrar por Telegram o WhatsApp.'}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={secondaryBtn}>
            Cancelar
          </button>
          <button type="submit" form="sale-form" disabled={busy} className={primaryBtn}>
            {busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar venta'}
          </button>
        </>
      }
    >
      <form id="sale-form" onSubmit={submit} noValidate className="space-y-4">
        {serverError && (
          <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">
            {serverError}
          </p>
        )}

        {ctx.isSuperAdmin && !editing && (
          <Field label="Tienda que vende">
            {(a) => (
              <select {...a} value={f.vendorId} onChange={(e) => set({ vendorId: e.target.value })} className={inputCls}>
                {ctx.vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        {editing && ctx.isSuperAdmin && <p className="text-xs text-zinc-400">Tienda: {vendorName(ctx.vendors, f.vendorId)}</p>}

        {/* Cliente */}
        <div className="space-y-2">
          <Field label="Cliente" required error={errors.customerText} hint="Escribe el nombre. Si ya lo tienes, elígelo de la lista; si no, se guardará como cliente nuevo.">
            {(a) => (
              <>
                <input
                  {...a}
                  list="sale-customers"
                  value={f.customerText}
                  onChange={(e) => set({ customerText: e.target.value })}
                  autoComplete="off"
                  maxLength={140}
                  placeholder="Ej.: Ana Pérez"
                  className={inputCls}
                />
                <datalist id="sale-customers">
                  {vendorCustomers.map((c) => (
                    <option key={c.id} value={labels.get(c.id)!} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
          {matched && (
            <p className="text-xs text-emerald-200">
              Cliente existente{matched.telegram ? ` · Telegram ${matched.telegram}` : ''}
              {matched.whatsapp ? ` · WhatsApp ${matched.whatsapp}` : ''}
            </p>
          )}
          {brandNew && !editing && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
              <label className="flex items-center gap-2 text-[13px] text-zinc-200">
                <input type="checkbox" checked={f.saveAsCustomer} onChange={(e) => set({ saveAsCustomer: e.target.checked })} className="h-4 w-4 accent-[#00ff88]" />
                Guardar “{f.customerText.trim()}” como cliente nuevo
              </label>
              {f.saveAsCustomer && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Telegram (opcional)">{(a) => <input {...a} value={f.newTelegram} onChange={(e) => set({ newTelegram: e.target.value })} maxLength={80} placeholder="@usuario" className={inputCls} />}</Field>
                  <Field label="WhatsApp (opcional)">{(a) => <input {...a} value={f.newWhatsapp} onChange={(e) => set({ newWhatsapp: e.target.value })} maxLength={30} inputMode="tel" placeholder="987 654 321" className={inputCls} />}</Field>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Producto y plan */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Producto" required error={errors.productId}>
            {(a) => (
              <select {...a} value={f.productId} onChange={(e) => onProduct(e.target.value)} className={inputCls}>
                <option value="">— Elegir producto —</option>
                {ctx.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
                <option value={OTHER}>Otro (escribirlo)</option>
              </select>
            )}
          </Field>
          {f.productId === OTHER ? (
            <Field label="Nombre del producto" required error={errors.productText}>
              {(a) => <input {...a} value={f.productText} onChange={(e) => set({ productText: e.target.value })} maxLength={160} className={inputCls} />}
            </Field>
          ) : plans.length > 0 ? (
            <Field label="Plan">
              {(a) => (
                <select {...a} value={f.plan} onChange={(e) => onPlan(e.target.value)} className={inputCls}>
                  <option value="">— Sin plan —</option>
                  {plans.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} · {p.price} / {p.period}
                    </option>
                  ))}
                  <option value={OTHER}>Otro (escribirlo)</option>
                </select>
              )}
            </Field>
          ) : (
            <Field label="Plan (opcional)">{(a) => <input {...a} value={f.plan === OTHER ? f.planText : f.plan} onChange={(e) => set({ plan: OTHER, planText: e.target.value })} maxLength={120} className={inputCls} />}</Field>
          )}
          {f.plan === OTHER && plans.length > 0 && (
            <Field label="Nombre del plan" className="sm:col-span-2">
              {(a) => <input {...a} value={f.planText} onChange={(e) => set({ planText: e.target.value })} maxLength={120} className={inputCls} />}
            </Field>
          )}
        </div>

        {/* Dinero */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Monto cobrado (S/)" required error={errors.amount}>
            {(a) => <input {...a} value={f.amount} onChange={(e) => set({ amount: e.target.value })} inputMode="decimal" placeholder="12.50" className={inputCls} />}
          </Field>
          <Field label="Método de pago">
            {(a) => (
              <select {...a} value={f.payment} onChange={(e) => set({ payment: e.target.value })} className={inputCls}>
                <option value="">— Sin indicar —</option>
                {payNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value={OTHER}>Otro (escribirlo)</option>
              </select>
            )}
          </Field>
          <Field label="Estado">
            {(a) => (
              <select {...a} value={f.status} onChange={(e) => set({ status: e.target.value as SaleStatus })} className={inputCls}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {f.payment === OTHER && (
            <Field label="Nombre del método de pago" className="sm:col-span-3">
              {(a) => <input {...a} value={f.paymentText} onChange={(e) => set({ paymentText: e.target.value })} maxLength={60} className={inputCls} />}
            </Field>
          )}
        </div>

        {/* Fechas */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Fecha de la venta" required error={errors.soldDay}>
            {(a) => <input {...a} type="date" value={f.soldDay} max={addDaysToDay(todayLima(), 1)} onChange={(e) => onSoldDay(e.target.value)} className={inputCls} />}
          </Field>
          <Field label="Duración (días)" error={errors.duration} hint="Vacío si no vence.">
            {(a) => <input {...a} value={f.duration} onChange={(e) => onDuration(e.target.value)} inputMode="numeric" placeholder="30" className={inputCls} />}
          </Field>
          <Field label="Vence el" error={errors.expiresDay} hint={f.expiresDay && isValidDay(f.expiresDay) ? formatDay(f.expiresDay) : 'Sin vencimiento'}>
            {(a) => <input {...a} type="date" value={f.expiresDay} onChange={(e) => set({ expiresDay: e.target.value })} className={inputCls} />}
          </Field>
        </div>

        <Field label="Notas (opcional)" error={errors.notes}>
          {(a) => <textarea {...a} value={f.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} maxLength={1000} placeholder="Ej.: perfil 3 de la cuenta, pidió factura…" className={`${inputCls} resize-y`} />}
        </Field>
        {!editing && f.amount && parseAmount(f.amount) !== null && (
          <p className="text-[13px] text-zinc-400">
            Se registrará una venta de <strong className="text-white">{money(parseAmount(f.amount)!)}</strong> como <strong className="text-white">{STATUS_LABEL[f.status].toLowerCase()}</strong>.
          </p>
        )}
      </form>
    </Dialog>
  );
};

// ---------------------------------------------------------------- nombres para la lista de clientes
/** Texto con el que aparece cada cliente en la lista; si hay dos con el mismo nombre se distinguen por su contacto. */
function customerLabels(list: Customer[]): Map<string, string> {
  const count = new Map<string, number>();
  list.forEach((c) => count.set(norm(c.name), (count.get(norm(c.name)) || 0) + 1));
  const out = new Map<string, string>();
  list.forEach((c) => {
    const dup = (count.get(norm(c.name)) || 0) > 1;
    out.set(c.id, dup ? `${c.name} · ${c.whatsapp || c.telegram || c.email || c.id.slice(0, 4)}` : c.name);
  });
  return out;
}
function customerLabelFor(list: Customer[], id: string | null | undefined): string {
  if (!id) return '';
  const c = list.find((x) => x.id === id);
  return c ? customerLabels(list.filter((x) => x.vendorId === c.vendorId)).get(c.id) || c.name : '';
}
