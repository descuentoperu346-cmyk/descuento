import React from 'react';

interface FooterProps {
  onOpenAdmin?: () => void;
  onNavigateTab?: (tab: string) => void;
  activeTab?: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigateTab, activeTab }) => {
  return (
    <footer className="py-10 border-t border-zinc-900/70 bg-[#060606] text-slate-400 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-900/40">
          {/* Brand lockup */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700">
              <img loading="lazy" decoding="async"
                src="/imagenes/hero-circle.webp"
                alt="Descuentos Perú"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white tracking-wide">
                DESCUENTOS <span className="text-[#00ff88]">PERÚ</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Plataforma de Entretenimiento, OSINT, Ciberseguridad & Software
              </p>
            </div>
          </div>

          {/* Navigation Links to Separate Pages */}
          {onNavigateTab && (
            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onNavigateTab('inicio')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'inicio' ? 'text-[#00ff88]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Inicio
              </button>
              {/* Servicios link temporarily hidden as requested */}
              <button
                type="button"
                onClick={() => onNavigateTab('leaks')}
                className={`transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'leaks' ? 'text-rose-400' : 'text-slate-300 hover:text-rose-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Leaks & Filtraciones</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('nosotros')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'nosotros' ? 'text-[#00ff88]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Nosotros
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('contacto')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'contacto' ? 'text-[#00ff88]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Contacto
              </button>
            </nav>
          )}

          {/* Admin / Vendor portal access hidden as requested */}
        </div>

        {/* Bottom copyright & disclaimers */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Descuentos Perú. Todos los derechos reservados. Activaciones oficiales y soporte 24/7.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-[11px] text-slate-400">
            <span>Privacidad Protegida</span>
            <span>·</span>
            <span>Garantía de Reposición</span>
            <span>·</span>
            <span>Soporte Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


