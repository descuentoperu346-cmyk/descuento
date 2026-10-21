import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Edit3, Eye, EyeOff, PackageOpen, Plus, Search, Trash2, TriangleAlert, X } from 'lucide-react';
import type { ServiceItem } from '../../data/servicesData';
import type { Vendor } from '../../data/vendorsData';
import { Card, PageHeader, primaryBtn, secondaryBtn } from './ui';
import { Switch } from './fields';
import { hasOwnImage, isPublished, matchesProductFilter, priceNumber, productPrice, type ProductFilter } from './panelHealth';

/** Ventas pagadas de un producto (solo se muestra cuando las ventas ya están cargadas) */
export interface ProductSalesStat {
  units: number;
  revenue: number;
}

interface ProductsTableProps {
  services: ServiceItem[];
  vendors: Vendor[];
  /** Muestra la columna de tiendas (solo administración) */
  showStores: boolean;
  canDelete: boolean;
  initialFilter?: ProductFilter;
  /** Ventas por id de producto; null cuando el módulo de ventas no está disponible */
  salesByProduct?: Map<string, ProductSalesStat> | null;
  formatMoney?: (n: number) => string;
  onNew: () => void;
  onEdit: (service: ServiceItem) => void;
  onDuplicate: (service: ServiceItem) => void;
  onBulkUpdate: (ids: string[], patch: Partial<ServiceItem>) => void;
  onDelete: (ids: string[]) => void;
}

type SortKey = 'title' | 'price' | 'status' | 'sales';

const STOCK_LABEL: Record<NonNullable<ServiceItem['stockStatus']>, string> = {
  in_stock: 'Disponible',
  few_left: 'Pocas unidades',
  preorder: 'Preventa'
};
const CATEGORY_NAMES: Record<string, string> = {
  streaming: 'Streaming',
  leaks: 'Leaks y ciberseguridad',
  investigacion: 'Investigación',
  educacion: 'Educación'
};
const PAGE = 25;

const FILTERS: { id: ProductFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'published', label: 'Publicados' },
  { id: 'hidden', label: 'Ocultos' },
  { id: 'noimage', label: 'Sin imagen' },
  { id: 'noprice', label: 'Sin precio' }
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const ProductsTable: React.FC<ProductsTableProps> = ({ services, vendors, showStores, canDelete, initialFilter = 'all', salesByProduct = null, formatMoney = (n) => String(n), onNew, onEdit, onDuplicate, onBulkUpdate, onDelete }) => {
  const [filter, setFilter] = useState<ProductFilter>(initialFilter);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'title', dir: 'asc' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(PAGE);
  const allRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => [...new Set(services.map((s) => s.category))], [services]);
  const counts = useMemo(() => {
    const c = {} as Record<ProductFilter, number>;
    FILTERS.forEach((f) => (c[f.id] = services.filter((s) => matchesProductFilter(s, f.id)).length));
    return c;
  }, [services]);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    const list = services.filter(
      (s) =>
        matchesProductFilter(s, filter) &&
        (category === 'all' || s.category === category) &&
        (!q || norm(`${s.title} ${s.categoryLabel} ${s.badge || ''} ${s.description}`).includes(q))
    );
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === 'price') {
        const pa = priceNumber(a);
        const pb = priceNumber(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1; // sin precio siempre al final
        if (pb === null) return -1;
        return (pa - pb) * dir;
      }
      if (sort.key === 'status') return (Number(isPublished(a)) - Number(isPublished(b))) * dir || a.title.localeCompare(b.title, 'es');
      if (sort.key === 'sales') return ((salesByProduct?.get(a.id)?.units ?? 0) - (salesByProduct?.get(b.id)?.units ?? 0)) * dir || a.title.localeCompare(b.title, 'es');
      return a.title.localeCompare(b.title, 'es') * dir;
    });
  }, [services, filter, category, query, sort, salesByProduct]);

  const shown = rows.slice(0, limit);
  const selIds = services.filter((s) => selected.has(s.id)).map((s) => s.id);
  const allShownSelected = shown.length > 0 && shown.every((s) => selected.has(s.id));
  const someShownSelected = shown.some((s) => selected.has(s.id));

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someShownSelected && !allShownSelected;
  }, [someShownSelected, allShownSelected]);
  useEffect(() => setLimit(PAGE), [filter, category, query, sort]);

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAllShown = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allShownSelected) shown.forEach((s) => next.delete(s.id));
      else shown.forEach((s) => next.add(s.id));
      return next;
    });
  const clearFilters = () => {
    setFilter('all');
    setCategory('all');
    setQuery('');
  };

  const storeNames = (s: ServiceItem): string[] => {
    const ids = s.assignedVendorIds?.length ? s.assignedVendorIds : s.vendorId ? [s.vendorId] : [];
    return ids.map((id) => vendors.find((v) => v.id === id)?.name).filter((n): n is string => !!n);
  };

  // Se llama como función (no como componente) para que el botón conserve el foco al reordenar
  const sortTh = (k: SortKey, label: string) => {
    const on = sort.key === k;
    const Icon = !on ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <th scope="col" aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-3 py-2.5 font-medium">
        <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 rounded text-xs font-medium text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
          {label}
          <Icon className={`h-3 w-3 ${on ? 'text-emerald-300' : 'text-zinc-400'}`} aria-hidden="true" />
        </button>
      </th>
    );
  };

  const priceCell = (s: ServiceItem) => {
    const p = productPrice(s);
    return p ? (
      <span className="font-semibold tabular-nums text-white">{p}</span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-200">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" /> Sin precio
      </span>
    );
  };
  const stockCell = (s: ServiceItem) =>
    s.stockStatus ? (
      <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${s.stockStatus === 'few_left' ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-zinc-700 bg-zinc-900 text-zinc-300'}`}>
        {STOCK_LABEL[s.stockStatus]}
      </span>
    ) : (
      <span className="text-xs text-zinc-400">—</span>
    );
  const thumb = (s: ServiceItem) => (
    <img loading="lazy" decoding="async" src={s.customImageUrl || '/imagenes/card-leaks.jpg'} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-zinc-800 bg-black object-cover" />
  );
  const statusSwitch = (s: ServiceItem) => (
    <span className="inline-flex items-center gap-2">
      <Switch checked={isPublished(s)} label={`${s.title}: ${isPublished(s) ? 'publicado, pulsa para ocultar' : 'oculto, pulsa para publicar'}`} onChange={() => onBulkUpdate([s.id], { active: !isPublished(s) })} />
      <span className={`text-xs font-medium ${isPublished(s) ? 'text-emerald-200' : 'text-zinc-400'}`}>{isPublished(s) ? 'Publicado' : 'Oculto'}</span>
    </span>
  );
  const salesCell = (s: ServiceItem) => {
    const st = salesByProduct?.get(s.id);
    return st ? (
      <span className="tabular-nums">
        <span className="font-semibold text-white">{st.units}</span>
        <span className="text-zinc-400"> · {formatMoney(st.revenue)}</span>
      </span>
    ) : (
      <span className="text-xs text-zinc-400">Sin ventas</span>
    );
  };
  const actions = (s: ServiceItem) => (
    <span className="inline-flex items-center gap-1">
      <button type="button" onClick={() => onEdit(s)} aria-label={`Editar ${s.title}`} title="Editar" className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => onDuplicate(s)} aria-label={`Duplicar ${s.title}`} title="Duplicar" className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
        <Copy className="h-4 w-4" aria-hidden="true" />
      </button>
      {canDelete && (
        <button type="button" onClick={() => onDelete([s.id])} aria-label={`Eliminar ${s.title}`} title="Eliminar" className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </span>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Productos"
        description={`${services.length} en total · ${counts.published} publicados en la tienda`}
        actions={
          <button type="button" onClick={onNew} className={primaryBtn}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo producto
          </button>
        }
      />

      <Card>
        {/* Filtros */}
        <div className="space-y-3 border-b border-zinc-800/80 p-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                    on ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {f.label}
                  <span className={`tabular-nums ${on ? 'text-emerald-200' : 'text-zinc-400'}`}>{counts[f.id]}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar productos</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, categoría o etiqueta…"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-400 focus:border-emerald-400/60 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="sr-only sm:not-sr-only">Categoría</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-400/60 focus:outline-none sm:w-auto">
                <option value="all">Todas</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_NAMES[c] || c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Barra de acciones en bloque */}
        {selIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5" role="region" aria-label="Acciones para los productos seleccionados">
            <span className="mr-1 text-[13px] font-semibold text-emerald-100">
              {selIds.length} seleccionado{selIds.length === 1 ? '' : 's'}
            </span>
            <button type="button" onClick={() => onBulkUpdate(selIds, { active: true })} className={`${secondaryBtn} !py-1.5 !text-xs`}>
              <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Publicar
            </button>
            <button type="button" onClick={() => onBulkUpdate(selIds, { active: false })} className={`${secondaryBtn} !py-1.5 !text-xs`}>
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Ocultar
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(selIds);
                  setSelected(new Set());
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Eliminar
              </button>
            )}
            <button type="button" onClick={() => setSelected(new Set())} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300">
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Quitar selección
            </button>
          </div>
        )}

        {/* Sin resultados */}
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <PackageOpen className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            {services.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-white">Aún no hay productos</p>
                <p className="max-w-sm text-[13px] text-zinc-400">Crea el primero y aparecerá en la tienda en cuanto lo publiques.</p>
                <button type="button" onClick={onNew} className={primaryBtn}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo producto
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-white">Ningún producto coincide con lo que buscas</p>
                <button type="button" onClick={clearFilters} className={secondaryBtn}>
                  Quitar filtros
                </button>
              </>
            )}
          </div>
        )}

        {/* Tabla (pantallas medianas y grandes) */}
        {rows.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-[13px]">
              <caption className="sr-only">Lista de productos con precio, disponibilidad y estado de publicación</caption>
              <thead className="border-b border-zinc-800/80 bg-white/[0.02]">
                <tr>
                  <th scope="col" className="w-10 px-4 py-2.5">
                    <input ref={allRef} type="checkbox" checked={allShownSelected} onChange={toggleAllShown} aria-label="Seleccionar todos los productos de la lista" className="h-4 w-4 cursor-pointer accent-[#00ff88]" />
                  </th>
                  {sortTh('title', 'Producto')}
                  {showStores && (
                    <th scope="col" className="px-3 py-2.5 text-xs font-medium text-zinc-300">
                      Tienda
                    </th>
                  )}
                  {sortTh('price', 'Precio')}
                  {salesByProduct && sortTh('sales', 'Ventas pagadas')}
                  <th scope="col" className="px-3 py-2.5 text-xs font-medium text-zinc-300">
                    Disponibilidad
                  </th>
                  {sortTh('status', 'Estado')}
                  <th scope="col" className="px-3 py-2.5">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {shown.map((s) => {
                  const names = storeNames(s);
                  return (
                    <tr key={s.id} className={selected.has(s.id) ? 'bg-emerald-400/5' : 'hover:bg-white/[0.02]'}>
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} aria-label={`Seleccionar ${s.title}`} className="h-4 w-4 cursor-pointer accent-[#00ff88]" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          {thumb(s)}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{s.title}</p>
                            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <span className="truncate">{CATEGORY_NAMES[s.category] || s.categoryLabel}</span>
                              {s.badge && <span className="rounded bg-zinc-800 px-1 py-px text-[10px] font-semibold text-zinc-300">{s.badge}</span>}
                              {!hasOwnImage(s) && <span className="rounded bg-amber-400/10 px-1 py-px text-[10px] font-semibold text-amber-200">Sin imagen</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      {showStores && (
                        <td className="px-3 py-2.5 text-zinc-300" title={names.join(', ')}>
                          {names.length === 0 ? <span className="text-zinc-400">—</span> : names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`}
                        </td>
                      )}
                      <td className="px-3 py-2.5">{priceCell(s)}</td>
                      {salesByProduct && <td className="px-3 py-2.5">{salesCell(s)}</td>}
                      <td className="px-3 py-2.5">{stockCell(s)}</td>
                      <td className="px-3 py-2.5">{statusSwitch(s)}</td>
                      <td className="px-3 py-2.5 text-right">{actions(s)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tarjetas (celular) */}
        {rows.length > 0 && (
          <ul className="divide-y divide-zinc-800/60 md:hidden" aria-label="Lista de productos">
            {shown.map((s) => (
              <li key={s.id} className={`flex items-start gap-3 p-4 ${selected.has(s.id) ? 'bg-emerald-400/5' : ''}`}>
                <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} aria-label={`Seleccionar ${s.title}`} className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#00ff88]" />
                {thumb(s)}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-zinc-400">{CATEGORY_NAMES[s.category] || s.categoryLabel}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
                    {priceCell(s)}
                    {stockCell(s)}
                  </div>
                  {salesByProduct && <p className="text-[13px] text-zinc-300">Ventas pagadas: {salesCell(s)}</p>}
                  <div className="flex items-center justify-between pt-1">
                    {statusSwitch(s)}
                    {actions(s)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pie */}
        {rows.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 px-4 py-3 text-xs text-zinc-400">
            <span>
              Mostrando {shown.length} de {rows.length}
              {rows.length !== services.length ? ` (filtrados de ${services.length})` : ''}
            </span>
            {rows.length > shown.length && (
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className={`${secondaryBtn} !py-1.5 !text-xs`}>
                Mostrar {Math.min(PAGE, rows.length - shown.length)} más
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
