import React from 'react';
import { Send, Menu, X, Shield } from 'lucide-react';
import { TELEGRAM_URL } from '../data/servicesData';

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

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#050b08]/92 border-b border-emerald-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo Lockup (Crisp, complete, never cut off) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('inicio');
          }}
          className="flex items-center gap-3 shrink-0 group focus-visible:outline-none"
        >
          {/* Logo Circular Emblem */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border border-emerald-400/50 shadow-[0_0_15px_rgba(0,255,136,0.35)] group-hover:shadow-[0_0_22px_rgba(0,255,136,0.6)] transition-all">
            <img
              src="/imagenes/hero-circle.png"
              alt="Descuentos Perú"
              className="w-full h-full object-cover filter contrast-110"
              loading="eager"
            />
          </div>

          {/* Typography Lockup (Matching screenshot exact font weights and colors) */}
          <div className="flex flex-col leading-[1.05] select-none">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-white uppercase">
              DESCUENTOS
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-wider text-[#00ff88] uppercase neon-glow-green">
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
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('servicios')}
            className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'servicios' ? 'text-[#00ff88] font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Servicios
            {activeTab === 'servicios' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('leaks')}
            className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaks'
                ? 'text-rose-400 font-bold'
                : 'text-slate-300 hover:text-rose-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Leaks & Filtraciones</span>
            {activeTab === 'leaks' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            )}
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
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
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
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
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
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-[#00ff88] bg-[#06180f] border border-emerald-500/50 shadow-[0_0_15px_rgba(0,255,136,0.15)] hover:bg-[#0a2717] hover:border-emerald-400 hover:text-white hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all whitespace-nowrap cursor-pointer"
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
        <div className="md:hidden border-t border-emerald-950 bg-[#06120b] px-4 pt-3 pb-6 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('inicio')}
            className={`block w-full text-left px-3.5 py-2.5 text-base rounded-xl transition-all ${
              activeTab === 'inicio'
                ? 'bg-emerald-950/80 text-[#00ff88] font-bold border border-emerald-500/40'
                : 'text-slate-200 hover:bg-emerald-950/40 font-medium'
            }`}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('servicios')}
            className={`block w-full text-left px-3.5 py-2.5 text-base rounded-xl transition-all ${
              activeTab === 'servicios'
                ? 'bg-emerald-950/80 text-[#00ff88] font-bold border border-emerald-500/40'
                : 'text-slate-200 hover:bg-emerald-950/40 font-medium'
            }`}
          >
            Servicios
          </button>
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
                ? 'bg-emerald-950/80 text-[#00ff88] font-bold border border-emerald-500/40'
                : 'text-slate-200 hover:bg-emerald-950/40 font-medium'
            }`}
          >
            Nosotros
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contacto')}
            className={`block w-full text-left px-3.5 py-2.5 text-base rounded-xl transition-all ${
              activeTab === 'contacto'
                ? 'bg-emerald-950/80 text-[#00ff88] font-bold border border-emerald-500/40'
                : 'text-slate-200 hover:bg-emerald-950/40 font-medium'
            }`}
          >
            Contacto
          </button>

          <div className="pt-2 border-t border-emerald-950/80">

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full font-semibold text-[#00ff88] bg-[#071d12] border border-emerald-500/40"
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
