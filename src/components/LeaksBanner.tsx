import React from 'react';
import { ShieldAlert, ArrowRight, AlertTriangle, Terminal, FileSearch, Database, Clock, FileWarning, CheckCircle2 } from 'lucide-react';
import { useFeaturedLeak } from '../hooks/useLeakCountdown';

interface LeaksBannerProps {
  onExploreLeaks: () => void;
  className?: string;
}

const TAGS = [
  { Icon: Terminal, label: 'Auditoría OSINT' },
  { Icon: FileSearch, label: 'Peritaje balístico' },
  { Icon: AlertTriangle, label: 'Alertas preventivas' },
  { Icon: Database, label: 'Cadena de custodia' }
];

export const LeaksBanner: React.FC<LeaksBannerProps> = ({ onExploreLeaks, className = '' }) => {
  const leak = useFeaturedLeak();
  const { days, hours, minutes, seconds, isExpired } = leak.time;
  const pad = (n: number) => String(n).padStart(2, '0');
  const units = [
    { v: String(days), l: 'días' },
    { v: pad(hours), l: 'horas' },
    { v: pad(minutes), l: 'min' },
    { v: pad(seconds), l: 'seg' }
  ];

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${className}`}>
      <div
        onClick={onExploreLeaks}
        className="group relative overflow-hidden rounded-2xl border border-rose-900/60 hover:border-rose-600/70 bg-[#0b0507] transition-colors cursor-pointer"
      >
        {/* Franja superior tipo terminal */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b border-rose-900/50 bg-rose-950/30 font-mono text-[10px] sm:text-xs tracking-widest uppercase">
          <span className="inline-flex items-center gap-2 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Alerta de ciberinteligencia
          </span>
          <span className="hidden sm:inline text-rose-400/80">Monitoreo activo · Perú</span>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 p-4 sm:p-6 lg:p-8">
          {/* Mensaje */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight text-balance">
              Monitoreo activo de brechas y filtraciones en Perú
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
              Publicamos análisis técnicos sobre filtraciones corporativas, bases de datos expuestas y expedientes
              forenses, con evidencia pericial contrastada.
            </p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {TAGS.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono text-zinc-300"
                >
                  <Icon className="w-3.5 h-3.5 text-rose-400" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Ficha del próximo leak */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-rose-900/60 bg-black/50 p-4 space-y-4">
              <div className="flex items-center justify-between gap-2 font-mono text-[10px] sm:text-[11px] tracking-widest uppercase">
                <span className="inline-flex items-center gap-2 text-rose-300">
                  <FileWarning className="w-3.5 h-3.5" />
                  {isExpired ? `Leak #0${leak.number} disponible` : `Próximo leak #0${leak.number}`}
                </span>
                <span className="px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">{leak.tag}</span>
              </div>

              <div>
                <h4 className="text-white font-black tracking-tight leading-snug">{leak.title}</h4>
                <p className="text-xs text-zinc-400 font-mono mt-1">{leak.subtitle}</p>
              </div>

              {isExpired ? (
                <div className="flex items-start gap-3 rounded-lg border border-rose-800/60 bg-rose-950/30 px-3 py-2.5">
                  <CheckCircle2 className="mt-0.5 w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
                  <div className="leading-tight">
                    <p className="font-mono text-xs font-black uppercase tracking-widest text-rose-200">Expediente liberado</p>
                    <p className="mt-1 text-xs text-zinc-300">Liberado el {leak.deadlineLabel}. Ya puedes leerlo completo.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2" role="timer" aria-label="Tiempo restante para la liberación">
                  <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {units.map((u) => (
                      <div key={u.l} className="rounded-md border border-zinc-800 bg-zinc-950 py-1.5 text-center">
                        <div className="font-mono text-base sm:text-lg font-black text-white tabular-nums leading-none">{u.v}</div>
                        <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400">{u.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreLeaks();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isExpired ? 'Leer el expediente y más leaks' : 'Ver cuenta regresiva y leaks'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
