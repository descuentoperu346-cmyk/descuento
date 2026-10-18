import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  Tv,
  AlertTriangle,
  FileText,
  GraduationCap,
  Zap,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Pause,
  Play,
  Store,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { Vendor } from '../data/vendorsData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface Vendors3DFloatingCarouselProps {
  vendors: Vendor[];
  className?: string;
}

const AUTO_MS = 6000;

const CATEGORY_META: Record<string, { label: string; Icon: React.ElementType; tone: string }> = {
  streaming: { label: 'Streaming', Icon: Tv, tone: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10' },
  leaks: { label: 'OSINT', Icon: AlertTriangle, tone: 'text-rose-300 border-rose-400/30 bg-rose-400/10' },
  investigacion: { label: 'Peritaje', Icon: FileText, tone: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' },
  educacion: { label: 'Software', Icon: GraduationCap, tone: 'text-amber-300 border-amber-400/30 bg-amber-400/10' }
};

const buildWhatsappUrl = (vendor: Vendor): string | null => {
  if (vendor.username === 'Tin9o' || vendor.id === 'vendedor-tino') {
    return 'https://wa.me/51919192244?text=Hola%20Tin9o%2C%20vengo%20de%20la%20web%20Descuentos%20Per%C3%BA%20y%20deseo%20consultar%20por%20tus%20servicios.';
  }
  const digits = (vendor.whatsapp || '').replace(/\D/g, '');
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
};

export const Vendors3DFloatingCarousel: React.FC<Vendors3DFloatingCarouselProps> = ({
  vendors,
  className = ''
}) => {
  // Solo creadores activos (el vendedor central tiene su propia tarjeta en el hero)
  const creators = vendors.filter((v) => v.id !== 'vendedor-central' && v.active !== false);
  const total = creators.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Avance automático; reinicia al cambiar de asesor (también al elegirlo a mano)
  useEffect(() => {
    if (isPaused || total < 2) return;
    const t = setTimeout(() => setActiveIndex((prev) => (prev + 1) % total), AUTO_MS);
    return () => clearTimeout(t);
  }, [isPaused, total, activeIndex]);

  if (total === 0) return null;

  const safeIndex = Math.min(activeIndex, total - 1);
  const vendor = creators[safeIndex];
  const whatsappUrl = buildWhatsappUrl(vendor);
  const goPrev = () => setActiveIndex((safeIndex - 1 + total) % total);
  const goNext = () => setActiveIndex((safeIndex + 1) % total);

  return (
    <section
      aria-label="Asesores y creadores oficiales"
      className={`relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/70 to-[#07090a] p-4 sm:p-6 ${className}`}
    >
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[#00ff88]/10 blur-3xl" />

      {/* Cabecera */}
      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
        <div className="space-y-1.5">
          <p className="section-eyebrow">Red de asesores · atención 24/7</p>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Asesores y creadores oficiales
          </h3>
          <p className="text-sm text-zinc-400 max-w-xl">
            Habla directo por Telegram o WhatsApp con quien prefieras. Todos están verificados y respaldan tu compra con garantía.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-pressed={isPaused}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full border border-zinc-700 hover:border-zinc-500 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Reanudar' : 'Pausar'}
          </button>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Asesor anterior"
            className="h-10 w-10 rounded-full border border-zinc-700 hover:border-[#00ff88] text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Siguiente asesor"
            className="h-10 w-10 rounded-full border border-zinc-700 hover:border-[#00ff88] text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Perfil destacado */}
        <div
          className="order-1 lg:order-2 lg:col-span-7"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <article
            key={vendor.id}
            className="advisor-enter overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950"
          >
            {/* Portada */}
            <div className="h-20 sm:h-24 bg-gradient-to-r from-emerald-500/25 via-cyan-500/10 to-transparent bg-grid" />

            <div className="px-4 sm:px-6 pb-5 sm:pb-6 -mt-10 sm:-mt-12 space-y-4">
              <div className="flex items-end gap-4">
                <div className="relative shrink-0">
                  <img
                    src={vendor.avatar}
                    alt={vendor.name}
                    width={96}
                    height={96}
                    decoding="async"
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-4 border-zinc-950 bg-black"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#00ff88] border-2 border-zinc-950"
                    title="En línea"
                  />
                </div>
                <div className="min-w-0 pb-1">
                  <h4 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-white tracking-tight">
                    <span className="truncate">{vendor.name}</span>
                    <BadgeCheck className="w-5 h-5 text-[#00ff88] shrink-0" aria-label="Verificado" />
                  </h4>
                  <p className="font-mono text-sm text-[#00ff88]">@{vendor.username}</p>
                </div>
              </div>

              <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
                {vendor.customNotes || 'Asesor oficial con reposición 24/7 y garantía total.'}
              </p>

              {/* Métricas */}
              <dl className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
                  <dt className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Star className="w-3 h-3" /> Calificación
                  </dt>
                  <dd className="text-lg font-black text-amber-300">{vendor.rating.toFixed(1)}</dd>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
                  <dt className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <TrendingUp className="w-3 h-3" /> Ventas
                  </dt>
                  <dd className="text-lg font-black text-white">+{vendor.salesCount}</dd>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
                  <dt className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Zap className="w-3 h-3" /> Respuesta
                  </dt>
                  <dd className="text-lg font-black text-white">&lt; 5 min</dd>
                </div>
              </dl>

              {/* Especialidades */}
              {vendor.allowedCategories.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Especialidades">
                  {vendor.allowedCategories.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    if (!meta) return null;
                    const { Icon } = meta;
                    return (
                      <li
                        key={cat}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${meta.tone}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                      </li>
                    );
                  })}
                  <li className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-700 text-xs font-semibold text-zinc-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
                    Garantía total
                  </li>
                </ul>
              )}

              {/* Acciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={vendor.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordVendorClickEvent(vendor.id, vendor.name, 'telegram', 'Advisor Spotlight Telegram')}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#00ff88] hover:bg-[#2bff9d] text-zinc-950 text-sm font-black transition-colors"
                >
                  <Send className="w-4 h-4 -rotate-12" />
                  Escribir a @{vendor.username}
                </a>

                <a
                  href={`#/tienda/${vendor.username}`}
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-zinc-600 hover:border-[#00ff88] text-sm font-bold text-white transition-colors"
                >
                  <Store className="w-4 h-4 text-[#00ff88]" />
                  Ver su catálogo
                </a>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordVendorClickEvent(vendor.id, vendor.name, 'whatsapp', 'Advisor Spotlight WhatsApp')}
                    className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-zinc-600 hover:border-[#00ff88] text-sm font-bold text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#00ff88]" />
                    WhatsApp
                  </a>
                ) : vendor.catalogUrl ? (
                  <a
                    href={vendor.catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordVendorClickEvent(vendor.id, vendor.name, 'telegram', 'Advisor Spotlight Telegram Catalog')}
                    className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-zinc-600 hover:border-[#00ff88] text-sm font-bold text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-[#00ff88]" />
                    Catálogo en Telegram
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        </div>

        {/* Directorio */}
        <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col gap-2.5">
          <p className="flex items-center justify-between px-1 text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>{total} asesores activos</span>
            <span>Toca para ver</span>
          </p>

          <ul className="space-y-2">
            {creators.map((c, idx) => {
              const selected = idx === safeIndex;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-pressed={selected}
                    className={`relative w-full overflow-hidden text-left flex items-center gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#00ff88]/70 bg-zinc-900'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt=""
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-xl object-cover bg-black shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[15px] font-bold ${selected ? 'text-[#00ff88]' : 'text-white'}`}>
                        {c.name}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <Star className="w-3 h-3 fill-amber-300" />
                          {c.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>+{c.salesCount} ventas</span>
                      </span>
                    </span>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${selected ? 'text-[#00ff88]' : 'text-zinc-600'}`} />

                    {selected && total > 1 && (
                      <span
                        key={`${c.id}-${safeIndex}`}
                        className="advisor-progress absolute left-0 bottom-0 h-0.5 bg-[#00ff88]"
                        style={{
                          animationDuration: `${AUTO_MS}ms`,
                          animationPlayState: isPaused ? 'paused' : 'running'
                        }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

        </div>
      </div>
    </section>
  );
};
