import React from 'react';
import { ArrowRight, Send } from 'lucide-react';
import { TELEGRAM_USERNAME, TELEGRAM_URL } from '../data/servicesData';

interface TelegramBannerProps {
  onDirectClick?: () => void;
  onNavigateToContact?: () => void;
}

export const TelegramBanner: React.FC<TelegramBannerProps> = ({ onDirectClick, onNavigateToContact }) => {
  const handleClick = (e: React.MouseEvent) => {
    const action = onDirectClick || onNavigateToContact;
    if (action) {
      e.preventDefault();
      action();
    } else {
      window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="my-10 relative select-none">
      {/* Banner Container */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#0c0c0c] border border-zinc-700 shadow-[0_4px_35px_rgba(0,0,0,0.8)] p-4 sm:p-6 overflow-hidden group">
        {/* Background Artwork (Fluid emerald waves and cyber texture) */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 pointer-events-none mix-blend-screen"
          style={{ backgroundImage: "url('/imagenes/telegram-banner.webp')" }}
        />

        {/* Content Layout */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
          {/* Left: Official Medallion Badge + Divider + Typography */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Telegram Medallion Badge */}
            <div className="w-13 h-13 rounded-full overflow-hidden border border-emerald-400/80 shrink-0 flex items-center justify-center bg-[#111111]">
              <img loading="lazy" decoding="async"
                src="/imagenes/iconos/Ícono de Telegram blanco con aro esmeralda-9.png"
                alt="Telegram"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Subtle Vertical Divider */}
            <div className="hidden sm:block w-[1.5px] h-9 bg-zinc-700/80 mx-1" />

            {/* Channel Branding */}
            <div className="flex flex-col">
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Conecta con Descuentos Perú
              </h4>
              <span className="text-xs sm:text-sm font-bold text-[#00ff88] tracking-widest font-mono">
                @{TELEGRAM_USERNAME}
              </span>
            </div>
          </div>

          {/* Right: Ir a Telegram CTA Button */}
          <button
            type="button"
            onClick={handleClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Ir a Telegram</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

