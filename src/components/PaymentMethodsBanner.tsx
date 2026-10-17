import React from 'react';
import { ShieldCheck, Zap, Lock, Clock, Sparkles, ArrowRight, Check } from 'lucide-react';
import { PaymentMethodItem } from '../data/paymentsData';

interface PaymentMethodsBannerProps {
  paymentMethods: PaymentMethodItem[];
  className?: string;
}

export const PaymentMethodsBanner: React.FC<PaymentMethodsBannerProps> = ({
  paymentMethods,
  className = ''
}) => {
  // Filter out any crypto/binance methods strictly - only official Peruvian payment methods
  const peruvianMethods = paymentMethods.filter(
    (p) =>
      p.active &&
      p.id !== 'binance' &&
      !p.name.toLowerCase().includes('binance') &&
      !p.name.toLowerCase().includes('usdt') &&
      !p.name.toLowerCase().includes('crypto')
  );

  // Fallback to ensure all 5 core Peruvian payment methods are displayed
  const defaultPeruvianList: PaymentMethodItem[] = [
    {
      id: 'yape',
      name: 'Yape',
      type: 'wallet',
      icon: 'wallet',
      logoUrl: '/imagenes/iconos-pago/yape.png',
      active: true,
      beneficiaryName: 'Descuentos Perú Oficial'
    },
    {
      id: 'plin',
      name: 'Plin',
      type: 'wallet',
      icon: 'wallet',
      logoUrl: '/imagenes/iconos-pago/plin.png',
      active: true,
      beneficiaryName: 'Descuentos Perú Oficial'
    },
    {
      id: 'bcp',
      name: 'BCP',
      type: 'bank',
      icon: 'bank',
      logoUrl: '/imagenes/iconos-pago/bcp.png',
      active: true,
      beneficiaryName: 'Descuentos Perú'
    },
    {
      id: 'interbank',
      name: 'Interbank',
      type: 'bank',
      icon: 'bank',
      logoUrl: '/imagenes/iconos-pago/interbank.png',
      active: true,
      beneficiaryName: 'Descuentos Perú'
    },
    {
      id: 'bbva',
      name: 'BBVA',
      type: 'bank',
      icon: 'bank',
      logoUrl: '/imagenes/iconos-pago/bbva.png',
      active: true,
      beneficiaryName: 'Descuentos Perú'
    }
  ];

  const displayMethods = peruvianMethods.length > 0 ? peruvianMethods : defaultPeruvianList;

  const brandStyles: Record<
    string,
    {
      name: string;
      sub: string;
      badge: string;
      cardHover: string;
      glowColor: string;
      iconBg: string;
      isWhiteIcon?: boolean;
    }
  > = {
    yape: {
      name: 'Yape',
      sub: 'Billetera Móvil BCP',
      badge: 'Al instante',
      cardHover: 'hover:border-purple-400 hover:shadow-[0_12px_30px_rgba(116,34,132,0.35)]',
      glowColor: 'from-purple-500/20 via-transparent to-transparent',
      iconBg: 'bg-[#742284]',
      isWhiteIcon: false
    },
    plin: {
      name: 'Plin',
      sub: 'BBVA / Interbank / Scotia',
      badge: '0% Comisión',
      cardHover: 'hover:border-cyan-400 hover:shadow-[0_12px_30px_rgba(0,209,213,0.35)]',
      glowColor: 'from-cyan-500/20 via-transparent to-transparent',
      iconBg: 'bg-white',
      isWhiteIcon: true
    },
    bcp: {
      name: 'BCP',
      sub: 'Banco de Crédito',
      badge: 'Soles PEN',
      cardHover: 'hover:border-blue-400 hover:shadow-[0_12px_30px_rgba(0,51,127,0.4)]',
      glowColor: 'from-blue-500/20 via-transparent to-transparent',
      iconBg: 'bg-[#00337f]',
      isWhiteIcon: false
    },
    interbank: {
      name: 'Interbank',
      sub: 'Banca Digital & App',
      badge: 'Sin Comisión',
      cardHover: 'hover:border-emerald-400 hover:shadow-[0_12px_30px_rgba(48,181,101,0.35)]',
      glowColor: 'from-emerald-500/20 via-transparent to-transparent',
      iconBg: 'bg-[#30B565]',
      isWhiteIcon: false
    },
    bbva: {
      name: 'BBVA',
      sub: 'Transferencia Directa',
      badge: 'Soles PEN',
      cardHover: 'hover:border-sky-400 hover:shadow-[0_12px_30px_rgba(0,68,129,0.4)]',
      glowColor: 'from-sky-500/20 via-transparent to-transparent',
      iconBg: 'bg-[#004481]',
      isWhiteIcon: false
    }
  };

  const getBrand = (id: string, name: string) => {
    const key = Object.keys(brandStyles).find(
      (k) => id.toLowerCase().includes(k) || name.toLowerCase().includes(k)
    );
    return (
      (key && brandStyles[key]) || {
        name,
        sub: 'Banca Móvil Perú',
        badge: 'Soles PEN',
        cardHover: 'hover:border-emerald-400 hover:shadow-[0_12px_30px_rgba(0,255,136,0.3)]',
        glowColor: 'from-emerald-500/20 via-transparent to-transparent',
        iconBg: 'bg-[#041a10]',
        isWhiteIcon: false
      }
    );
  };

  return (
    <section className={`relative rounded-3xl p-4 sm:p-7 lg:p-8 bg-[#030e07] border border-emerald-500/30 shadow-[0_0_40px_rgba(0,255,136,0.08)] overflow-hidden ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Tech Corner Accents */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#00ff88]/60 pointer-events-none" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#00ff88]/60 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#00ff88]/60 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#00ff88]/60 pointer-events-none" />

      <div className="relative z-10 space-y-5 sm:space-y-6">
        
        {/* Top Header: Trust Tag, Title, and Kusi AI Trust Pill */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-emerald-500/15">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>PAGOS OFICIALES EN PERÚ · MONEDA LOCAL (S/.)</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Paga Seguro en Soles con tu Billetera o Banco Preferido
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300">
              Aceptamos transferencias inmediatas sin comisiones bancarias. Acreditación automática y comprobante en 3 a 5 minutos.
            </p>
          </div>

          {/* Kusi AI Compact Trust Badge */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md shrink-0 shadow-lg w-full sm:w-auto">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <img
                src="/imagenes/llama-about.png"
                alt="Kusi AI"
                className="w-full h-full object-contain filter drop-shadow"
              />
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-[#00ff88] ring-2 ring-black" />
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-bold uppercase">
                <span>Kusi AI</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-normal">Asistente 24/7</span>
              </div>
              <span className="text-white font-bold block mt-0.5">Activación 100% Garantizada</span>
            </div>
          </div>
        </div>

        {/* The 5 Official Peruvian Payment Cards Grid (Pure, Clean Fintech Squircle App Icons) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {displayMethods.map((method, idx) => {
            const brand = getBrand(method.id, method.name);
            const logoSrc = method.logoUrl || `/imagenes/iconos-pago/${method.id}.png`;
            const isLastOdd = idx === displayMethods.length - 1 && displayMethods.length % 2 !== 0;

            return (
              <div
                key={method.id}
                className={`group relative p-3 sm:p-4 rounded-2xl bg-[#05140b]/90 border border-emerald-500/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 ${brand.cardHover} ${isLastOdd ? 'col-span-2 sm:col-span-1' : ''} cursor-default select-none flex flex-col justify-between overflow-hidden`}
              >
                {/* Ambient Brand Glow on hover */}
                <div
                  className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${brand.glowColor} rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                {/* Top: Crisp App Icon + Micro Badge */}
                <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                  <div
                    className={`w-12 h-12 rounded-2xl overflow-hidden ${brand.iconBg} shadow-md flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 border border-white/10`}
                  >
                    <img
                      src={logoSrc}
                      alt={brand.name}
                      className={`w-full h-full ${brand.isWhiteIcon ? 'object-contain p-1.5' : 'object-cover'}`}
                    />
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10 whitespace-nowrap">
                    {brand.badge}
                  </span>
                </div>

                {/* Middle: Brand Details */}
                <div className="text-left space-y-0.5 relative z-10 mb-3">
                  <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors tracking-tight">
                    {brand.name}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {brand.sub}
                  </p>
                </div>

                {/* Bottom: Official Perú Live Indicator */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-emerald-400 relative z-10">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                    Oficial Perú
                  </span>
                  <Check className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Guarantee Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>Encriptación bancaria SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>Sin cobros ocultos ni comisiones interbancarias</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>Atención y reposición 24/7 vía Telegram</span>
          </div>
        </div>

      </div>
    </section>
  );
};
