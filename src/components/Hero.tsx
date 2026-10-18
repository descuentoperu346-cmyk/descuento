import React from 'react';
import { ArrowRight, Send, AlertTriangle } from 'lucide-react';
import { HeroGraphic } from './HeroGraphic';

interface HeroProps {
  onExploreClick: () => void;
  onTelegramConsult: () => void;
  onSelectCategory: (category: 'streaming' | 'investigacion' | 'educacion') => void;
  onNavigateToLeaks?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onTelegramConsult,
  onSelectCategory,
  onNavigateToLeaks
}) => {
  return (
    <section className="relative pt-2 pb-3 sm:pt-3 sm:pb-4 md:py-4 lg:py-5 overflow-hidden bg-grid">
      {/* Full-Screen Panoramic Cybernetic Background Banner */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: "url('/imagenes/hero-bg-wide.webp')" }}
      />
      {/* Seamless Ambient Gradient Overlay to prevent any hard edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07090a]/40 via-transparent to-[#07090a] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07090a]/75 via-transparent to-[#07090a]/50 pointer-events-none" />
      {/* Subtle green ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/12 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          {/* Left Column: Headline, subtext, and action buttons */}
          <div className="lg:col-span-6 z-10 text-center lg:text-left space-y-3 sm:space-y-3.5">
            {/* Kicker Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-semibold tracking-[0.14em] sm:tracking-[0.16em] text-slate-300 uppercase flex-wrap justify-center lg:justify-start">
              <span>STREAMING</span>
              <span className="text-emerald-500 font-bold">·</span>
              <button
                type="button"
                onClick={onNavigateToLeaks}
                className="text-rose-400 font-bold hover:text-white bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-500/50 hover:bg-rose-900 transition-all cursor-pointer flex items-center gap-1.5"
                title="Ir a la sección de Leaks & Filtraciones"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>LEAKS & FILTRACIONES</span>
                <AlertTriangle className="w-3 h-3 text-rose-400 stroke-[2.5]" />
              </button>
              <span className="text-emerald-500 font-bold">·</span>
              <span>OSINT</span>
              <span className="text-emerald-500 font-bold">·</span>
              <span>TECNOLOGÍA</span>
            </div>

            {/* Headline: Responsive, balanced, compact, never clipped */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.2rem] xl:text-[2.55rem] font-black tracking-tight text-white leading-[1.12] text-balance">
              Tu mundo <span className="text-[#00ff88] neon-glow-green">digital,</span>
              <span className="block text-white">en un solo lugar.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal max-w-md mx-auto lg:mx-0 leading-relaxed">
              Entretenimiento 4K, auditoría de leaks y filtraciones, inteligencia OSINT y software original con activación inmediata.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 pt-0.5 flex-wrap">
              {/* Primary Green Pill Button */}
              <button
                type="button"
                onClick={onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Explorar servicios</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {/* Secondary Dark Pill Button with Telegram Icon */}
              <button
                type="button"
                onClick={onTelegramConsult}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#111111]/90 hover:bg-[#1f1f1f] border border-zinc-800/80 hover:border-emerald-500/80 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5 text-[#00ff88] fill-[#00ff88] -rotate-12" />
                <span>Consultar Telegram</span>
              </button>

              {/* Leaks CTA Button */}
              {onNavigateToLeaks && (
                <button
                  type="button"
                  onClick={onNavigateToLeaks}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full font-bold text-xs text-rose-300 bg-[#0f0505] hover:bg-rose-950 border border-rose-800/80 hover:border-rose-500 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Ver Leaks & Alertas</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Graphic Composition with 3D Atom & Orbiting Badges */}
          <div className="lg:col-span-6 flex items-center justify-center relative py-0">
            <HeroGraphic onSelectCategory={onSelectCategory} />
          </div>
        </div>
      </div>
    </section>
  );
};
