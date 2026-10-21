import React, { useState } from 'react';
import { ShieldCheck, Zap, Lock, Clock, Pause, Play } from 'lucide-react';
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
      p.id !== 'plin' &&
      !p.name.toLowerCase().includes('plin') &&
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

  // Con pocos métodos el carrusel se repite hasta llenar el ancho: así nunca queda un hueco al reiniciar el ciclo
  const marqueeSet = Array.from({ length: Math.max(1, Math.ceil(8 / displayMethods.length)) }).flatMap(() => displayMethods);
  const [paused, setPaused] = useState(false);

  // Logos oficiales (SVG horizontales) para las marcas conocidas.
  const brandInfo: Record<string, { name: string; sub: string; badge: string; logo: string }> = {
    yape: { name: 'Yape', sub: 'Billetera móvil BCP', badge: 'Al instante', logo: '/imagenes/iconos-pago/yape-app.jpg' },
    bcp: { name: 'BCP', sub: 'Banco de Crédito', badge: 'Soles PEN', logo: '/imagenes/iconos-pago/bcp-app.jpg' },
    interbank: { name: 'Interbank', sub: 'Banca digital y app', badge: 'Sin comisión', logo: '/imagenes/iconos-pago/interbank-app.jpg' },
    bbva: { name: 'BBVA', sub: 'Transferencia directa', badge: 'Soles PEN', logo: '/imagenes/iconos-pago/bbva-app.jpg' },
    lemon: { name: 'Lemon Cash', sub: 'Billetera digital', badge: 'Billetera', logo: '/imagenes/iconos-pago/lemon-app.jpg' },
    panda: { name: 'Panda', sub: 'Billetera digital', badge: 'Billetera', logo: '/imagenes/iconos-pago/panda-app.jpg' },
    pagoefectivo: { name: 'PagoEfectivo', sub: 'Pago en agentes y bancos', badge: 'Efectivo', logo: '/imagenes/iconos-pago/pagoefectivo-app.jpg' },
    moni: { name: 'Moni', sub: 'Billetera KasNet', badge: 'Billetera', logo: '/imagenes/iconos-pago/moni-app.jpg' },
    cajaarequipa: { name: 'Caja Arequipa', sub: 'Caja municipal', badge: 'Soles PEN', logo: '/imagenes/iconos-pago/cajaarequipa-app.jpg' },
    sip: { name: 'SIP', sub: 'Billetera digital', badge: 'Billetera', logo: '/imagenes/iconos-pago/sip-app.jpg' }
  };

  const getBrand = (method: PaymentMethodItem) => {
    const key = Object.keys(brandInfo).find(
      (k) => method.id.toLowerCase().includes(k) || method.name.toLowerCase().includes(k)
    );
    if (key) return brandInfo[key];
    return {
      name: method.name,
      sub: 'Banca móvil Perú',
      badge: 'Soles PEN',
      logo: method.logoUrl || `/imagenes/iconos-pago/${method.id}.png`
    };
  };

  return (
    <section className={`relative rounded-2xl border border-zinc-800 bg-[#0a0d0c] overflow-hidden ${className}`}>
      {/* Franja superior tipo terminal */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b border-zinc-800 bg-zinc-900/40 font-mono text-[10px] sm:text-xs tracking-widest uppercase">
        <span className="inline-flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Pagos oficiales en Perú
        </span>
        <span className="hidden sm:inline text-zinc-400">Moneda local · S/.</span>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-left max-w-2xl">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight text-balance">
              Paga seguro en soles con tu billetera o banco preferido
            </h3>
            <p className="text-sm text-zinc-400">
              Transferencias inmediatas sin comisiones bancarias. Acreditación automática y comprobante en 3 a 5 minutos.
            </p>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 shrink-0">
            <img
              loading="lazy"
              decoding="async"
              src="/imagenes/llama-about.png"
              alt="Kusi AI"
              className="w-10 h-10 rounded-lg object-contain bg-zinc-950 border border-zinc-800"
            />
            <div className="text-left leading-tight">
              <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">Kusi AI · asistente 24/7</div>
              <div className="text-sm font-bold text-white mt-0.5">Activación 100% garantizada</div>
            </div>
          </div>
        </div>

        {/* Métodos de pago: carrusel continuo (se pausa al pasar el cursor o con el botón) */}
        <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-zinc-400">
          <span>
            {displayMethods.length} métodos de pago <span className="hidden sm:inline">· pasa el cursor para detener</span>
          </span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="marquee-toggle inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1 font-semibold text-zinc-200 transition-colors hover:border-emerald-500/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            {paused ? <Play className="h-3 w-3" aria-hidden="true" /> : <Pause className="h-3 w-3" aria-hidden="true" />}
            {paused ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
        <div className={`marquee relative -mx-4 sm:-mx-6 lg:-mx-8${paused ? ' is-paused' : ''}`} aria-label="Métodos de pago aceptados">
          <ul className="marquee-track py-1.5">
            {[...marqueeSet, ...marqueeSet].map((method, i) => {
              const brand = getBrand(method);
              const isClone = i >= marqueeSet.length;
              return (
                <li
                  key={`${method.id}-${i}`}
                  aria-hidden={isClone || undefined}
                  className={`${isClone ? 'marquee-clone ' : ''}group mr-3 w-40 sm:w-44 shrink-0 flex flex-col items-center text-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-zinc-900`}
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={brand.logo}
                    alt={isClone ? '' : `Icono de ${brand.name}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-[22%] object-cover shadow-md shadow-black/50 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-white">{brand.name}</h4>
                    <p className="text-[11px] font-mono text-zinc-400 leading-tight">{brand.sub}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded border border-zinc-700 text-[10px] font-mono text-zinc-300">
                    {brand.badge}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        </div>

        {/* Garantías */}
        <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-center sm:justify-between gap-3 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encriptación bancaria SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sin cobros ocultos ni comisiones interbancarias</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Atención y reposición 24/7 vía Telegram</span>
          </div>
        </div>
      </div>
    </section>
  );
};
