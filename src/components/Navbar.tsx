import React from 'react';
import { Send, Menu, X, Shield, Clock, ShieldAlert } from 'lucide-react';
import { TELEGRAM_URL } from '../data/servicesData';
import { useLeakCountdown } from '../hooks/useLeakCountdown';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenContact?: () => void;
  onOpenAbout?: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenContact,
  onOpenAbout,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { days, hours, minutes, seconds, isExpired } = useLeakCountdown();

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#07090a]/95 border-b border-zinc-900/70">
      {/* Top Breaking Leak Countdown Ticker Bar */}
      <div
        onClick={() => handleNavClick('leaks')}
        className="w-full bg-gradient-to-r from-[#1b0307] via-[#29050d] to-[#150205] border-b border-rose-500/40 px-3 py-1.5 cursor-pointer hover:bg-rose-950/90 transition-colors select-none"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-rose-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 inline" />
              <span>{isExpired ? 'LEAK #02 DISPONIBLE:' : 'PRÓXIMO LEAK #02:'}</span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight truncate hidden sm:inline">
              EXPEDIENTE KEIKO FUJIMORI - LO QUE DICEN LOS DOCUMENTOS DEL CASO CÓCTELES
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isExpired ? (<span className="font-mono text-[11px] font-black text-rose-100 px-2 py-0.5 rounded bg-rose-900 border border-rose-400">LIBERADO</span>) : (<div className="flex items-center gap-1 font-mono text-[11px] font-black text-rose-300">
              <span className="text-slate-400 text-[9px] uppercase font-bold mr-0.5 hidden md:inline">LIBERACIÓN EN:</span>
              <span className="px-1.5 py-0.5 rounded bg-black/80 border border-rose-500/40 text-white shadow-sm">{days}d</span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-black/80 border border-rose-500/40 text-white shadow-sm">{String(hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-black/80 border border-rose-500/40 text-white shadow-sm">{String(minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-900 border border-rose-400 text-rose-100 shadow-sm animate-pulse">{String(seconds).padStart(2, '0')}s</span>
            </div>)}

            <span className="text-[10px] font-mono font-bold text-rose-300 hover:text-white bg-rose-900/40 px-2 py-0.5 rounded border border-rose-500/40 hidden lg:inline-flex items-center gap-1">
              Ver Dossier & 9 Implicados →
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Logo Lockup (Crisp, complete, never cut off) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('inicio');
          }}
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus-visible:outline-none"
        >
          {/* Logo Circular Emblem */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border border-emerald-400/50 transition-all">
            <img
              src="/imagenes/hero-circle.webp"
              alt="Descuentos Perú"
              className="w-full h-full object-cover filter contrast-110"
              loading="eager"
            />
          </div>

          {/* Typography Lockup */}
          <div className="flex flex-col leading-[1.05] select-none">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.22em] text-white uppercase">
              DESCUENTOS
            </span>
            <span className="text-lg sm:text-2xl font-black tracking-wider text-[#00ff88] uppercase neon-glow-green">
              PERÚ
            </span>
          </div>
        </a>

        {/* Center Navigation Links - Real Separate Pages */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            type="button"
            onClick={() => handleNavClick('inicio')}
            className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'inicio' ? 'text-[#00ff88] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Inicio
            {activeTab === 'inicio' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88]" />
            )}
          </button>

          {/* Servicios tab temporarily hidden as requested */}

          <button
            type="button"
            onClick={() => handleNavClick('leaks')}
            aria-current={activeTab === 'leaks' ? 'page' : undefined}
            className={`group relative flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 ${
              activeTab === 'leaks'
                ? 'border-rose-400/70 bg-rose-500/15 text-rose-100 shadow-[0_0_22px_rgba(244,63,94,0.35)]'
                : 'border-rose-500/30 bg-rose-500/5 text-rose-200 hover:border-rose-400/60 hover:bg-rose-500/12 hover:text-white'
            }`}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60 animate-pulse" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <span className="tracking-wide">Leaks & Filtraciones</span>
            <span className="rounded-md bg-rose-500 px-1.5 py-px font-mono text-[10px] font-black leading-4 text-white">#02</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('nosotros')}
            className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'nosotros' ? 'text-[#00ff88] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Nosotros
            {activeTab === 'nosotros' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('contacto')}
            className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'contacto' ? 'text-[#00ff88] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Contacto
            {activeTab === 'contacto' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88]" />
            )}
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Telegram CTA Button */}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-[#00ff88] bg-[#111111] border border-emerald-500/50 hover:bg-[#1c1c1c] hover:border-emerald-400 hover:text-white transition-all whitespace-nowrap cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 fill-[#00ff88] text-[#00ff88] -rotate-12" />
            <span>Telegram</span>
          </a>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg focus-visible:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-[#0d0d0d] px-4 pt-3 pb-6 space-y-2 max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={() => handleNavClick('inicio')}
            className={`block w-full text-left px-3.5 py-2.5 text-base rounded-xl transition-all ${
              activeTab === 'inicio'
                ? 'bg-zinc-900/80 text-[#00ff88] font-bold border border-zinc-700'
                : 'text-slate-200 hover:bg-zinc-900/40 font-medium'
            }`}
          >
            Inicio
          </button>
          {/* Mobile Servicios tab temporarily hidden as requested */}
          <button
            type="button"
            onClick={() => handleNavClick('leaks')}
            className={`flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-base rounded-xl transition-all ${
              activeTab === 'leaks'
                ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-500/40'
                : 'text-rose-400 hover:bg-rose-950/40 font-semibold'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Leaks & Filtraciones</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('nosotros')}
            className={`block w-full text-left px-3.5 py-2.5 text-base rounded-xl transition-all ${
              activeTab === 'nosotros'
                ? 'bg-zinc-900/80 text-[#00ff88] font-bold border border-zinc-700'
                : 'text-slate-200 hover:bg-zinc-900/40 font-medium'
            }`}
          >
            Nosotros
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contacto')}
            className={`block w-full text-left px-3.5 py-2.5 text-base rounded-xl transition-all ${
              activeTab === 'contacto'
                ? 'bg-zinc-900/80 text-[#00ff88] font-bold border border-zinc-700'
                : 'text-slate-200 hover:bg-zinc-900/40 font-medium'
            }`}
          >
            Contacto
          </button>

          <div className="pt-2 border-t border-zinc-900/80">

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full font-semibold text-[#00ff88] bg-[#151515] border border-zinc-700"
            >
              <Send className="w-4 h-4 fill-[#00ff88] text-[#00ff88] -rotate-12" />
              <span>Abrir Canal Telegram</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
