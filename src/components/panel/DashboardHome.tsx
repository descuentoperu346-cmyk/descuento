import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Package,
  Plus,
  ReceiptText,
  ShieldAlert,
  ShoppingBag,
  Store,
  UsersRound
} from 'lucide-react';
import type { ServiceItem } from '../../data/servicesData';
import type { Vendor } from '../../data/vendorsData';
import type { PaymentMethodItem } from '../../data/paymentsData';
import type { LeakArticle } from '../../data/leaksData';
import type { BuyerRecord } from '../../lib/supabaseBrowser';
import { computeAttention, isPublished, type ProductFilter } from './panelHealth';
import type { PanelNavId } from './panelNav';
import { Card, DeltaTag, PageHeader, SEVERITY_STYLE, SeverityChip, primaryBtn, secondaryBtn } from './ui';
import { ensureSalesLoaded, type SalesState } from '../../lib/salesStore';
import { inDayRange, latestSubscriptions, limaDay, money, pctChange, resolvePeriod, round2, subscriptionInfo, todayLima, totals } from '../../lib/salesMath';
import { StatusChip } from './sales/shared';

interface DashboardHomeProps {
  userName: string;
  /** Productos visibles para la tienda con la que se trabaja */
  services: ServiceItem[];
  /** Todas las tiendas (solo se muestran las de la tabla si isSuperAdmin) */
  vendors: Vendor[];
  currentVendor: Vendor;
  paymentMethods: PaymentMethodItem[];
  leakArticles: LeakArticle[];
  serverOk: boolean;
  isSuperAdmin: boolean;
  /** Solo el rol DEV y solo con la base conectada: lee los compradores registrados */
  showBuyers: boolean;
  onNavigate: (id: PanelNavId, productFilter?: ProductFilter) => void;
  onNewProduct: () => void;
  onOpenStore: () => void;
  /** Solo para el rol DEV: pasar a trabajar en otra tienda */
  onSwitchStore?: (vendorId: string) => void;
  /** Ventas y clientes (solo con la base de datos conectada) */
  salesEnabled: boolean;
  sales: SalesState;
  onNewSale: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  streaming: 'Streaming',
  leaks: 'Leaks y ciberseguridad',
  investigacion: 'Investigación',
  educacion: 'Educación'
};

const nf = new Intl.NumberFormat('es-PE');

function limaGreeting(): { saludo: string; fecha: string } {
  const hour = Number(new Date().toLocaleString('es-PE', { hour: 'numeric', hour12: false, timeZone: 'America/Lima' }));
  const saludo = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const f = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Lima' });
  return { saludo, fecha: f.charAt(0).toUpperCase() + f.slice(1) };
}

interface BuyersState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  buyers: BuyerRecord[];
}

/** Lee los compradores registrados (solo el DEV recibe filas de otras personas; la base lo exige). */
function useBuyers(enabled: boolean): BuyersState {
  const [state, setState] = useState<BuyersState>({ status: enabled ? 'loading' : 'idle', buyers: [] });
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState({ status: 'loading', buyers: [] });
    import('../../lib/supabaseBrowser')
      .then((m) => m.readTeamAndBuyers())
      .then((res) => {
        if (cancelled) return;
        setState(res.error ? { status: 'error', buyers: [] } : { status: 'ready', buyers: res.buyers });
      })
      .catch(() => !cancelled && setState({ status: 'error', buyers: [] }));
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return state;
}

interface Tile {
  key: string;
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  /** 0–1: muestra un medidor */
  ratio?: number;
  go: () => void;
  goLabel: string;
}

const GRID_COLS: Record<number, string> = { 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6' };

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  userName,
  services,
  vendors,
  currentVendor,
  paymentMethods,
  leakArticles,
  serverOk,
  isSuperAdmin,
  showBuyers,
  onNavigate,
  onNewProduct,
  onOpenStore,
  onSwitchStore,
  salesEnabled,
  sales,
  onNewSale
}) => {
  const { saludo, fecha } = useMemo(limaGreeting, []);
  const buyers = useBuyers(showBuyers);

  // Las ventas se cargan una sola vez y se comparten con las demás pantallas
  useEffect(() => {
    if (salesEnabled) void ensureSalesLoaded();
  }, [salesEnabled]);

  // Cifras del negocio: salen de las ventas que el equipo registró, nunca de ejemplos
  const biz = useMemo(() => {
    if (!salesEnabled || sales.status !== 'ready') return null;
    const scoped = isSuperAdmin ? sales.sales : sales.sales.filter((s) => s.vendorId === currentVendor.id);
    const now = Date.now();
    const month = resolvePeriod('month', now);
    const cur = totals(scoped.filter((s) => inDayRange(s, month.fromDay, month.toDay)));
    const prev = totals(scoped.filter((s) => inDayRange(s, month.prev!.fromDay, month.prev!.toDay)));
    const today = todayLima(now);
    const todayT = totals(scoped.filter((s) => limaDay(s.soldAt) === today));
    const subs = latestSubscriptions(scoped).map((s) => ({ s, info: subscriptionInfo(s, now)! })).filter((x) => x.info);
    const expiring = subs.filter((x) => x.info.state === 'expiring');
    const expiredRecent = subs.filter((x) => x.info.state === 'expired' && x.info.daysLeft >= -30);
    return {
      cur,
      pct: pctChange(cur.revenue, prev.revenue),
      todayT,
      expiring,
      expiringSum: round2(expiring.reduce((a, x) => a + x.s.amount, 0)),
      expiredRecent,
      pending: totals(scoped),
      recent: scoped.slice(0, 5),
      total: scoped.length
    };
  }, [salesEnabled, sales, isSuperAdmin, currentVendor.id]);

  const scopeVendors = isSuperAdmin ? vendors : [currentVendor];
  const catalogAttention = useMemo(
    () => computeAttention({ services, vendors: scopeVendors, paymentMethods, serverOk, isSuperAdmin }),
    // scopeVendors se recalcula en cada render; sus datos vienen de estas dependencias
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, vendors, currentVendor, paymentMethods, serverOk, isSuperAdmin]
  );
  // A los avisos del catálogo se suman los de cobros y renovaciones
  const attention = useMemo(() => {
    if (!biz) return catalogAttention;
    const extra: typeof catalogAttention = [];
    if (biz.expiring.length) {
      extra.push({
        id: 'por-vencer',
        severity: 'warning',
        title: `${biz.expiring.length} suscripción${biz.expiring.length === 1 ? '' : 'es'} ${biz.expiring.length === 1 ? 'vence' : 'vencen'} en 7 días`,
        detail: `Son ${money(biz.expiringSum)} que puedes asegurar si renuevan. Recuérdaselo con un mensaje.`,
        actionLabel: 'Ver renovaciones',
        target: 'renovaciones'
      });
    }
    if (biz.pending.pendingCount) {
      extra.push({
        id: 'por-cobrar',
        severity: 'warning',
        title: `${biz.pending.pendingCount} venta${biz.pending.pendingCount === 1 ? '' : 's'} pendiente${biz.pending.pendingCount === 1 ? '' : 's'} de cobro`,
        detail: `${money(biz.pending.pendingAmount)} por cobrar. Cuando te paguen, márcalas como pagadas.`,
        actionLabel: 'Ver ventas',
        target: 'ventas'
      });
    }
    if (biz.expiredRecent.length) {
      extra.push({
        id: 'vencidas-recientes',
        severity: 'info',
        title: `${biz.expiredRecent.length} suscripción${biz.expiredRecent.length === 1 ? ' venció' : 'es vencieron'} en los últimos 30 días`,
        detail: 'Todavía estás a tiempo de recuperar a estos clientes.',
        actionLabel: 'Ver renovaciones',
        target: 'renovaciones'
      });
    }
    const rank = { critical: 0, warning: 1, info: 2 } as const;
    return [...catalogAttention, ...extra].sort((a, b) => rank[a.severity] - rank[b.severity]);
  }, [catalogAttention, biz]);

  const published = services.filter(isPublished).length;
  const activePayments = paymentMethods.filter((m) => m.active).length;
  const upcoming = leakArticles.filter((a) => a.isUpcoming).length;
  const activeVendors = vendors.filter((v) => v.active).length;
  const urgent = attention.filter((a) => a.severity !== 'info').length;

  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const newBuyers = buyers.buyers.filter((b) => new Date(b.createdAt).getTime() >= weekAgo).length;

  const tiles: Tile[] = [
    {
      key: 'productos',
      label: 'Productos publicados',
      value: nf.format(published),
      sub: `de ${nf.format(services.length)} en total`,
      icon: Package,
      ratio: services.length ? published / services.length : 0,
      go: () => onNavigate('productos'),
      goLabel: 'Ver productos'
    },
    {
      key: 'pagos',
      label: 'Métodos de pago activos',
      value: nf.format(activePayments),
      sub: `de ${nf.format(paymentMethods.length)} configurados`,
      icon: CreditCard,
      ratio: paymentMethods.length ? activePayments / paymentMethods.length : 0,
      go: () => onNavigate('pagos'),
      goLabel: 'Ver métodos de pago'
    },
    {
      key: 'leaks',
      label: 'Artículos Leaks',
      value: nf.format(leakArticles.length),
      sub: upcoming ? `${upcoming} próximo${upcoming === 1 ? '' : 's'} a publicar` : 'en la revista',
      icon: ShieldAlert,
      go: () => onNavigate('leaks-articulos'),
      goLabel: 'Ver artículos'
    }
  ];
  if (isSuperAdmin) {
    tiles.push({
      key: 'tiendas',
      label: 'Tiendas activas',
      value: nf.format(activeVendors),
      sub: `de ${nf.format(vendors.length)} registradas`,
      icon: Store,
      ratio: vendors.length ? activeVendors / vendors.length : 0,
      go: () => onNavigate('gestion-vendedores'),
      goLabel: 'Ver tiendas'
    });
  }
  if (showBuyers) {
    tiles.push({
      key: 'compradores',
      label: 'Compradores registrados',
      value: buyers.status === 'ready' ? (buyers.buyers.length >= 500 ? '500+' : nf.format(buyers.buyers.length)) : '—',
      sub: buyers.status === 'ready' ? `${nf.format(newBuyers)} nuevos en 7 días` : buyers.status === 'error' ? 'No se pudo leer' : 'Cargando…',
      icon: UsersRound,
      go: () => onNavigate('equipo'),
      goLabel: 'Ver compradores'
    });
  }
  tiles.push({
    key: 'revisar',
    label: 'Por revisar',
    value: nf.format(attention.length),
    sub: attention.length === 0 ? 'nada pendiente' : urgent ? `${nf.format(urgent)} por corregir` : 'solo avisos informativos',
    icon: attention.length ? ShieldAlert : CheckCircle2,
    go: () => document.getElementById('panel-atencion')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    goLabel: 'Ir a la lista de avisos'
  });

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    services.forEach((s) => m.set(s.category, (m.get(s.category) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [services]);
  const maxCat = byCategory[0]?.[1] || 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={`${saludo}, ${userName}`}
        description={
          <>
            {fecha} · Trabajando en <strong className="font-semibold text-zinc-200">{currentVendor.name}</strong>
          </>
        }
        actions={
          <>
            <button type="button" onClick={onOpenStore} className={secondaryBtn}>
              <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Ver tienda
            </button>
            <button type="button" onClick={onNewProduct} className={salesEnabled ? secondaryBtn : primaryBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo producto
            </button>
            {salesEnabled && (
              <button type="button" onClick={onNewSale} className={primaryBtn}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Registrar venta
              </button>
            )}
          </>
        }
      />

      {/* Tu negocio: cifras de las ventas registradas */}
      {salesEnabled && (
        <section aria-labelledby="negocio-titulo" className="space-y-3">
          <h2 id="negocio-titulo" className="text-sm font-semibold text-zinc-200">
            Tu negocio este mes
          </h2>
          {sales.status === 'missing' ? (
            <Card className="flex flex-col gap-3 border-dashed p-5 sm:flex-row sm:items-center">
              <ReceiptText className="hidden h-5 w-5 shrink-0 text-amber-300 sm:block" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Activa las ventas y los clientes</p>
                <p className="mt-0.5 text-[13px] text-zinc-400">Con este módulo registras cada venta, guardas a tus clientes y ves quién está por vencer. Se activa una sola vez en tu base de datos.</p>
              </div>
              <button type="button" onClick={() => onNavigate('ventas')} className={`${secondaryBtn} shrink-0`}>
                Ver cómo activarlo
              </button>
            </Card>
          ) : sales.status === 'error' ? (
            <Card className="p-4 text-[13px] text-rose-200" role="alert">
              No se pudieron cargar las ventas: {sales.error}
            </Card>
          ) : !biz ? (
            <p className="text-sm text-zinc-400" role="status">
              Cargando cifras del negocio…
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Cifras del negocio">
              {[
                {
                  key: 'ingresos',
                  label: 'Ingresos del mes',
                  value: money(biz.cur.revenue),
                  extra: <DeltaTag pct={biz.pct} vs="el mismo tramo del mes anterior" />,
                  go: () => onNavigate('reportes'),
                  hint: 'Ver reportes'
                },
                {
                  key: 'hoy',
                  label: 'Ventas de hoy',
                  value: String(biz.todayT.count),
                  extra: <span className="text-xs text-zinc-400">{money(biz.todayT.revenue)} cobrados</span>,
                  go: () => onNavigate('ventas'),
                  hint: 'Ver ventas'
                },
                {
                  key: 'vencen',
                  label: 'Vencen en 7 días',
                  value: String(biz.expiring.length),
                  extra: <span className="text-xs text-zinc-400">{money(biz.expiringSum)} por renovar</span>,
                  go: () => onNavigate('renovaciones'),
                  hint: 'Ver renovaciones'
                },
                {
                  key: 'cobrar',
                  label: 'Pendiente de cobro',
                  value: money(biz.pending.pendingAmount),
                  extra: <span className="text-xs text-zinc-400">{biz.pending.pendingCount} venta{biz.pending.pendingCount === 1 ? '' : 's'} por cobrar</span>,
                  go: () => onNavigate('ventas'),
                  hint: 'Ver ventas'
                }
              ].map((t) => (
                <li key={t.key}>
                  <button
                    type="button"
                    onClick={t.go}
                    className="group flex h-full w-full flex-col rounded-xl border border-zinc-800/80 bg-[#101013] p-4 text-left transition-colors hover:border-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                  >
                    <span className="text-[13px] text-zinc-400">{t.label}</span>
                    <span className="mt-2 text-3xl font-semibold tracking-tight text-white">{t.value}</span>
                    <span className="mt-1">{t.extra}</span>
                    <span className="sr-only">. {t.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Cifras reales: salen de tu catálogo, no de ejemplos */}
      <div className="space-y-3">
        {salesEnabled && <h2 className="text-sm font-semibold text-zinc-200">Tu catálogo</h2>}
        <ul className={`grid grid-cols-2 gap-3 md:grid-cols-3 ${GRID_COLS[tiles.length] || 'xl:grid-cols-4'}`} aria-label="Cifras principales">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={t.go}
                  className="group flex h-full w-full flex-col rounded-xl border border-zinc-800/80 bg-[#101013] p-4 text-left transition-colors hover:border-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                >
                  <span className="flex items-center justify-between gap-2 text-[13px] text-zinc-400">
                    <span>{t.label}</span>
                    <Icon className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-emerald-300" aria-hidden="true" />
                  </span>
                  <span className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">{t.value}</span>
                  <span className="mt-1 text-xs text-zinc-400">{t.sub}</span>
                  <span className="sr-only">. {t.goLabel}</span>
                  {t.ratio !== undefined && (
                    <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-emerald-400/15" aria-hidden="true">
                      <span className="block h-full rounded-full bg-[#00ff88]" style={{ width: `${Math.round(t.ratio * 100)}%` }} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Requiere atención */}
          <Card as="section" id="panel-atencion" aria-labelledby="atencion-titulo" className="scroll-mt-20">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
              <h2 id="atencion-titulo" className="text-base font-semibold text-white">
                Requiere atención
              </h2>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-zinc-200">{attention.length}</span>
            </div>
            {attention.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-8 text-sm text-zinc-300">
                <CheckCircle2 className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />
                Todo en orden: no hay nada pendiente en tu catálogo ni en tus tiendas.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800/80">
                {attention.map((a) => {
                  const Icon = SEVERITY_STYLE[a.severity].icon;
                  return (
                    <li key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                      <Icon className={`hidden h-5 w-5 shrink-0 sm:block ${SEVERITY_STYLE[a.severity].iconClass}`} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityChip severity={a.severity} />
                          <p className="text-sm font-medium text-white">{a.title}</p>
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{a.detail}</p>
                      </div>
                      {a.target && (
                        <button type="button" onClick={() => onNavigate(a.target!, a.productFilter)} className={`${secondaryBtn} shrink-0`}>
                          {a.actionLabel || 'Abrir'} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Tiendas (administración) o mi tienda (vendedor) */}
          {isSuperAdmin ? (
            <Card as="section" aria-labelledby="tiendas-titulo">
              <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
                <h2 id="tiendas-titulo" className="text-base font-semibold text-white">
                  Tiendas
                </h2>
                <button type="button" onClick={() => onNavigate('gestion-vendedores')} className="text-[13px] font-semibold text-emerald-300 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-emerald-300">
                  Administrar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-[13px]">
                  <caption className="sr-only">Resumen por tienda: productos, métodos de pago y estado</caption>
                  <thead>
                    <tr className="text-xs text-zinc-400">
                      <th scope="col" className="px-5 py-2.5 font-medium">Tienda</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Productos</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Pagos</th>
                      <th scope="col" className="px-3 py-2.5 font-medium">Estado</th>
                      {onSwitchStore && <th scope="col" className="px-5 py-2.5 text-right font-medium"><span className="sr-only">Acción</span></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {vendors.map((v) => {
                      const mine = services.filter((s) => v.allowedServiceIds.includes(s.id)).length;
                      return (
                        <tr key={v.id} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-3">
                            <p className="font-medium text-white">{v.name}</p>
                            <p className="text-xs text-zinc-400">@{v.username}</p>
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-zinc-200">{mine}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-zinc-200">{v.paymentMethods.length}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${v.active ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}>
                              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${v.active ? 'bg-[#00ff88]' : 'bg-zinc-500'}`} />
                              {v.active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          {onSwitchStore && (
                            <td className="px-5 py-3 text-right">
                              {v.id === currentVendor.id ? (
                                <span className="text-xs font-medium text-zinc-400">Trabajando aquí</span>
                              ) : (
                                <button type="button" onClick={() => onSwitchStore(v.id)} className="text-[13px] font-semibold text-emerald-300 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-emerald-300">
                                  Gestionar<span className="sr-only"> {v.name}</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card as="section" aria-labelledby="mitienda-titulo" className="p-5">
              <h2 id="mitienda-titulo" className="text-base font-semibold text-white">
                Mi tienda
              </h2>
              <dl className="mt-4 grid gap-4 text-[13px] sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-zinc-400">Nombre público</dt>
                  <dd className="mt-0.5 font-medium text-white">{currentVendor.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Telegram</dt>
                  <dd className="mt-0.5 font-medium text-white">
                    {currentVendor.telegramUrl ? (
                      <a href={currentVendor.telegramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200">
                        @{currentVendor.username} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        <span className="sr-only">(se abre en una pestaña nueva)</span>
                      </a>
                    ) : (
                      <span className="text-amber-200">Sin configurar</span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-zinc-400">Métodos de pago que muestras</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {currentVendor.paymentMethods.length ? (
                      currentVendor.paymentMethods.map((m) => (
                        <span key={m} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-200">
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-amber-200">Ninguno todavía</span>
                    )}
                  </dd>
                </div>
              </dl>
              <button type="button" onClick={() => onNavigate('perfil')} className={`${secondaryBtn} mt-4`}>
                Editar mi perfil <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Últimas ventas */}
          {biz && (
            <Card as="section" aria-labelledby="ult-ventas-titulo" className="p-5">
              <div className="flex items-center justify-between">
                <h2 id="ult-ventas-titulo" className="text-base font-semibold text-white">
                  Últimas ventas
                </h2>
                <button type="button" onClick={() => onNavigate('ventas')} className="text-[13px] font-semibold text-emerald-300 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-emerald-300">
                  Ver todas
                </button>
              </div>
              {biz.recent.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-400">Todavía no registraste ninguna venta. Anota la primera con “Registrar venta”.</p>
              ) : (
                <ul className="mt-3 divide-y divide-zinc-800/60">
                  {biz.recent.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">{s.customerName}</p>
                        <p className="truncate text-xs text-zinc-400">{s.productTitle}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-semibold tabular-nums text-white">{money(s.amount)}</span>
                        <StatusChip status={s.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* Catálogo por categoría */}
          <Card as="section" aria-labelledby="cat-titulo" className="p-5">
            <h2 id="cat-titulo" className="text-base font-semibold text-white">
              Catálogo por categoría
            </h2>
            {byCategory.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-400">Todavía no hay productos. Crea el primero con “Nuevo producto”.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byCategory.map(([cat, n]) => (
                  <li key={cat}>
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className="text-zinc-200">{CATEGORY_NAMES[cat] || cat}</span>
                      <span className="font-semibold tabular-nums text-white">{n}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-r bg-emerald-400/10" aria-hidden="true">
                      <div className="h-full rounded-r bg-[#00ff88]" style={{ width: `${Math.max(6, Math.round((n / maxCat) * 100))}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Compradores recientes (solo DEV) */}
          {showBuyers && (
            <Card as="section" aria-labelledby="comp-titulo" className="p-5">
              <div className="flex items-center justify-between">
                <h2 id="comp-titulo" className="text-base font-semibold text-white">
                  Compradores recientes
                </h2>
                <button type="button" onClick={() => onNavigate('equipo')} className="text-[13px] font-semibold text-emerald-300 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-emerald-300">
                  Ver todos
                </button>
              </div>
              {buyers.status === 'loading' && <p className="mt-3 text-sm text-zinc-400">Cargando…</p>}
              {buyers.status === 'error' && <p className="mt-3 text-sm text-rose-300">No se pudo leer la lista de compradores.</p>}
              {buyers.status === 'ready' && buyers.buyers.length === 0 && (
                <p className="mt-3 text-sm text-zinc-400">Todavía nadie se registró para comprar. Cuando alguien cree su cuenta, aparecerá aquí.</p>
              )}
              {buyers.status === 'ready' && buyers.buyers.length > 0 && (
                <ul className="mt-3 divide-y divide-zinc-800/60">
                  {buyers.buyers.slice(0, 5).map((b) => (
                    <li key={b.userId} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                      <span className="min-w-0 truncate text-zinc-200">{b.name || b.email}</span>
                      <time dateTime={b.createdAt} className="shrink-0 text-xs text-zinc-400">
                        {new Date(b.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', timeZone: 'America/Lima' })}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* Artículos recientes */}
          {leakArticles.length > 0 && (
            <Card as="section" aria-labelledby="leaks-titulo" className="p-5">
              <div className="flex items-center justify-between">
                <h2 id="leaks-titulo" className="text-base font-semibold text-white">
                  Artículos de la revista
                </h2>
                <button type="button" onClick={() => onNavigate('leaks-articulos')} className="text-[13px] font-semibold text-emerald-300 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-emerald-300">
                  Administrar
                </button>
              </div>
              <ul className="mt-3 divide-y divide-zinc-800/60">
                {leakArticles.slice(0, 4).map((a) => (
                  <li key={a.id} className="py-2.5 text-[13px]">
                    <p className="line-clamp-1 font-medium text-zinc-100">{a.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {a.categoryLabel}
                      {a.isUpcoming ? ' · Próximo' : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Tráfico: cifras reales (necesita la base de datos) */}
      {salesEnabled && (
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <Activity className="hidden h-5 w-5 shrink-0 text-emerald-300 sm:block" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Visitas y clics de tu web</p>
            <p className="mt-0.5 text-[13px] text-zinc-400">Mira cuántas personas entran, qué productos abren y cuántas te escriben por Telegram o WhatsApp.</p>
          </div>
          <button type="button" onClick={() => onNavigate('telemetria')} className={`${secondaryBtn} shrink-0`}>
            Ver tráfico y clics
          </button>
        </Card>
      )}
    </div>
  );
};
