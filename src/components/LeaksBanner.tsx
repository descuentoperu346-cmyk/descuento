import React from 'react';
import { ShieldAlert, ArrowRight, AlertTriangle, Radio, Terminal, FileSearch, Database, Fingerprint, Lock, ShieldCheck, Clock } from 'lucide-react';
import { useLeakCountdown } from '../hooks/useLeakCountdown';

interface LeaksBannerProps {
  onExploreLeaks: () => void;
  className?: string;
}

export const LeaksBanner: React.FC<LeaksBannerProps> = ({ onExploreLeaks, className = '' }) => {
  const { days, hours, minutes, seconds } = useLeakCountdown();
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 ${className}`}>
      <div
        onClick={onExploreLeaks}
        className="group relative rounded-3xl p-4 sm:p-7 lg:p-8 bg-gradient-to-r from-[#160307]/95 via-[#0d0205]/98 to-[#050102]/98 border border-rose-500/35 hover:border-rose-500/65 shadow-[0_0_40px_rgba(244,63,94,0.12)] hover:shadow-[0_0_55px_rgba(244,63,94,0.22)] transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* Cyber Tech Corner Accents (Harmonized with Kusi and Payments Banners) */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-rose-500/70 pointer-events-none group-hover:border-rose-400 transition-colors" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-rose-500/70 pointer-events-none group-hover:border-rose-400 transition-colors" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-rose-500/70 pointer-events-none group-hover:border-rose-400 transition-colors" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-rose-500/70 pointer-events-none group-hover:border-rose-400 transition-colors" />

        {/* Ambient Volumetric Crimson Aura */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-600/15 transition-all duration-500" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-950/20 rounded-full blur-2xl pointer-events-none" />

        {/* Tactical Crosshair Grid & Telemetry Vector Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 1000 240"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="leaksFineGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f43f5e" strokeWidth="0.5" strokeOpacity="0.3" />
                <circle cx="40" cy="40" r="1" fill="#f43f5e" fillOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="1000" height="240" fill="url(#leaksFineGrid)" />
            {/* Concentric Tactical Rings on right side */}
            <circle cx="820" cy="120" r="100" stroke="#f43f5e" strokeWidth="0.75" strokeDasharray="3 6" />
            <circle cx="820" cy="120" r="60" stroke="#f43f5e" strokeWidth="0.5" />
            <circle cx="820" cy="120" r="20" fill="#f43f5e" fillOpacity="0.08" />
            <path d="M720 120 H920 M820 20 V220" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Left Column: Intelligence Alerts & Threat Telemetry */}
          <div className="space-y-2.5 text-center lg:text-left max-w-2xl">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-[10px] sm:text-xs font-mono font-bold text-rose-300 shadow-sm flex-wrap justify-center lg:justify-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span>ALERTA DE SEGURIDAD & CIBERINTELIGENCIA</span>
              <span className="text-rose-500">·</span>
              <span className="flex items-center gap-1 text-rose-200">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" /> MONITOREO ACTIVO PERÚ
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-black text-white tracking-tight leading-tight group-hover:text-rose-100 transition-colors">
              Monitoreo Activo de Brechas y Filtraciones en Perú
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Publicamos análisis técnicos periódicos sobre filtraciones corporativas, bases de datos expuestas y desclasificación de expedientes forenses con evidencia pericial contrastada.
            </p>

            {/* Micro Feature Tags */}
            <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 sm:gap-2.5 text-[10px] font-mono text-rose-300 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-900/70 text-rose-200">
                <Terminal className="w-3 h-3 text-rose-400" /> Auditoría OSINT
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-900/70 text-rose-200">
                <FileSearch className="w-3 h-3 text-rose-400" /> Peritaje Balístico
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-900/70 text-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Alertas Preventivas
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-900/70 text-rose-200">
                <Database className="w-3 h-3 text-rose-400" /> Cadena de Custodia
              </span>
            </div>
          </div>

          {/* Right Column: Live Dossier Telemetry Card + Primary CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-center sm:items-stretch lg:items-end gap-3.5 w-full lg:w-auto justify-center">
            {/* Upcoming Leak Callout Card with Live Countdown (1d 13h 20m) */}
            <div className="w-full sm:w-84 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#180407] to-black border border-rose-500/50 shadow-lg text-left space-y-2">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-rose-400 font-bold uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  PRÓXIMO LEAK #02
                </span>
                <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  EXPEDIENTE CONGRESO
                </span>
              </div>

              <div>
                <h4 className="text-white text-xs sm:text-sm font-black tracking-tight line-clamp-1">
                  NUEVO CASO: PAGOS A AMÉRICA TV
                </h4>
                <p className="text-[10px] text-slate-300 font-mono mt-0.5 line-clamp-1">
                  Silenciamiento de coimas en el Congreso · 9 implicados
                </p>
              </div>

              {/* Live Ticking Countdown Pill Bar */}
              <div className="p-2 rounded-xl bg-black/80 border border-rose-500/40 flex items-center justify-between gap-1 shadow-inner">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 font-bold uppercase">
                  <Clock className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>LIBERA EN:</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] font-black">
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-white shadow-sm">
                    {days}d
                  </span>
                  <span className="text-rose-500">:</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-white shadow-sm">
                    {String(hours).padStart(2, '0')}h
                  </span>
                  <span className="text-rose-500">:</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-white shadow-sm">
                    {String(minutes).padStart(2, '0')}m
                  </span>
                  <span className="text-rose-500">:</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-900 border border-rose-400 text-rose-200 shadow-sm animate-pulse">
                    {String(seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExploreLeaks();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-rose-650 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-[0_0_24px_rgba(244,63,94,0.45)] hover:shadow-[0_0_36px_rgba(244,63,94,0.7)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
              <span>Ver Cuenta Regresiva & Leaks</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

