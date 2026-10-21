import React, { useMemo, useState } from 'react';
import { ChartNoAxesColumn, Download, Table2 } from 'lucide-react';
import { Card, DeltaTag, PageHeader, secondaryBtn } from '../ui';
import { inputCls } from '../fields';
import type { SalesState } from '../../../lib/salesStore';
import {
  customerKey,
  dailySeries,
  daysBetween,
  formatDay,
  groupRevenue,
  inDayRange,
  limaDay,
  money,
  moneyCompact,
  monthKey,
  monthLabel,
  pctChange,
  PERIOD_OPTIONS,
  resolvePeriod,
  round2,
  todayLima,
  toCsv,
  totals,
  type PeriodId
} from '../../../lib/salesMath';
import { downloadText, SalesGate, scopeData, vendorName, type SalesCtx } from './shared';
import { BarList, ColumnChart, LineChart, type ChartPoint } from './charts';

const DAILY_MAX_DAYS = 62;
const nf = new Intl.NumberFormat('es-PE');

const Body: React.FC<{ ctx: SalesCtx; state: SalesState }> = ({ ctx, state }) => {
  const { sales: scoped, customers } = useMemo(() => scopeData(state, ctx), [state, ctx.isSuperAdmin, ctx.currentVendor.id]);
  const [period, setPeriod] = useState<PeriodId>('30d');
  const [vendor, setVendor] = useState('all');
  const [asTable, setAsTable] = useState(false);

  const base = useMemo(() => (vendor === 'all' ? scoped : scoped.filter((s) => s.vendorId === vendor)), [scoped, vendor]);
  const earliest = useMemo(() => (base.length ? limaDay(base.reduce((a, s) => (s.soldAt < a ? s.soldAt : a), base[0].soldAt)) : undefined), [base]);
  const range = useMemo(() => resolvePeriod(period, Date.now(), earliest), [period, earliest]);

  const current = useMemo(() => base.filter((s) => inDayRange(s, range.fromDay, range.toDay)), [base, range]);
  const previous = useMemo(() => (range.prev ? base.filter((s) => inDayRange(s, range.prev!.fromDay, range.prev!.toDay)) : []), [base, range]);
  const tc = useMemo(() => totals(current), [current]);
  const tp = useMemo(() => totals(previous), [previous]);

  const inRange = (iso: string, from: string, to: string) => {
    const d = limaDay(iso);
    return d >= from && d <= to;
  };
  const newCustomers = customers.filter((c) => inRange(c.createdAt, range.fromDay, range.toDay)).length;
  const newCustomersPrev = range.prev ? customers.filter((c) => inRange(c.createdAt, range.prev!.fromDay, range.prev!.toDay)).length : 0;

  // ---- gráfico principal: por día si el período es corto; por mes si es largo
  const span = daysBetween(range.fromDay, range.toDay) + 1;
  const daily = span <= DAILY_MAX_DAYS;
  const points = useMemo<ChartPoint[]>(() => {
    if (daily) {
      return dailySeries(current, range.fromDay, range.toDay).map((d) => ({
        key: d.day,
        tick: formatDay(d.day, false),
        label: formatDay(d.day),
        value: d.revenue,
        extra: `${d.count} venta${d.count === 1 ? '' : 's'}`
      }));
    }
    const map = new Map<string, { revenue: number; count: number }>();
    for (let d = range.fromDay.slice(0, 7) + '-01'; d <= range.toDay; ) {
      map.set(d.slice(0, 7), { revenue: 0, count: 0 });
      const [y, m] = d.split('-').map(Number);
      d = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
    }
    current.forEach((s) => {
      if (s.status !== 'paid') return;
      const m = map.get(monthKey(s.soldAt));
      if (m) {
        m.revenue = round2(m.revenue + s.amount);
        m.count++;
      }
    });
    return [...map.entries()].map(([k, v]) => ({ key: k, tick: monthLabel(k).slice(0, 3) + (range.fromDay.slice(0, 4) !== range.toDay.slice(0, 4) ? ` ${k.slice(2, 4)}` : ''), label: monthLabel(k), value: v.revenue, extra: `${v.count} venta${v.count === 1 ? '' : 's'}` }));
  }, [current, range, daily]);

  const best = points.reduce<ChartPoint | null>((b, p) => (p.value > (b?.value ?? 0) ? p : b), null);
  const prevLabel = range.prev?.label ?? null;

  const byProduct = useMemo(() => groupRevenue(current, (s) => s.productTitle).slice(0, 6), [current]);
  const byPayment = useMemo(() => groupRevenue(current, (s) => s.paymentMethod).slice(0, 6), [current]);
  const byCustomer = useMemo(() => groupRevenue(current, (s) => s.customerName).slice(0, 5), [current]);
  const byVendor = useMemo(() => groupRevenue(current, (s) => s.vendorId), [current]);
  const totalRevenue = tc.revenue || 1;

  // ---- por día de la semana (hora de Lima): sirve para saber cuándo conviene estar más atento
  const weekdayPoints = useMemo<ChartPoint[]>(() => {
    const short = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const full = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const acc = short.map(() => ({ revenue: 0, count: 0 }));
    current.forEach((s) => {
      if (s.status !== 'paid') return;
      const i = (new Date(`${limaDay(s.soldAt)}T12:00:00Z`).getUTCDay() + 6) % 7; // lunes = 0
      acc[i].revenue = round2(acc[i].revenue + s.amount);
      acc[i].count++;
    });
    return acc.map((a, i) => ({ key: short[i], tick: short[i], label: full[i], value: a.revenue, extra: `${a.count} venta${a.count === 1 ? '' : 's'}` }));
  }, [current]);
  const bestWeekday = weekdayPoints.reduce<ChartPoint | null>((b, p) => (p.value > (b?.value ?? 0) ? p : b), null);

  // ---- clientes que compraron en el período: nuevos (primera compra pagada) o recurrentes (ya habían comprado antes)
  const buyers = useMemo(() => {
    const before = new Set(base.filter((s) => s.status === 'paid' && limaDay(s.soldAt) < range.fromDay).map(customerKey));
    const now = new Set(current.filter((s) => s.status === 'paid').map(customerKey));
    let fresh = 0;
    let recurring = 0;
    now.forEach((k) => (before.has(k) ? recurring++ : fresh++));
    return { fresh, recurring };
  }, [base, current, range]);

  // ---- lo que no suma a los ingresos
  const notCounted = useMemo(() => {
    const acc = { pending: { n: 0, amount: 0 }, cancelled: { n: 0, amount: 0 }, refunded: { n: 0, amount: 0 } };
    current.forEach((s) => {
      if (s.status === 'paid') return;
      acc[s.status].n++;
      acc[s.status].amount = round2(acc[s.status].amount + s.amount);
    });
    return acc;
  }, [current]);

  const exportSummary = () => {
    const rows: (string | number | null)[][] = [
      ['Reporte de ventas', ctx.isSuperAdmin && vendor === 'all' ? 'Todas las tiendas' : vendorName(ctx.vendors, ctx.isSuperAdmin ? vendor : ctx.currentVendor.id)],
      ['Período', `${formatDay(range.fromDay)} al ${formatDay(range.toDay)} (${range.label})`],
      [],
      ['Resumen', 'Valor'],
      ['Ingresos (S/)', tc.revenue],
      ['Ventas pagadas', tc.count],
      ['Ticket promedio (S/)', tc.average],
      ['Clientes nuevos registrados', newCustomers],
      ['Clientes que compraron por primera vez', buyers.fresh],
      ['Clientes que repitieron compra', buyers.recurring],
      ['Pendientes de cobro (S/)', notCounted.pending.amount],
      ['Anuladas', notCounted.cancelled.n],
      ['Reembolsadas (S/)', notCounted.refunded.amount],
      [],
      ['Por producto', 'Ventas', 'Ingresos (S/)'],
      ...groupRevenue(current, (s) => s.productTitle).map((g) => [g.key, g.count, g.revenue]),
      [],
      ['Por método de pago', 'Ventas', 'Ingresos (S/)'],
      ...groupRevenue(current, (s) => s.paymentMethod).map((g) => [g.key, g.count, g.revenue]),
      [],
      ['Por cliente', 'Compras', 'Ingresos (S/)'],
      ...groupRevenue(current, (s) => s.customerName).map((g) => [g.key, g.count, g.revenue]),
      [],
      [daily ? 'Por día' : 'Por mes', 'Ventas', 'Ingresos (S/)'],
      ...points.map((p) => [p.label, Number(p.extra?.split(' ')[0] || 0), p.value])
    ];
    downloadText(`reporte-ventas-${todayLima()}.csv`, toCsv(rows));
    ctx.onToast('Resumen descargado. Ábrelo con Excel.');
  };

  const tiles = [
    { label: 'Ingresos', value: money(tc.revenue), pct: pctChange(tc.revenue, tp.revenue) },
    { label: 'Ventas pagadas', value: nf.format(tc.count), pct: pctChange(tc.count, tp.count) },
    { label: 'Ticket promedio', value: money(tc.average), pct: pctChange(tc.average, tp.average) },
    { label: 'Clientes nuevos', value: nf.format(newCustomers), pct: pctChange(newCustomers, newCustomersPrev) }
  ];

  const hasAny = base.length > 0;
  const hasAnySales = hasAny;
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Reportes"
        description={`${range.label}: ${formatDay(range.fromDay)} al ${formatDay(range.toDay)} · cifras reales de tus ventas registradas`}
        actions={
          hasAnySales && (
            <button type="button" onClick={exportSummary} className={secondaryBtn}>
              <Download className="h-4 w-4" aria-hidden="true" /> Descargar resumen
            </button>
          )
        }
      />

      {/* Filtros: una fila, y todo lo de abajo se calcula con ellos */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Período">
          {PERIOD_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={period === o.id}
              onClick={() => setPeriod(o.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                period === o.id ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
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
      </div>

      {!hasAny ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <ChartNoAxesColumn className="h-8 w-8 text-zinc-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-white">Todavía no hay ventas para analizar</p>
          <p className="max-w-md text-[13px] text-zinc-400">Registra tus ventas en la sección Ventas y aquí verás tus ingresos, tus productos más vendidos y cómo vas contra el período anterior.</p>
        </Card>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <Card key={t.label} className="p-4">
                <dt className="text-[13px] text-zinc-400">{t.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">{t.value}</dd>
                <dd className="mt-1">
                  <DeltaTag pct={t.pct} vs={prevLabel} />
                </dd>
              </Card>
            ))}
          </dl>

          <Card as="section" aria-labelledby="rep-ingresos" className="p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="rep-ingresos" className="text-base font-semibold text-white">
                  Ingresos {daily ? 'por día' : 'por mes'}
                </h2>
                <p className="mt-0.5 text-[13px] text-zinc-400">
                  {money(tc.revenue)} en {tc.count} venta{tc.count === 1 ? '' : 's'} pagada{tc.count === 1 ? '' : 's'}
                  {best && best.value > 0 ? ` · mejor ${daily ? 'día' : 'mes'}: ${best.label} (${money(best.value)})` : ''}
                </p>
              </div>
              <button type="button" onClick={() => setAsTable((v) => !v)} aria-pressed={asTable} className={`${secondaryBtn} !px-2.5 !py-1.5 !text-xs`}>
                {asTable ? <ChartNoAxesColumn className="h-3.5 w-3.5" aria-hidden="true" /> : <Table2 className="h-3.5 w-3.5" aria-hidden="true" />}
                {asTable ? 'Ver gráfico' : 'Ver como tabla'}
              </button>
            </div>
            {asTable ? (
              <div role="region" tabIndex={0} aria-label={`Ingresos ${daily ? 'por día' : 'por mes'} en tabla`} className="max-h-80 overflow-auto rounded-lg border border-zinc-800 focus-visible:outline-2 focus-visible:outline-emerald-300">
                <table className="w-full text-left text-[13px]">
                  <caption className="sr-only">Ingresos {daily ? 'por día' : 'por mes'}</caption>
                  <thead className="sticky top-0 bg-[#16161a] text-xs text-zinc-300">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">{daily ? 'Día' : 'Mes'}</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Ventas</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {[...points].reverse().map((p) => (
                      <tr key={p.key}>
                        <th scope="row" className="px-3 py-1.5 font-normal text-zinc-200">{p.label}</th>
                        <td className="px-3 py-1.5 text-right tabular-nums text-zinc-300">{p.extra?.split(' ')[0]}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-white">{money(p.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : daily ? (
              <LineChart points={points} format={money} axisFormat={(n) => `S/ ${moneyCompact(n)}`} ariaLabel={`Gráfico de ingresos por día. Total ${money(tc.revenue)}.`} />
            ) : (
              <ColumnChart points={points} format={money} axisFormat={(n) => `S/ ${moneyCompact(n)}`} ariaLabel={`Gráfico de ingresos por mes. Total ${money(tc.revenue)}.`} />
            )}
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card as="section" aria-labelledby="rep-prod" className="p-5">
              <h2 id="rep-prod" className="mb-4 text-base font-semibold text-white">
                Productos más vendidos
              </h2>
              <BarList
                items={byProduct.map((g) => ({ key: g.key, label: g.key, value: g.revenue, sub: `${g.count} venta${g.count === 1 ? '' : 's'}` }))}
                format={money}
                emptyText="No hay ventas pagadas en este período."
              />
            </Card>
            <Card as="section" aria-labelledby="rep-pago" className="p-5">
              <h2 id="rep-pago" className="mb-4 text-base font-semibold text-white">
                Cómo te pagan
              </h2>
              <BarList
                items={byPayment.map((g) => ({ key: g.key, label: g.key, value: g.revenue, sub: `${Math.round((g.revenue / totalRevenue) * 100)}%` }))}
                format={money}
                emptyText="No hay ventas pagadas en este período."
              />
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card as="section" aria-labelledby="rep-clientes" className="p-5">
              <h2 id="rep-clientes" className="mb-4 text-base font-semibold text-white">
                Mejores clientes del período
              </h2>
              <BarList
                items={byCustomer.map((g) => ({ key: g.key, label: g.key, value: g.revenue, sub: `${g.count} compra${g.count === 1 ? '' : 's'}` }))}
                format={money}
                emptyText="No hay ventas pagadas en este período."
              />
            </Card>
            {ctx.isSuperAdmin && (
              <Card as="section" aria-labelledby="rep-tiendas" className="p-5">
                <h2 id="rep-tiendas" className="mb-3 text-base font-semibold text-white">
                  Ventas por tienda
                </h2>
                {byVendor.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-zinc-400">No hay ventas pagadas en este período.</p>
                ) : (
                  <div role="region" tabIndex={0} aria-label="Ingresos por tienda" className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-emerald-300">
                    <table className="w-full text-left text-[13px]">
                      <caption className="sr-only">Ingresos por tienda</caption>
                      <thead className="text-xs text-zinc-300">
                        <tr>
                          <th scope="col" className="py-2 pr-3 font-medium">Tienda</th>
                          <th scope="col" className="px-3 py-2 text-right font-medium">Ventas</th>
                          <th scope="col" className="px-3 py-2 text-right font-medium">Ingresos</th>
                          <th scope="col" className="py-2 pl-3 text-right font-medium">Parte</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {byVendor.map((g) => (
                          <tr key={g.key}>
                            <th scope="row" className="py-2 pr-3 font-medium text-zinc-100">{vendorName(ctx.vendors, g.key)}</th>
                            <td className="px-3 py-2 text-right tabular-nums text-zinc-300">{g.count}</td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums text-white">{money(g.revenue)}</td>
                            <td className="py-2 pl-3 text-right tabular-nums text-zinc-300">{Math.round((g.revenue / totalRevenue) * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card as="section" aria-labelledby="rep-semana" className="p-5">
              <h2 id="rep-semana" className="text-base font-semibold text-white">
                Qué día de la semana vendes más
              </h2>
              <p className="mb-3 mt-0.5 text-[13px] text-zinc-400">
                {bestWeekday && bestWeekday.value > 0 ? `Tu mejor día: ${bestWeekday.label} (${money(bestWeekday.value)}).` : 'Aún no hay ventas pagadas en este período.'}
              </p>
              <ColumnChart points={weekdayPoints} format={money} axisFormat={(n) => `S/ ${moneyCompact(n)}`} unit="los días de la semana" ariaLabel="Ingresos por día de la semana" height={200} />
            </Card>
            <div className="space-y-5">
              <Card as="section" aria-labelledby="rep-nuevos" className="p-5">
                <h2 id="rep-nuevos" className="mb-1 text-base font-semibold text-white">
                  Clientes nuevos y recurrentes
                </h2>
                <p className="mb-4 text-[13px] text-zinc-400">Personas que compraron en este período.</p>
                <BarList
                  items={[
                    { key: 'new', label: 'Compraron por primera vez', value: buyers.fresh },
                    { key: 'rec', label: 'Ya habían comprado antes', value: buyers.recurring }
                  ].filter((i) => i.value > 0)}
                  format={(n) => `${nf.format(n)} cliente${n === 1 ? '' : 's'}`}
                  emptyText="No hay ventas pagadas en este período."
                />
              </Card>
              <Card as="section" aria-labelledby="rep-nosuma" className="p-5">
                <h2 id="rep-nosuma" className="mb-3 text-base font-semibold text-white">
                  Lo que no suma a tus ingresos
                </h2>
                <dl className="space-y-2 text-[13px]">
                  {[
                    { k: 'Pendientes de cobro', v: notCounted.pending },
                    { k: 'Anuladas', v: notCounted.cancelled },
                    { k: 'Reembolsadas', v: notCounted.refunded }
                  ].map((r) => (
                    <div key={r.k} className="flex items-baseline justify-between gap-3 border-b border-zinc-800/60 pb-2 last:border-0 last:pb-0">
                      <dt className="text-zinc-300">{r.k}</dt>
                      <dd className="tabular-nums text-white">
                        {nf.format(r.v.n)} · {money(r.v.amount)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </div>
          </div>

          <p className="text-xs text-zinc-400">
            Los ingresos cuentan solo las ventas en estado “Pagada”. Las pendientes, anuladas y reembolsadas no suman.
          </p>
        </>
      )}
    </div>
  );
};

export const ReportsPage: React.FC<{ ctx: SalesCtx }> = ({ ctx }) => <SalesGate ctx={ctx}>{(state) => <Body ctx={ctx} state={state} />}</SalesGate>;
export default ReportsPage;
