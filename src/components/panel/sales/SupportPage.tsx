import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleHelp, Clock, Database, LifeBuoy, Plus, RefreshCw, RotateCcw, Search, ShieldCheck, TriangleAlert, Undo2, Wrench, type LucideIcon } from 'lucide-react';
import { Card, PageHeader, StateNote, primaryBtn, secondaryBtn } from '../ui';
import { Dialog } from '../Dialog';
import { Field, inputCls } from '../fields';
import { ensureSalesLoaded, useSales } from '../../../lib/salesStore';
import { createCase, editCase, ensureSupportLoaded, setCaseStatus, useSupport } from '../../../lib/supportStore';
import {
  DESCRIPTION_MAX,
  KIND_LABEL,
  RESOLUTION_MAX,
  STATUS_LABEL,
  applySale,
  caseCounts,
  draftFromCase,
  emptyCaseDraft,
  hasCaseErrors,
  isOverdue,
  isPending,
  sortCases,
  validateCase,
  warrantyInfo,
  type CaseDraft,
  type CaseKind,
  type CaseStatus,
  type SupportCase
} from '../../../lib/supportLogic';
import { renderTemplate, TEMPLATES } from '../../../lib/messageTemplates';
import { formatDay, relativeDays, todayLima } from '../../../lib/salesMath';
import { ContactLinks, vendorName, type SalesCtx } from './shared';

const nf = new Intl.NumberFormat('es-PE');
type Filter = 'pending' | 'open' | 'in_progress' | 'resolved' | 'all';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'open', label: 'Abiertos' },
  { id: 'in_progress', label: 'En proceso' },
  { id: 'resolved', label: 'Resueltos' },
  { id: 'all', label: 'Todos' }
];
const KIND_ICON: Record<CaseKind, LucideIcon> = { problem: TriangleAlert, replacement: RotateCcw, refund: Undo2, question: CircleHelp };
const STATUS_STYLE: Record<CaseStatus, { icon: LucideIcon; cls: string }> = {
  open: { icon: Clock, cls: 'border-amber-400/40 bg-amber-400/10 text-amber-200' },
  in_progress: { icon: Wrench, cls: 'border-sky-400/40 bg-sky-400/10 text-sky-200' },
  resolved: { icon: CheckCircle2, cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' }
};
const Chip: React.FC<{ icon: LucideIcon; cls: string; children: React.ReactNode }> = ({ icon: Icon, cls, children }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}>
    <Icon className="h-3 w-3" aria-hidden="true" />
    {children}
  </span>
);

const Tile: React.FC<{ label: string; value: number; hint: string; tone?: 'bad' | 'plain' }> = ({ label, value, hint, tone = 'plain' }) => (
  <Card className="p-4">
    <p className="text-xs font-medium text-zinc-400">{label}</p>
    <p className={`mt-1 text-2xl font-bold tabular-nums ${tone === 'bad' && value > 0 ? 'text-rose-300' : 'text-white'}`}>{nf.format(value)}</p>
    <p className="mt-1 text-xs text-zinc-400">{hint}</p>
  </Card>
);

export const SupportPage: React.FC<{ ctx: SalesCtx }> = ({ ctx }) => {
  const support = useSupport();
  const sales = useSales();
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [vendor, setVendor] = useState('all');
  const [form, setForm] = useState<{ id: string | null; draft: CaseDraft } | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [resolving, setResolving] = useState<SupportCase | null>(null);
  const [resolution, setResolution] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    void ensureSupportLoaded();
    void ensureSalesLoaded();
  }, []);

  const now = Date.now();
  const mine = useMemo(() => {
    const scoped = ctx.isSuperAdmin ? support.cases : support.cases.filter((c) => c.vendorId === ctx.currentVendor.id);
    return vendor === 'all' || !ctx.isSuperAdmin ? scoped : scoped.filter((c) => c.vendorId === vendor);
  }, [support.cases, ctx.isSuperAdmin, ctx.currentVendor.id, vendor]);
  const counts = useMemo(() => caseCounts(mine, now), [mine]);
  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = mine.filter((c) => {
      if (filter === 'pending' ? !isPending(c) : filter !== 'all' && c.status !== filter) return false;
      return !term || `${c.customerName} ${c.productTitle || ''} ${c.description} ${c.number}`.toLowerCase().includes(term);
    });
    return sortCases(list, now);
  }, [mine, filter, search]);

  // ventas del equipo con las que se puede abrir un caso (las más recientes de la tienda)
  const saleOptions = useMemo(() => {
    if (sales.status !== 'ready' || !form) return [];
    const v = form.draft.vendorId;
    // La administración ve las ventas de todas las tiendas (al elegir una, el caso pasa a esa tienda)
    const pool = ctx.isSuperAdmin ? sales.sales : sales.sales.filter((s) => s.vendorId === v);
    return pool.filter((s) => s.status !== 'cancelled').slice(0, 150);
  }, [sales.status, sales.sales, form?.draft.vendorId, ctx.isSuperAdmin]);
  const customerOptions = useMemo(() => (sales.status === 'ready' && form ? sales.customers.filter((c) => c.vendorId === form.draft.vendorId) : []), [sales.status, sales.customers, form?.draft.vendorId]);

  const openNew = () => {
    setShowErrors(false);
    setDialogError('');
    setForm({ id: null, draft: emptyCaseDraft(ctx.currentVendor.id) });
  };
  const openEdit = (c: SupportCase) => {
    setShowErrors(false);
    setDialogError('');
    setForm({ id: c.id, draft: draftFromCase(c) });
  };
  const setDraft = (patch: Partial<CaseDraft>) => setForm((f) => (f ? { ...f, draft: { ...f.draft, ...patch } } : f));

  const errors = form ? validateCase(form.draft, now) : {};
  // al editar un caso que ya tenía fecha límite pasada, no se vuelve a exigir una fecha futura
  const editingOldDue = form?.id ? support.cases.find((c) => c.id === form.id)?.dueAt : null;
  if (editingOldDue && form && errors.dueDay && form.draft.dueDay === draftFromCase(support.cases.find((c) => c.id === form.id)!).dueDay) delete errors.dueDay;

  const submit = async () => {
    if (!form) return;
    setShowErrors(true);
    if (hasCaseErrors(errors)) return;
    setBusy(true);
    setDialogError('');
    const res = form.id ? await editCase(form.id, form.draft) : await createCase(form.draft);
    setBusy(false);
    if (!res.ok) {
      setDialogError(res.error || 'No se pudo guardar.');
      return;
    }
    ctx.onToast(form.id ? 'Caso actualizado.' : 'Caso creado.');
    setForm(null);
  };

  const changeStatus = async (c: SupportCase, status: CaseStatus) => {
    setRowBusy(c.id);
    setRowError(null);
    const res = await setCaseStatus(c.id, status);
    setRowBusy(null);
    if (!res.ok) setRowError({ id: c.id, message: res.error || 'No se pudo guardar.' });
    else ctx.onToast(status === 'in_progress' ? `Caso #${c.number} en proceso.` : `Caso #${c.number} reabierto.`);
  };
  const confirmResolve = async () => {
    if (!resolving) return;
    if (resolution.trim().length > RESOLUTION_MAX) {
      setDialogError(`Máximo ${RESOLUTION_MAX} letras.`);
      return;
    }
    setBusy(true);
    setDialogError('');
    const res = await setCaseStatus(resolving.id, 'resolved', resolution);
    setBusy(false);
    if (!res.ok) {
      setDialogError(res.error || 'No se pudo guardar.');
      return;
    }
    ctx.onToast(`Caso #${resolving.number} resuelto.`);
    setResolving(null);
  };

  const header = (
    <PageHeader
      title="Garantías y soporte"
      description="Lleva el control de cada reclamo o consulta: qué pasó, de qué venta, y si ya se resolvió."
      actions={
        support.status === 'ready' ? (
          <button type="button" onClick={openNew} className={primaryBtn}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo caso
          </button>
        ) : undefined
      }
    />
  );

  if (support.status === 'idle' || (support.status === 'loading' && support.cases.length === 0)) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        {header}
        <div className="py-16 text-center text-sm text-zinc-400" role="status" aria-busy="true">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" aria-hidden="true" />
          Cargando los casos…
        </div>
      </div>
    );
  }
  if (support.status === 'missing') {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        {header}
        <StateNote
          icon={Database}
          tone="amber"
          title="Falta activar garantías y soporte"
          action={
            <button type="button" onClick={() => void ensureSupportLoaded(true)} className={`${secondaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Comprobar de nuevo
            </button>
          }
        >
          {ctx.isStaffAdmin ? (
            <>
              <p>Esta parte todavía no existe en tu base de datos. Se activa una sola vez (necesita que ya hayas ejecutado el paso de ventas):</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>
                  Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.
                </li>
                <li>
                  Pega todo el archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/12-garantias-y-soporte.sql</code> y pulsa <strong className="text-white">Run</strong>.
                </li>
                <li>Vuelve aquí y pulsa “Comprobar de nuevo”.</li>
              </ol>
            </>
          ) : (
            <p>Pídele al administrador de la web que active garantías y soporte.</p>
          )}
        </StateNote>
      </div>
    );
  }
  if (support.status === 'error') {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        {header}
        <StateNote
          icon={TriangleAlert}
          tone="rose"
          title="No se pudieron cargar los casos"
          action={
            <button type="button" onClick={() => void ensureSupportLoaded(true)} className={`${primaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Intentar de nuevo
            </button>
          }
        >
          <p role="alert">{support.error}</p>
        </StateNote>
      </div>
    );
  }

  const countOf = (f: Filter) => (f === 'pending' ? counts.pending : f === 'open' ? counts.open : f === 'in_progress' ? counts.inProgress : f === 'resolved' ? mine.filter((c) => c.status === 'resolved').length : mine.length);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {header}

      <section aria-label="Resumen de casos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Abiertos" value={counts.open} hint="Todavía sin atender" />
        <Tile label="En proceso" value={counts.inProgress} hint="Ya los estás atendiendo" />
        <Tile label="Con plazo vencido" value={counts.overdue} hint="Pasó la fecha límite" tone="bad" />
        <Tile label="Resueltos" value={counts.resolvedRecent} hint="En los últimos 30 días" />
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                filter === f.id ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500'
              }`}
            >
              {f.label} <span className="tabular-nums text-zinc-400">{countOf(f.id)}</span>
            </button>
          ))}
        </div>
        {ctx.isSuperAdmin && (
          <>
            <label className="sr-only" htmlFor="sup-tienda">
              Tienda
            </label>
            <select id="sup-tienda" value={vendor} onChange={(e) => setVendor(e.target.value)} className={`${inputCls} max-w-[15rem] cursor-pointer`}>
              <option value="all">Todas las tiendas</option>
              {ctx.vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </>
        )}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente o producto" aria-label="Buscar casos" className={`${inputCls} pl-9`} />
        </div>
      </div>

      {shown.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <LifeBuoy className="h-8 w-8 text-zinc-500" aria-hidden="true" />
          <p className="text-base font-semibold text-white">{mine.length === 0 ? 'Todavía no hay casos' : 'No hay casos con ese filtro'}</p>
          <p className="max-w-md text-sm text-zinc-400">
            {mine.length === 0 ? 'Cuando un cliente reporte un problema o pida la garantía, anótalo aquí con “Nuevo caso” para no olvidarlo.' : 'Prueba con otro estado o con otra palabra.'}
          </p>
        </Card>
      ) : (
        <ul className="space-y-3" aria-label="Casos de soporte">
          {shown.map((c) => {
            const KindIcon = KIND_ICON[c.kind];
            const st = STATUS_STYLE[c.status];
            const w = warrantyInfo(c, now);
            const overdue = isOverdue(c, now);
            const customer = c.customerId && sales.status === 'ready' ? sales.customers.find((x) => x.id === c.customerId) : null;
            // Mensaje de "recibimos tu reporte" con los datos del caso, para avisar al cliente con un clic
            const reply = renderTemplate(TEMPLATES.find((t) => t.id === 'garantia-recibida')!.text, {
              cliente: c.customerName.trim().split(/\s+/)[0],
              producto: c.productTitle || 'tu producto',
              tienda: vendorName(ctx.vendors, c.vendorId)
            }).text;
            const busyRow = rowBusy === c.id;
            return (
              <li key={c.id}>
                <Card className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-white">Caso #{c.number}</span>
                    <Chip icon={st.icon} cls={st.cls}>
                      {STATUS_LABEL[c.status]}
                    </Chip>
                    <Chip icon={KindIcon} cls="border-zinc-700 bg-zinc-900 text-zinc-200">
                      {KIND_LABEL[c.kind]}
                    </Chip>
                    {overdue && (
                      <Chip icon={TriangleAlert} cls="border-rose-400/40 bg-rose-500/10 text-rose-200">
                        Plazo vencido
                      </Chip>
                    )}
                    {ctx.isSuperAdmin && <span className="text-xs text-zinc-400">{vendorName(ctx.vendors, c.vendorId)}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {c.customerName}
                      {c.productTitle && <span className="font-normal text-zinc-300"> · {c.productTitle}</span>}
                    </p>
                    <p className="mt-1 whitespace-pre-line break-words text-[13px] text-zinc-300">{c.description}</p>
                    {c.resolution && (
                      <p className="mt-2 whitespace-pre-line break-words rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[13px] text-emerald-100">
                        <span className="font-semibold">Cómo se resolvió:</span> {c.resolution}
                      </p>
                    )}
                  </div>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                    <span>Abierto el {formatDay(c.createdAt)}</span>
                    {c.resolvedAt && <span>Resuelto el {formatDay(c.resolvedAt)}</span>}
                    {c.dueAt && isPending(c) && <span className={overdue ? 'font-semibold text-rose-200' : ''}>Responder antes del {formatDay(c.dueAt)}</span>}
                    {w.state === 'active' && (
                      <span className="inline-flex items-center gap-1 text-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Garantía vigente · vence {relativeDays(w.days)} ({formatDay(c.warrantyUntil)})
                      </span>
                    )}
                    {w.state === 'expired' && (
                      <span className="inline-flex items-center gap-1 text-amber-200">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Garantía vencida hace {w.days} día{w.days === 1 ? '' : 's'}
                      </span>
                    )}
                  </p>
                  {rowError?.id === c.id && (
                    <p role="alert" className="text-xs text-rose-300">
                      {rowError.message}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {c.status === 'open' && (
                      <button type="button" disabled={busyRow} onClick={() => void changeStatus(c, 'in_progress')} aria-label={`Atender el caso ${c.number}`} className={secondaryBtn}>
                        <Wrench className="h-4 w-4" aria-hidden="true" /> Atender
                      </button>
                    )}
                    {isPending(c) && (
                      <button
                        type="button"
                        disabled={busyRow}
                        onClick={() => {
                          setResolution(c.resolution || '');
                          setDialogError('');
                          setResolving(c);
                        }}
                        aria-label={`Resolver el caso ${c.number}`}
                        className={primaryBtn}
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Resolver
                      </button>
                    )}
                    {c.status === 'resolved' && (
                      <button type="button" disabled={busyRow} onClick={() => void changeStatus(c, 'open')} aria-label={`Reabrir el caso ${c.number}`} className={secondaryBtn}>
                        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reabrir
                      </button>
                    )}
                    <button type="button" disabled={busyRow} onClick={() => openEdit(c)} aria-label={`Editar el caso ${c.number}`} className={secondaryBtn}>
                      Editar
                    </button>
                    {customer && isPending(c) && (
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-zinc-400">
                        Avisar al cliente: <ContactLinks customer={customer} text={reply} />
                      </span>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* Nuevo caso / editar caso */}
      <Dialog
        open={form !== null}
        onClose={() => !busy && setForm(null)}
        title={form?.id ? 'Editar caso' : 'Nuevo caso'}
        description="Anota lo que reportó el cliente. Si eliges la venta, el cliente, el producto y la garantía se llenan solos."
        size="lg"
        dismissible={!busy}
        footer={
          <>
            <button type="button" onClick={() => setForm(null)} disabled={busy} className={secondaryBtn}>
              Cancelar
            </button>
            <button type="button" onClick={() => void submit()} disabled={busy} className={primaryBtn}>
              {busy ? 'Guardando…' : form?.id ? 'Guardar cambios' : 'Crear caso'}
            </button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            {ctx.isSuperAdmin && !form.id && !form.draft.saleId && (
              <Field label="Tienda">
                {(a) => (
                  <select {...a} value={form.draft.vendorId} onChange={(e) => setDraft({ vendorId: e.target.value, customerId: null })} className={`${inputCls} cursor-pointer`}>
                    {ctx.vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}
            {sales.status === 'ready' && (
              <Field label="Venta relacionada (opcional)" hint="Sirve para saber si la garantía sigue vigente.">
                {(a) => (
                  <select
                    {...a}
                    value={form.draft.saleId || ''}
                    onChange={(e) => {
                      const s = saleOptions.find((x) => x.id === e.target.value);
                      if (s) setDraft(applySale(form.draft, s));
                      else setDraft({ saleId: null, warrantyUntil: null });
                    }}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="">Sin venta (escribo los datos)</option>
                    {saleOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        #{s.number} · {s.customerName} · {s.productTitle} · {formatDay(s.soldAt)}
                        {ctx.isSuperAdmin ? ` · ${vendorName(ctx.vendors, s.vendorId)}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" required error={showErrors ? errors.customerName : undefined}>
                {(a) => (
                  <>
                    <input
                      {...a}
                      list="sup-clientes"
                      value={form.draft.customerName}
                      maxLength={120}
                      onChange={(e) => {
                        const match = customerOptions.find((c) => c.name.toLowerCase() === e.target.value.trim().toLowerCase());
                        setDraft({ customerName: e.target.value, customerId: match ? match.id : form.draft.saleId ? form.draft.customerId : null });
                      }}
                      className={inputCls}
                    />
                    <datalist id="sup-clientes">
                      {customerOptions.slice(0, 200).map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </>
                )}
              </Field>
              <Field label="Producto">
                {(a) => <input {...a} value={form.draft.productTitle} maxLength={160} onChange={(e) => setDraft({ productTitle: e.target.value })} className={inputCls} />}
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Qué necesita">
                {(a) => (
                  <select {...a} value={form.draft.kind} onChange={(e) => setDraft({ kind: e.target.value as CaseKind })} className={`${inputCls} cursor-pointer`}>
                    {(Object.keys(KIND_LABEL) as CaseKind[]).map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Responder antes del (opcional)" error={showErrors ? errors.dueDay : undefined}>
                {(a) => <input {...a} type="date" min={todayLima()} value={form.draft.dueDay} onChange={(e) => setDraft({ dueDay: e.target.value })} className={inputCls} />}
              </Field>
            </div>
            <Field label="Qué pasó" required error={showErrors ? errors.description : undefined}>
              {(a) => (
                <>
                  <textarea {...a} rows={4} value={form.draft.description} onChange={(e) => setDraft({ description: e.target.value })} className={inputCls} />
                  <p className={`mt-1 text-right text-xs tabular-nums ${form.draft.description.trim().length > DESCRIPTION_MAX ? 'text-rose-300' : 'text-zinc-400'}`}>
                    {form.draft.description.trim().length}/{DESCRIPTION_MAX}
                  </p>
                </>
              )}
            </Field>
            {dialogError && (
              <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">
                {dialogError}
              </p>
            )}
          </div>
        )}
      </Dialog>

      {/* Resolver */}
      <Dialog
        open={resolving !== null}
        onClose={() => !busy && setResolving(null)}
        title={resolving ? `Resolver el caso #${resolving.number}` : 'Resolver caso'}
        description="Escribe cómo lo resolviste para que quede el registro (por ejemplo: “Se repuso la cuenta el 12/11”)."
        dismissible={!busy}
        footer={
          <>
            <button type="button" onClick={() => setResolving(null)} disabled={busy} className={secondaryBtn}>
              Cancelar
            </button>
            <button type="button" onClick={() => void confirmResolve()} disabled={busy} className={primaryBtn}>
              {busy ? 'Guardando…' : 'Marcar como resuelto'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Cómo se resolvió (opcional)">
            {(a) => (
              <>
                <textarea {...a} rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)} className={inputCls} />
                <p className={`mt-1 text-right text-xs tabular-nums ${resolution.trim().length > RESOLUTION_MAX ? 'text-rose-300' : 'text-zinc-400'}`}>
                  {resolution.trim().length}/{RESOLUTION_MAX}
                </p>
              </>
            )}
          </Field>
          {dialogError && (
            <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">
              {dialogError}
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default SupportPage;
