import React from 'react';
import { ArrowRight, Send } from 'lucide-react';
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
    <section className="relative py-4 sm:py-6 md:py-8 lg:py-10 overflow-hidden">
      {/* Full-Screen Panoramic Cybernetic Background Banner */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: "url('/imagenes/hero-bg-wide.jpg')" }}
      />
      {/* Seamless Ambient Gradient Overlay to prevent any hard edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b08]/40 via-transparent to-[#050b08] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050b08]/75 via-transparent to-[#050b08]/50 pointer-events-none" />
      {/* Subtle green ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">
          {/* Left Column: Headline, subtext, and action buttons */}
          <div className="lg:col-span-6 z-10 text-center lg:text-left space-y-4 sm:space-y-5">
            {/* Kicker Tag */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-[0.18em] text-slate-300 uppercase flex-wrap justify-center lg:justify-start">
              <span>STREAMING</span>
              <span className="text-emerald-500 font-bold">·</span>
              <button
                type="button"
                onClick={onNavigateToLeaks}
                className="text-rose-400 font-bold hover:text-white bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-500/50 hover:bg-rose-900 transition-all cursor-pointer flex items-center gap-1.5"
                title="Ir a la sección de Leaks & Filtraciones"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>LEAKS & FILTRACIONES 🚨</span>
              </button>
              <span className="text-emerald-500 font-bold">·</span>
              <span>OSINT</span>
              <span className="text-emerald-500 font-bold">·</span>
              <span>TECNOLOGÍA</span>
            </div>

            {/* Headline: Responsive, balanced, never clipped */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3.25rem] font-black tracking-tight text-white leading-[1.08] text-balance">
              Tu mundo <span className="text-[#00ff88] neon-glow-green">digital,</span>
              <span className="block text-white">en un solo lugar.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Entretenimiento 4K, auditoría de leaks y filtraciones, inteligencia OSINT y software original con activación inmediata.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1 flex-wrap">
              {/* Primary Green Pill Button */}
              <button
                type="button"
                onClick={onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Explorar servicios</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Secondary Dark Pill Button with Telegram Icon */}
              <button
                type="button"
                onClick={onTelegramConsult}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base text-white bg-[#07170f]/90 hover:bg-[#0d2a1b] border border-emerald-900/80 hover:border-emerald-500/80 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Send className="w-4 h-4 text-[#00ff88] fill-[#00ff88] -rotate-12" />
                <span>Consultar Telegram</span>
              </button>

              {/* Leaks CTA Button */}
              {onNavigateToLeaks && (
                <button
                  type="button"
                  onClick={onNavigateToLeaks}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-rose-300 bg-[#0f0505] hover:bg-rose-950 border border-rose-800/80 hover:border-rose-500 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Ver Leaks & Alertas</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Graphic Composition with 3D Atom & Orbiting Badges */}
          <div className="lg:col-span-6 flex items-center justify-center relative py-1 sm:py-2">
            <HeroGraphic onSelectCategory={onSelectCategory} />
          </div>
        </div>
      </div>
    </section>
  );
};
