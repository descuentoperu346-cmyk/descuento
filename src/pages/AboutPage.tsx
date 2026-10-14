import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Users,
  Award,
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  ArrowRight,
  Database,
  Radio,
  Tv,
  ChevronLeft,
  ChevronRight,
  Phone,
  Crown,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { TELEGRAM_URL, TELEGRAM_USERNAME } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface AboutPageProps {
  onNavigateToServices: () => void;
  onNavigateToContact: () => void;
  onNavigateToLeaks: () => void;
  vendors: Vendor[];
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateToServices,
  onNavigateToContact,
  onNavigateToLeaks,
  vendors
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Group / Central Vendor is the MAIN card
  const centralVendor = vendors.find((v) => v.role === 'admin' || v.id === 'vendedor-central') || vendors[0];

  // The 4 verified creators for the cards carousel
  const creatorVendors = vendors.filter((v) => v.id !== centralVendor.id && v.active !== false);

  // Auto-moving carousel interval
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 25) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3400);

    return () => clearInterval(interval);
  }, [isAutoScrolling, creatorVendors.length]);

  const pauseAutoScroll = () => setIsAutoScrolling(false);
  const resumeAutoScroll = () => setIsAutoScrolling(true);

  const scrollLeft = () => {
    pauseAutoScroll();
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    pauseAutoScroll();
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: '¿Cómo se realiza la entrega de las cuentas y servicios?',
      a: 'Una vez coordinado el pago por Yape, Plin o transferencia bancaria, el asesor asignado te envía los datos de acceso o el reporte digital directamente por Telegram en un lapso promedio de 3 a 10 minutos.'
    },
    {
      q: '¿Qué garantía tengo si una cuenta presenta problemas?',
      a: 'Todos nuestros servicios cuentan con Garantía Total de Reposición durante el periodo contratado. Si experimentas cualquier caída de señal o inconveniente técnico, nuestro equipo te reactiva o sustituye el servicio sin costo adicional.'
    },
    {
      q: '¿Los servicios de investigación OSINT son confidenciales?',
      a: 'Absolutamente. Aplicamos protocolos de borrado seguro. No almacenamos historiales de búsquedas personales ni compartimos información de clientes con terceros bajo ninguna circunstancia.'
    },
    {
      q: '¿Puedo renovar la misma cuenta mes a mes?',
      a: 'Sí. En la gran mayoría de servicios (como Spotify a tu propio correo, Disney+, Netflix y YouTube Premium), ofrecemos renovaciones continuas para que mantengas tus listas de reproducción, perfiles y preferencias intactos.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
      
      {/* 1. Hero Section with Peruvian Mascot & High-Tech Intro */}
      <section className="relative rounded-3xl p-6 sm:p-10 md:p-12 bg-gradient-to-r from-[#041108] via-[#06180e] to-[#020b06] border border-emerald-500/35 shadow-[0_0_50px_rgba(0,255,136,0.12)] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-[#00ff88] tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4 text-[#00ff88]" />
              <span>CONÓCENOS // COMPROMISO & CONFIANZA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              La plataforma líder de <span className="text-[#00ff88] neon-glow-green">servicios digitales</span> y ciberseguridad en el Perú
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal">
              En <strong>Descuentos Perú</strong> centralizamos suscripciones premium oficiales de streaming, auditoría e investigación OSINT en registros públicos y laboratorios de ciberseguridad con la atención directa de nuestros creadores verificados: <strong>Whisky Perú</strong>, <strong>Abbys Perú</strong>, <strong>El Nano VIP</strong> y <strong>Tin9o</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToServices}
                className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_20px_rgba(0,255,136,0.35)] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Ver Catálogo de Servicios</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onNavigateToContact}
                className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-[#07190e] hover:bg-[#0d2a1b] border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-[#00ff88]" />
                <span>Contactar con un Asesor</span>
              </button>
            </div>
          </div>

          {/* Peruvian Mascot Presenting */}
          <div className="relative shrink-0 w-48 sm:w-56 lg:w-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <img
              src="/imagenes/llama-about.png"
              alt="Mascota Descuentos Perú"
              className="relative z-10 w-full h-auto max-h-72 object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </section>

      {/* 2. TEAM SHOWCASE: MAIN GROUP CARD (PRINCIPAL) + CREATOR CAROUSEL */}
      <section className="space-y-6">
        
        {/* A. EL DEL GRUPO COMO PRINCIPAL (FEATURED HERO CARD) */}
        <div className="rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-r from-[#04170d] via-[#062415] to-[#020e06] border-2 border-[#00ff88]/60 shadow-[0_0_40px_rgba(0,255,136,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#00ff88] text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-bl-2xl font-mono flex items-center gap-1.5 shadow-md">
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>CANAL & GRUPO OFICIAL PRINCIPAL</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 max-w-3xl">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#00ff88] p-1.5 bg-black shadow-[0_0_25px_rgba(0,255,136,0.5)] shrink-0">
                <img
                  src="/imagenes/monograma.png"
                  alt={centralVendor.name}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#00ff88] border-2 border-black animate-ping" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/50 text-[#00ff88]">
                    ADMINISTRACIÓN CENTRAL
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Verificado oficial</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {centralVendor.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {centralVendor.customNotes ||
                    'Canal matriz y administración central. Coordinación de compras mayoristas, garantías 24/7, soporte general y comunicados oficiales en todo el Perú.'}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-emerald-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                    En Línea 24/7 (Telegram)
                  </span>
                  <span>•</span>
                  <span>100% Reposición Garantizada</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <a
                href={centralVendor.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  recordVendorClickEvent(centralVendor.id, centralVendor.name, 'telegram', 'Nosotros Grupo Principal');
                }}
                className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 font-mono uppercase tracking-wide active:scale-95 whitespace-nowrap"
              >
                <Send className="w-4 h-4 fill-slate-950" />
                <span>Unirse al Canal (@{centralVendor.username})</span>
              </a>
              <span className="text-[10px] font-mono text-slate-400 text-center">
                Canal oficial de broadcasts & soporte
              </span>
            </div>
          </div>
        </div>

        {/* B. BANNER DE CREADORES VIP CON CARRUSEL AUTOMÁTICO EN MOVIMIENTO */}
        <div className="rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-r from-[#031c10] via-[#052d19] to-[#02130a] border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(0,255,136,0.22)] relative overflow-hidden space-y-6">
          
          {/* Ambient Cyber Highlights */}
          <div className="absolute top-0 right-0 w-96 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#00ff88]/10 blur-3xl pointer-events-none" />

          {/* Banner Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/30 pb-5 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-mono text-[#00ff88] tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#00ff88] animate-pulse" />
                <span>RED DE CREADORES VIP // ATENCIÓN DIRECTA 24/7</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Asesores & Vendedores Certificados
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Cada asesor cuenta con canales oficiales y entrega inmediata por Telegram. El carrusel se desliza automáticamente para que explores todas las especialidades disponibles.
              </p>
            </div>

            {/* Live Status Badge & Arrow Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-emerald-500/40 text-[11px] font-mono text-[#00ff88]">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
                <span>{isAutoScrolling ? 'Carrusel en Vivo' : 'Pausado'}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="w-10 h-10 rounded-full bg-[#04150c] border border-emerald-500/50 hover:border-[#00ff88] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  title="Deslizar a la izquierda"
                >
                  <ChevronLeft className="w-5 h-5 text-[#00ff88]" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  className="w-10 h-10 rounded-full bg-[#04150c] border border-emerald-500/50 hover:border-[#00ff88] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  title="Deslizar a la derecha"
                >
                  <ChevronRight className="w-5 h-5 text-[#00ff88]" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Multi-Card Auto-moving Carousel Track */}
          <div
            ref={carouselRef}
            onMouseEnter={pauseAutoScroll}
            onMouseLeave={resumeAutoScroll}
            onTouchStart={pauseAutoScroll}
            onTouchEnd={resumeAutoScroll}
            className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth relative z-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {creatorVendors.map((vendor) => {
              const isTino = vendor.username === 'Tin9o' || vendor.id === 'vendedor-tino';

              return (
                <div
                  key={vendor.id}
                  className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start rounded-3xl p-6 bg-gradient-to-b from-[#04140a] to-[#020b05] border border-emerald-900/80 hover:border-[#00ff88] shadow-xl hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-4">
                    {/* Creator Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_15px_rgba(0,255,136,0.3)] shrink-0 bg-black">
                        <img
                          src={vendor.avatar}
                          alt={vendor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff88] border-2 border-black animate-pulse" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors">
                            {vendor.name}
                          </h4>
                        </div>
                        <span className="text-xs text-[#00ff88] font-mono block">
                          @{vendor.username}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>⭐ {vendor.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span>+{vendor.salesCount} entregas</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal min-h-[48px]">
                      {vendor.customNotes ||
                        'Asesor verificado con atención personalizada y garantía total de reposición en Descuentos Perú.'}
                    </p>

                    {/* Specialty Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {vendor.allowedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/50 text-[10px] font-mono text-emerald-300 capitalize"
                        >
                          {cat === 'streaming' && '🎬 Streaming'}
                          {cat === 'leaks' && '🚨 Leaks'}
                          {cat === 'investigacion' && '🕵️ OSINT'}
                          {cat === 'educacion' && '💻 Software'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Telegram + WhatsApp ONLY for Tin9o */}
                  <div className="pt-4 mt-4 border-t border-emerald-950/80 space-y-2">
                    <a
                      href={vendor.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        recordVendorClickEvent(vendor.id, vendor.name, 'telegram', 'Nosotros Carrusel');
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-mono uppercase"
                    >
                      <Send className="w-3.5 h-3.5 fill-slate-950 text-slate-950 -rotate-12" />
                      <span>Contactar por Telegram</span>
                    </a>

                    {/* WhatsApp button ONLY for Tin9o with +51919192244 */}
                    {isTino && (
                      <a
                        href="https://wa.me/51919192244?text=Hola%20Tin9o%2C%20vengo%20de%20la%20web%20Descuentos%20Per%C3%BA%20y%20deseo%20consultar%20por%20tus%20servicios."
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          recordVendorClickEvent(vendor.id, vendor.name, 'whatsapp', 'Nosotros Carrusel Tin9o');
                        }}
                        className="w-full py-2 rounded-xl font-bold text-xs text-white bg-[#0e3b20] hover:bg-[#13522d] border border-emerald-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
                        title="WhatsApp directo a Tin9o (+51 919 192 244)"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#00ff88]" />
                        <span>WhatsApp (+51 919 192 244)</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. 4 Informatics KPI Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#041209] border border-emerald-900/60 shadow-lg text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-[#00ff88] font-mono block">
            +15,000
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Activaciones Exitosas
          </h4>
          <p className="text-[11px] text-slate-400">
            En Lima y todas las provincias del Perú
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#041209] border border-emerald-900/60 shadow-lg text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-[#00ff88] font-mono block">
            99.8%
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Tasa de Estabilidad
          </h4>
          <p className="text-[11px] text-slate-400">
            Con garantía de reemplazo inmediato
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#041209] border border-emerald-900/60 shadow-lg text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-[#00ff88] font-mono block">
            &lt; 5 min
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Tiempo de Entrega
          </h4>
          <p className="text-[11px] text-slate-400">
            Activación y envío de credenciales por Telegram
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#041209] border border-emerald-900/60 shadow-lg text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-[#00ff88] font-mono block">
            100%
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Garantía Local
          </h4>
          <p className="text-[11px] text-slate-400">
            Yape, Plin, BCP, Interbank y Binance Pay
          </p>
        </div>
      </section>

      {/* 4. Three Core Strategic Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff88]">
            NUESTRAS TRES DIVISIONES
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pilares Estratégicos de Descuentos Perú
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Combinamos ocio digital, trazabilidad de datos y educación técnica de vanguardia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-[#041108] border border-emerald-900/60 hover:border-emerald-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-[#00ff88] shadow-md">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Streaming & Entretenimiento 4K</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Cuentas oficiales y perfiles privados para Netflix UHD, Disney+, Spotify HiFi, Max y YouTube Premium. Olvídate de caídas continuas y perfiles compartidos con desconocidos.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToServices}
              className="text-xs font-bold text-[#00ff88] hover:underline flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>Explorar cuentas de streaming</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-[#041108] border border-emerald-900/60 hover:border-emerald-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-rose-400 shadow-md">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Inteligencia OSINT & Leaks</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Análisis forense de fuentes públicas y monitoreo de filtraciones en la dark web. Ayudamos a ciudadanos y empresas a proteger su identidad y detectar brechas de datos.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToLeaks}
              className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>Ver boletín de filtraciones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-[#041108] border border-emerald-900/60 hover:border-emerald-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-[#00ff88] shadow-md">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Software Original & Educación</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Licencias permanentes OEM de Windows 11, suites de Office 365, Canva Pro Anual y laboratorios educativos de administración remota y pentesting ético.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToServices}
              className="text-xs font-bold text-[#00ff88] hover:underline flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>Ver software y licencias</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Guarantees Grid */}
      <section className="p-6 sm:p-10 rounded-3xl bg-[#030e06] border border-emerald-900/60 shadow-xl space-y-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff88]">
            POLÍTICAS DE SEGURIDAD
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            ¿Por Qué Comprar con Total Tranquilidad en Descuentos Perú?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />
              <span>Garantía de Reposición</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Si tu cuenta experimenta alguna alteración de contraseña o bloqueo, se te entrega un reemplazo inmediato o reactivación.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />
              <span>Atención 100% Humana</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No hablamos con bots automáticos frustrantes. Cada cliente es atendido directamente por un asesor asignado en Telegram.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />
              <span>Pagos Verificados</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transferencias a cuentas bancarias peruanas y billeteras oficiales. Validación inmediata de comprobantes.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />
              <span>Privacidad Estricta</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No comercializamos datos de clientes ni archivamos consultas de inteligencia digital. Tu privacidad está protegida.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section className="p-6 sm:p-10 rounded-3xl bg-[#030d07] border border-emerald-900/60 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff88]">
            RESOLVEMOS TUS DUDAS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#05140c] border border-emerald-950/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-white text-sm sm:text-base hover:text-[#00ff88] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#00ff88] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-emerald-950/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#00ff88] to-[#00b359] text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_50px_rgba(0,255,136,0.25)]">
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full inline-block">
            ÚNETE A MILES DE CLIENTES
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            ¿Listo para activar tu servicio digital hoy?
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-900 max-w-xl">
            Revisa nuestro catálogo en tiempo real con precios en soles o consúltanos cualquier duda directamente por Telegram.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNavigateToServices}
            className="px-6 py-3 rounded-full font-black text-xs sm:text-sm text-white bg-slate-950 hover:bg-black shadow-lg transition-all cursor-pointer"
          >
            Explorar Servicios
          </button>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full font-black text-xs sm:text-sm text-slate-950 bg-white/90 hover:bg-white shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Hablar en Telegram</span>
          </a>
        </div>
      </section>

    </div>
  );
};
