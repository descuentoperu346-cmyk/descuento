import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Radio,
  Timer,
  Clock,
  ShieldAlert,
  FileText,
  Lock,
  Send,
  Share2,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Scale,
  FileSearch,
  Eye,
  Maximize2,
  X,
  Users,
  Search,
  Zap,
  Building2,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface PoliticalFigureEntry {
  id: string;
  code: string;
  name: string;
  role: string;
  status: string;
  imageUrl: string;
  category: 'ejecutivo' | 'congreso' | 'historico' | 'todos';
  tag: string;
  notes: string;
  /** Figura resaltada con marco especial en la cuadrícula */
  featured?: boolean;
  /** Cargo vigente que se muestra en la ficha destacada */
  officeLabel?: string;
}

export const CONGRESO_FIGURES: PoliticalFigureEntry[] = [
  {
    id: 'cong-fig-01',
    code: 'EXP-01 // MESA DIRECTIVA',
    name: 'Operadores de Mesa Directiva y Enlaces',
    role: 'Coordinación de transferencias y asignación presupuestal de pauta publicitaria clandestina del Congreso.',
    status: 'Trazabilidad de pagos en revisión pericial',
    imageUrl: '/imagenes/caso-congreso/figura-01.jpg',
    category: 'congreso',
    tag: 'CONGRESO / MESA DIRECTIVA',
    notes: 'Investigación sobre intermediarios encargados de autorizar órdenes de servicio y pautas ficticias con productoras vinculadas a América TV.'
  },
  {
    id: 'cong-fig-02',
    code: 'EXP-02 // ÓRGANOS DE CONTROL',
    name: 'Vínculos con Órganos de Control y Fiscalías',
    role: 'Seguimiento a carpetas fiscales y comisiones investigadoras sobre cobro de comisiones y blindaje mediático.',
    status: 'Cotejo de expedientes y resoluciones',
    imageUrl: '/imagenes/caso-congreso/figura-02.jpg',
    category: 'congreso',
    tag: 'CONTROL / MINISTERIO PÚBLICO',
    notes: 'Informes sobre presiones internas para suspender denuncias sobre cobro de diezmos y coimas a proveedores del Estado.'
  },
  {
    id: 'cong-fig-03',
    code: 'EXP-03 // ANTECEDENTE HISTÓRICO',
    name: 'Alberto Fujimori',
    role: 'Precedente histórico de control de líneas editoriales y compra de coberturas televisivas (Caso Vladivideos / América TV).',
    status: 'Antecedente pericial homologado',
    imageUrl: '/imagenes/caso-congreso/figura-03.jpg',
    category: 'historico',
    tag: 'ANTECEDENTE HISTÓRICO',
    notes: 'Patrón criminal documentado en sentencias judiciales sobre el pago directo a directivos televisivos para silenciar oposición y denuncias de corrupción.'
  },
  {
    id: 'cong-fig-04',
    code: 'EXP-04 // COMISIONES ORDINARIAS',
    name: 'Dirección Parlamentaria y Comisiones Ordinarias',
    role: 'Gestión de comisiones de fiscalización y distribución de montos encubiertos en publicidad institucional.',
    status: 'Bajo cotejo de firmas y contratos',
    imageUrl: '/imagenes/caso-congreso/figura-04.jpg',
    category: 'congreso',
    tag: 'PARLAMENTO / COMISIONES',
    notes: 'Presuntos acuerdos para omitir investigaciones a congresistas a cambio de pautas comerciales garantizadas en medios masivos.'
  },
  {
    id: 'cong-fig-05',
    code: 'EXP-05 // EJECUTIVO ANTERIOR',
    name: 'Martín Vizcarra',
    role: 'Investigaciones por direccionamiento de gasto publicitario estatal y contrataciones en el Ejecutivo.',
    status: 'Carpetas preliminares contrastadas',
    imageUrl: '/imagenes/caso-congreso/figura-05.jpg',
    category: 'ejecutivo',
    tag: 'EXPRESIDENTE / PROCESO',
    notes: 'Antecedentes de reasignación millonaria de presupuestos publicitarios hacia conglomerados de televisión en coyunturas de cierre del Congreso.'
  },
  {
    id: 'cong-fig-06',
    code: 'EXP-06 // PODER EJECUTIVO',
    name: 'Dina Boluarte',
    role: 'Decretos de urgencia y partidas de imagen institucional vinculadas al sostenimiento de acuerdos con bancadas congresales.',
    status: 'Análisis de partidas presupuestarias',
    imageUrl: '/imagenes/caso-congreso/figura-06.jpg',
    category: 'ejecutivo',
    tag: 'PODER EJECUTIVO / PRESIDENCIA',
    notes: 'Cotejo de convenios de publicidad estatal emitidos durante debates parlamentarios de mociones de censura y vacancia.'
  },
  {
    id: 'cong-fig-07',
    code: 'EXP-07 // EJECUTIVO ANTERIOR',
    name: 'Pedro Castillo',
    role: 'Expedientes por irregularidades en comisiones, licitaciones regionales y reclamos por pauta periodística.',
    status: 'Documentación en custodia',
    imageUrl: '/imagenes/caso-congreso/figura-07.jpg',
    category: 'ejecutivo',
    tag: 'EXPRESIDENTE / PROCESO',
    notes: 'Testimonios de colaboradores eficaces sobre ofrecimientos de pauta oficial y entrega de prebendas a cambio de frenar coberturas dominicales.'
  },
  {
    id: 'cong-fig-08',
    code: 'EXP-08 // ANTECEDENTE HISTÓRICO',
    name: 'Alan García',
    role: 'Patrones históricos de asignación de publicidad estatal y condicionamiento de reportajes dominicales.',
    status: 'Precedente judicial documentado',
    imageUrl: '/imagenes/caso-congreso/figura-08.jpg',
    category: 'historico',
    tag: 'ANTECEDENTE HISTÓRICO',
    notes: 'Registros de convenios comerciales y transferencias institucionales que sirvieron de modelo para el actual blindaje de comisiones congresales.'
  },
  {
    id: 'cong-fig-09',
    code: 'EXP-09 // FUERZA POPULAR',
    name: 'Keiko Fujimori',
    role: 'Dirección política de la bancada mayoritaria en comisiones de presupuesto y alianzas de veto mediático.',
    status: 'Cotejo de registros de bancada',
    imageUrl: '/imagenes/caso-congreso/figura-09.jpg',
    category: 'congreso',
    tag: 'FUERZA POPULAR / LIDERAZGO',
    notes: 'Análisis de votaciones coordinadas en comisiones y coincidencias editoriales en programas periodísticos de América TV.',
    featured: true,
    officeLabel: 'Presidenta del Perú · 2026–2031'
  }
];

import { useLeakCountdown, LEAK_DEADLINE_LABEL } from '../hooks/useLeakCountdown';
import { getFigureBadge, FIGURE_PROFILES, CASE_STATUS_META, PREVIEW_CASE_COUNT } from '../data/figureProfiles';

const FIGURE_TONE: Record<'red' | 'amber' | 'green' | 'zinc', string> = {
  red: 'bg-rose-500/15 text-rose-300 border-rose-500/50',
  amber: 'bg-amber-400/15 text-amber-300 border-amber-400/50',
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50',
  zinc: 'bg-zinc-700/40 text-zinc-300 border-zinc-600'
};

interface UpcomingLeakCountdownBannerProps {
  onNotifyTelegram?: () => void;
  onExploreDetails?: () => void;
  /** Abre el artículo completo del Leak #02 */
  onReadExpediente?: () => void;
  /** Muestra siempre la vista completa (sin franja plegada) */
  forceExpanded?: boolean;
  onClose?: () => void;
  className?: string;
}

export const UpcomingLeakCountdownBanner: React.FC<UpcomingLeakCountdownBannerProps> = ({
  onNotifyTelegram,
  onExploreDetails,
  onReadExpediente,
  forceExpanded,
  onClose,
  className = ''
}) => {
  // Live dynamic countdown timer: 1 dia, 13 horas y 20 minutos
  const { days, hours, minutes, seconds, isExpired } = useLeakCountdown();

  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'todos' | 'ejecutivo' | 'congreso' | 'historico'>('todos');
  const [zoomedFigure, setZoomedFigure] = useState<PoliticalFigureEntry | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [expanded, setExpanded] = useState(!!forceExpanded);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#/leaks`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      });
    }
  };

  const handleTelegramClick = () => {
    if (onNotifyTelegram) {
      onNotifyTelegram();
    } else {
      window.open('https://t.me/Tin9o', '_blank', 'noopener,noreferrer');
    }
  };

  const filteredFigures = CONGRESO_FIGURES.filter(
    (f) => activeCategory === 'todos' || f.category === activeCategory
  );

  if (!expanded) {
    const units = [
      { v: String(days).padStart(2, '0'), l: 'd' },
      { v: String(hours).padStart(2, '0'), l: 'h' },
      { v: String(minutes).padStart(2, '0'), l: 'm' },
      { v: String(seconds).padStart(2, '0'), l: 's' }
    ];
    return (
      <section
        id="proximo-leak-congreso"
        aria-label="Leak #02: Expediente Keiko Fujimori"
        className={`relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-[#1a0409] to-[#0a0204] p-4 sm:p-5 ${className}`}
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-rose-600/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-500/10 px-2.5 py-0.5 text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                {isExpired ? 'Leak #02 · Liberado' : 'Leak #02 · Próxima liberación'}
              </span>
              <span className="text-zinc-400">Caso archivado · sin condena</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Expediente Keiko Fujimori</h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Caso Cócteles: aportes ocultos, falsos aportantes y presión sobre testigos, según documentos judiciales y de la SMV.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
            {!isExpired && (
              <div role="timer" aria-label="Tiempo restante para la liberación" className="flex items-center gap-1 font-mono text-sm font-black text-white tabular-nums">
                <Clock className="mr-1 h-4 w-4 text-rose-400" />
                {units.map((u) => (
                  <span key={u.l} className="rounded-md border border-rose-500/30 bg-black/60 px-1.5 py-0.5">
                    {u.v}
                    <span className="text-[10px] text-zinc-500">{u.l}</span>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {onReadExpediente && isExpired && (
                <button
                  type="button"
                  onClick={onReadExpediente}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs sm:text-sm font-black text-white transition-colors hover:bg-rose-400 cursor-pointer"
                >
                  Leer expediente
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-expanded={false}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors hover:border-rose-400 cursor-pointer"
              >
                Personas de interés (9)
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <div
      id="proximo-leak-congreso"
      className={`relative rounded-3xl overflow-hidden border border-rose-500/50 bg-gradient-to-b from-[#180307]/95 via-[#0e0204]/98 to-[#050102] shadow-[0_0_50px_rgba(244,63,94,0.18)] select-none ${className}`}
    >
      {/* Tactical Cyber Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 800 300"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="countdownGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#f43f5e" strokeWidth="0.5" strokeOpacity="0.4" />
              <circle cx="32" cy="32" r="1" fill="#f43f5e" fillOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="800" height="300" fill="url(#countdownGrid)" />
        </svg>
      </div>

      {/* Volumetric Crimson Spotlight Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-950/25 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Corner Precision Brackets */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-rose-500/80 pointer-events-none" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-rose-500/80 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-rose-500/80 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-rose-500/80 pointer-events-none" />

      {/* Top Tactical Status Bar */}
      <div className="bg-gradient-to-r from-rose-950 via-[#26050a] to-[#0d0204] px-4 sm:px-7 py-2.5 border-b border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono font-bold tracking-wider relative z-10">
        <div className="flex items-center gap-2 text-rose-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <span className="uppercase">{isExpired ? 'EXPEDIENTE LIBERADO // LEAK #02' : 'DESCLASIFICACIÓN INMINENTE // EXPEDIENTE EXCLUSIVO #02'}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span className="text-rose-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>{isExpired ? 'ESTADO: CASO ARCHIVADO · SIN CONDENA' : 'ESTADO: EN REVISIÓN'}</span>
          </span>
          <span className="text-rose-500">·</span>
          <span className="text-rose-200">OCTUBRE 2026</span>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              onClose?.();
            }}
            aria-expanded={true}
            className="ml-2 inline-flex items-center gap-1 rounded-md border border-rose-500/40 px-2 py-0.5 text-rose-200 hover:text-white cursor-pointer"
          >
            Plegar <ChevronUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Banner Content */}
      <div className="p-4 sm:p-7 md:p-9 relative z-10 space-y-7">
        
        {/* Top Two-Column Split: Headline Info on Left + Live Countdown HUD on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Case Description */}
          <div className="lg:col-span-7 space-y-3.5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-[10px] sm:text-[11px] font-mono font-bold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{isExpired ? 'EXPEDIENTE #02 // LIBERADO' : 'EXPEDIENTE #02 // PRÓXIMA LIBERACIÓN'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              EXPEDIENTE KEIKO FUJIMORI -{' '}
              <span className="text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.7)]">
                LO QUE DICEN LOS DOCUMENTOS DEL CASO CÓCTELES
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Aportes ocultos, falsos aportantes y denuncias de presión sobre testigos en las campañas de 2011 y 2016, reconstruidos a partir de resoluciones judiciales, documentos de la Superintendencia del Mercado de Valores y reportajes con fuente. El caso está archivado y no hay condena: separamos lo documentado de lo acusado.
            </p>

            {/* Aviso: ficha ampliada de Keiko Fujimori */}
            <a
              href="#/leaks/figura/cong-fig-09"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-amber-400/50 bg-amber-400/5 hover:bg-amber-400/10 px-3.5 py-3 transition-colors"
            >
              <Lock className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <span className="space-y-0.5">
                <span className="block text-xs sm:text-sm font-black text-amber-200">
                  {isExpired
                    ? 'Información liberada sobre Keiko Fujimori y sus casos más polémicos'
                    : 'Se revelará información sobre Keiko Fujimori y sus casos más polémicos'}
                </span>
                <span className="block text-[11px] sm:text-xs text-slate-300 leading-snug">
                  {isExpired
                    ? 'Ya puedes ver todos los casos de su ficha, con fuente enlazada.'
                    : `Hoy damos un pequeño vistazo: algunos casos siguen ocultos en la sección Implicados y se muestran al cierre del contador (${LEAK_DEADLINE_LABEL}).`}
                  <span className="text-amber-300 font-bold group-hover:underline"> Ver adelanto →</span>
                </span>
              </span>
            </a>

            {/* Quick Evidence Tags */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] font-mono text-rose-300">
              <span className="px-2.5 py-1 rounded-lg bg-black/70 border border-rose-900/80 flex items-center gap-1.5">
                <FileSearch className="w-3 h-3 text-rose-400" />
                <span>Aportes y falsos aportantes</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/70 border border-rose-900/80 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Denuncias de presión a testigos</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/70 border border-rose-900/80 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-rose-400" />
                <span>Caso archivado · sin condena</span>
              </span>
            </div>
          </div>

          {/* Right Column: Live Countdown Clock Display HUD */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-4 sm:p-5 rounded-2xl bg-black/90 border border-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.25)] space-y-4">
              
              {/* Timer Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-rose-950/80">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-rose-300 uppercase tracking-wider">
                    {isExpired ? 'EXPEDIENTE LIBERADO' : 'LIBERACIÓN PÚBLICA EN:'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-zinc-900/80 px-2 py-0.5 rounded-full border border-zinc-700 font-bold">
                  EXPEDIENTE #02
                </span>
              </div>

              {/* 4 Clock Boxes */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                {/* Days */}
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-[#1e0508] to-[#0a0203] border border-rose-500/40 flex flex-col items-center justify-center shadow-inner">
                  <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-rose-400 leading-none drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                    {String(days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 font-bold uppercase mt-1">
                    DÍAS
                  </span>
                </div>

                {/* Hours */}
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-[#1e0508] to-[#0a0203] border border-rose-500/40 flex flex-col items-center justify-center shadow-inner">
                  <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-rose-400 leading-none drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                    {String(hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 font-bold uppercase mt-1">
                    HORAS
                  </span>
                </div>

                {/* Minutes */}
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-[#1e0508] to-[#0a0203] border border-rose-500/40 flex flex-col items-center justify-center shadow-inner">
                  <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-rose-400 leading-none drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                    {String(minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 font-bold uppercase mt-1">
                    MIN
                  </span>
                </div>

                {/* Seconds */}
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-[#2a060a] to-[#0d0204] border border-rose-400/60 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                  <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-rose-300 leading-none drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]">
                    {String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-rose-300 font-bold uppercase mt-1">
                    SEG
                  </span>
                </div>
              </div>

              {/* Exact Duration Badge */}
              <div className="flex items-center justify-between text-[10px] font-mono text-rose-300 bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-900/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isExpired ? 'Liberado' : 'Cierre'}: {LEAK_DEADLINE_LABEL}</span>
                </span>

              </div>

              {isExpired ? (
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed pt-1">
                  Lee el expediente completo en &quot;Últimas publicaciones&quot;, más abajo. Una acusación no es una condena.
                </p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Preparación del expediente:</span>
                    <span className="text-emerald-400 font-bold">en curso</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-rose-950">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-[#00ff88] rounded-full"
                      style={{ width: '92%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RED DE PERSONAS DE INTERÉS & EXPEDIENTES CLASIFICADOS */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/30 pb-3">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest mb-0.5">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>EXPEDIENTE CLASIFICADO // RED DE PERSONAS DE INTERÉS (9)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Personas de interés del Expediente Keiko Fujimori</span>
              </h3>
            </div>

            {/* Tactical Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveCategory('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'todos'
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-black/70 text-slate-300 hover:text-white border border-rose-950'
                }`}
              >
                Todos (9)
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('congreso')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'congreso'
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-black/70 text-slate-300 hover:text-white border border-rose-950'
                }`}
              >
                Congreso (4)
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('ejecutivo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'ejecutivo'
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-black/70 text-slate-300 hover:text-white border border-rose-950'
                }`}
              >
                Ejecutivo (3)
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('historico')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === 'historico'
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-black/70 text-slate-300 hover:text-white border border-rose-950'
                }`}
              >
                Históricos (2)
              </button>
            </div>
          </div>

          {/* 9-Card Responsive Cyber Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {[...filteredFigures].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).map((fig) => {
              const badge = getFigureBadge(fig.id);
              const href = `#/leaks/figura/${fig.id}`;

              if (fig.featured) {
                /* Ficha destacada: marco dorado a todo el ancho, primera de la cuadrícula */
                return (
                  <div
                    key={fig.id}
                    className="relative sm:col-span-2 md:col-span-3 p-[2px] rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-rose-500"
                  >
                    <div className="relative rounded-[22px] bg-[#0d0507] p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
                      <span className="absolute -top-3 left-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-zinc-950">
                        <Zap className="w-3 h-3" />
                        Figura destacada
                      </span>

                      <div className="relative w-28 h-36 sm:w-36 sm:h-44 rounded-2xl overflow-hidden bg-black shrink-0 mx-auto sm:mx-0 ring-2 ring-amber-400/80">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={fig.imageUrl}
                          alt={fig.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/imagenes/monograma.png';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                        <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300">{fig.code}</p>
                        <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{fig.name}</h4>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          {fig.officeLabel && (
                            <p className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-400/50 bg-amber-400/10 text-xs font-bold text-amber-200">
                              <Building2 className="w-3.5 h-3.5" />
                              {fig.officeLabel}
                            </p>
                          )}
                          {badge && (
                            <p className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${FIGURE_TONE[badge.tone]}`}>
                              {badge.label}
                            </p>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{fig.role}</p>
                        <p className="text-[10px] sm:text-[11px] font-mono text-slate-500 leading-snug">
                          Mención en el expediente en revisión; no implica responsabilidad penal. Rige la presunción de inocencia.
                        </p>

                        {/* Vistazo: algunos casos visibles, el resto reservado hasta el cierre del contador */}
                        {(() => {
                          const cases = FIGURE_PROFILES[fig.id]?.cases ?? [];
                          if (cases.length === 0) return null;
                          const shown = isExpired ? cases : cases.slice(0, PREVIEW_CASE_COUNT);
                          const hiddenCount = cases.length - shown.length;
                          return (
                            <div className="rounded-xl border border-amber-400/30 bg-black/40 p-3 text-left space-y-1.5">
                              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                                {isExpired ? 'Casos en su ficha' : 'Vistazo previo a la liberación'}
                              </p>
                              <ul className="space-y-1.5">
                                {shown.map((c) => (
                                  <li key={c.name} className="flex items-start justify-between gap-2 text-xs text-slate-200">
                                    <span className="min-w-0 line-clamp-2">{c.name}</span>
                                    <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-bold ${FIGURE_TONE[CASE_STATUS_META[c.status].tone]}`}>
                                      {CASE_STATUS_META[c.status].label}
                                    </span>
                                  </li>
                                ))}
                                {Array.from({ length: hiddenCount }).map((_, i) => (
                                  <li key={`locked-${i}`} className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Lock className="w-3 h-3 shrink-0" />
                                    <span className="h-2.5 flex-1 rounded bg-zinc-700/60" aria-hidden="true" />
                                    <span className="shrink-0 text-[10px] font-mono">Reservado</span>
                                  </li>
                                ))}
                              </ul>
                              {hiddenCount > 0 && (
                                <p className="text-[10px] font-mono text-slate-500">
                                  {hiddenCount} {hiddenCount === 1 ? 'caso más se revela' : 'casos más se revelan'} al cierre: {LEAK_DEADLINE_LABEL}.
                                </p>
                              )}
                            </div>
                          );
                        })()}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white border border-amber-400/60 hover:bg-amber-400/10 transition-colors"
                          >
                            Ver historial completo
                            <ArrowRight className="w-4 h-4" />
                          </a>
                          <a
                            href="https://t.me/Tin9o"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                          >
                            <Send className="w-4 h-4 -rotate-12" />
                            Pide más información (@Tin9o)
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={fig.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hud-card rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-4 flex flex-col justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">{fig.code}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white -rotate-45 transition-colors" />
                  </div>

                  <div className="flex items-start gap-3.5">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={fig.imageUrl}
                      alt={fig.name}
                      width={72}
                      height={90}
                      className="w-[72px] h-[90px] rounded-xl object-cover bg-black shrink-0 border border-zinc-700"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/imagenes/monograma.png';
                      }}
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="text-sm font-black text-white group-hover:text-rose-300 transition-colors tracking-tight line-clamp-2">{fig.name}</h4>
                      {badge && (
                        <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold leading-tight ${FIGURE_TONE[badge.tone]}`}>
                          {badge.label}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{fig.role}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500 truncate max-w-[65%]">{fig.status}</span>
                    <span className="text-rose-400 font-bold shrink-0">Ver historial ↗</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Interactive Buttons */}
        <div className="pt-4 border-t border-rose-500/25 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTelegramClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-rose-650 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.45)] hover:shadow-[0_0_30px_rgba(244,63,94,0.7)] active:scale-95 transition-all cursor-pointer font-mono"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>Activar Alerta en Telegram (@Tin9o)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs font-mono text-slate-300 hover:text-white bg-[#0b0304] hover:bg-[#180507] border border-rose-900/80 hover:border-rose-500/60 transition-all cursor-pointer"
              title="Copiar enlace del reporte clasificado"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
                  <span className="text-[#00ff88]">Enlace copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Compartir Alerta</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showTechnicalDetails ? 'Ocultar Ficha Técnica' : 'Ver Ficha Técnica Previa'}</span>
          </button>
        </div>

        {/* Collapsible Forensic Preview Details Panel */}
        {showTechnicalDetails && (
          <div className="pt-3 border-t border-rose-950/80 animate-in fade-in duration-300 space-y-4 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-black/80 border border-rose-900/60 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase">
                <Terminal className="w-4 h-4 text-rose-500" />
                <span>DOCUMENTOS Y REGISTROS EN CADENA DE CUSTODIA (SHA-256)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 font-sans">
                <div className="p-3 rounded-xl bg-[#120305] border border-rose-950 space-y-1">
                  <span className="font-bold text-rose-300 font-mono block">1. Comprobantes Bancarios</span>
                  <p className="text-slate-400 leading-relaxed text-[11.5px]">
                    Extractos de transferencias fraccionadas canalizadas desde cuentas de intermediarios hacia operadores de producción periodística.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#120305] border border-rose-950 space-y-1">
                  <span className="font-bold text-rose-300 font-mono block">2. Facturación Simulada</span>
                  <p className="text-slate-400 leading-relaxed text-[11.5px]">
                    Contratos de asesoría publicitaria y servicios de difusión institucional inflados para encubrir pagos de sobornos.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#120305] border border-rose-950 space-y-1">
                  <span className="font-bold text-rose-300 font-mono block">3. Mensajería Confidencial</span>
                  <p className="text-slate-400 leading-relaxed text-[11.5px]">
                    Hilos de chat coordinando el veto de emisiones en vivo y la modificación de temas en programas dominicales.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#120305] border border-rose-950 space-y-1">
                  <span className="font-bold text-rose-300 font-mono block">4. Audios de Blindaje</span>
                  <p className="text-slate-400 leading-relaxed text-[11.5px]">
                    Grabaciones en comisiones parlamentarias donde se debate el costo del silencio y la protección a legisladores investigados.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1a0407] border border-rose-900/40 text-[11px] font-mono text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Aviso Jurídico: La publicación íntegra de los archivos no editados se realizará en cumplimiento estricto de la ley de acceso a la información y reserva de fuentes de periodismo de investigación.
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* LIGHTBOX MODAL: FULL-SCREEN FIGURE FORENSIC INSPECTOR */}
      {/* ======================================================== */}
      {zoomedFigure && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setZoomedFigure(null)}
        >
          <div
            className="max-w-xl w-full rounded-3xl bg-[#080204] border border-rose-500/70 overflow-hidden shadow-2xl relative cursor-default space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="px-5 py-3 bg-[#180407] border-b border-rose-500/40 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                {zoomedFigure.code} // FICHA PERICIAL
              </span>
              <button
                type="button"
                onClick={() => setZoomedFigure(null)}
                className="p-1.5 rounded-full bg-black/60 hover:bg-rose-950 text-slate-300 hover:text-white border border-rose-500/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo & Metadata Layout */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden bg-black shrink-0 border-2 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                  <img loading="lazy" decoding="async"
                    src={zoomedFigure.imageUrl}
                    alt={zoomedFigure.name}
                    className="w-full h-full object-cover filter contrast-105"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-900 inline-block">
                    {zoomedFigure.tag}
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {zoomedFigure.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {zoomedFigure.role}
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/70 border border-rose-950 text-[11px] font-mono text-emerald-400">
                    <span className="text-slate-400 block text-[9.5px] uppercase">Estado en el expediente:</span>
                    {zoomedFigure.status}
                  </div>
                </div>
              </div>

              {/* Forensic Field Notes */}
              <div className="p-3.5 rounded-xl bg-[#140306] border-l-3 border-rose-500 text-xs text-slate-300 font-sans leading-relaxed text-left">
                <span className="text-rose-400 font-mono font-bold block mb-1">
                  Anotación de Inteligencia OSINT:
                </span>
                {zoomedFigure.notes}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#0d0204] border-t border-rose-950 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Cadena de Custodia SHA-256</span>
              <button
                type="button"
                onClick={() => setZoomedFigure(null)}
                className="px-4 py-1.5 rounded-xl bg-rose-950 text-rose-200 hover:text-white border border-rose-900 cursor-pointer"
              >
                Cerrar ficha
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
