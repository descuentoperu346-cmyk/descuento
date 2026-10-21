import React, { useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, Download, Edit3, Plus, ReceiptText, RotateCcw, Repeat2, Search, Trash2 } from 'lucide-react';
import { Card, PageHeader, primaryBtn, secondaryBtn } from '../ui';
import { ConfirmDialog } from '../Dialog';
import { RowMenu, type MenuItem } from '../RowMenu';
import { inputCls } from '../fields';
import { deleteSale, saveSale, type SalesState } from '../../../lib/salesStore';
import {
  formatDay,
  inDayRange,
  limaDay,
  money,
  PERIOD_OPTIONS,
  resolvePeriod,
  STATUS_LABEL,
  subscriptionInfo,
  toCsv,
  todayLima,
  totals,
  type PeriodId,
  type Sale,
  type SaleStatus
} from '../../../lib/salesMath';
import { downloadText, SalesGate, saleToInput, scopeData, StatusChip, SubChip, vendorName, type SaleDraft, type SalesCtx, type SalesIntent } from './shared';
import { SaleDialog } from './SaleDialog';

interface SalesPageProps {
  ctx: SalesCtx;
  intent: SalesIntent;
  onIntentHandled: () => void;
}

const PAGE = 50;
const STATUS_FILTERS: { id: SaleStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'paid', label: 'Pagadas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'cancelled', label: 'Anuladas' },
  { id: 'refunded', label: 'Reembolsadas' }
];
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

type Pending = { kind: 'cancelled' | 'refunded' | 'delete'; sale: Sale } | null;

const Body: React.FC<SalesPageProps & { state: SalesState }> = ({ ctx, state, intent, onIntentHandled }) => {
  const { sales: scopedSales, customers } = useMemo(() => scopeData(state, ctx), [state, ctx.isSuperAdmin, ctx.currentVendor.id]);

  const [period, setPeriod] = useState<PeriodId>('30d');
  const [status, setStatus] = useState<SaleStatus | 'all'>('all');
  const [product, setProduct] = useState('all');
  const [payment, setPayment] = useState('all');
  const [vendor, setVendor] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const [dialog, setDialog] = useState<{ sale?: Sale | null; draft?: SaleDraft | null } | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Peticiones desde el buscador o el Resumen ("Registrar una venta")
  useEffect(() => {
    if (intent?.kind === 'new-sale') {
      setDialog({ sale: null, draft: intent.draft || null });
      onIntentHandled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent?.seq]);

  const earliest = useMemo(() => (scopedSales.length ? limaDay(scopedSales.reduce((a, s) => (s.soldAt < a ? s.soldAt : a), scopedSales[0].soldAt)) : undefined), [scopedSales]);
  const range = useMemo(() => resolvePeriod(period, Date.now(), earliest), [period, earliest]);

  const products = useMemo(() => [...new Set(scopedSales.map((s) => s.productTitle))].sort((a, b) => a.localeCompare(b, 'es')), [scopedSales]);
  const payments = useMemo(() => [...new Set(scopedSales.map((s) => s.paymentMethod).filter((p): p is string => !!p))].sort(), [scopedSales]);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    return scopedSales.filter(
      (s) =>
        (period === 'all' || inDayRange(s, range.fromDay, range.toDay)) &&
        (status === 'all' || s.status === status) &&
        (product === 'all' || s.productTitle === product) &&
        (payment === 'all' || s.paymentMethod === payment) &&
        (vendor === 'all' || s.vendorId === vendor) &&
        (!q || norm(`${s.number} ${s.customerName} ${s.productTitle} ${s.plan || ''} ${s.notes || ''}`).includes(q))
    );
  }, [scopedSales, period, range, status, product, payment, vendor, query]);
  useEffect(() => setLimit(PAGE), [period, status, product, payment, vendor, query]);

  const sum = useMemo(() => totals(rows), [rows]);
  const shown = rows.slice(0, limit);
  const now = Date.now();
  const filtersOn = status !== 'all' || product !== 'all' || payment !== 'all' || vendor !== 'all' || !!query;

  const exportCsv = () => {
    const head = ['N.º', 'Fecha', 'Cliente', 'Producto', 'Plan', 'Monto (S/)', 'Método de pago', 'Estado', 'Vence', 'Tienda', 'Notas'];
    const body = rows.map((s) => [s.number, limaDay(s.soldAt), s.customerName, s.productTitle, s.plan, s.amount.toFixed(2), s.paymentMethod, STATUS_LABEL[s.status], s.expiresAt ? limaDay(s.expiresAt) : '', vendorName(ctx.vendors, s.vendorId), s.notes]);
    downloadText(`ventas-${todayLima()}.csv`, toCsv([head, ...body]));
    ctx.onToast(`Se exportaron ${rows.length} ventas.`);
  };

  const quickStatus = async (s: Sale, next: SaleStatus) => {
    const res = await saveSale(saleToInput(s, { status: next }), s.id);
    ctx.onToast(res.ok ? `Venta N.º ${s.number}: ${STATUS_LABEL[next].toLowerCase()}.` : res.error);
  };

  const confirmAction = async () => {
    if (!pending) return;
    setBusy(true);
    setConfirmError('');
    const res = pending.kind === 'delete' ? await deleteSale(pending.sale.id) : await saveSale(saleToInput(pending.sale, { status: pending.kind }), pending.sale.id);
    setBusy(false);
    if (!res.ok) return setConfirmError(res.error);
    ctx.onToast(pending.kind === 'delete' ? `Venta N.º ${pending.sale.number} borrada.` : `Venta N.º ${pending.sale.number}: ${STATUS_LABEL[pending.kind].toLowerCase()}.`);
    setPending(null);
  };

  const renewDraft = (s: Sale): SaleDraft => ({
    vendorId: s.vendorId,
    customerId: s.customerId,
    customerName: s.customerName,
    productId: s.productId,
    productTitle: s.productTitle,
    plan: s.plan,
    amount: s.amount,
    paymentMethod: s.paymentMethod,
    durationDays: s.durationDays,
    renewOf: s
  });

  const menuFor = (s: Sale): MenuItem[] => [
    { label: 'Editar venta', icon: Edit3, onClick: () => setDialog({ sale: s }) },
    { label: 'Marcar como pagada', icon: CheckCircle2, hidden: s.status !== 'pending', onClick: () => void quickStatus(s, 'paid') },
    { label: 'Renovar', icon: Repeat2, hidden: s.status !== 'paid', onClick: () => setDialog({ sale: null, draft: renewDraft(s) }) },
    { label: 'Anular venta', icon: Ban, hidden: s.status !== 'paid' && s.status !== 'pending', onClick: () => setPending({ kind: 'cancelled', sale: s }) },
    { label: 'Reembolsar', icon: RotateCcw, hidden: s.status !== 'paid', onClick: () => setPending({ kind: 'refunded', sale: s }) },
    { label: 'Borrar definitivamente', icon: Trash2, danger: true, hidden: !ctx.isStaffAdmin, onClick: () => setPending({ kind: 'delete', sale: s }) }
  ];

  const subCell = (s: Sale) => {
    const info = subscriptionInfo(s, now);
    return info ? <SubChip info={info} /> : <span className="text-xs text-zinc-400">{s.status === 'paid' && !s.expiresAt ? 'No vence' : '—'}</span>;
  };

  const confirmCopy = pending && {
    cancelled: { title: `Anular la venta N.º ${pending.sale.number}`, label: 'Sí, anular', danger: true, text: 'La venta dejará de contar como ingreso y como suscripción activa. Queda en el historial como anulada.' },
    refunded: { title: `Reembolsar la venta N.º ${pending.sale.number}`, label: 'Sí, reembolsar', danger: true, text: 'La venta dejará de contar como ingreso. Recuerda devolver el dinero al cliente por tu método de pago.' },
    delete: { title: `Borrar la venta N.º ${pending.sale.number}`, label: 'Borrar para siempre', danger: true, text: 'Se elimina del historial y no se puede recuperar. Si solo fue un error, es mejor anularla.' }
  }[pending.kind];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Ventas"
        description={ctx.isSuperAdmin ? 'Todas las ventas registradas por el equipo' : `Ventas de ${ctx.currentVendor.name}`}
        actions={
          <>
            <button type="button" onClick={exportCsv} disabled={!rows.length} className={secondaryBtn}>
              <Download className="h-4 w-4" aria-hidden="true" /> Exportar CSV
            </button>
            <button type="button" onClick={() => setDialog({ sale: null })} className={primaryBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Registrar venta
            </button>
          </>
        }
      />

      {state.truncated && (
        <p role="status" className="rounded-lg border border-amber-400/40 bg-amber-400/5 px-3 py-2 text-[13px] text-amber-100">
          Se muestran las 5,000 ventas más recientes. Las anteriores siguen guardadas en la base.
        </p>
      )}

      {/* Filtros: una sola fila sobre todo lo que se ve debajo */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Período">
          {PERIOD_OPTIONS.filter((o) => o.id !== '90d' && o.id !== 'year').map((o) => {
            const on = period === o.id;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPeriod(o.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                  on ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Buscar ventas</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente, producto o N.º…" className={`${inputCls} pl-9`} />
          </label>
          <label>
            <span className="sr-only">Estado</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as SaleStatus | 'all')} className={inputCls}>
              {STATUS_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id === 'all' ? 'Todos los estados' : f.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Producto</span>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className={inputCls}>
              <option value="all">Todos los productos</option>
              {products.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Método de pago</span>
            <select value={payment} onChange={(e) => setPayment(e.target.value)} className={inputCls}>
              <option value="all">Todos los pagos</option>
              {payments.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          {ctx.isSuperAdmin ? (
            <label>
              <span className="sr-only">Tienda</span>
              <select value={vendor} onChange={(e) => setVendor(e.target.value)} className={inputCls}>
                <option value="all">Todas las tiendas</option>
                {ctx.vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span aria-hidden="true" className="hidden lg:block" />
          )}
        </div>
      </div>

      {/* Resumen de lo que se ve */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Ingresos', value: money(sum.revenue), sub: 'ventas pagadas' },
          { label: 'Ventas pagadas', value: String(sum.count), sub: `de ${rows.length} en la lista` },
          { label: 'Ticket promedio', value: money(sum.average), sub: 'por venta pagada' },
          { label: 'Pendiente de cobro', value: money(sum.pendingAmount), sub: `${sum.pendingCount} venta${sum.pendingCount === 1 ? '' : 's'} por cobrar` }
        ].map((t) => (
          <Card key={t.label} className="p-4">
            <dt className="text-[13px] text-zinc-400">{t.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">{t.value}</dd>
            <dd className="mt-0.5 text-xs text-zinc-400">{t.sub}</dd>
          </Card>
        ))}
      </dl>

      <Card>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <ReceiptText className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            {scopedSales.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-white">Todavía no hay ventas registradas</p>
                <p className="max-w-md text-[13px] text-zinc-400">Cuando cierres una venta por Telegram o WhatsApp, anótala aquí. Con eso el panel te muestra tus ingresos, tus clientes y quién está por vencer.</p>
                <button type="button" onClick={() => setDialog({ sale: null })} className={primaryBtn}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Registrar la primera venta
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-white">No hay ventas con estos filtros</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {period !== 'all' && (
                    <button type="button" onClick={() => setPeriod('all')} className={secondaryBtn}>
                      Ver todo el historial
                    </button>
                  )}
                  {filtersOn && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('all');
                        setProduct('all');
                        setPayment('all');
                        setVendor('all');
                        setQuery('');
                      }}
                      className={secondaryBtn}
                    >
                      Quitar filtros
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[13px]">
                <caption className="sr-only">Ventas registradas</caption>
                <thead className="border-b border-zinc-800/80 bg-white/[0.02] text-xs text-zinc-300">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">N.º</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Fecha</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Cliente</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Producto</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Monto</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Estado</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Vencimiento</th>
                    <th scope="col" className="px-3 py-2.5"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {shown.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 tabular-nums text-zinc-300">{s.number}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-300">{formatDay(s.soldAt)}</td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-white">{s.customerName}</p>
                        {ctx.isSuperAdmin && <p className="text-xs text-zinc-400">{vendorName(ctx.vendors, s.vendorId)}</p>}
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-zinc-100">{s.productTitle}</p>
                        <p className="text-xs text-zinc-400">
                          {[s.plan, s.paymentMethod].filter(Boolean).join(' · ') || '—'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-white">{money(s.amount)}</td>
                      <td className="px-3 py-2.5"><StatusChip status={s.status} /></td>
                      <td className="px-3 py-2.5">{subCell(s)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <RowMenu label={`Acciones de la venta N.º ${s.number}`} items={menuFor(s)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-zinc-800/60 md:hidden" aria-label="Ventas registradas">
              {shown.map((s) => (
                <li key={s.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{s.customerName}</p>
                      <p className="text-xs text-zinc-400">
                        N.º {s.number} · {formatDay(s.soldAt)}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-white">{money(s.amount)}</p>
                  </div>
                  <p className="text-[13px] text-zinc-200">
                    {s.productTitle}
                    {s.plan ? <span className="text-zinc-400"> · {s.plan}</span> : null}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip status={s.status} />
                    {subCell(s)}
                    <span className="ml-auto">
                      <RowMenu label={`Acciones de la venta N.º ${s.number}`} items={menuFor(s)} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 px-4 py-3 text-xs text-zinc-400">
              <span>
                Mostrando {shown.length} de {rows.length}
              </span>
              {rows.length > shown.length && (
                <button type="button" onClick={() => setLimit((l) => l + PAGE)} className={`${secondaryBtn} !py-1.5 !text-xs`}>
                  Mostrar {Math.min(PAGE, rows.length - shown.length)} más
                </button>
              )}
            </div>
          </>
        )}
      </Card>

      <SaleDialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        ctx={ctx}
        customers={state.customers}
        sale={dialog?.sale}
        draft={dialog?.draft}
        onSaved={(s, mode) => ctx.onToast(mode === 'created' ? `Venta N.º ${s.number} registrada.` : `Venta N.º ${s.number} actualizada.`)}
      />
      <ConfirmDialog
        open={!!pending}
        title={confirmCopy?.title || ''}
        message={confirmCopy?.text}
        confirmLabel={confirmCopy?.label || 'Confirmar'}
        danger={confirmCopy?.danger}
        busy={busy}
        error={confirmError}
        onConfirm={() => void confirmAction()}
        onCancel={() => {
          setPending(null);
          setConfirmError('');
        }}
      />
    </div>
  );
};

export const SalesPage: React.FC<SalesPageProps> = (props) => (
  <SalesGate ctx={props.ctx}>{(state) => <Body {...props} state={state} />}</SalesGate>
);
export default SalesPage;
