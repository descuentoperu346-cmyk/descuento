import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChartNoAxesColumn, Database, RefreshCw, ShieldCheck, Table2, TriangleAlert } from 'lucide-react';
import type { Vendor } from '../../data/vendorsData';
import type { ServiceItem } from '../../data/servicesData';
import { loadTraffic, type TrafficReport } from '../../lib/trafficApi';
import { formatDay, pctChange } from '../../lib/salesMath';
import { Card, DeltaTag, PageHeader, StateNote as Note, primaryBtn, secondaryBtn } from './ui';
import { inputCls } from './fields';
import { BarList, ColumnChart, LineChart, type ChartPoint } from './sales/charts';
import { vendorName } from './sales/shared';

interface TrafficPageProps {
  vendors: Vendor[];
  services: ServiceItem[];
  /** Administración viendo toda la web: puede mirar todas las tiendas o elegir una */
  isSuperAdmin: boolean;
  isStaffAdmin: boolean;
  currentVendorId: string;
  /** false cuando el panel trabaja sin base de datos (modo local) */
  dbMode: boolean;
}

const nf = new Intl.NumberFormat('es-PE');
const DAY_OPTIONS = [
  { id: 7, label: 'Últimos 7 días' },
  { id: 30, label: 'Últimos 30 días' },
  { id: 90, label: 'Últimos 90 días' }
];
type Metric = 'visits' | 'views' | 'clicks';
const METRIC_LABEL: Record<Metric, { chip: string; title: string; unit: (n: number) => string }> = {
  visits: { chip: 'Visitas', title: 'Visitas a la web', unit: (n) => `${nf.format(n)} visita${n === 1 ? '' : 's'}` },
  views: { chip: 'Productos vistos', title: 'Productos abiertos', unit: (n) => `${nf.format(n)} vista${n === 1 ? '' : 's'}` },
  clicks: { chip: 'Clics de contacto', title: 'Clics en Telegram o WhatsApp', unit: (n) => `${nf.format(n)} clic${n === 1 ? '' : 's'}` }
};

export const TrafficPage: React.FC<TrafficPageProps> = ({ vendors, services, isSuperAdmin, isStaffAdmin, currentVendorId, dbMode }) => {
  const [days, setDays] = useState(30);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [metric, setMetric] = useState<Metric | null>(null);
  const [asTable, setAsTable] = useState(false);
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'missing' | 'error'; report?: TrafficReport; message?: string }>({ status: 'loading' });
  const seq = useRef(0);

  // Administración con "todas las tiendas" ve la web completa; en cualquier otro caso se ve una sola tienda
  const scopeVendor = isSuperAdmin ? (vendorFilter === 'all' ? null : vendorFilter) : currentVendorId;
  const wholeSite = scopeVendor === null;

  const load = useCallback(async () => {
    if (!dbMode) return;
    const mine = ++seq.current;
    setState((s) => ({ ...s, status: 'loading' }));
    const res = await loadTraffic(days, scopeVendor);
    if (mine !== seq.current) return; // llegó una respuesta vieja: se ignora
    setState(res.status === 'ready' ? { status: 'ready', report: res.report } : { status: res.status, message: res.message });
  }, [days, scopeVendor, dbMode]);

  useEffect(() => {
    void load();
    return () => {
      seq.current++;
    };
  }, [load]);

  const report = state.report;
  const activeMetric: Metric = metric && (wholeSite || metric !== 'visits') ? metric : wholeSite ? 'visits' : 'views';
  const titleOf = useMemo(() => {
    const map = new Map(services.map((s) => [s.id, s.title]));
    return (id: string) => map.get(id) || 'Producto que ya no está en la lista';
  }, [services]);

  // ---------------------------------------------------------------- estados sin datos
  if (!dbMode) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader title="Tráfico y clics" description="Visitas y clics reales de tu web." />
        <Note icon={Database} tone="zinc" title="Necesita la base de datos conectada">
          <p>Las cifras de visitas y clics se guardan en la base de datos de la web. En este modo (sin base de datos) no hay nada real que mostrar, y no se inventan números.</p>
        </Note>
      </div>
    );
  }
  if (state.status === 'missing') {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader title="Tráfico y clics" description="Visitas y clics reales de tu web." />
        <Note
          icon={Database}
          tone="amber"
          title="Falta activar el registro de visitas y clics"
          action={
            <button type="button" onClick={() => void load()} className={`${secondaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Comprobar de nuevo
            </button>
          }
        >
          {isStaffAdmin ? (
            <>
              <p>Esta parte todavía no existe en tu base de datos. Se activa una sola vez:</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>
                  Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.
                </li>
                <li>
                  Pega todo el archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/07-visitas-y-clics.sql</code> y pulsa <strong className="text-white">Run</strong>.
                </li>
                <li>Vuelve aquí y pulsa “Comprobar de nuevo”. Las cifras empiezan a contarse desde ese momento.</li>
              </ol>
            </>
          ) : (
            <p>Pídele al administrador de la web que active el registro de visitas y clics.</p>
          )}
        </Note>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <PageHeader title="Tráfico y clics" description="Visitas y clics reales de tu web." />
        <Note
          icon={TriangleAlert}
          tone="rose"
          title="No se pudieron cargar las cifras"
          action={
            <button type="button" onClick={() => void load()} className={`${primaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Intentar de nuevo
            </button>
          }
        >
          <p role="alert">{state.message}</p>
        </Note>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="mx-auto max-w-7xl py-16 text-center text-sm text-zinc-400" role="status" aria-busy="true">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-zinc-400" aria-hidden="true" />
        Cargando visitas y clics…
      </div>
    );
  }

  // ---------------------------------------------------------------- cifras
  const t = report.totals;
  const p = report.previous;
  const vs = `los ${report.days} días anteriores`;
  const hasAny = t.visits + t.views + t.clicks > 0;
  const perHundred = (clicks: number, views: number) => (views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0);
  const rateNow = perHundred(t.clicks, t.views);
  const ratePrev = perHundred(p.clicks, p.views);

  const tiles: { label: string; value: string; pct: number | null; note?: string }[] = wholeSite
    ? [
        { label: 'Visitas a la web', value: nf.format(t.visits), pct: pctChange(t.visits, p.visits) },
        { label: 'Personas distintas', value: nf.format(t.visitors), pct: pctChange(t.visitors, p.visitors) },
        { label: 'Productos abiertos', value: nf.format(t.views), pct: pctChange(t.views, p.views) },
        { label: 'Clics de contacto', value: nf.format(t.clicks), pct: pctChange(t.clicks, p.clicks) }
      ]
    : [
        { label: 'Productos abiertos', value: nf.format(t.views), pct: pctChange(t.views, p.views) },
        { label: 'Personas distintas', value: nf.format(t.visitors), pct: pctChange(t.visitors, p.visitors) },
        { label: 'Clics de contacto', value: nf.format(t.clicks), pct: pctChange(t.clicks, p.clicks) },
        { label: 'Clics por cada 100 vistas', value: nf.format(rateNow), pct: pctChange(rateNow, ratePrev) }
      ];

  const points: ChartPoint[] = report.series.map((d) => ({
    key: d.day,
    tick: formatDay(d.day, false),
    label: formatDay(d.day),
    value: d[activeMetric],
    extra: `${nf.format(d.visitors)} persona${d.visitors === 1 ? '' : 's'} distinta${d.visitors === 1 ? '' : 's'}`
  }));
  const peak = points.reduce<ChartPoint | null>((b, pt) => (pt.value > (b?.value ?? 0) ? pt : b), null);
  const total = report.series.reduce((a, d) => a + d[activeMetric], 0);
  const metrics = (['visits', 'views', 'clicks'] as Metric[]).filter((m) => wholeSite || m !== 'visits');

  const hourPoints: ChartPoint[] = report.hours.map((n, h) => ({ key: String(h), tick: `${h} h`, label: `De ${h}:00 a ${h}:59`, value: n, extra: undefined }));
  const busiest = hourPoints.reduce<ChartPoint | null>((b, pt) => (pt.value > (b?.value ?? 0) ? pt : b), null);

  const scopeLabel = wholeSite ? 'toda la web' : vendorName(vendors, scopeVendor!);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Tráfico y clics"
        description={`Cifras reales de ${scopeLabel} · ${formatDay(report.from)} al ${formatDay(report.to)} (hora de Lima)`}
        actions={
          <button type="button" onClick={() => void load()} disabled={state.status === 'loading'} className={secondaryBtn}>
            <RefreshCw className={`h-4 w-4 ${state.status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" /> {state.status === 'loading' ? 'Actualizando…' : 'Actualizar'}
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Período">
          {DAY_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={days === o.id}
              onClick={() => setDays(o.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                days === o.id ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {isSuperAdmin && (
          <label>
            <span className="sr-only">Tienda</span>
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className={`${inputCls} sm:w-auto`}>
              <option value="all">Toda la web</option>
              {vendors.map((v) => (
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
          <p className="text-sm font-semibold text-white">Todavía no hay visitas registradas en este período</p>
          <p className="max-w-md text-[13px] text-zinc-400">
            Las cifras empiezan a contarse cuando alguien visita la web. Para probar: abre la web en una ventana privada (sin iniciar sesión en el panel), entra a un producto, pulsa el botón de Telegram y vuelve aquí a “Actualizar”.
          </p>
        </Card>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((x) => (
              <Card key={x.label} className="p-4">
                <dt className="text-[13px] text-zinc-400">{x.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">{x.value}</dd>
                <dd className="mt-1">
                  <DeltaTag pct={x.pct} vs={vs} />
                </dd>
              </Card>
            ))}
          </dl>

          <Card as="section" aria-labelledby="tr-serie" className="p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="tr-serie" className="text-base font-semibold text-white">
                  {METRIC_LABEL[activeMetric].title} por día
                </h2>
                <p className="mt-0.5 text-[13px] text-zinc-400">
                  {METRIC_LABEL[activeMetric].unit(total)} en {report.days} días
                  {peak && peak.value > 0 ? ` · mejor día: ${peak.label} (${METRIC_LABEL[activeMetric].unit(peak.value)})` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Qué mostrar en el gráfico">
                  {metrics.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={activeMetric === m}
                      onClick={() => setMetric(m)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                        activeMetric === m ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {METRIC_LABEL[m].chip}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setAsTable((v) => !v)} aria-pressed={asTable} className={`${secondaryBtn} !px-2.5 !py-1.5 !text-xs`}>
                  {asTable ? <ChartNoAxesColumn className="h-3.5 w-3.5" aria-hidden="true" /> : <Table2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  {asTable ? 'Ver gráfico' : 'Ver como tabla'}
                </button>
              </div>
            </div>
            {asTable ? (
              <div role="region" tabIndex={0} aria-label="Visitas y clics por día en tabla" className="max-h-80 overflow-auto rounded-lg border border-zinc-800 focus-visible:outline-2 focus-visible:outline-emerald-300">
                <table className="w-full text-left text-[13px]">
                  <caption className="sr-only">Visitas y clics por día</caption>
                  <thead className="sticky top-0 bg-[#16161a] text-xs text-zinc-300">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">Día</th>
                      {wholeSite && <th scope="col" className="px-3 py-2 text-right font-medium">Visitas</th>}
                      <th scope="col" className="px-3 py-2 text-right font-medium">Productos abiertos</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Clics</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Personas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {[...report.series].reverse().map((d) => (
                      <tr key={d.day}>
                        <th scope="row" className="px-3 py-1.5 font-normal text-zinc-200">{formatDay(d.day)}</th>
                        {wholeSite && <td className="px-3 py-1.5 text-right tabular-nums text-zinc-300">{nf.format(d.visits)}</td>}
                        <td className="px-3 py-1.5 text-right tabular-nums text-zinc-300">{nf.format(d.views)}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-white">{nf.format(d.clicks)}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-zinc-300">{nf.format(d.visitors)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <LineChart points={points} format={METRIC_LABEL[activeMetric].unit} axisFormat={(n) => nf.format(n)} ariaLabel={`Gráfico de ${METRIC_LABEL[activeMetric].title.toLowerCase()} por día. Total ${nf.format(total)}.`} />
            )}
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card as="section" aria-labelledby="tr-prod" className="p-5">
              <h2 id="tr-prod" className="mb-4 text-base font-semibold text-white">
                Productos más vistos
              </h2>
              <BarList
                items={report.products.slice(0, 8).map((x) => ({ key: x.item_id, label: titleOf(x.item_id), value: x.views, sub: `${nf.format(x.clicks)} clic${x.clicks === 1 ? '' : 's'}` }))}
                format={(n) => `${nf.format(n)} vista${n === 1 ? '' : 's'}`}
                emptyText="Todavía nadie abrió un producto en este período."
              />
            </Card>
            <Card as="section" aria-labelledby="tr-canal" className="p-5">
              <h2 id="tr-canal" className="mb-4 text-base font-semibold text-white">
                Por dónde te escriben
              </h2>
              <BarList
                items={[
                  { key: 'telegram', label: 'Telegram', value: t.telegram, sub: t.clicks ? `${Math.round((t.telegram / t.clicks) * 100)}%` : undefined },
                  { key: 'whatsapp', label: 'WhatsApp', value: t.whatsapp, sub: t.clicks ? `${Math.round((t.whatsapp / t.clicks) * 100)}%` : undefined }
                ].filter((i) => i.value > 0)}
                format={(n) => `${nf.format(n)} clic${n === 1 ? '' : 's'}`}
                emptyText="Todavía no hay clics en Telegram ni WhatsApp."
              />
              {report.sources.length > 0 && (
                <div className="mt-6 border-t border-zinc-800/70 pt-4">
                  <h3 className="mb-3 text-[13px] font-semibold text-zinc-200">Desde dónde hicieron clic</h3>
                  <BarList items={report.sources.slice(0, 5).map((x) => ({ key: x.source, label: x.source, value: x.clicks }))} format={(n) => `${nf.format(n)} clic${n === 1 ? '' : 's'}`} emptyText="" />
                </div>
              )}
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card as="section" aria-labelledby="tr-horas" className="p-5">
              <h2 id="tr-horas" className="text-base font-semibold text-white">
                A qué hora hay más movimiento
              </h2>
              <p className="mb-3 mt-0.5 text-[13px] text-zinc-400">
                {busiest && busiest.value > 0 ? `Más actividad ${busiest.label.toLowerCase()} (hora de Lima).` : 'Aún no hay suficiente actividad.'} Úsalo para estar atento a Telegram y WhatsApp.
              </p>
              <ColumnChart points={hourPoints} format={(n) => `${nf.format(n)} registro${n === 1 ? '' : 's'}`} axisFormat={(n) => nf.format(n)} unit="las horas" ariaLabel="Gráfico de actividad por hora del día" height={200} />
            </Card>
            {wholeSite && (
              <Card as="section" aria-labelledby="tr-tiendas" className="p-5">
                <h2 id="tr-tiendas" className="mb-3 text-base font-semibold text-white">
                  Clics por tienda
                </h2>
                {report.vendors.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-zinc-400">Todavía no hay actividad de tiendas en este período.</p>
                ) : (
                  <div role="region" tabIndex={0} aria-label="Actividad por tienda" className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-emerald-300">
                    <table className="w-full text-left text-[13px]">
                      <caption className="sr-only">Actividad por tienda</caption>
                      <thead className="text-xs text-zinc-300">
                        <tr>
                          <th scope="col" className="py-2 pr-3 font-medium">Tienda</th>
                          <th scope="col" className="px-3 py-2 text-right font-medium">Vistas</th>
                          <th scope="col" className="px-3 py-2 text-right font-medium">Clics</th>
                          <th scope="col" className="px-3 py-2 text-right font-medium">Telegram</th>
                          <th scope="col" className="py-2 pl-3 text-right font-medium">WhatsApp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {report.vendors.map((v) => (
                          <tr key={v.vendor_id}>
                            <th scope="row" className="py-2 pr-3 font-medium text-zinc-100">{vendorName(vendors, v.vendor_id)}</th>
                            <td className="px-3 py-2 text-right tabular-nums text-zinc-300">{nf.format(v.views)}</td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums text-white">{nf.format(v.clicks)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-zinc-300">{nf.format(v.telegram)}</td>
                            <td className="py-2 pl-3 text-right tabular-nums text-zinc-300">{nf.format(v.whatsapp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>
        </>
      )}

      <p className="flex items-start gap-2 text-xs text-zinc-400">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          No se guarda IP, nombre, correo ni teléfono: solo qué pasó y un código al azar por navegador, para contar personas distintas. No se cuenta a quien tiene activado “No rastrear”, a los robots ni al equipo con sesión iniciada.
          {!wholeSite && ' Las vistas de un producto se cuentan para la tienda dueña del producto.'}
        </span>
      </p>
    </div>
  );
};

export default TrafficPage;
