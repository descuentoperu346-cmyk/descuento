import React, { useMemo, useState } from 'react';
import { BellRing, ClipboardCopy, Repeat2, Search } from 'lucide-react';
import { Card, PageHeader, primaryBtn, secondaryBtn } from '../ui';
import { inputCls } from '../fields';
import type { SalesState } from '../../../lib/salesStore';
import {
  EXPIRING_DAYS,
  formatDay,
  latestSubscriptions,
  money,
  reminderText,
  round2,
  subscriptionInfo,
  type Customer,
  type Sale,
  type SubInfo
} from '../../../lib/salesMath';
import { copyText } from '../../../lib/clipboard';
import { ContactLinks, SalesGate, scopeData, SubChip, vendorName, type SaleDraft, type SalesCtx } from './shared';
import { SaleDialog } from './SaleDialog';

type Tab = 'expiring' | 'expired' | 'upcoming' | 'all';
interface Item {
  sale: Sale;
  info: SubInfo;
  customer: Customer | null;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
const UPCOMING_DAYS = 30;

const Body: React.FC<{ ctx: SalesCtx; state: SalesState }> = ({ ctx, state }) => {
  const { sales, customers } = useMemo(() => scopeData(state, ctx), [state, ctx.isSuperAdmin, ctx.currentVendor.id]);
  const [tab, setTab] = useState<Tab>('expiring');
  const [query, setQuery] = useState('');
  const [expiredDays, setExpiredDays] = useState(60);
  const [vendor, setVendor] = useState('all');
  const [draft, setDraft] = useState<SaleDraft | null>(null);
  const now = Date.now();

  const items = useMemo<Item[]>(() => {
    const byId = new Map(customers.map((c) => [c.id, c]));
    return latestSubscriptions(sales)
      .map((sale) => ({ sale, info: subscriptionInfo(sale, now)!, customer: sale.customerId ? byId.get(sale.customerId) || null : null }))
      .filter((x) => x.info);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, customers]);

  const expiring = items.filter((i) => i.info.state === 'expiring');
  const expired = items.filter((i) => i.info.state === 'expired');
  const expiredShown = expired.filter((i) => expiredDays === 0 || -i.info.daysLeft <= expiredDays);
  const upcoming = items.filter((i) => i.info.state === 'active' && i.info.daysLeft <= UPCOMING_DAYS);
  const sumOf = (list: Item[]) => round2(list.reduce((a, i) => a + i.sale.amount, 0));

  const base = tab === 'expiring' ? expiring : tab === 'expired' ? expiredShown : tab === 'upcoming' ? upcoming : [...expiring, ...expiredShown, ...upcoming];
  const q = norm(query.trim());
  const list = base
    .filter((i) => (vendor === 'all' || i.sale.vendorId === vendor) && (!q || norm(`${i.sale.customerName} ${i.sale.productTitle} ${i.sale.plan || ''}`).includes(q)))
    // Las vencidas, de la más reciente a la más antigua; el resto, de la que vence primero a la última
    .sort((a, b) => (tab === 'expired' ? b.info.daysLeft - a.info.daysLeft : a.info.daysLeft - b.info.daysLeft));

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

  const copy = async (i: Item) => {
    const ok = await copyText(reminderText(i.sale, vendorName(ctx.vendors, i.sale.vendorId), now));
    ctx.onToast(ok ? 'Mensaje copiado. Pégalo en el chat del cliente.' : 'No se pudo copiar el mensaje.');
  };

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: 'expiring', label: `Vencen en ${EXPIRING_DAYS} días`, n: expiring.length },
    { id: 'expired', label: 'Vencidas', n: expiredShown.length },
    { id: 'upcoming', label: `Próximas (${UPCOMING_DAYS} días)`, n: upcoming.length },
    { id: 'all', label: 'Todas', n: expiring.length + expiredShown.length + upcoming.length }
  ];

  const tiles = [
    { label: `Vencen en ${EXPIRING_DAYS} días`, n: expiring.length, amount: sumOf(expiring), hint: 'ingresos que puedes asegurar renovando' },
    { label: 'Vencidas', n: expired.length, amount: sumOf(expired), hint: 'clientes que dejaron de renovar' },
    { label: `Próximas ${UPCOMING_DAYS} días`, n: upcoming.length, amount: sumOf(upcoming), hint: 'renovaciones del mes' }
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader title="Renovaciones" description="Quién está por vencer y quién ya venció, con el mensaje listo para recordárselo." />

      <dl className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <dt className="text-[13px] text-zinc-400">{t.label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-white">{t.n}</span>
              <span className="text-sm text-zinc-300">{t.n === 1 ? 'cliente' : 'clientes'}</span>
            </dd>
            <dd className="mt-0.5 text-xs text-zinc-400">
              {money(t.amount)} · {t.hint}
            </dd>
          </Card>
        ))}
      </dl>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Qué mostrar">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                tab === t.id ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {t.label}
              <span className={`tabular-nums ${tab === t.id ? 'text-emerald-200' : 'text-zinc-400'}`}>{t.n}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
          {(tab === 'expired' || tab === 'all') && (
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Vencidas hace</span>
              <select value={expiredDays} onChange={(e) => setExpiredDays(Number(e.target.value))} className={`${inputCls} w-auto`}>
                <option value={30}>máx. 30 días</option>
                <option value={60}>máx. 60 días</option>
                <option value={90}>máx. 90 días</option>
                <option value={0}>sin límite</option>
              </select>
            </label>
          )}
          {ctx.isSuperAdmin && (
            <label>
              <span className="sr-only">Tienda</span>
              <select value={vendor} onChange={(e) => setVendor(e.target.value)} className={`${inputCls} sm:w-auto`}>
                <option value="all">Todas las tiendas</option>
                {ctx.vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="relative sm:w-64">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente o producto…" className={`${inputCls} pl-9`} />
          </label>
        </div>
      </div>

      <Card>
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <BellRing className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <p className="text-sm font-semibold text-white">
              {items.length === 0 ? 'Todavía no hay suscripciones con vencimiento' : tab === 'expiring' ? 'Nadie vence en los próximos 7 días' : 'No hay nada en esta lista'}
            </p>
            <p className="max-w-md text-[13px] text-zinc-400">
              {items.length === 0
                ? 'Cuando registres ventas con duración (por ejemplo 30 días), aquí verás quién está por vencer.'
                : 'Revisa las otras pestañas o cambia los filtros.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800/60" aria-label="Suscripciones">
            {list.map((i) => {
              const text = reminderText(i.sale, vendorName(ctx.vendors, i.sale.vendorId), now);
              return (
                <li key={i.sale.id} className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{i.sale.customerName}</p>
                      <SubChip info={i.info} />
                    </div>
                    <p className="mt-0.5 text-[13px] text-zinc-300">
                      {i.sale.productTitle}
                      {i.sale.plan ? <span className="text-zinc-400"> · {i.sale.plan}</span> : null}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {i.info.state === 'expired' ? 'Venció' : 'Vence'} el {formatDay(i.sale.expiresAt)} · {money(i.sale.amount)}
                      {ctx.isSuperAdmin ? ` · ${vendorName(ctx.vendors, i.sale.vendorId)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ContactLinks customer={i.customer || { telegram: null, whatsapp: null }} text={text} />
                    <button type="button" onClick={() => void copy(i)} className={`${secondaryBtn} !px-2.5 !py-1 !text-xs`}>
                      <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" /> Copiar mensaje
                    </button>
                    <button type="button" onClick={() => setDraft(renewDraft(i.sale))} className={`${primaryBtn} !px-2.5 !py-1 !text-xs`}>
                      <Repeat2 className="h-3.5 w-3.5" aria-hidden="true" /> Renovar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <SaleDialog open={!!draft} onClose={() => setDraft(null)} ctx={ctx} customers={state.customers} draft={draft} onSaved={(s) => ctx.onToast(`Renovación registrada (venta N.º ${s.number}).`)} />
    </div>
  );
};

export const RenewalsPage: React.FC<{ ctx: SalesCtx }> = ({ ctx }) => <SalesGate ctx={ctx}>{(state) => <Body ctx={ctx} state={state} />}</SalesGate>;
export default RenewalsPage;
