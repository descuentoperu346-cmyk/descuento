import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2, UsersRound } from 'lucide-react';
import { Card, PageHeader, primaryBtn, secondaryBtn } from '../ui';
import { ConfirmDialog, Dialog } from '../Dialog';
import { Field, inputCls } from '../fields';
import { deleteCustomer, saveCustomer, type SalesState } from '../../../lib/salesStore';
import {
  customerStats,
  formatDay,
  money,
  subscriptionInfo,
  telegramHandle,
  whatsappDigits,
  type Customer,
  type CustomerStats,
  type Sale
} from '../../../lib/salesMath';
import { ContactLinks, SalesGate, scopeData, StatusChip, SubChip, vendorName, type SaleDraft, type SalesCtx, type SalesIntent } from './shared';
import { SaleDialog } from './SaleDialog';

interface CustomersPageProps {
  ctx: SalesCtx;
  intent: SalesIntent;
  onIntentHandled: () => void;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Sort = 'name' | 'spent' | 'recent';
type Filter = 'all' | 'active' | 'none';

// ---------------------------------------------------------------- formulario de cliente
const CustomerDialog: React.FC<{ open: boolean; onClose: () => void; ctx: SalesCtx; customer?: Customer | null; onSaved: (c: Customer, created: boolean) => void }> = ({ open, onClose, ctx, customer, onSaved }) => {
  const [f, setF] = useState({ vendorId: '', name: '', telegram: '', whatsapp: '', email: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setServerError('');
    setBusy(false);
    setF(
      customer
        ? { vendorId: customer.vendorId, name: customer.name, telegram: customer.telegram || '', whatsapp: customer.whatsapp || '', email: customer.email || '', notes: customer.notes || '' }
        : { vendorId: ctx.currentVendor.id, name: '', telegram: '', whatsapp: '', email: '', notes: '' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const er: Record<string, string> = {};
    if (!f.name.trim()) er.name = 'Escribe el nombre del cliente.';
    if (f.telegram.trim() && !telegramHandle(f.telegram)) er.telegram = 'Escribe el usuario así: @usuario (4 a 32 letras, números o guion bajo).';
    if (f.whatsapp.trim() && !whatsappDigits(f.whatsapp)) er.whatsapp = 'Escribe el número con sus 9 dígitos (o con el código de país).';
    if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) er.email = 'Escribe un correo válido.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setServerError('');
    const res = await saveCustomer(
      { vendorId: f.vendorId, name: f.name, telegram: f.telegram.trim() ? `@${telegramHandle(f.telegram)}` : null, whatsapp: f.whatsapp.trim() || null, email: f.email.trim() || null, notes: f.notes.trim() || null },
      customer?.id
    );
    setBusy(false);
    if (!res.ok) return setServerError(res.error);
    onSaved(res.data, !customer);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={customer ? 'Editar cliente' : 'Nuevo cliente'}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={secondaryBtn}>
            Cancelar
          </button>
          <button type="submit" form="customer-form" disabled={busy} className={primaryBtn}>
            {busy ? 'Guardando…' : 'Guardar cliente'}
          </button>
        </>
      }
    >
      <form id="customer-form" onSubmit={submit} noValidate className="space-y-4">
        {serverError && (
          <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">
            {serverError}
          </p>
        )}
        {ctx.isSuperAdmin && !customer && (
          <Field label="Tienda del cliente">
            {(a) => (
              <select {...a} value={f.vendorId} onChange={(e) => setF({ ...f, vendorId: e.target.value })} className={inputCls}>
                {ctx.vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        <Field label="Nombre" required error={errors.name}>
          {(a) => <input {...a} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={120} autoComplete="off" className={inputCls} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telegram" error={errors.telegram}>
            {(a) => <input {...a} value={f.telegram} onChange={(e) => setF({ ...f, telegram: e.target.value })} maxLength={80} placeholder="@usuario" autoComplete="off" className={inputCls} />}
          </Field>
          <Field label="WhatsApp" error={errors.whatsapp}>
            {(a) => <input {...a} value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} maxLength={30} inputMode="tel" placeholder="987 654 321" autoComplete="off" className={inputCls} />}
          </Field>
        </div>
        <Field label="Correo (opcional)" error={errors.email}>
          {(a) => <input {...a} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={160} autoComplete="off" className={inputCls} />}
        </Field>
        <Field label="Notas (opcional)" hint="Solo las ve tu equipo.">
          {(a) => <textarea {...a} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={3} maxLength={1000} className={`${inputCls} resize-y`} />}
        </Field>
      </form>
    </Dialog>
  );
};

// ---------------------------------------------------------------- pantalla
const Body: React.FC<CustomersPageProps & { state: SalesState }> = ({ ctx, state, intent, onIntentHandled }) => {
  const { sales, customers } = useMemo(() => scopeData(state, ctx), [state, ctx.isSuperAdmin, ctx.currentVendor.id]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('name');
  const [filter, setFilter] = useState<Filter>('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ customer: Customer | null } | null>(null);
  const [saleFor, setSaleFor] = useState<SaleDraft | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);
  const [delError, setDelError] = useState('');

  useEffect(() => {
    if (intent?.kind === 'customer') {
      setDetailId(intent.id);
      onIntentHandled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent?.seq]);

  const now = Date.now();
  const stats = useMemo(() => {
    const m = new Map<string, CustomerStats>();
    customers.forEach((c) => m.set(c.id, customerStats(c, sales, now)));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, sales]);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    const list = customers.filter((c) => {
      const st = stats.get(c.id)!;
      if (filter === 'active' && st.activeSubs === 0) return false;
      if (filter === 'none' && st.purchases > 0) return false;
      return !q || norm(`${c.name} ${c.telegram || ''} ${c.whatsapp || ''} ${c.email || ''}`).includes(q);
    });
    return [...list].sort((a, b) => {
      const sa = stats.get(a.id)!;
      const sb = stats.get(b.id)!;
      if (sort === 'spent') return sb.spent - sa.spent || a.name.localeCompare(b.name, 'es');
      if (sort === 'recent') return (sb.lastPurchase || '').localeCompare(sa.lastPurchase || '') || a.name.localeCompare(b.name, 'es');
      return a.name.localeCompare(b.name, 'es');
    });
  }, [customers, stats, query, sort, filter]);

  const detail = detailId ? customers.find((c) => c.id === detailId) || null : null;
  const detailSales = useMemo(
    () => (detail ? sales.filter((s) => (s.customerId ? s.customerId === detail.id : norm(s.customerName) === norm(detail.name))) : []),
    [detail, sales]
  );

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    setDelError('');
    const res = await deleteCustomer(deleting.id);
    setBusy(false);
    if (!res.ok) return setDelError(res.error);
    ctx.onToast(`Cliente “${deleting.name}” borrado. Sus ventas se conservan en el historial.`);
    setDeleting(null);
    setDetailId(null);
  };

  const totalSpent = rows.reduce((a, c) => a + stats.get(c.id)!.spent, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Clientes"
        description={`${customers.length} cliente${customers.length === 1 ? '' : 's'} · ${money(customers.reduce((a, c) => a + stats.get(c.id)!.spent, 0))} comprados en total`}
        actions={
          <button type="button" onClick={() => setEditing({ customer: null })} className={primaryBtn}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo cliente
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar clientes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, Telegram, WhatsApp o correo…" className={`${inputCls} pl-9`} />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar clientes">
          {([['all', 'Todos'], ['active', 'Con suscripción activa'], ['none', 'Sin compras']] as [Filter, string][]).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                filter === id ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="sr-only sm:not-sr-only">Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${inputCls} sm:w-auto`}>
            <option value="name">Por nombre</option>
            <option value="spent">Quien más compró</option>
            <option value="recent">Compra más reciente</option>
          </select>
        </label>
      </div>

      <Card>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <UsersRound className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            {customers.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-white">Todavía no tienes clientes guardados</p>
                <p className="max-w-md text-[13px] text-zinc-400">Se crean solos cuando registras una venta, o puedes agregarlos tú aquí con su Telegram o WhatsApp.</p>
                <button type="button" onClick={() => setEditing({ customer: null })} className={primaryBtn}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo cliente
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-white">Ningún cliente coincide</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                  className={secondaryBtn}
                >
                  Quitar filtros
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[13px]">
                <caption className="sr-only">Lista de clientes con sus compras</caption>
                <thead className="border-b border-zinc-800/80 bg-white/[0.02] text-xs text-zinc-300">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Cliente</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Contacto</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Compras</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Total comprado</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Última compra</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Activas</th>
                    <th scope="col" className="px-3 py-2.5"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {rows.map((c) => {
                    const st = stats.get(c.id)!;
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5">
                          <button type="button" onClick={() => setDetailId(c.id)} className="text-left font-semibold text-white underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-300">
                            {c.name}
                          </button>
                          {ctx.isSuperAdmin && <p className="text-xs text-zinc-400">{vendorName(ctx.vendors, c.vendorId)}</p>}
                        </td>
                        <td className="px-3 py-2.5"><ContactLinks customer={c} /></td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-200">{st.purchases}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-white">{money(st.spent)}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-zinc-300">{st.lastPurchase ? formatDay(st.lastPurchase) : '—'}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-zinc-200">{st.activeSubs}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button type="button" onClick={() => setEditing({ customer: c })} aria-label={`Editar ${c.name}`} title="Editar" className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-zinc-800/60 md:hidden" aria-label="Lista de clientes">
              {rows.map((c) => {
                const st = stats.get(c.id)!;
                return (
                  <li key={c.id} className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => setDetailId(c.id)} className="text-left font-semibold text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
                        {c.name}
                      </button>
                      <p className="shrink-0 font-semibold tabular-nums text-white">{money(st.spent)}</p>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {st.purchases} compra{st.purchases === 1 ? '' : 's'} · {st.activeSubs} activa{st.activeSubs === 1 ? '' : 's'}
                      {st.lastPurchase ? ` · última ${formatDay(st.lastPurchase)}` : ''}
                    </p>
                    <ContactLinks customer={c} />
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-zinc-800/80 px-4 py-3 text-xs text-zinc-400">
              {rows.length} de {customers.length} clientes · {money(totalSpent)} comprados por los que se ven
            </div>
          </>
        )}
      </Card>

      {/* Ficha del cliente */}
      <Dialog
        open={!!detail}
        onClose={() => setDetailId(null)}
        size="xl"
        title={detail?.name || ''}
        description={detail ? `Cliente de ${vendorName(ctx.vendors, detail.vendorId)} desde ${formatDay(detail.createdAt)}` : undefined}
        footer={
          detail && (
            <>
              {ctx.isStaffAdmin && (
                <button type="button" onClick={() => setDeleting(detail)} className="mr-auto inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] font-semibold text-rose-200 hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-rose-300">
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Borrar cliente
                </button>
              )}
              <button type="button" onClick={() => setEditing({ customer: detail })} className={secondaryBtn}>
                <Edit3 className="h-4 w-4" aria-hidden="true" /> Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaleFor({ vendorId: detail.vendorId, customerId: detail.id, customerName: detail.name });
                  setDetailId(null);
                }}
                className={primaryBtn}
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Registrar venta
              </button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-5">
            <dl className="grid gap-4 text-[13px] sm:grid-cols-3">
              <div>
                <dt className="text-xs text-zinc-400">Contacto</dt>
                <dd className="mt-1"><ContactLinks customer={detail} /></dd>
                {detail.email && <dd className="mt-1 text-zinc-300">{detail.email}</dd>}
                {detail.telegram && <dd className="mt-1 text-zinc-300">Telegram: {detail.telegram}</dd>}
                {detail.whatsapp && <dd className="mt-1 text-zinc-300">WhatsApp: {detail.whatsapp}</dd>}
              </div>
              <div>
                <dt className="text-xs text-zinc-400">Compras</dt>
                <dd className="mt-1 text-2xl font-semibold text-white">{stats.get(detail.id)?.purchases ?? 0}</dd>
                <dd className="text-xs text-zinc-400">{money(stats.get(detail.id)?.spent ?? 0)} en total</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">Suscripciones activas</dt>
                <dd className="mt-1 text-2xl font-semibold text-white">{stats.get(detail.id)?.activeSubs ?? 0}</dd>
                <dd className="text-xs text-zinc-400">{stats.get(detail.id)?.lastPurchase ? `Última compra: ${formatDay(stats.get(detail.id)!.lastPurchase)}` : 'Sin compras todavía'}</dd>
              </div>
            </dl>
            {detail.notes && (
              <div>
                <p className="text-xs text-zinc-400">Notas</p>
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-zinc-200">{detail.notes}</p>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-white">Historial de compras</h3>
              {detailSales.length === 0 ? (
                <p className="text-[13px] text-zinc-400">Todavía no hay ventas para este cliente.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-zinc-800">
                  <table className="w-full text-left text-[13px]">
                    <caption className="sr-only">Compras de {detail.name}</caption>
                    <thead className="bg-white/[0.02] text-xs text-zinc-300">
                      <tr>
                        <th scope="col" className="px-3 py-2 font-medium">N.º</th>
                        <th scope="col" className="px-3 py-2 font-medium">Fecha</th>
                        <th scope="col" className="px-3 py-2 font-medium">Producto</th>
                        <th scope="col" className="px-3 py-2 text-right font-medium">Monto</th>
                        <th scope="col" className="px-3 py-2 font-medium">Estado</th>
                        <th scope="col" className="px-3 py-2 font-medium">Vencimiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {detailSales.map((s: Sale) => {
                        const info = subscriptionInfo(s, now);
                        return (
                          <tr key={s.id}>
                            <td className="px-3 py-2 tabular-nums text-zinc-300">{s.number}</td>
                            <td className="whitespace-nowrap px-3 py-2 text-zinc-300">{formatDay(s.soldAt)}</td>
                            <td className="px-3 py-2 text-zinc-100">
                              {s.productTitle}
                              {s.plan ? <span className="text-zinc-400"> · {s.plan}</span> : null}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-white">{money(s.amount)}</td>
                            <td className="px-3 py-2"><StatusChip status={s.status} /></td>
                            <td className="px-3 py-2">{info ? <SubChip info={info} /> : <span className="text-xs text-zinc-400">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <CustomerDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        ctx={ctx}
        customer={editing?.customer}
        onSaved={(c, created) => ctx.onToast(created ? `Cliente “${c.name}” guardado.` : `Cliente “${c.name}” actualizado.`)}
      />
      <SaleDialog open={!!saleFor} onClose={() => setSaleFor(null)} ctx={ctx} customers={state.customers} draft={saleFor} onSaved={(s) => ctx.onToast(`Venta N.º ${s.number} registrada.`)} />
      <ConfirmDialog
        open={!!deleting}
        title={`Borrar a ${deleting?.name || ''}`}
        message={<>Se borra la ficha del cliente. Sus ventas <strong className="text-white">se conservan</strong> en el historial con su nombre, pero ya no quedan unidas a una ficha.</>}
        confirmLabel="Borrar cliente"
        danger
        busy={busy}
        error={delError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          setDeleting(null);
          setDelError('');
        }}
      />
    </div>
  );
};

export const CustomersPage: React.FC<CustomersPageProps> = (props) => <SalesGate ctx={props.ctx}>{(state) => <Body {...props} state={state} />}</SalesGate>;
export default CustomersPage;
