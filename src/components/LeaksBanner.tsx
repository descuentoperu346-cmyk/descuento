import React from 'react';
import { ShieldAlert, ArrowRight, AlertTriangle, Radio, Terminal, FileSearch } from 'lucide-react';

interface LeaksBannerProps {
  onExploreLeaks: () => void;
  className?: string;
}

export const LeaksBanner: React.FC<LeaksBannerProps> = ({ onExploreLeaks, className = '' }) => {
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 ${className}`}>
      <div className="relative rounded-3xl p-6 sm:p-8 lg:p-9 bg-gradient-to-r from-[#170508] via-[#100305] to-[#080203] border border-rose-500/40 shadow-[0_0_40px_rgba(244,63,94,0.18)] overflow-hidden">
        {/* 1. High-Tech Cyber Constellation & Threat Radar Grid in Background (Vector SVG) */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
          >
            {/* Cyber Threat Radar Grid */}
            <defs>
              <linearGradient id="leaksGridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#881337" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M0 60 H1000 M0 140 H1000 M0 220 H1000"
              stroke="#f43f5e"
              strokeWidth="0.75"
              strokeDasharray="4 8"
            />
            <path
              d="M150 0 V300 M350 0 V300 M550 0 V300 M750 0 V300 M900 0 V300"
              stroke="#f43f5e"
              strokeWidth="0.75"
              strokeDasharray="4 8"
            />
            {/* Cardinal Radar Rings */}
            <circle cx="850" cy="150" r="120" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 6" />
            <circle cx="850" cy="150" r="70" stroke="#f43f5e" strokeWidth="1" />
            <circle cx="850" cy="150" r="25" fill="#f43f5e" fillOpacity="0.15" />
          </svg>
        </div>

        {/* Ambient Crimson Aura */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/12 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Left Column: Intelligence Alerts & Threat Telemetry */}
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-[10px] sm:text-xs font-mono font-bold text-rose-300 shadow-sm flex-wrap justify-center lg:justify-start">
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
            <h3 className="text-xl sm:text-2xl lg:text-[1.75rem] font-black text-white tracking-tight leading-tight">
              Monitoreo Activo de Brechas y Filtraciones en Perú
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Publicamos análisis técnicos periódicos sobre filtraciones corporativas, bases de datos expuestas y recomendaciones para proteger tu identidad digital y contraseñas con el equipo de <strong className="text-rose-400 font-bold">Tin9o</strong>.
            </p>

            {/* Micro Feature Tags */}
            <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[10px] font-mono text-rose-300 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-950/60 border border-rose-900/60">
                <Terminal className="w-3 h-3 text-rose-400" /> Auditoría OSINT
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-950/60 border border-rose-900/60">
                <FileSearch className="w-3 h-3 text-rose-400" /> Análisis Técnico
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-950/60 border border-rose-900/60">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Alertas Preventivas
              </span>
            </div>
          </div>

          {/* Right Column: High-Tech Cyber Threat Shield Emblem + Primary CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 lg:gap-5 w-full lg:w-auto justify-center lg:justify-end">
            {/* Cyber Threat Radar Shield Emblem (Replaces the cut-off cropped image) */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#2a0810] to-[#0f0305] border border-rose-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.35)] overflow-hidden">
              {/* Rotating radar reticle */}
              <div className="absolute inset-1 rounded-xl border border-dashed border-rose-400/40 animate-spin-slow" />
              {/* Central Glowing Shield Icon */}
              <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-rose-950 border border-rose-400/70 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-300 stroke-[2.2]" />
              </div>
              {/* Radar sweep beam */}
              <div className="absolute -inset-4 bg-gradient-to-t from-transparent via-rose-500/10 to-transparent rotate-45 pointer-events-none animate-pulse" />
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={onExploreLeaks}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-[0_0_28px_rgba(244,63,94,0.5)] hover:shadow-[0_0_38px_rgba(244,63,94,0.75)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>Explorar Revista de Leaks</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
