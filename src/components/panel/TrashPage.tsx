import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Database, Package, RefreshCw, RotateCcw, Search, Store, Trash2, TriangleAlert, Users, ReceiptText, CreditCard, FileText, UserRound, type LucideIcon } from 'lucide-react';
import type { Vendor } from '../../data/vendorsData';
import { TRASH_DAYS, daysLeft, deleteForever, loadTrash, restoreFromTrash, tableLabel, type TrashItem } from '../../lib/vaultApi';
import { Card, PageHeader, StateNote as Note, primaryBtn, secondaryBtn } from './ui';
import { ConfirmDialog } from './Dialog';
import { inputCls } from './fields';

interface TrashPageProps {
  /** false cuando el panel trabaja sin base de datos (modo local) */
  dbMode: boolean;
  isStaffAdmin: boolean;
  vendors: Vendor[];
  /** Se llama después de restaurar para que el panel vuelva a leer el contenido */
  onRestored: (table: string) => void | Promise<void>;
  onToast: (message: string) => void;
}

const ICONS: Record<string, LucideIcon> = {
  products: Package,
  vendors: Store,
  payment_methods: CreditCard,
  leaks: FileText,
  customers: UserRound,
  sales: ReceiptText
};

const fmtWhen = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' });

export const TrashPage: React.FC<TrashPageProps> = ({ dbMode, isStaffAdmin, vendors, onRestored, onToast }) => {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'missing' | 'error'; items: TrashItem[]; message?: string }>({ status: 'loading', items: [] });
  const [kind, setKind] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);
  const [forever, setForever] = useState<TrashItem | null>(null);
  const [foreverError, setForeverError] = useState('');
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!dbMode) return;
    const mine = ++seq.current;
    setState((s) => ({ ...s, status: 'loading' }));
    const res = await loadTrash();
    if (mine !== seq.current) return;
    setState(res.status === 'ready' ? { status: 'ready', items: res.data } : { status: res.status, items: [], message: res.status === 'error' ? res.message : undefined });
  }, [dbMode]);

  useEffect(() => {
    void load();
    return () => {
      seq.current++;
    };
  }, [load]);

  const kinds = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of state.items) map.set(i.table, (map.get(i.table) || 0) + 1);
    return [...map.entries()];
  }, [state.items]);
  const shownItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return state.items.filter((i) => (kind === 'all' || i.table === kind) && (!term || i.label.toLowerCase().includes(term)));
  }, [state.items, kind, search]);

  const storeName = (id: string | null) => (id ? vendors.find((v) => v.id === id)?.name || id : null);

  const restore = async (item: TrashItem) => {
    setBusyId(item.id);
    setRowError(null);
    const res = await restoreFromTrash(item.id);
    setBusyId(null);
    if ('error' in res) {
      setRowError({ id: item.id, message: res.error });
      return;
    }
    setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== item.id) }));
    onToast(`“${item.label}” se restauró.`);
    await onRestored(item.table);
  };

  const confirmForever = async () => {
    if (!forever) return;
    setBusyId(forever.id);
    setForeverError('');
    const res = await deleteForever(forever.id);
    setBusyId(null);
    if ('error' in res) {
      setForeverError(res.error);
      return;
    }
    setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== forever.id) }));
    onToast(`“${forever.label}” se borró para siempre.`);
    setForever(null);
  };

  const header = <PageHeader title="Papelera" description={`Lo que borres se guarda aquí ${TRASH_DAYS} días. Puedes recuperarlo con un clic.`} />;

  if (!dbMode) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        {header}
        <Note icon={Database} tone="zinc" title="Necesita la base de datos conectada">
          <p>La papelera guarda copias en la base de datos de la web. Sin base de datos (modo local) lo que se borra no se puede recuperar.</p>
        </Note>
      </div>
    );
  }
  if (state.status === 'missing') {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        {header}
        <Note
          icon={Database}
          tone="amber"
          title="Falta activar la papelera"
          action={
            <button type="button" onClick={() => void load()} className={`${secondaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Comprobar de nuevo
            </button>
          }
        >
          {isStaffAdmin ? (
            <>
              <p>Hoy, lo que se borra se pierde para siempre. Para activar la papelera:</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>
                  Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.
                </li>
                <li>
                  Pega todo el archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/08-papelera.sql</code> y pulsa <strong className="text-white">Run</strong>.
                </li>
                <li>Vuelve aquí y pulsa “Comprobar de nuevo”. Desde ese momento todo lo que borres se podrá recuperar.</li>
              </ol>
            </>
          ) : (
            <p>Pídele al administrador de la web que active la papelera.</p>
          )}
        </Note>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        {header}
        <Note
          icon={TriangleAlert}
          tone="rose"
          title="No se pudo cargar la papelera"
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

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Papelera"
        description={`Lo que borres se guarda aquí ${TRASH_DAYS} días. Puedes recuperarlo con un clic.${isStaffAdmin ? '' : ' Aquí ves solo los productos borrados de tu tienda.'}`}
        actions={
          <button type="button" onClick={() => void load()} disabled={state.status === 'loading'} className={secondaryBtn}>
            <RefreshCw className={`h-4 w-4 ${state.status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" /> {state.status === 'loading' ? 'Actualizando…' : 'Actualizar'}
          </button>
        }
      />

      {state.status === 'loading' && state.items.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400" role="status" aria-busy="true">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" aria-hidden="true" />
          Cargando la papelera…
        </div>
      ) : state.items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Trash2 className="h-8 w-8 text-zinc-500" aria-hidden="true" />
          <p className="text-base font-semibold text-white">La papelera está vacía</p>
          <p className="max-w-md text-sm text-zinc-400">Cuando borres un producto, un artículo, un cliente o una venta, aparecerá aquí durante {TRASH_DAYS} días por si te arrepientes.</p>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tipo">
              {[['all', 'Todo', state.items.length] as const, ...kinds.map(([k, n]) => [k, tableLabel(k), n] as const)].map(([k, label, n]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                    kind === k ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500'
                  }`}
                >
                  {label} <span className="tabular-nums text-zinc-400">{n}</span>
                </button>
              ))}
            </div>
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre" aria-label="Buscar en la papelera" className={`${inputCls} pl-9`} />
            </div>
          </div>

          {shownItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400" role="status">
              No hay nada que coincida con lo que buscas.
            </p>
          ) : (
            <ul className="space-y-2.5" aria-label="Elementos borrados">
              {shownItems.map((item) => {
                const Icon = ICONS[item.table] || Trash2;
                const left = daysLeft(item.deletedAt);
                const store = storeName(item.vendorId);
                const busy = busyId === item.id;
                return (
                  <li key={item.id}>
                    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900">
                        <Icon className="h-5 w-5 text-zinc-300" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {tableLabel(item.table)}
                          {store && isStaffAdmin ? ` · ${store}` : ''} · Borrado{item.deletedBy ? ` por ${item.deletedBy}` : ''} el {fmtWhen.format(new Date(item.deletedAt))}
                        </p>
                        <p className={`mt-1 inline-flex items-center gap-1 text-xs ${left <= 3 ? 'font-semibold text-amber-200' : 'text-zinc-400'}`}>
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {left <= 1 ? 'Se elimina para siempre hoy o mañana' : `Se elimina para siempre en ${left} días`}
                        </p>
                        {rowError?.id === item.id && (
                          <p role="alert" className="mt-2 text-xs text-rose-300">
                            {rowError.message}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button type="button" disabled={busy} onClick={() => void restore(item)} aria-label={`Restaurar ${item.label}`} className={primaryBtn}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {busy ? 'Un momento…' : 'Restaurar'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setForeverError('');
                            setForever(item);
                          }}
                          aria-label={`Borrar para siempre ${item.label}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] font-semibold text-rose-200 hover:bg-rose-500/20 focus-visible:outline-2 focus-visible:outline-rose-300 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" /> Borrar para siempre
                        </button>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Users className="h-3.5 w-3.5" aria-hidden="true" /> Restaurar vuelve a poner el elemento tal como estaba. Si ya hay otro con el mismo nombre o identificador, te avisará.
          </p>
        </>
      )}

      <ConfirmDialog
        open={forever !== null}
        title="¿Borrar para siempre?"
        message={`“${forever?.label ?? ''}” se eliminará definitivamente. Ya no podrás recuperarlo.`}
        confirmLabel="Borrar para siempre"
        danger
        busy={busyId !== null && forever?.id === busyId}
        error={foreverError}
        onConfirm={() => void confirmForever()}
        onCancel={() => setForever(null)}
      />
    </div>
  );
};

export default TrashPage;
