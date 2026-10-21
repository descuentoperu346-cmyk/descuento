import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Database, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, TriangleAlert } from 'lucide-react';
import { ACTION_LABEL, TABLE_LABELS, fieldLabel, loadAudit, tableLabel, valueText, type AuditEntry, type AuditFilter } from '../../lib/vaultApi';
import { Card, PageHeader, StateNote as Note, primaryBtn, secondaryBtn } from './ui';
import { inputCls } from './fields';

interface HistoryPageProps {
  /** false cuando el panel trabaja sin base de datos (modo local) */
  dbMode: boolean;
}

const fmtWhen = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' });
const ACTION_STYLE: Record<AuditEntry['action'], { icon: React.ElementType; chip: string }> = {
  insert: { icon: Plus, chip: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' },
  update: { icon: Pencil, chip: 'border-sky-400/40 bg-sky-400/10 text-sky-200' },
  delete: { icon: Trash2, chip: 'border-rose-400/40 bg-rose-500/10 text-rose-200' }
};
const ACTION_FILTERS: { id: AuditFilter['action']; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'insert', label: 'Creó' },
  { id: 'update', label: 'Cambió' },
  { id: 'delete', label: 'Borró' }
];
const SHOWN_CHANGES = 3;

type State = { status: 'loading' | 'ready' | 'missing' | 'error'; entries: AuditEntry[]; more: boolean; message?: string };

export const HistoryPage: React.FC<HistoryPageProps> = ({ dbMode }) => {
  const [table, setTable] = useState('all');
  const [action, setAction] = useState<AuditFilter['action']>('all');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [state, setState] = useState<State>({ status: 'loading', entries: [], more: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const seq = useRef(0);

  // La búsqueda se envía cuando la persona deja de escribir
  useEffect(() => {
    const t = setTimeout(() => setTerm(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filter: AuditFilter = { table, action, search: term };
  const load = useCallback(async () => {
    if (!dbMode) return;
    const mine = ++seq.current;
    setState((s) => ({ ...s, status: 'loading' }));
    const res = await loadAudit({ table, action, search: term });
    if (mine !== seq.current) return;
    setOpen(new Set());
    setState(res.status === 'ready' ? { status: 'ready', entries: res.data.entries, more: res.data.more } : { status: res.status, entries: [], more: false, message: res.status === 'error' ? res.message : undefined });
  }, [dbMode, table, action, term]);

  useEffect(() => {
    void load();
    return () => {
      seq.current++;
    };
  }, [load]);

  const loadMore = async () => {
    const last = state.entries[state.entries.length - 1];
    if (!last) return;
    setLoadingMore(true);
    const res = await loadAudit(filter, last.id);
    setLoadingMore(false);
    if (res.status === 'ready') setState((s) => ({ ...s, entries: [...s.entries, ...res.data.entries], more: res.data.more }));
    else setState((s) => ({ ...s, message: res.status === 'error' ? res.message : 'No se pudo cargar más.' }));
  };

  const toggle = (id: number) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const header = <PageHeader title="Historial de cambios" description="Quién cambió qué y cuándo. Solo lo ve el desarrollador." />;

  if (!dbMode) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        {header}
        <Note icon={Database} tone="zinc" title="Necesita la base de datos conectada">
          <p>El historial se guarda en la base de datos de la web. En este modo (sin base de datos) no hay nada que mostrar.</p>
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
          title="Falta activar el historial de cambios"
          action={
            <button type="button" onClick={() => void load()} className={`${secondaryBtn} mt-4`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Comprobar de nuevo
            </button>
          }
        >
          <p>Todavía no se está anotando quién cambia qué. Para activarlo:</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>
              Abre Supabase → <strong className="text-white">SQL Editor</strong> → <strong className="text-white">New query</strong>.
            </li>
            <li>
              Pega todo el archivo <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] text-emerald-200">supabase/09-historial-de-cambios.sql</code> y pulsa <strong className="text-white">Run</strong>.
            </li>
            <li>Vuelve aquí y pulsa “Comprobar de nuevo”. Se anotará todo lo que se cambie desde ese momento.</li>
          </ol>
        </Note>
      </div>
    );
  }
  if (state.status === 'error' && state.entries.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        {header}
        <Note
          icon={TriangleAlert}
          tone="rose"
          title="No se pudo cargar el historial"
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

  const filtered = table !== 'all' || action !== 'all' || term !== '';
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Historial de cambios"
        description="Quién cambió qué y cuándo. Solo lo ve el desarrollador."
        actions={
          <button type="button" onClick={() => void load()} disabled={state.status === 'loading'} className={secondaryBtn}>
            <RefreshCw className={`h-4 w-4 ${state.status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" /> {state.status === 'loading' ? 'Actualizando…' : 'Actualizar'}
          </button>
        }
      />

      <Card className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
          <div>
            <label htmlFor="hist-tabla" className="mb-1 block text-[13px] font-medium text-zinc-200">
              Qué cambió
            </label>
            <select id="hist-tabla" value={table} onChange={(e) => setTable(e.target.value)} className={`${inputCls} cursor-pointer`}>
              <option value="all">Todo</option>
              {Object.keys(TABLE_LABELS).map((k) => (
                <option key={k} value={k}>
                  {TABLE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hist-buscar" className="mb-1 block text-[13px] font-medium text-zinc-200">
              Buscar por nombre o persona
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input id="hist-buscar" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ej.: Netflix o whiskyper" className={`${inputCls} pl-9`} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tipo de acción">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={action === f.id}
              onClick={() => setAction(f.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                action === f.id ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100' : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {state.status === 'loading' && state.entries.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400" role="status" aria-busy="true">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" aria-hidden="true" />
          Cargando el historial…
        </div>
      ) : state.entries.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <ShieldCheck className="h-8 w-8 text-zinc-500" aria-hidden="true" />
          <p className="text-base font-semibold text-white">{filtered ? 'No hay cambios que coincidan' : 'Todavía no hay cambios anotados'}</p>
          <p className="max-w-md text-sm text-zinc-400">{filtered ? 'Prueba con otro filtro o con otra palabra.' : 'Desde que se activó, cada vez que alguien cree, cambie o borre algo aparecerá aquí.'}</p>
        </Card>
      ) : (
        <ul className="space-y-2.5" aria-label="Cambios anotados">
          {state.entries.map((e) => {
            const st = ACTION_STYLE[e.action];
            const Icon = st.icon;
            const list = e.changes ? Object.entries(e.changes) : [];
            const expanded = open.has(e.id);
            const visible = expanded ? list : list.slice(0, SHOWN_CHANGES);
            return (
              <li key={e.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${st.chip}`}>
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      {ACTION_LABEL[e.action]}
                    </span>
                    <span className="text-sm font-semibold text-white">{e.label || '(sin nombre)'}</span>
                    <span className="text-xs text-zinc-400">{tableLabel(e.table)}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Por <span className="font-medium text-zinc-200">{e.actor}</span> · {fmtWhen.format(new Date(e.changedAt))}
                  </p>
                  {list.length > 0 && (
                    <>
                      <ul className="mt-2.5 space-y-1.5 border-l-2 border-zinc-800 pl-3 text-[13px]">
                        {visible.map(([key, ch]) => (
                          <li key={key} className="break-words">
                            <span className="font-medium text-zinc-200">{fieldLabel(key)}:</span> <span className="text-zinc-400">antes</span> <span className="text-zinc-200">{valueText(ch.antes)}</span>{' '}
                            <span aria-hidden="true" className="text-zinc-500">
                              →
                            </span>{' '}
                            <span className="text-zinc-400">ahora</span> <span className="text-white">{valueText(ch.despues)}</span>
                          </li>
                        ))}
                      </ul>
                      {list.length > SHOWN_CHANGES && (
                        <button type="button" aria-expanded={expanded} onClick={() => toggle(e.id)} className="mt-2 text-xs font-semibold text-emerald-300 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
                          {expanded ? 'Ver menos' : `Ver los ${list.length} cambios`}
                        </button>
                      )}
                    </>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {state.message && state.status === 'ready' && (
        <p role="alert" className="text-center text-sm text-rose-300">
          {state.message}
        </p>
      )}
      {state.more && (
        <div className="text-center">
          <button type="button" onClick={() => void loadMore()} disabled={loadingMore} className={secondaryBtn}>
            {loadingMore ? 'Cargando…' : 'Ver más antiguos'}
          </button>
        </div>
      )}
      <p className="text-xs text-zinc-400">Se conservan los últimos 12 meses. Las contraseñas nunca se anotan. Los cambios en las fotos se muestran como “[imagen]”.</p>
    </div>
  );
};

export default HistoryPage;
