import React from 'react';
import { AlertOctagon, AlertTriangle, ArrowDownRight, ArrowUpRight, Info, Minus } from 'lucide-react';
import type { Severity } from './panelHealth';

/** Superficie base de las tarjetas del panel. */
export const Card: React.FC<React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' }> = ({ as: Tag = 'div', className = '', ...rest }) => (
  <Tag className={`rounded-xl border border-zinc-800/80 bg-[#101013] ${className}`} {...rest} />
);

export const PageHeader: React.FC<{ title: string; description?: React.ReactNode; actions?: React.ReactNode }> = ({ title, description, actions }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#00ff88] px-3.5 py-2 text-[13px] font-bold text-zinc-950 transition-colors hover:bg-[#00e676] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-[13px] font-semibold text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:opacity-50';

/** Variación contra un período anterior: flecha + signo + palabra, nunca solo color. */
export const DeltaTag: React.FC<{ pct: number | null; vs: string | null }> = ({ pct, vs }) => {
  if (!vs) return <span className="text-xs text-zinc-400">Sin período para comparar</span>;
  if (pct === null) return <span className="text-xs text-zinc-400">Sin datos en {vs} para comparar</span>;
  const up = pct > 0;
  const flat = pct === 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-xs">
      <span className={`inline-flex items-center gap-0.5 font-semibold ${flat ? 'text-zinc-300' : up ? 'text-emerald-300' : 'text-rose-300'}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {up ? '+' : ''}
        {pct.toLocaleString('es-PE')}%
      </span>
      <span className="text-zinc-400">vs {vs}</span>
    </span>
  );
};

/** Aviso a página completa: "falta activar", "no se pudo cargar", "necesita la base de datos". */
export const StateNote: React.FC<{ icon: React.ElementType; tone: 'amber' | 'rose' | 'zinc'; title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ icon: Icon, tone, title, children, action }) => (
  <Card className="mx-auto max-w-2xl p-6">
    <div className="flex items-start gap-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone === 'rose' ? 'border-rose-400/40 bg-rose-500/10' : tone === 'amber' ? 'border-amber-400/40 bg-amber-400/10' : 'border-zinc-700 bg-zinc-900'}`}>
        <Icon className={`h-5 w-5 ${tone === 'rose' ? 'text-rose-300' : tone === 'amber' ? 'text-amber-200' : 'text-zinc-300'}`} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <div className="mt-1 text-sm text-zinc-300">{children}</div>
        {action}
      </div>
    </div>
  </Card>
);

/** Los estados llevan siempre icono + palabra: nunca dependen solo del color. */
export const SEVERITY_STYLE: Record<Severity, { label: string; icon: React.ElementType; chip: string; iconClass: string }> = {
  critical: { label: 'Urgente', icon: AlertOctagon, chip: 'border-rose-400/40 bg-rose-500/10 text-rose-200', iconClass: 'text-rose-300' },
  warning: { label: 'Revisar', icon: AlertTriangle, chip: 'border-amber-400/40 bg-amber-400/10 text-amber-200', iconClass: 'text-amber-300' },
  info: { label: 'Aviso', icon: Info, chip: 'border-sky-400/40 bg-sky-400/10 text-sky-200', iconClass: 'text-sky-300' }
};

export const SeverityChip: React.FC<{ severity: Severity }> = ({ severity }) => {
  const s = SEVERITY_STYLE[severity];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${s.chip}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {s.label}
    </span>
  );
};
