import React, { useState } from 'react';
import { Send, MessageCircle, X, ChevronUp, ChevronDown, Sparkles, Crown, Star, Film, Shield, Zap } from 'lucide-react';
import { recordVendorClickEvent } from '../data/telemetryData';

interface CreatorContact {
  id: string;
  name: string;
  username: string;
  telegramUrl: string;
  avatar: string;
  badge: string;
  role: string;
}

const CREATORS_LIST: CreatorContact[] = [
  {
    id: 'vendedor-whisky',
    name: 'Whisky Perú',
    username: 'whiskyper',
    telegramUrl: 'https://t.me/whiskyper',
    avatar: '/imagenes/perfiles/whisky.jpg',
    badge: 'Creador VIP',
    role: 'Streaming 4K'
  },
  {
    id: 'vendedor-abby',
    name: 'Abbys Perú',
    username: 'AbbysPeru',
    telegramUrl: 'https://t.me/AbbysPeru',
    avatar: '/imagenes/perfiles/abby.jpg',
    badge: 'Verificada',
    role: 'Música & Diseño'
  },
  {
    id: 'vendedor-nano',
    name: 'El Nano VIP',
    username: 'elnanovip',
    telegramUrl: 'https://t.me/elnanovip',
    avatar: '/imagenes/perfiles/nanovip.jpg',
    badge: 'Entretenimiento',
    role: 'Cine & IA Plus'
  },
  {
    id: 'vendedor-tino',
    name: 'Tin9o',
    username: 'Tin9o',
    telegramUrl: 'https://t.me/Tin9o',
    avatar: '/imagenes/perfiles/tino.gif',
    badge: 'Ciberseguridad',
    role: 'OSINT & Leaks'
  },
  {
    id: 'vendedor-central',
    name: 'Descuentos Perú',
    username: 'DESCUENTOSPER2',
    telegramUrl: 'https://t.me/descuentosper2',
    avatar: '/imagenes/monograma.png',
    badge: 'Soporte 24/7',
    role: 'Administración'
  }
];

export const FloatingVendorsDock: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside aria-label="Creadores en línea" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2.5 select-none">
      {/* Expanded Creators Drawer */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-3xl bg-[#04130a]/95 border-2 border-emerald-500/70 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(0,255,136,0.25)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
              </span>
              <div>
                <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">
                  Creadores Oficiales
                </h4>
                <span className="text-[10px] text-slate-400 font-sans block">
                  Elige con quién chatear por Telegram
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-emerald-950/80 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Creators Stack */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-0.5">
            {CREATORS_LIST.map((creator) => (
              <a
                key={creator.id}
                href={creator.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  recordVendorClickEvent(creator.id, creator.name, 'telegram', 'Floating Dock');
                }}
                className="group flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-[#061e12] via-[#05170e] to-[#020b06] hover:from-[#0a331f] hover:via-[#0c3e25] hover:to-[#041a0e] border border-emerald-500/30 hover:border-emerald-400/80 shadow-sm hover:shadow-[0_0_20px_rgba(0,255,136,0.35)] transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-emerald-400/80 shadow-[0_0_8px_rgba(0,255,136,0.3)]">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00ff88] border border-black animate-pulse" />
                  </div>

                  <div className="leading-tight text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-black text-white group-hover:text-[#00ff88] transition-colors">
                        @{creator.username}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-sans">
                      {creator.name} · <span className="text-emerald-400 font-medium">{creator.role}</span>
                    </span>
                  </div>
                </div>

                <div className="w-6 h-6 rounded-full bg-emerald-950/80 group-hover:bg-[#00ff88] border border-emerald-500/40 flex items-center justify-center shrink-0 transition-colors">
                  <Send className="w-3 h-3 text-[#00ff88] group-hover:text-slate-950 fill-current -rotate-12 transition-colors" />
                </div>
              </a>
            ))}
          </div>

          <div className="pt-1 text-center">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
              <Zap className="w-2.5 h-2.5 text-[#00ff88]" />
              <span>Respuesta inmediata en menos de 5 minutos</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Trigger: Compact Icon Button with DP Logo */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#062413] via-[#031309] to-black border-2 border-[#00ff88] shadow-[0_0_25px_rgba(0,255,136,0.65)] hover:shadow-[0_0_40px_rgba(0,255,136,0.9)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer p-2 backdrop-blur-xl"
        title="Creadores oficiales en línea (Telegram)"
        aria-label="Abrir panel de creadores oficiales"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#00ff88] transition-transform duration-200 rotate-90 group-hover:rotate-0" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* DP Official Monogram Logo */}
            <img
              src="/imagenes/monograma.png"
              alt="Descuentos Perú"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,255,136,0.8)] group-hover:rotate-6 transition-transform"
            />
            {/* Pulsing Online Green Dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00ff88] border-2 border-black" />
            </span>
          </div>
        )}

        {/* Hover / Active Tooltip */}
        {!isOpen && (
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-xl bg-black/90 border border-emerald-500/50 text-[10px] font-mono font-bold text-[#00ff88] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:inline-flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#00ff88]" />
            <span>Creadores en Línea</span>
          </span>
        )}
      </button>
    </aside>
  );
};
