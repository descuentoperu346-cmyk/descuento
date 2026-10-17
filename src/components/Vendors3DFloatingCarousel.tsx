import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  Sparkles,
  Tv,
  AlertTriangle,
  FileText,
  GraduationCap,
  Shield,
  Zap,
  Crown,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Users,
  ExternalLink
} from 'lucide-react';
import { Vendor } from '../data/vendorsData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface Vendors3DFloatingCarouselProps {
  vendors: Vendor[];
  className?: string;
}

export const Vendors3DFloatingCarousel: React.FC<Vendors3DFloatingCarouselProps> = ({
  vendors,
  className = ''
}) => {
  // Only display active creator vendors (excluding admin central which has its own hero card)
  const creators = vendors.filter((v) => v.id !== 'vendedor-central' && v.active !== false);
  const total = creators.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive spread tracking
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Proportional horizontal spread inside the 3D stage column
  const spreadX = windowWidth >= 1200 ? 190 : windowWidth >= 768 ? 165 : windowWidth >= 480 ? 115 : 70;
  const farSpreadX = windowWidth >= 1200 ? 280 : windowWidth >= 768 ? 240 : windowWidth >= 480 ? 165 : 110;

  // Auto-advance loop every 4 seconds
  useEffect(() => {
    if (isPaused || total === 0) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  if (total === 0) return null;

  const activeCreator = creators[activeIndex] || creators[0];

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#02130a] via-[#041d10] to-[#010c06] border border-emerald-500/40 shadow-[0_0_28px_rgba(0,255,136,0.12)] relative overflow-hidden ${className}`}
    >
      {/* Background Cyber Tech Grid & Glow Orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#00ff88]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Brackets */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#00ff88]/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#00ff88]/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-[#00ff88]/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#00ff88]/60 pointer-events-none" />

      {/* 1. Header Strip - Clean, compact & informative */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3 mb-3 relative z-30">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[9px] font-mono text-[#00ff88] tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-[#00ff88] animate-pulse" />
            <span>RED DE ASESORES VIP // MONITOREO 24/7</span>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Asesores & Creadores Oficiales</span>
            <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 hidden sm:inline-block">
              {total} Activos
            </span>
          </h3>
          <p className="text-[11px] text-slate-300">
            Atención directa por Telegram y WhatsApp. Selecciona un asesor o explora en órbita 3D.
          </p>
        </div>

        {/* Controls: Bucle 3D toggle + Arrow Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-emerald-500/40 text-[10px] font-mono text-[#00ff88] hover:border-[#00ff88] transition-colors cursor-pointer"
            title="Pausar o reanudar rotación automática"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-[#00ff88] animate-ping'}`} />
            <span>{isPaused ? 'Pausado' : 'Bucle 3D'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-[#04150c] border border-emerald-500/50 hover:border-[#00ff88] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Asesor anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#00ff88]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-[#04150c] border border-emerald-500/50 hover:border-[#00ff88] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Siguiente asesor"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#00ff88]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main High-Density Cyber Deck: Quick Directory (Left) + 3D Orbital Stage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-20">
        
        {/* LEFT COLUMN: Fast Advisor Directory & Trust Telemetry */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#00ff88]" />
              <span>Directorio Rápido</span>
            </span>
            <span className="text-slate-400">Clic para enfocar</span>
          </div>

          {/* Interactive Advisor Selector List */}
          <div className="space-y-1.5">
            {creators.map((c, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/90 to-[#041f11] border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.22)]'
                      : 'bg-black/40 border-emerald-900/50 hover:border-emerald-500/50 hover:bg-emerald-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Mini Avatar */}
                    <div className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border ${
                      isSelected ? 'border-[#00ff88]' : 'border-emerald-800'
                    }`}>
                      <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#00ff88]' : 'text-white'}`}>
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">@{c.username}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                        <span className="flex items-center gap-0.5 text-amber-300">
                          <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                          {c.rating.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400">+{c.salesCount} ventas</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Indicator Tag */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#00ff88] text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Crown className="w-2.5 h-2.5 fill-slate-950" />
                        <span>Activo</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-500/70 hover:text-[#00ff88]">
                        Ver →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Trust Telemetry Strip */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-emerald-950/80">
            <div className="px-2 py-1.5 rounded-lg bg-black/50 border border-emerald-900/60 text-center">
              <span className="text-[9px] font-mono text-slate-400 block">Respuesta</span>
              <span className="text-[11px] font-mono font-bold text-[#00ff88] flex items-center justify-center gap-1">
                <Zap className="w-2.5 h-2.5" /> &lt; 5 min
              </span>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-black/50 border border-emerald-900/60 text-center">
              <span className="text-[9px] font-mono text-slate-400 block">Garantía</span>
              <span className="text-[11px] font-mono font-bold text-[#00ff88] flex items-center justify-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> 100% Total
              </span>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-black/50 border border-emerald-900/60 text-center">
              <span className="text-[9px] font-mono text-slate-400 block">Soporte</span>
              <span className="text-[11px] font-mono font-bold text-[#00ff88] flex items-center justify-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> 24/7 Perú
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Orbital Focused Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div
            className="relative w-full h-[290px] sm:h-[310px] flex items-center justify-center preserve-3d select-none overflow-hidden sm:overflow-visible"
            style={{ perspective: '1000px' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {creators.map((vendor, index) => {
              // Calculate circular offset
              let offset = (index - activeIndex + total) % total;
              if (offset > total / 2) offset -= total;

              const isActive = offset === 0;
              const isLeft = offset === -1;
              const isRight = offset === 1;

              // Compute 3D positioning styles
              let transformStyle = '';
              let zIndex = 10;
              let opacity = 0.2;
              let filter = 'brightness(0.6) blur(1px)';
              let pointerEvents: 'auto' | 'none' = 'none';

              if (isActive) {
                transformStyle = 'translateX(0px) translateY(0px) translateZ(40px) rotateY(0deg) scale(1.02)';
                zIndex = 30;
                opacity = 1;
                filter = 'brightness(1) blur(0px)';
                pointerEvents = 'auto';
              } else if (isLeft) {
                transformStyle = `translateX(-${spreadX}px) translateY(6px) translateZ(-50px) rotateY(16deg) scale(0.86)`;
                zIndex = 20;
                opacity = 0.65;
                filter = 'brightness(0.7) blur(0.5px)';
                pointerEvents = 'auto';
              } else if (isRight) {
                transformStyle = `translateX(${spreadX}px) translateY(6px) translateZ(-50px) rotateY(-16deg) scale(0.86)`;
                zIndex = 20;
                opacity = 0.65;
                filter = 'brightness(0.7) blur(0.5px)';
                pointerEvents = 'auto';
              } else {
                const dir = offset > 0 ? 1 : -1;
                transformStyle = `translateX(${dir * farSpreadX}px) translateY(12px) translateZ(-110px) rotateY(${dir * -20}deg) scale(0.72)`;
                zIndex = 10;
                opacity = 0.15;
                filter = 'brightness(0.4) blur(1.5px)';
                pointerEvents = 'none';
              }

              return (
                <div
                  key={vendor.id}
                  onClick={() => {
                    if (!isActive) setActiveIndex(index);
                  }}
                  className="absolute top-1/2 left-1/2 w-[205px] sm:w-[245px] transition-all duration-500 ease-out cursor-pointer select-none"
                  style={{
                    transform: `translate(-50%, -50%) ${transformStyle}`,
                    zIndex,
                    opacity,
                    filter,
                    pointerEvents
                  }}
                >
                  {/* Card Container */}
                  <div
                    className={`rounded-2xl p-3 sm:p-3.5 bg-gradient-to-b from-[#04160c]/98 via-[#062415]/98 to-[#020e07]/98 border transition-all duration-300 relative ${
                      isActive
                        ? 'border-2 border-[#00ff88] shadow-[0_12px_30px_rgba(0,255,136,0.28)] animate-float-card'
                        : 'border border-emerald-900/80 shadow-lg hover:border-emerald-500/60'
                    }`}
                  >
                    {/* Glowing Superpuesta Tag */}
                    {isActive && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#00ff88] text-slate-950 font-mono font-black text-[8px] tracking-wider uppercase shadow-[0_0_10px_#00ff88] flex items-center gap-1 whitespace-nowrap">
                        <Crown className="w-2.5 h-2.5 fill-slate-950" />
                        <span>ASESOR ACTIVO</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {/* Creator Avatar & Basic Info */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-emerald-400 shadow-[0_0_10px_rgba(0,255,136,0.3)] shrink-0 bg-black">
                          <img
                            src={vendor.avatar}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-[#00ff88] border border-black animate-pulse" />
                        </div>

                        <div className="leading-tight min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">
                            {vendor.name}
                          </h4>
                          <span className="text-[10px] text-[#00ff88] font-mono font-bold block">
                            @{vendor.username}
                          </span>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-mono mt-0.5">
                            <span className="flex items-center gap-0.5 text-amber-300">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              {vendor.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400">+{vendor.salesCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio Description (1 line) */}
                      <p className="text-[10px] text-slate-300 leading-tight font-normal line-clamp-1">
                        {vendor.customNotes || 'Asesor oficial con reposición 24/7 y garantía total.'}
                      </p>

                      {/* Specialty Badges */}
                      <div className="flex flex-wrap gap-1">
                        {vendor.allowedCategories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-[8px] font-mono text-emerald-300 font-bold"
                          >
                            {cat === 'streaming' && (
                              <>
                                <Tv className="w-2.5 h-2.5 text-cyan-400" />
                                <span>Streaming</span>
                              </>
                            )}
                            {cat === 'leaks' && (
                              <>
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                <span>OSINT</span>
                              </>
                            )}
                            {cat === 'investigacion' && (
                              <>
                                <FileText className="w-2.5 h-2.5 text-[#00ff88]" />
                                <span>Peritaje</span>
                              </>
                            )}
                            {cat === 'educacion' && (
                              <>
                                <GraduationCap className="w-2.5 h-2.5 text-amber-400" />
                                <span>Software</span>
                              </>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Trust Highlights micro row */}
                      <div className="pt-1 border-t border-emerald-950/80 flex items-center justify-between text-[8px] font-mono text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Zap className="w-2.5 h-2.5 text-[#00ff88]" /> 5 min
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Shield className="w-2.5 h-2.5 text-[#00ff88]" /> 100% Seguro
                        </span>
                      </div>

                      {/* Action Contact Buttons */}
                      <div className="pt-0.5 space-y-1">
                        <a
                          href={vendor.telegramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!isActive) {
                              e.preventDefault();
                              setActiveIndex(index);
                              return;
                            }
                            recordVendorClickEvent(vendor.id, vendor.name, 'telegram', '3D Carousel Button');
                          }}
                          className={`w-full py-1.5 rounded-xl font-black text-[10px] font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                            isActive
                              ? 'bg-[#00ff88] hover:bg-[#00e676] text-slate-950 shadow-[0_0_12px_rgba(0,255,136,0.4)] active:scale-95'
                              : 'bg-[#051c10] text-emerald-300 border border-emerald-800/80 hover:bg-[#082a18]'
                          }`}
                        >
                          <Send className={`w-3 h-3 -rotate-12 ${isActive ? 'fill-slate-950' : 'text-[#00ff88]'}`} />
                          <span>{isActive ? `Contactar @${vendor.username}` : `Ver @${vendor.username}`}</span>
                        </a>

                        {vendor.catalogUrl && (
                          <a
                            href={vendor.catalogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!isActive) {
                                e.preventDefault();
                                setActiveIndex(index);
                                return;
                              }
                              recordVendorClickEvent(vendor.id, vendor.name, 'telegram', '3D Carousel Catalog Button');
                            }}
                            className={`w-full py-1 rounded-xl font-bold text-[9px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/50 hover:border-cyan-300'
                                : 'bg-[#03150a] text-slate-400 border border-emerald-900/60 hover:text-white'
                            }`}
                            title={`Catálogo de ventas de ${vendor.name} en Telegram`}
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                            <span>Ver Catálogo de Ventas</span>
                          </a>
                        )}

                        {(vendor.username === 'Tin9o' || vendor.id === 'vendedor-tino') && (
                          <a
                            href="https://wa.me/51919192244?text=Hola%20Tin9o%2C%20vengo%20de%20la%20web%20Descuentos%20Per%C3%BA%20y%20deseo%20consultar%20por%20tus%20servicios."
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!isActive) {
                                e.preventDefault();
                                setActiveIndex(index);
                                return;
                              }
                              recordVendorClickEvent(vendor.id, vendor.name, 'whatsapp', '3D Carousel Tin9o WhatsApp');
                            }}
                            className={`w-full py-1 rounded-xl font-bold text-[9px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#0e3b20] hover:bg-[#13522d] text-white border border-emerald-400/60'
                                : 'bg-[#03150a] text-slate-400 border border-emerald-900/60 hover:text-white'
                            }`}
                            title="WhatsApp directo a Tin9o (+51 919 192 244)"
                          >
                            <Phone className="w-2.5 h-2.5 text-[#00ff88]" />
                            <span>WhatsApp (+51 919 192 244)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Micro Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1 relative z-20">
            {creators.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? 'w-5 h-1.5 bg-[#00ff88] shadow-[0_0_8px_#00ff88]'
                    : 'w-1.5 h-1.5 bg-emerald-950 border border-emerald-700/60 hover:bg-emerald-800'
                }`}
                title={`Ir a ${c.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
