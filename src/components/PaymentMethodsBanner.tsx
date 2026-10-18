import React from 'react';
import { ShieldCheck, Zap, Lock, Clock } from 'lucide-react';
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
        <span className="hidden sm:inline text-zinc-500">Moneda local · S/.</span>
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

        {/* Métodos de pago: carrusel continuo (se pausa al pasar el cursor) */}
        <div className="marquee relative -mx-4 sm:-mx-6 lg:-mx-8" aria-label="Métodos de pago aceptados">
          <ul className="marquee-track py-1">
            {[...displayMethods, ...displayMethods].map((method, i) => {
              const brand = getBrand(method);
              const isClone = i >= displayMethods.length;
              return (
                <li
                  key={`${method.id}-${i}`}
                  aria-hidden={isClone || undefined}
                  className="mr-3 w-36 sm:w-40 shrink-0 flex flex-col items-center text-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-4"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={brand.logo}
                    alt={isClone ? '' : `Icono de ${brand.name}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-[22%] object-cover shadow-md shadow-black/50"
                  />
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-white">{brand.name}</h4>
                    <p className="text-[11px] font-mono text-zinc-500 leading-tight">{brand.sub}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded border border-zinc-700 text-[10px] font-mono text-zinc-300">
                    {brand.badge}
                  </span>
                </li>
              );
            })}
          </ul>
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
