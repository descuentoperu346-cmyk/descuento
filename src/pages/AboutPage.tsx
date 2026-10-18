import React from 'react';
import {
  ShieldCheck,
  Zap,
  Users,
  Award,
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
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
  MessageCircle,
  AlertTriangle,
  Search,
  Laptop,
  Film
} from 'lucide-react';
import { TELEGRAM_URL, TELEGRAM_USERNAME } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { recordVendorClickEvent } from '../data/telemetryData';
import { Vendors3DFloatingCarousel } from '../components/Vendors3DFloatingCarousel';

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
  // Group / Central Vendor is the MAIN card
  const centralVendor = vendors.find((v) => v.role === 'admin' || v.id === 'vendedor-central') || vendors[0];

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
      
      {/* 1. Header: Transparencia, Garantía y Comunidad */}
      <section className="relative rounded-2xl p-5 sm:p-7 md:p-8 bg-gradient-to-r from-[#0d0d0d] via-[#131313] to-[#090909] border border-zinc-700 overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-700 text-[11px] font-mono text-[#00ff88]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
              <span className="font-semibold uppercase tracking-wider">Identidad, Garantía & Comunidad</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Plataforma Digital Verificada en <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-emerald-300 to-teal-200">Todo el Perú</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Conectamos usuarios con creadores y asesores de confianza. Garantizamos cuentas 100% privadas, reposición inmediata ante cualquier contingencia y soporte continuo en Telegram para streaming, herramientas OSINT y software profesional.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('seccion-asesores');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#00ff88] text-slate-950 hover:bg-[#00e676] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Users className="w-3.5 h-3.5 text-slate-950" />
                <span>Conocer al Equipo</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToServices}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-zinc-900/60 text-emerald-300 border border-zinc-700 hover:border-[#00ff88] hover:text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00ff88]" />
                <span>Explorar Catálogo</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0 w-full lg:w-auto lg:min-w-[280px]">
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-700 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[#00ff88] text-[10px] font-mono font-bold uppercase mb-0.5">
                <Users className="w-3 h-3" />
                <span>Equipo</span>
              </div>
              <div className="text-xl font-black text-white">4 Asesores</div>
              <div className="text-[10px] text-slate-400">Verificados y activos</div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-700 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[#00ff88] text-[10px] font-mono font-bold uppercase mb-0.5">
                <Zap className="w-3 h-3" />
                <span>Respuesta</span>
              </div>
              <div className="text-xl font-black text-white">&lt; 5 min</div>
              <div className="text-[10px] text-slate-400">Promedio de atención</div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-700 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[#00ff88] text-[10px] font-mono font-bold uppercase mb-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Garantía</span>
              </div>
              <div className="text-xl font-black text-white">100% Total</div>
              <div className="text-[10px] text-slate-400">Reposición sin costo</div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-700 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[#00ff88] text-[10px] font-mono font-bold uppercase mb-0.5">
                <Lock className="w-3 h-3" />
                <span>Privacidad</span>
              </div>
              <div className="text-xl font-black text-white">Segura</div>
              <div className="text-[10px] text-slate-400">Sin retención de logs</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TEAM SHOWCASE: MAIN GROUP CARD (PRINCIPAL) + 3D FLOATING CAROUSEL */}
      <section id="seccion-asesores" className="space-y-6">
        
        {/* A. EL DEL GRUPO COMO PRINCIPAL (FEATURED HERO CARD - COMPACT) */}
        <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-[#101010] via-[#191919] to-[#090909] border-2 border-[#00ff88]/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-[#00ff88] text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-bl-xl font-mono flex items-center gap-1 shadow-sm">
            <Crown className="w-3 h-3 fill-slate-950" />
            <span>CANAL MATRIZ OFICIAL</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-3xl">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-[#00ff88] p-1 bg-black shrink-0">
                <img loading="lazy" decoding="async"
                  src="/imagenes/monograma.png"
                  alt={centralVendor.name}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff88] border-2 border-black animate-ping" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-zinc-900 border border-emerald-500/50 text-[#00ff88]">
                    ADMINISTRACIÓN CENTRAL
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Verificado</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {centralVendor.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {centralVendor.customNotes ||
                    'Canal matriz y administración central. Coordinación de compras mayoristas, garantías 24/7, soporte general y comunicados oficiales en todo el Perú.'}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                    En Línea 24/7 (Telegram)
                  </span>
                  <span>•</span>
                  <span>100% Reposición</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-1.5 w-full lg:w-auto">
              <a
                href={centralVendor.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  recordVendorClickEvent(centralVendor.id, centralVendor.name, 'telegram', 'Nosotros Grupo Principal');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-[#00ff88] hover:bg-[#00e676] transition-all cursor-pointer flex items-center justify-center gap-2 font-mono uppercase tracking-wide active:scale-95 text-center"
              >
                <Send className="w-3.5 h-3.5 fill-slate-950" />
                <span>Unirse al Canal (@{centralVendor.username})</span>
              </a>
              <span className="text-[9px] font-mono text-slate-400 text-center">
                Canal oficial de broadcasts & soporte
              </span>
            </div>
          </div>
        </div>

        {/* B. TARJETAS 3D FLOTANDO Y AVANZANDO EN BUCLE (ACTIVA SUPERPUESTA, DEMÁS ATRÁS) */}
        <Vendors3DFloatingCarousel vendors={vendors} />
      </section>

      {/* 3. 4 Informatics KPI Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0c0c] border border-zinc-800/60 shadow-lg text-center space-y-1">
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

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0c0c] border border-zinc-800/60 shadow-lg text-center space-y-1">
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

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0c0c] border border-zinc-800/60 shadow-lg text-center space-y-1">
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

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0c0c] border border-zinc-800/60 shadow-lg text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-black text-[#00ff88] font-mono block">
            100%
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Garantía Local
          </h4>
          <p className="text-[11px] text-slate-400">
            Yape, Plin, BCP, Interbank y BBVA
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
          <div className="p-6 rounded-3xl bg-[#0c0c0c] border border-zinc-800/60 hover:border-emerald-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-[#00ff88] shadow-md">
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
          <div className="p-6 rounded-3xl bg-[#0c0c0c] border border-zinc-800/60 hover:border-emerald-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-rose-400 shadow-md">
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
          <div className="p-6 rounded-3xl bg-[#0c0c0c] border border-zinc-800/60 hover:border-emerald-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-zinc-700 flex items-center justify-center text-[#00ff88] shadow-md">
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
      <section className="p-6 sm:p-10 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-8">
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


    </div>
  );
};

