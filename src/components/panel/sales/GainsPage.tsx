import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircleAlert, Database, PiggyBank, RefreshCw, Save, Search } from 'lucide-react';
import { Card, PageHeader, StateNote, primaryBtn, secondaryBtn } from '../ui';
import { inputCls } from '../fields';
import type { SalesState } from '../../../lib/salesStore';
import { ensureCostsLoaded, saveCostChanges, useCosts, type CostChange } from '../../../lib/costsStore';
import { buildCostMap, costKey, costPlanKeys, gainTotals, gainsByProduct, unitProfit } from '../../../lib/gainsMath';
import { formatDay, inDayRange, limaDay, money, parseAmount, PERIOD_OPTIONS, resolvePeriod, type PeriodId } from '../../../lib/salesMath';
import { SalesGate, scopeData, vendorName, type SalesCtx } from './shared';

const nf = new Intl.NumberFormat('es-PE');
const pct = (n: number | null) => (n === null ? '—' : `${n.toLocaleString('es-PE', { maximumFractionDigits: 1 })} %`);

interface EditorRow {
  key: string;
  productId: string;
  title: string;
  plan: string;
  planLabel: string;
  price: number | null;
}

const Tile: React.FC<{ label: string; value: string; hint?: string; tone?: 'good' | 'bad' | 'plain' }> = ({ label, value, hint, tone = 'plain' }) => (
  <Card className="p-4">
    <p className="text-xs font-medium text-zinc-400">{label}</p>
    <p className={`mt-1 text-2xl font-bold tabular-nums ${tone === 'good' ? 'text-emerald-300' : tone === 'bad' ? 'text-rose-300' : 'text-white'}`}>{value}</p>
    {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
  </Card>
);

const Body: React.FC<{ ctx: SalesCtx; state: SalesState }> = ({ ctx, state }) => {
  const costs = useCosts();
  const { sales: scoped } = useMemo(() => scopeData(state, ctx), [state, ctx.isSuperAdmin, ctx.currentVendor.id]);
  const [period, setPeriod] = useState<PeriodId>('month');
  const [vendor, setVendor] = useState('all');
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const editorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void ensureCostsLoaded();
  }, []);

  const base = useMemo(() => (vendor === 'all' ? scoped : scoped.filter((s) => s.vendorId === vendor)), [scoped, vendor]);
  const earliest = useMemo(() => (base.length ? limaDay(base.reduce((a, s) => (s.soldAt < a ? s.soldAt : a), base[0].soldAt)) : undefined), [base]);
  const range = useMemo(() => resolvePeriod(period, Date.now(), earliest), [period, earliest]);
  const current = useMemo(() => base.filter((s) => inDayRange(s, range.fromDay, range.toDay)), [base, range]);

  const costMap = useMemo(() => buildCostMap(costs.rows), [costs.rows]);
  const totals = useMemo(() => gainTotals(current, costMap), [current, costMap]);
  const byProduct = useMemo(() => gainsByProduct(current, costMap), [current, costMap]);
  const missing = byProduct.filter((p) => p.missingCost > 0);

  // ---- editor de costos: la tienda a la que pertenecen los costos que se escriben
  const costVendor = ctx.isSuperAdmin ? (vendor === 'all' ? null : vendor) : ctx.currentVendor.id;
  const rows = useMemo<EditorRow[]>(() => {
    if (!costVendor) return [];
    const store = ctx.vendors.find((v) => v.id === costVendor);
    const list = ctx.isSuperAdmin ? ctx.services.filter((s) => store?.allowedServiceIds?.includes(s.id)) : ctx.services;
    const out: EditorRow[] = [];
    for (const s of list) {
      const plans = s.details?.plans || [];
      const single = plans.length <= 1;
      for (const plan of costPlanKeys(plans.map((p) => p.name))) {
        const found = plan ? plans.find((p) => p.name.trim() === plan) : single ? plans[0] : undefined;
        out.push({
          key: costKey(costVendor, s.id, plan),
          productId: s.id,
          title: s.title,
          plan,
          // Con varios planes, la fila sin plan es el costo general del producto
          planLabel: plan || (single ? plans[0]?.name || '' : 'Todos los planes'),
          price: found ? parseAmount(found.price || '') : single ? parseAmount(s.priceFrom || '') : null
        });
      }
    }
    return out;
  }, [costVendor, ctx.vendors, ctx.services, ctx.isSuperAdmin]);

  const saved = (key: string) => {
    const hit = costs.rows.find((r) => costKey(r.vendorId, r.productId, r.plan) === key);
    return hit ? hit.cost : null;
  };
  const valueOf = (r: EditorRow) => (r.key in drafts ? drafts[r.key] : saved(r.key) === null ? '' : String(saved(r.key)));
  const parsed = (text: string) => (text.trim() === '' ? null : parseAmount(text));
  const invalid = (text: string) => {
    if (text.trim() === '') return false;
    const n = parseAmount(text);
    return n === null || n < 0 || n > 100000 || !/^\s*(S\/\s*)?\d+([.,]\d{1,2})?\s*$/.test(text);
  };
  const changes = useMemo<CostChange[]>(() => {
    const out: CostChange[] = [];
    for (const r of rows) {
      if (!(r.key in drafts)) continue;
      const text = drafts[r.key];
      if (invalid(text)) continue;
      const next = parsed(text);
      if (next !== saved(r.key)) out.push({ vendorId: costVendor!, productId: r.productId, plan: r.plan, cost: next });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, drafts, costs.rows, costVendor]);
  const hasInvalid = rows.some((r) => r.key in drafts && invalid(drafts[r.key]));
  const shownRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? rows.filter((r) => r.title.toLowerCase().includes(term) || r.planLabel.toLowerCase().includes(term)) : rows;
  }, [rows, search]);

  const save = async () => {
    if (hasInvalid || !changes.length) return;
    setSaving(true);
    setSaveError('');
    const res = await saveCostChanges(changes);
    setSaving(false);
    if (!res.ok) {
      setSaveError(res.error || 'No se pudo guardar.');
      return;
    }
    setDrafts({});
    ctx.onToast(changes.length === 1 ? 'Costo guardado.' : `${changes.length} costos guardados.`);
  };

  const goToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => editorRef.current?.querySelector<HTMLElement>('input[data-cost-input], select')?.focus(), 350);
  };

  const periodLabel = `${formatDay(range.fromDay)} al ${formatDay(range.toDay)}`;
  const noCostsYet = costs.status === 'ready' && costs.rows.length === 0;

  if (costs.status === 'missing') {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <PageHeader title="Ganancias" description="Cuánto te queda después de restar lo que te cuesta cada producto." />
        <StateNote
          icon={Database}
          tone="amber"
          title="Falta activar los costos"
          action={
            <button type="button" onClick={() => void ensureCostsLoaded(true)} className={`${secondaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Comprobar de nuevo
            </button>
          }
        >
          {ctx.isStaffAdmin ? (
            <>
              <p>Para calcular tu ganancia hace falta guardar lo que te cuesta cada producto. Esa parte todavía no existe en tu base de datos. Se activa una sola vez:</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>
                  Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.
                </li>
                <li>
                  Pega todo el archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/11-costos-y-ganancias.sql</code> y pulsa <strong className="text-white">Run</strong>.
                </li>
                <li>Vuelve aquí y pulsa “Comprobar de nuevo”. Los costos son privados: la tienda pública nunca los ve.</li>
              </ol>
            </>
          ) : (
            <p>Pídele al administrador de la web que active los costos.</p>
          )}
        </StateNote>
      </div>
    );
  }
  if (costs.status === 'error') {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <PageHeader title="Ganancias" description="Cuánto te queda después de restar lo que te cuesta cada producto." />
        <StateNote
          icon={CircleAlert}
          tone="rose"
          title="No se pudieron cargar los costos"
          action={
            <button type="button" onClick={() => void ensureCostsLoaded(true)} className={`${primaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Intentar de nuevo
            </button>
          }
        >
          <p role="alert">{costs.error}</p>
        </StateNote>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Ganancias"
        description="Cuánto te queda después de restar lo que te cuesta cada producto. Solo cuentan las ventas pagadas."
        actions={
          <>
            <label className="sr-only" htmlFor="gan-periodo">
              Período
            </label>
            <select id="gan-periodo" value={period} onChange={(e) => setPeriod(e.target.value as PeriodId)} className={`${inputCls} max-w-[15rem] cursor-pointer`}>
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            {ctx.isSuperAdmin && (
              <>
                <label className="sr-only" htmlFor="gan-tienda">
                  Tienda
                </label>
                <select id="gan-tienda" value={vendor} onChange={(e) => setVendor(e.target.value)} className={`${inputCls} max-w-[15rem] cursor-pointer`}>
                  <option value="all">Todas las tiendas</option>
                  {ctx.vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </>
        }
      />
      <p className="-mt-3 text-xs text-zinc-400">{periodLabel}</p>

      <section aria-label="Resumen de ganancias" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Ingresos (ventas pagadas)" value={money(totals.revenue)} hint={`${nf.format(totals.paidSales)} venta${totals.paidSales === 1 ? '' : 's'} pagada${totals.paidSales === 1 ? '' : 's'}`} />
        <Tile label="Lo que te costó" value={totals.salesWithCost ? money(totals.cost) : '—'} hint={totals.salesWithCost ? `De ${nf.format(totals.salesWithCost)} venta${totals.salesWithCost === 1 ? '' : 's'} con costo` : 'Todavía no hay costos puestos'} />
        <Tile label="Ganancia" value={totals.salesWithCost ? money(totals.profit) : '—'} tone={totals.salesWithCost ? (totals.profit >= 0 ? 'good' : 'bad') : 'plain'} hint={totals.profit < 0 && totals.salesWithCost ? 'Estás perdiendo dinero en lo vendido' : 'Ingresos menos costos'} />
        <Tile label="Margen" value={pct(totals.margin)} hint="De cada S/ 100 vendidos, lo que queda" />
      </section>

      {totals.salesMissingCost > 0 && (
        <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-[13px] text-amber-100">
          <CircleAlert className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <strong className="text-white">{nf.format(totals.salesMissingCost)} venta{totals.salesMissingCost === 1 ? '' : 's'} pagada{totals.salesMissingCost === 1 ? '' : 's'} ({money(totals.revenueMissingCost)}) no tiene{totals.salesMissingCost === 1 ? '' : 'n'} costo</strong> y no cuenta{totals.salesMissingCost === 1 ? '' : 'n'} en la ganancia
            {missing.length > 0 ? `: ${missing.slice(0, 4).map((p) => `${p.title} (${p.missingCost})`).join(', ')}${missing.length > 4 ? '…' : ''}` : ''}.
          </span>
          <button type="button" onClick={goToEditor} className={secondaryBtn}>
            Poner costos
          </button>
        </p>
      )}

      <Card as="section" aria-labelledby="gan-productos" className="p-5">
        <h2 id="gan-productos" className="text-base font-semibold text-white">
          Ganancia por producto
        </h2>
        {byProduct.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400" role="status">
            No hay ventas pagadas en este período.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto" role="region" aria-label="Tabla de ganancia por producto" tabIndex={0}>
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Ventas, ingresos, costo y ganancia de cada producto en {periodLabel}</caption>
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-400">
                  <th scope="col" className="py-2 pr-3 font-medium">Producto</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Ventas</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Ingresos</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Costo</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Ganancia</th>
                  <th scope="col" className="py-2 pl-3 text-right font-medium">Margen</th>
                </tr>
              </thead>
              <tbody>
                {byProduct.map((p) => (
                  <tr key={p.key} className="border-b border-zinc-800/60 last:border-0">
                    <th scope="row" className="py-2.5 pr-3 font-medium text-white">{p.title}</th>
                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{nf.format(p.units)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{money(p.revenue)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">{p.withCost ? money(p.cost) : '—'}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {p.withCost ? (
                        <span className={`font-semibold ${p.profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{money(p.profit)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-200">
                          <CircleAlert className="h-3 w-3" aria-hidden="true" /> Falta el costo
                        </span>
                      )}
                      {p.withCost > 0 && p.missingCost > 0 && <span className="mt-0.5 block text-[11px] text-amber-200">{p.missingCost} sin costo</span>}
                    </td>
                    <td className="py-2.5 pl-3 text-right tabular-nums text-zinc-300">{pct(p.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {noCostsYet && <p className="mt-3 text-xs text-zinc-400">Todavía no has puesto ningún costo. Escríbelos abajo para ver tu ganancia real.</p>}
      </Card>

      <section ref={editorRef} aria-labelledby="gan-costos" id="gan-costos" className="scroll-mt-24">
        <Card className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="gan-costos" className="text-base font-semibold text-white">
                Lo que te cuesta cada producto
              </h2>
              <p className="mt-0.5 text-[13px] text-zinc-400">
                Escribe cuánto pagas tú por cada uno. Es privado: la tienda pública nunca lo ve. Si lo dejas vacío, esas ventas no cuentan en la ganancia.
              </p>
            </div>
            <PiggyBank className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" />
          </div>

          {!costVendor ? (
            <p role="status" className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300">
              Cada tienda tiene sus propios costos. Elige una tienda arriba (en lugar de “Todas las tiendas”) para ponerlos.
            </p>
          ) : rows.length === 0 ? (
            <p role="status" className="text-sm text-zinc-400">
              {vendorName(ctx.vendors, costVendor)} todavía no tiene productos para ponerles costo.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[13px] text-zinc-300">
                  Costos de <strong className="text-white">{vendorName(ctx.vendors, costVendor)}</strong>
                </p>
                <div className="relative ml-auto w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto" aria-label="Buscar producto para ponerle costo" className={`${inputCls} pl-9`} />
                </div>
              </div>
              <div className="overflow-x-auto" role="region" aria-label="Tabla de costos por producto" tabIndex={0}>
                <table className="w-full min-w-[560px] text-left text-sm">
                  <caption className="sr-only">Costo de cada producto y plan, con lo que ganas por venta</caption>
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs text-zinc-400">
                      <th scope="col" className="py-2 pr-3 font-medium">Producto</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Precio de venta</th>
                      <th scope="col" className="px-3 py-2 font-medium">Tu costo (S/)</th>
                      <th scope="col" className="py-2 pl-3 font-medium">Ganas por venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownRows.map((r) => {
                      const text = valueOf(r);
                      const bad = invalid(text);
                      const up = unitProfit(r.price, bad ? null : parsed(text));
                      return (
                        <tr key={r.key} className="border-b border-zinc-800/60 last:border-0">
                          <th scope="row" className="py-2 pr-3 font-medium text-white">
                            {r.title}
                            {r.planLabel && <span className="block text-xs font-normal text-zinc-400">{r.planLabel}</span>}
                          </th>
                          <td className="px-3 py-2 text-right tabular-nums text-zinc-300">{r.price === null ? '—' : money(r.price)}</td>
                          <td className="px-3 py-2">
                            <div className="relative w-32">
                              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                                S/
                              </span>
                              <input
                                data-cost-input
                                inputMode="decimal"
                                value={text}
                                onChange={(e) => setDrafts((d) => ({ ...d, [r.key]: e.target.value }))}
                                aria-label={`Costo de ${r.title}${r.planLabel ? ` (${r.planLabel})` : ''}`}
                                aria-invalid={bad ? true : undefined}
                                placeholder="0.00"
                                className={`${inputCls} pl-8`}
                              />
                            </div>
                            {bad && (
                              <p role="alert" className="mt-1 text-xs text-rose-300">
                                Usa solo números, por ejemplo 8 o 8.50.
                              </p>
                            )}
                          </td>
                          <td className="py-2 pl-3 text-[13px] tabular-nums">
                            {up ? (
                              <span className={up.profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                                {money(up.profit)} <span className="text-zinc-400">({pct(up.margin)})</span>
                              </span>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {shownRows.length === 0 && (
                <p role="status" className="text-sm text-zinc-400">
                  Ningún producto coincide con lo que buscas.
                </p>
              )}
              {saveError && (
                <p role="alert" className="text-sm text-rose-300">
                  {saveError}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => void save()} disabled={saving || hasInvalid || changes.length === 0} className={primaryBtn}>
                  <Save className="h-4 w-4" aria-hidden="true" /> {saving ? 'Guardando…' : changes.length ? `Guardar ${changes.length} cambio${changes.length === 1 ? '' : 's'}` : 'Guardar costos'}
                </button>
                <p role="status" className={`text-xs ${changes.length ? 'text-amber-200' : 'text-zinc-400'}`}>
                  {changes.length ? 'Tienes cambios sin guardar.' : 'Todo guardado.'}
                </p>
              </div>
            </>
          )}
        </Card>
      </section>
      <p className="text-xs text-zinc-400">
        La ganancia usa el costo que tienes anotado hoy: si lo cambias, se recalcula también lo ya vendido. Para ventas sin producto del catálogo no se puede calcular.
      </p>
    </div>
  );
};

export const GainsPage: React.FC<{ ctx: SalesCtx }> = ({ ctx }) => <SalesGate ctx={ctx}>{(state) => <Body ctx={ctx} state={state} />}</SalesGate>;
export default GainsPage;
