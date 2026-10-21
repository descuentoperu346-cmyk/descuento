import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react';
import { roleLabel } from '../lib/roles';
import type { BuyerRecord, TeamMember } from '../lib/supabaseBrowser';

const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' });
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateFormat.format(d);
};

/** Solo para el rol DEV: equipo con sus roles y compradores registrados (solo lectura). */
export const TeamBuyersTab: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const m = await import('../lib/supabaseBrowser');
      const res = await m.readTeamAndBuyers();
      setTeam(res.team);
      setBuyers(res.buyers);
      if (res.error) setError(res.error);
    } catch {
      setError('No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buyers;
    return buyers.filter((b) => `${b.name} ${b.email} ${b.phone}`.toLowerCase().includes(q));
  }, [buyers, query]);

  const th = 'px-3 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400';
  const td = 'px-3 py-2.5 align-top text-xs text-slate-200';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00ff88]">DESARROLLADOR // ACCESOS</span>
          <h2 className="text-2xl font-black tracking-tight text-white">Equipo y compradores</h2>
          <p className="mt-1 font-mono text-xs text-slate-400">
            Solo lectura. Los roles se cambian con el SQL del paso 5 (ver supabase/LEEME.md).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3.5 py-2 font-mono text-xs font-bold text-white transition-colors hover:border-[#00ff88] disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
          Actualizar
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-3 font-mono text-xs text-rose-300">
          {error}
        </p>
      )}

      <section aria-labelledby="team-title" className="rounded-3xl border border-zinc-800 bg-[#0a0a0a] p-4 sm:p-5">
        <h3 id="team-title" className="mb-3 flex items-center gap-2 text-sm font-black text-white">
          <ShieldCheck className="h-4 w-4 text-[#00ff88]" aria-hidden="true" />
          Equipo <span className="font-mono text-xs font-normal text-slate-400">({team.length})</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <caption className="sr-only">Cuentas del equipo con su rol</caption>
            <thead>
              <tr className="border-b border-zinc-800">
                <th className={th}>Usuario</th>
                <th className={th}>Rol</th>
                <th className={th}>Tienda</th>
                <th className={th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.userId} className="border-b border-zinc-900 last:border-0">
                  <td className={`${td} font-bold text-white`}>@{m.username}</td>
                  <td className={td}>
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-black ${
                        m.role === 'dev' ? 'bg-[#00ff88] text-slate-950' : m.role === 'admin' ? 'bg-sky-400/20 text-sky-200' : 'bg-zinc-800 text-slate-300'
                      }`}
                    >
                      {roleLabel(m.role)}
                    </span>
                  </td>
                  <td className={`${td} font-mono text-slate-400`}>{m.vendorId || '—'}</td>
                  <td className={td}>
                    <span className={m.active ? 'text-emerald-300' : 'text-rose-300'}>{m.active ? 'Activo' : 'De baja'}</span>
                  </td>
                </tr>
              ))}
              {!loading && team.length === 0 && (
                <tr>
                  <td colSpan={4} className={`${td} text-slate-500`}>
                    No hay cuentas del equipo visibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="buyers-title" className="rounded-3xl border border-zinc-800 bg-[#0a0a0a] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 id="buyers-title" className="flex items-center gap-2 text-sm font-black text-white">
            <Users className="h-4 w-4 text-[#00ff88]" aria-hidden="true" />
            Compradores registrados <span className="font-mono text-xs font-normal text-slate-400">({buyers.length})</span>
          </h3>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <label htmlFor="buyers-search" className="sr-only">
              Buscar comprador
            </label>
            <input
              id="buyers-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nombre, correo o teléfono"
              className="w-64 max-w-full rounded-xl border border-zinc-800 bg-[#060606] py-2 pl-8 pr-3 text-xs text-white outline-none focus:border-[#00ff88]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <caption className="sr-only">Compradores registrados en la web</caption>
            <thead>
              <tr className="border-b border-zinc-800">
                <th className={th}>Nombre</th>
                <th className={th}>Correo</th>
                <th className={th}>Teléfono</th>
                <th className={th}>Registro</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((b) => (
                <tr key={b.userId} className="border-b border-zinc-900 last:border-0">
                  <td className={`${td} font-bold text-white`}>{b.name || '—'}</td>
                  <td className={`${td} break-all`}>{b.email || '—'}</td>
                  <td className={`${td} font-mono`}>{b.phone || '—'}</td>
                  <td className={`${td} font-mono text-slate-400`}>{formatDate(b.createdAt)}</td>
                </tr>
              ))}
              {!loading && shown.length === 0 && (
                <tr>
                  <td colSpan={4} className={`${td} text-slate-500`}>
                    {buyers.length === 0 ? 'Todavía no se registró ningún comprador.' : 'Sin resultados para esa búsqueda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {buyers.length >= 500 && <p className="mt-2 font-mono text-[10px] text-slate-500">Se muestran los 500 más recientes.</p>}
      </section>
    </div>
  );
};
