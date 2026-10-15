import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Clock,
  FileText,
  Send,
  X,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Calendar,
  Sparkles,
  Zap,
  Radio,
  Eye,
  Lock,
  Check,
  Crosshair,
  Maximize2,
  DollarSign,
  MapPin,
  HelpCircle,
  FileSearch,
  Users,
  Scale,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  AlertCircle,
  Play,
  Film,
  CreditCard,
  Receipt,
  Quote,
  ExternalLink,
  Smartphone,
  Layers,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { LeakArticle, EvidenceFigure } from '../data/leaksData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface LeaksTabProps {
  articles: LeakArticle[];
  onOpenContact: () => void;
}

// ========================================================
// REAL FORENSIC ASSETS: CASO CHINA POLO
// ========================================================
const CHAT_EVIDENCES = [
  {
    id: 'chat-01',
    stepNumber: 'PARTE 01',
    title: 'Negociación y Cargo en la Policía',
    sender: 'Revoredo C.',
    imageUrl: '/imagenes/caso-chinapolo/imagen-1.jpg',
    excerpt: 'Nadie puede saber sobre esto, yo tengo un cargo importante en la policía... Pasame Tu Yape',
    dialogue: [
      { speaker: 'Contacto / Tirador', text: 'Chamo Escuchame tu tranquilo k todo bello', align: 'right' },
      { speaker: 'Contacto / Tirador', text: 'Ahora sobre lo acordado', align: 'right' },
      { speaker: 'Contacto / Tirador', text: 'Como haremos ese. Tema. yo Necesito ese dinero.', align: 'right' },
      { speaker: 'Revoredo C.', text: 'Ok, pero te estoy pagando por todo tu gente, el dinero se reparten ustedes', align: 'left' },
      { speaker: 'Revoredo C.', text: 'Nadie puede saber sobre esto, yo tengo un cargo importante en la policía, sería un riesgo ahora encontrarnos. Pasame Tu Yape', align: 'left' },
      { speaker: 'Contacto / Tirador', text: 'De eso no hay problema.', align: 'right' },
      { speaker: 'Contacto / Tirador', text: 'Tenlo por seguro que nadie sabe Sobre.Esto.', align: 'right' }
    ],
    notes: 'Primer fragmento divulgado: el remitente identificado en el teléfono como "Revoredo C." condiciona el pago al secreto absoluto, invocando expresamente un "cargo importante en la policía" para evitar un encuentro presencial y solicita la cuenta de billetera digital para realizar el depósito.'
  },
  {
    id: 'chat-02',
    stepNumber: 'PARTE 02',
    title: 'Coordinación Plin y Primer Depósito (S/ 500)',
    sender: 'Revoredo C.',
    imageUrl: '/imagenes/caso-chinapolo/imagen-2.jpg',
    excerpt: 'Ok, tengo plin. no yape... Llamada 3 min... 1er pago (S/ 500)',
    dialogue: [
      { speaker: 'Contacto / Tirador', text: 'Ok, tengo plin.no yape.', align: 'right' },
      { speaker: 'Sistema', text: 'Llamada de voz cifrada finalizada (Duración: 3 min)', align: 'center' },
      { speaker: 'Contacto / Tirador', text: 'Bello me mandas las capturaa xfavor.', align: 'right' },
      { speaker: 'Revoredo C.', text: 'Ok', align: 'left' },
      { speaker: 'Voucher Adjunto', text: 'Comprobante Yape: ¡Yapeaste! S/ 500 con destino a Plin - Ronald Jose Toro Ardila', align: 'left' },
      { speaker: 'Revoredo C.', text: '1er pago', align: 'left' }
    ],
    notes: 'Tras una llamada telefónica de 3 minutos, el receptor aclara que maneja Plin. Acto seguido se adjunta la captura oficial del primer giro por S/ 500.00 con destino expreso a nombre del investigado Ronald José Toro Ardila.'
  },
  {
    id: 'chat-03',
    stepNumber: 'PARTE 03',
    title: 'Segundo Depósito (S/ 500) y Conformidad',
    sender: 'Revoredo C.',
    imageUrl: '/imagenes/caso-chinapolo/imagen-3.jpg',
    excerpt: '1er pago... Ok... 2do Pago (S/ 500)... Okey, con todo esto conforme',
    dialogue: [
      { speaker: 'Revoredo C.', text: '1er pago (7:00 p.m.)', align: 'left' },
      { speaker: 'Contacto / Tirador', text: 'Ok (7:03 p.m.)', align: 'right' },
      { speaker: 'Voucher Adjunto', text: 'Comprobante Yape: ¡Yapeaste! S/ 500 a Plin - Ronald Jose Toro Ardila (7:04 p.m.)', align: 'left' },
      { speaker: 'Revoredo C.', text: '2do Pago. (7:05 p.m.)', align: 'left' },
      { speaker: 'Revoredo C.', text: 'Okey, con todo esto conforme (7:06 p.m.)', align: 'left' }
    ],
    notes: 'Segunda transferencia correlativa por otros 500 soles hacia la misma cuenta de Ronald Toro. El pagador emite la confirmación explícita del envío y exige la ejecución total del acuerdo pactado.'
  },
  {
    id: 'chat-04',
    stepNumber: 'PARTE 04',
    title: 'Confirmación: "Esa mamaguevvva no vuelve al mundo"',
    sender: 'Revoredo C.',
    imageUrl: '/imagenes/caso-chinapolo/imagen-4.jpg',
    excerpt: 'Kedamos asi entoncs porque el trabajo ya está hecho. Esa mamaguevvva no vuelve al mundo',
    dialogue: [
      { speaker: 'Contacto / Tirador', text: 'Si.', align: 'right' },
      { speaker: 'Revoredo C.', text: 'No quiero nada de sospechas de alguien, que pude ver hoy en noticias que me están vinculando', align: 'left' },
      { speaker: 'Revoredo C.', text: 'Si caes preso, yo tengo conocidos que pueden sacarte y rápido', align: 'left' },
      { speaker: 'Revoredo C.', text: 'De eso no hay problema', align: 'left' },
      { speaker: 'Contacto / Tirador', text: 'Ok chamo. Kedamos asi entoncs porque el trabajo ya está hecho', align: 'right' },
      { speaker: 'Contacto / Tirador', text: 'Esa mamaguevvva no vuelve al mundo', align: 'right' }
    ],
    notes: 'Pieza procesal determinante: el interlocutor ofrece protección e influencias judiciales si el ejecutor es detenido ("tengo conocidos que pueden sacarte y rápido"). El sicario confirma sin ambigüedades que la víctima ha sido eliminada.'
  },
  {
    id: 'chat-05',
    stepNumber: 'PARTE 05',
    title: 'Cierre de Canal y Clave de Contacto',
    sender: 'Revoredo C.',
    imageUrl: '/imagenes/caso-chinapolo/imagen-5.jpg',
    excerpt: 'Ok, estamos en contacto',
    dialogue: [
      { speaker: 'Contacto / Tirador', text: 'Ok chamo. Kedamos asi entoncs porque el trabajo ya está hecho', align: 'right' },
      { speaker: 'Revoredo C.', text: 'Ok, estamos en contacto', align: 'left' }
    ],
    notes: 'Cierre del canal de mensajería incautado por las unidades de Homicidios y peritos de la Policía Nacional del Perú.'
  }
];

const PAYMENT_VOUCHERS = [
  {
    id: 'voucher-01',
    code: 'OPERACIÓN #97100373',
    amount: 'S/ 80.00',
    title: 'Pago Exacto de Hospedaje en Caraz (Hotel La Explanada)',
    receiver: 'Ronald Jose Toro Ardila',
    walletType: 'Yape a Plin Interoperable',
    imageUrl: '/imagenes/caso-chinapolo/pago-3.jpg',
    dateContext: '16 al 19 de Septiembre de 2026',
    notes: 'Comprobante clave que coincide al milímetro con la tarifa de S/ 80 por noche declarada ante la Fiscalía por las recepcionistas del alojamiento en Caraz, donde se hospedó la banda durante 3 noches antes del crimen.'
  },
  {
    id: 'voucher-02',
    code: '1ER ADELANTO LOGÍSTICO',
    amount: 'S/ 500.00',
    title: 'Primer Giro de Fondos Operativos para la Banda',
    receiver: 'Ronald Jose Toro Ardila',
    walletType: 'Plin (Desde cuenta Yape)',
    imageUrl: '/imagenes/caso-chinapolo/pago-1.jpg',
    dateContext: 'Horas previas al desplazamiento',
    notes: 'Captura enviada directamente dentro del hilo de chat con "Revoredo C." rotulada como "1er pago", destinada a cubrir alimentación, viáticos y movilidad entre Chimbote, Huaraz y Caraz.'
  },
  {
    id: 'voucher-03',
    code: '2DO ADELANTO LOGÍSTICO',
    amount: 'S/ 500.00',
    title: 'Segunda Remesa Inmediata de Conformidad',
    receiver: 'Ronald Jose Toro Ardila',
    walletType: 'Plin (Desde cuenta Yape)',
    imageUrl: '/imagenes/caso-chinapolo/pago-2.jpg',
    dateContext: 'Correlativo al primer pago',
    notes: 'Segunda transferencia correlativa por otros 500 soles hacia la misma cuenta de Ronald Toro. Sumados ambos giros completan S/ 1.000 de adelanto logístico directo acreditado en capturas.'
  }
];

export const LeaksTab: React.FC<LeaksTabProps> = ({ articles, onOpenContact }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<LeakArticle | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lightbox zoom modal state
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string; caption: string; tag?: string } | null>(null);

  // Active chat tab inside the forensic chat timeline
  const [activeChatTab, setActiveChatTab] = useState(0);

  // Active section in China Polo Dossier Navigator: 'evidencias' | 'balistica' | 'red-criminal' | 'cronica' | 'preguntas' | 'completo'
  const [activeDossierSection, setActiveDossierSection] = useState<'evidencias' | 'balistica' | 'red-criminal' | 'cronica' | 'preguntas' | 'completo'>('evidencias');

  // Active chapter in narrative: 0 to 4
  const [activeNarrativeChapter, setActiveNarrativeChapter] = useState(0);

  // Custom image slot override state (allows user to replace image slots in real time)
  const [customFigureUrls, setCustomFigureUrls] = useState<Record<string, string>>({});
  const [editingFigureSlot, setEditingFigureSlot] = useState<EvidenceFigure | null>(null);
  const [inputSlotUrl, setInputSlotUrl] = useState('');

  // Available categories matching the magazine pill bar
  const categories = [
    { id: 'todo', label: 'Todo' },
    { id: 'filtraciones', label: 'Filtraciones' },
    { id: 'ciberseguridad', label: 'Ciberseguridad' },
    { id: 'investigaciones', label: 'Investigaciones' },
    { id: 'guias', label: 'Guías' }
  ];

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      let matchCat = true;
      if (selectedCategory !== 'todo') {
        const catKey = art.category.toLowerCase();
        if (selectedCategory === 'filtraciones') {
          matchCat = catKey === 'filtraciones' || catKey === 'breaches' || catKey === 'darkweb';
        } else if (selectedCategory === 'ciberseguridad') {
          matchCat = catKey === 'ciberseguridad' || catKey === 'bancos';
        } else if (selectedCategory === 'investigaciones') {
          matchCat = catKey === 'investigaciones' || art.categoryLabel.toLowerCase().includes('análisis') || catKey === 'darkweb';
        } else if (selectedCategory === 'guias') {
          matchCat = catKey === 'guias' || art.categoryLabel.toLowerCase().includes('guía') || art.categoryLabel.toLowerCase().includes('protección');
        } else {
          matchCat = catKey === selectedCategory;
        }
      }

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.categoryLabel.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q)) ||
        art.compromisedData.some((d) => d.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Featured Lead (Hero Cover Article) - China Polo takes lead position
  const heroArticle = useMemo(() => {
    return (
      articles.find((a) => a.id === 'leak-china-polo') ||
      articles.find((a) => a.id === 'leak-hero-db') ||
      articles.find((a) => a.featured) ||
      articles[0]
    );
  }, [articles]);

  // Right column: Últimas publicaciones (3 items)
  const latestArticles = useMemo(() => {
    const list = articles.filter((a) => a.id !== heroArticle?.id);
    const specificOrder = ['leak-hero-db', 'leak-fake-alert', 'leak-report-reveal'];
    const found = specificOrder
      .map((id) => articles.find((a) => a.id === id))
      .filter((a): a is LeakArticle => Boolean(a));

    if (found.length === 3) return found;
    return list.slice(0, 3);
  }, [articles, heroArticle]);

  // Bottom section: Explora la revista (3 horizontal cards)
  const exploreArticles = useMemo(() => {
    const specificOrder = ['leak-understand-exposure', 'leak-suspicious-email', 'leak-protect-identity'];
    const found = specificOrder
      .map((id) => articles.find((a) => a.id === id))
      .filter((a): a is LeakArticle => Boolean(a));

    if (found.length === 3) return found;

    const usedIds = new Set([heroArticle?.id, ...latestArticles.map((a) => a.id)]);
    return articles.filter((a) => !usedIds.has(a.id)).slice(0, 3);
  }, [articles, heroArticle, latestArticles]);

  const getAuthorAvatar = (handle?: string) => {
    if (!handle) return '/imagenes/perfiles/tino.gif';
    const h = handle.toLowerCase();
    if (h.includes('whisky')) return '/imagenes/perfiles/whisky.jpg';
    if (h.includes('abby')) return '/imagenes/perfiles/abby.jpg';
    if (h.includes('nano')) return '/imagenes/perfiles/nanovip.jpg';
    if (h.includes('tin9o') || h.includes('tino')) return '/imagenes/perfiles/tino.gif';
    if (h.includes('descuentosper') || h.includes('central') || h.includes('admin')) return '/imagenes/monograma.png';
    return '/imagenes/perfiles/tino.gif';
  };

  const handleOpenTelegram = (art?: LeakArticle) => {
    const authorHandle = art?.authorTelegram || 'Tin9o';
    const authorName = art?.author || 'Tin9o (@Tin9o)';
    const topic = art ? `sobre el expediente "${art.title}"` : 'sobre la Revista de Leaks & Ciberseguridad';

    recordVendorClickEvent(
      authorHandle.toLowerCase().includes('tin9o') ? 'vendedor-tino' : 'vendedor-central',
      authorName,
      'telegram',
      art?.title || 'Revista Leaks & Filtraciones'
    );

    const msg = `¡Hola @${authorHandle}! Vengo desde la sección Leaks & Filtraciones de Descuentos Perú y me gustaría consultar ${topic}. ¿Podrías brindarme más información?`;
    const url = `https://t.me/${authorHandle}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyArticleLink = (art: LeakArticle) => {
    const url = `${window.location.origin}/#/leaks?id=${art.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    });
  };

  const getTagBadgeStyle = (label: string) => {
    const upper = label.toUpperCase();
    if (upper.includes('LEAK') || upper.includes('CRÍTICO')) {
      return 'border border-rose-500/80 bg-rose-950/80 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
    }
    if (upper.includes('ANÁLISIS')) {
      return 'border border-emerald-400/60 bg-emerald-950/80 text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.35)]';
    }
    if (upper.includes('GUÍA') || upper.includes('GUÍAS')) {
      return 'border border-cyan-400/60 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]';
    }
    if (upper.includes('PROTECCIÓN')) {
      return 'border border-amber-500/70 bg-amber-950/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]';
    }
    if (upper.includes('FILTRACIONES')) {
      return 'border border-amber-500/60 bg-amber-950/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]';
    }
    if (upper.includes('CIBERSEGURIDAD')) {
      return 'border border-emerald-500/60 bg-emerald-950/80 text-emerald-300 shadow-[0_0_12px_rgba(0,255,136,0.3)]';
    }
    return 'border border-emerald-900/80 bg-[#06170d] text-emerald-300';
  };

  const handleSelectArticle = (art: LeakArticle) => {
    setActiveArticle(art);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToNews = () => {
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCustomSlotUrl = (figId: string) => {
    if (inputSlotUrl.trim()) {
      setCustomFigureUrls((prev) => ({
        ...prev,
        [figId]: inputSlotUrl.trim()
      }));
    }
    setEditingFigureSlot(null);
    setInputSlotUrl('');
  };

  // ==========================================
  // VIEW: DEDICATED WEB MAGAZINE INVESTIGATIVE REPORT
  // ==========================================
  if (activeArticle) {
    const isChinaPoloReport = activeArticle.id === 'leak-china-polo';
    const relatedArticles = articles
      .filter((a) => a.id !== activeArticle.id)
      .slice(0, 3);

    return (
      <article className="w-full max-w-[1560px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
        
        {/* Sticky Tactical Navigation Bar */}
        <div className="flex items-center justify-between gap-4 pt-2 pb-4 border-b border-emerald-950/80 sticky top-16 z-30 bg-[#050b08]/95 backdrop-blur-md">
          <button
            type="button"
            onClick={handleBackToNews}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-[#00ff88] bg-[#051a0f] hover:bg-[#092b1a] border border-emerald-500/50 hover:border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a la Revista & Leaks</span>
          </button>

          <div className="flex items-center gap-2">
            {activeArticle.dossierCode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400 bg-black/80 border border-emerald-500/40">
                <FileSearch className="w-3 h-3 text-[#00ff88]" />
                <span>{activeArticle.dossierCode}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => handleCopyArticleLink(activeArticle)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-300 hover:text-white bg-[#06180e] border border-emerald-900 hover:border-emerald-500/60 transition-all cursor-pointer shadow-sm"
              title="Copiar enlace del reporte"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff88]" />
                  <span className="text-[#00ff88]">Enlace copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EDITORIAL DOSSIER COVER & TITLE BANNER */}
        {/* ======================================================== */}
        <div className="rounded-3xl overflow-hidden border border-emerald-500/40 bg-[#030d07] shadow-[0_0_50px_rgba(0,255,136,0.18)] relative">
          
          {/* Top Military Classification Bar */}
          <div className="bg-gradient-to-r from-red-950 via-[#180808] to-[#041209] px-6 py-2.5 border-b border-red-500/40 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono font-bold tracking-wider">
            <div className="flex items-center gap-2 text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>EXPEDIENTE FILTRADO // INTELIGENCIA FORENSE & POLICIAL</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span>ESTADO: CASO EN CURSO</span>
              <span className="text-emerald-500">·</span>
              <span className="text-emerald-300">{activeArticle.date}</span>
            </div>
          </div>

          {/* Hero Cover Frame */}
          <div className="relative h-72 sm:h-96 md:h-[460px] w-full overflow-hidden bg-black group cursor-pointer"
               onClick={() => setZoomedImage({ url: activeArticle.imageUrl, title: activeArticle.title, caption: activeArticle.summary, tag: 'PORTADA PRINCIPAL' })}>
            <img
              src={activeArticle.imageUrl}
              alt={activeArticle.title}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/imagenes/leak-doc-analysis.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020b05] via-[#020b05]/60 to-transparent" />

            {/* Tactical Badges */}
            <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${getTagBadgeStyle(activeArticle.categoryLabel)}`}>
                {activeArticle.categoryLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/85 text-[10px] text-slate-200 font-mono border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#00ff88]" />
                <span>{activeArticle.readTime}</span>
              </span>
            </div>

            {/* Magnify Hint */}
            <div className="absolute bottom-4 right-4 z-10 px-3.5 py-1.5 rounded-full bg-black/80 border border-emerald-500/50 text-xs font-mono text-emerald-300 backdrop-blur-md flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:bg-[#00ff88] group-hover:text-black transition-all">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ver imagen de cabecera</span>
            </div>
          </div>

          {/* Title & Editorial Lead */}
          <div className="p-6 sm:p-9 md:p-12 space-y-6 relative z-10 bg-[#020b05]">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-black text-white leading-tight tracking-tight">
                {activeArticle.title}
              </h1>

              {activeArticle.subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed border-l-4 border-emerald-400 pl-4 py-1">
                  {activeArticle.subtitle}
                </p>
              )}
            </div>

            {/* Legal / Archival Disclaimer Notice */}
            {activeArticle.classificationNotice && (
              <div className="p-4 rounded-2xl bg-[#081f12] border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-mono leading-relaxed flex items-start gap-3 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
                <span>{activeArticle.classificationNotice}</span>
              </div>
            )}

            {/* Author Profile Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-emerald-950">
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400 p-0.5 bg-black shadow-[0_0_15px_rgba(0,255,136,0.3)] shrink-0">
                  <img
                    src={getAuthorAvatar(activeArticle.authorTelegram)}
                    alt={activeArticle.author}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/imagenes/monograma.png';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00ff88] border-2 border-black animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{activeArticle.author}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[9px] font-mono text-[#00ff88] uppercase font-bold">
                      UNIDAD DE INVESTIGACIÓN
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeArticle.authorRole} · Telegram: @{activeArticle.authorTelegram}
                  </span>
                </div>
              </div>

              {/* Direct Telegram Chat with Author */}
              <button
                type="button"
                onClick={() => handleOpenTelegram(activeArticle)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_20px_rgba(0,255,136,0.35)] transition-all cursor-pointer font-mono whitespace-nowrap active:scale-95"
              >
                <Send className="w-3.5 h-3.5 fill-slate-950 -rotate-12" />
                <span>Consultar con la Redacción OSINT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lead Executive Summary */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#031c10] via-[#052917] to-[#02140a] border border-emerald-500/50 text-emerald-100 text-sm sm:text-base font-medium leading-relaxed shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-black/60 border border-emerald-400/60 flex items-center justify-center text-[#00ff88] shrink-0 mt-1 shadow-md">
              <Scale className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                SÍNTESIS EDITORIAL DEL CASO
              </span>
              <p className="italic text-slate-100 text-sm sm:text-base leading-relaxed font-sans">
                "{activeArticle.summary}"
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DOSSIER COMMAND BAR: INTERACTIVE HUB & SECTION SELECTOR */}
        {/* ======================================================== */}
        {isChinaPoloReport && (
          <div className="sticky top-20 z-20 p-2 sm:p-2.5 rounded-2xl bg-[#041208]/95 backdrop-blur-xl border border-emerald-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                <button
                  type="button"
                  onClick={() => setActiveDossierSection('evidencias')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeDossierSection === 'evidencias'
                      ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                      : 'bg-[#06190f] text-slate-300 hover:text-white border border-emerald-900/80 hover:bg-[#0c2f1c]'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Evidencias & Chats (8)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDossierSection('balistica')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeDossierSection === 'balistica'
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                      : 'bg-[#06190f] text-slate-300 hover:text-white border border-emerald-900/80 hover:bg-[#0c2f1c]'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Peritaje Balístico (Glock 9mm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDossierSection('red-criminal')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeDossierSection === 'red-criminal'
                      ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                      : 'bg-[#06190f] text-slate-300 hover:text-white border border-emerald-900/80 hover:bg-[#0c2f1c]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Red Criminal & Implicados</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDossierSection('cronica')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeDossierSection === 'cronica'
                      ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                      : 'bg-[#06190f] text-slate-300 hover:text-white border border-emerald-900/80 hover:bg-[#0c2f1c]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Crónica de Investigación</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDossierSection('preguntas')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeDossierSection === 'preguntas'
                      ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                      : 'bg-[#06190f] text-slate-300 hover:text-white border border-emerald-900/80 hover:bg-[#0c2f1c]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Interrogantes Clave</span>
                </button>
              </div>

              {/* Mode Toggle: View Section vs View Continuous */}
              <button
                type="button"
                onClick={() => setActiveDossierSection(activeDossierSection === 'completo' ? 'evidencias' : 'completo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  activeDossierSection === 'completo'
                    ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'bg-[#020b05] text-slate-300 hover:text-white border-emerald-900 hover:border-emerald-500/60'
                }`}
                title="Alternar entre vista modular dinámica y vista continua"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {activeDossierSection === 'completo' ? 'Vista Modular' : 'Ver Todo Continuo'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MÓDULO 01: EVIDENCIAS AUDIOVISUALES (VIDEOS EN VIVO Y FINAL) */}
        {/* ======================================================== */}
        {isChinaPoloReport && (activeDossierSection === 'evidencias' || activeDossierSection === 'completo') && (
          <section className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="border-b border-emerald-500/30 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest block mb-0.5">
                  EVIDENCIA AUDIOVISUAL // REGISTROS FORENSES EN VIDEO
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Film className="w-6 h-6 text-emerald-400" />
                  <span>Los Videos Forenses: El Ataque en Directo y el Desenlace Final</span>
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-[#051a0f] px-3 py-1 rounded-full border border-emerald-500/40 self-start sm:self-auto">
                2 Grabaciones Oficiales
              </span>
            </div>

            {/* Dual Video Grid: Live Interview Attack + Final Aftermath */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Video 1: El Momento del Atentado en Vivo (Actualizado 14.2 MB) */}
              <div className="rounded-3xl bg-black border-2 border-emerald-500/50 overflow-hidden shadow-[0_0_35px_rgba(0,255,136,0.18)] flex flex-col justify-between">
                <div className="bg-[#04160d] px-5 py-3 border-b border-emerald-500/30 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#00ff88]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <span className="font-bold text-red-400">VIDEO 01: EL ATENTADO EN VIVO</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">Mercado La Explanada · Caraz</span>
                </div>

                <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster="/imagenes/china-polo-mapa-caraz.jpg"
                    className="w-full h-full object-contain"
                  >
                    <source src="/imagenes/caso-chinapolo/video.mp4" type="video/mp4" />
                    Tu navegador no soporta video MP4.
                  </video>
                </div>

                <div className="p-4 bg-[#020b05] border-t border-emerald-950/80 space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                    <Play className="w-3.5 h-3.5 fill-emerald-400" />
                    <span>Transmisión en directo durante la entrevista</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Registro que capta el instante en que la candidata y periodista es atacada a quemarropa ante los simpatizantes. Los disparos generaron el caos inicial y permitieron la identificación del atacante por parte de testigos como Ana Armijos Julca.
                  </p>
                </div>
              </div>

              {/* Video 2: Desenlace y Escena Final (4.7 MB) */}
              <div className="rounded-3xl bg-black border-2 border-amber-500/50 overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.18)] flex flex-col justify-between">
                <div className="bg-[#181104] px-5 py-3 border-b border-amber-500/30 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span className="font-bold text-amber-400">VIDEO 02: CÓMO ACABÓ TODO</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">Escena Final y Operativo</span>
                </div>

                <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster="/imagenes/china-polo-dossier.jpg"
                    className="w-full h-full object-contain"
                  >
                    <source src="/imagenes/caso-chinapolo/video-final.mp4" type="video/mp4" />
                    Tu navegador no soporta video MP4.
                  </video>
                </div>

                <div className="p-4 bg-[#0a0702] border-t border-amber-950/80 space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
                    <Play className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Registro del desenlace y auxilio posterior</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Filmación de los momentos posteriores al ataque, el auxilio de emergencia a los heridos en la zona comercial y la movilización policial que culminó con la captura del tirador Obispo Díaz tras la persecución de dos kilómetros en mototaxi.
                  </p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* COMPROBANTES DE PAGO Y TRAZABILIDAD FINANCIERA */}
        {/* ======================================================== */}
        {isChinaPoloReport && (activeDossierSection === 'evidencias' || activeDossierSection === 'completo') && (
          <section className="space-y-6 pt-2 animate-in fade-in duration-300">
            <div className="border-b border-emerald-500/30 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest block mb-0.5">
                  TRAZABILIDAD BANCARIA // INTEROPERABILIDAD YAPE Y PLIN
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <span>La Ruta del Dinero: Los 3 Vouchers Incautados a Ronald Toro</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-black/80 px-3 py-1 rounded-full border border-emerald-500/40 self-start sm:self-auto">
                3 Giros Bancarios Judiciales
              </span>
            </div>

            {/* Financial Vouchers Showcase (3 Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PAYMENT_VOUCHERS.map((v) => (
                <div
                  key={v.id}
                  className="rounded-3xl bg-[#031309] border border-emerald-500/40 overflow-hidden flex flex-col justify-between shadow-xl hover:border-emerald-400 transition-all group"
                >
                  {/* Voucher Header */}
                  <div className="p-4 bg-[#020b05] border-b border-emerald-950 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#00ff88]">{v.code}</span>
                    <span className="text-lg font-black text-white">{v.amount}</span>
                  </div>

                  {/* Voucher Image Thumbnail with Zoom */}
                  <div
                    className="relative aspect-[3/4] w-full overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                    onClick={() => setZoomedImage({ url: v.imageUrl, title: v.title, caption: v.notes, tag: v.code })}
                  >
                    <img
                      src={v.imageUrl}
                      alt={v.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-104 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/imagenes/leak-doc-analysis.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    
                    <button
                      type="button"
                      onClick={() => setZoomedImage({ url: v.imageUrl, title: v.title, caption: v.notes, tag: v.code })}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/80 hover:bg-[#00ff88] text-white hover:text-black border border-emerald-500/60 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Inspeccionar</span>
                    </button>
                  </div>

                  {/* Voucher Analytical Details */}
                  <div className="p-4 bg-[#020904] border-t border-emerald-950/80 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {v.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {v.notes}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-950 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                      <span className="truncate">Destino: {v.receiver}</span>
                      <span className="text-[#00ff88] font-bold">PLIN</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytical Context on Hotel and 15,000 Soles Bounty */}
            <div className="p-5 rounded-3xl bg-[#03150b] border border-emerald-500/40 text-xs sm:text-sm text-slate-200 space-y-2 font-mono">
              <span className="text-emerald-400 font-bold uppercase block">Descargo Legal de la Defensa y Evidencia Fiscal:</span>
              El abogado de Ronald Toro sostiene que su defendido no conocía al sicario y que se limitó a prestar su cuenta a su media hermana Beángel Toro. Sin embargo, los peritajes de la Fiscalía confirman que los depósitos de S/ 80 corresponden con exactitud a la tarifa de 3 noches en el Hotel La Explanada donde se alojó la banda antes del ataque, sumados a los S/ 1.000 transferidos en horas previas como adelanto operativo.
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* LAS 5 CAPTURAS DE CHATS COMPLETAS A LA VISTA SIMULTÁNEA */}
        {/* ======================================================== */}
        {isChinaPoloReport && (activeDossierSection === 'evidencias' || activeDossierSection === 'completo') && (
          <section className="space-y-6 pt-4 animate-in fade-in duration-300">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#041c10] via-[#052918] to-[#02130b] border-2 border-emerald-500/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest block">
                  EXPEDIENTE DE MENSAJERÍA INCAUTADA // POLICÍA NACIONAL DEL PERÚ
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-[#00ff88]" />
                  <span>Las 5 Capturas de Chats: Órdenes, Pagos y Confirmación del Crimen</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-sans">
                  Todas las 5 capturas del teléfono peritado están incluidas y visibles. Haz clic en cualquiera para abrir en alta resolución o ver su transcripción y cotejo pericial.
                </p>
              </div>
              <div className="text-xs font-mono text-emerald-300 bg-black/80 px-3.5 py-1.5 rounded-full border border-emerald-500/50 self-start sm:self-auto shrink-0 font-bold">
                5 de 5 Capturas Incluidas
              </div>
            </div>

            {/* 5-Column Panoramic Visual Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {CHAT_EVIDENCES.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => setActiveChatTab(idx)}
                  className={`rounded-2xl bg-[#031309] border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group shadow-lg ${
                    activeChatTab === idx
                      ? 'border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)] ring-1 ring-[#00ff88]'
                      : 'border-emerald-500/30 hover:border-emerald-400/80 hover:bg-[#051d0e]'
                  }`}
                >
                  {/* Card Top Badge */}
                  <div className="p-2.5 bg-[#020b05] border-b border-emerald-950 flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-[#00ff88]">{c.stepNumber}</span>
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider">{c.sender}</span>
                  </div>

                  {/* Screenshot Preview with Zoom button */}
                  <div className="relative aspect-[3/5] w-full bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-full h-full object-contain p-1.5 group-hover:scale-103 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/imagenes/leak-doc-analysis.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

                    {/* Direct Zoom Trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImage({
                          url: c.imageUrl,
                          title: `${c.stepNumber}: ${c.title}`,
                          caption: c.notes,
                          tag: c.stepNumber
                        });
                      }}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/85 hover:bg-[#00ff88] text-white hover:text-black border border-emerald-500/60 text-[10px] font-mono font-bold flex items-center gap-1 transition-all shadow-md cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Zoom</span>
                    </button>
                  </div>

                  {/* Card Excerpt */}
                  <div className="p-3 bg-[#020904] border-t border-emerald-950/80 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-sans italic mt-1 line-clamp-3">
                        "{c.excerpt}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-emerald-950 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                      <span>{activeChatTab === idx ? 'Cotejo Activo' : 'Clic para cotejo'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Forensic Comparison Console */}
            {CHAT_EVIDENCES[activeChatTab] && (
              <div className="rounded-3xl bg-[#041209] border border-emerald-500/40 overflow-hidden shadow-2xl mt-4">
                
                {/* Selector Bar for quick switching */}
                <div className="flex items-center gap-2 p-3 bg-[#020b05] border-b border-emerald-950 overflow-x-auto scrollbar-none">
                  <span className="text-[11px] font-mono text-slate-400 px-2 font-bold uppercase">
                    Cotejo Seleccionado:
                  </span>
                  {CHAT_EVIDENCES.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveChatTab(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeChatTab === idx
                          ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                          : 'bg-[#07190f] text-slate-300 hover:text-white border border-emerald-900/80 hover:bg-[#0c2f1c]'
                      }`}
                    >
                      <span>{c.stepNumber}</span>
                    </button>
                  ))}
                </div>

                {/* Active Comparison Viewer (Image + Transcription side by side) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-start">
                  
                  {/* Left: Real Screenshot with Zoom */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div
                      className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-black cursor-pointer group shadow-xl max-w-sm w-full"
                      onClick={() => setZoomedImage({
                        url: CHAT_EVIDENCES[activeChatTab].imageUrl,
                        title: CHAT_EVIDENCES[activeChatTab].title,
                        caption: CHAT_EVIDENCES[activeChatTab].notes,
                        tag: CHAT_EVIDENCES[activeChatTab].stepNumber
                      })}
                    >
                      <img
                        src={CHAT_EVIDENCES[activeChatTab].imageUrl}
                        alt={CHAT_EVIDENCES[activeChatTab].title}
                        className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/imagenes/leak-doc-analysis.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/85 text-xs font-mono font-bold text-[#00ff88] border border-emerald-500/60 flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Ver captura completa</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 mt-2 block">
                      Captura forense auténtica ({CHAT_EVIDENCES[activeChatTab].stepNumber})
                    </span>
                  </div>

                  {/* Right: Clean Verified Transcript and Legal Analysis */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                        TRANSCRIPCIÓN Y COTEJO JUDICIAL // CONTACTO: {CHAT_EVIDENCES[activeChatTab].sender}
                      </span>
                      <h3 className="text-xl font-black text-white">
                        {CHAT_EVIDENCES[activeChatTab].title}
                      </h3>
                    </div>

                    {/* Chat Bubble Reconstruction */}
                    <div className="space-y-2.5 p-4 rounded-2xl bg-black/80 border border-emerald-950/80 max-h-96 overflow-y-auto">
                      {CHAT_EVIDENCES[activeChatTab].dialogue.map((d, dIdx) => (
                        <div
                          key={dIdx}
                          className={`flex flex-col ${
                            d.align === 'right'
                              ? 'items-end'
                              : d.align === 'center'
                              ? 'items-center'
                              : 'items-start'
                          }`}
                        >
                          <span className="text-[9px] font-mono text-slate-400 px-1 mb-0.5">
                            {d.speaker}
                          </span>
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm font-sans ${
                              d.align === 'right'
                                ? 'bg-[#005c4b] text-white rounded-br-none'
                                : d.align === 'center'
                                ? 'bg-zinc-800 text-amber-300 text-center font-mono text-xs rounded-xl border border-zinc-700'
                                : 'bg-[#202c33] text-slate-100 rounded-bl-none'
                            }`}
                          >
                            {d.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Forensic Analysis Note */}
                    <div className="p-4 rounded-2xl bg-[#06180f] border-l-4 border-[#00ff88] text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                      <span className="text-[#00ff88] font-mono font-bold block mb-1">
                        Relevancia Criminalística:
                      </span>
                      {CHAT_EVIDENCES[activeChatTab].notes}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Complementary pressures from Morocho and Andrea */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-3xl bg-[#05170d] border border-emerald-500/35 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Presión de "Ricardo Morocho" (Posible ejecutor alternativo):</span>
                </div>
                <div className="p-3 rounded-xl bg-black/80 border-l-3 border-rose-500 text-sm font-mono text-white italic">
                  "Si no la matas tú, la mato yo"
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Mensajes divulgados por La República que describen amenazas internas para obligar a Obispo a ejecutar el encargo tras haberse frustrado tentativas previas en Nuevo Chimbote y Huaraz.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#05170d] border border-emerald-500/35 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Comunicaciones de Andrea Gonzáles (Pareja de Obispo):</span>
                </div>
                <div className="p-3 rounded-xl bg-black/80 border-l-3 border-amber-400 text-sm font-mono text-white italic">
                  Reclamos de dinero y cuestionamientos por la demora del atentado
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Intercambios donde reclama fondos a la organización. ATV reportó adicionalmente una transferencia de 200 soles efectuada el 18 de septiembre por Beángel Toro a favor de Andrea.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* CAPÍTULO IV: PERITAJE BALÍSTICO DE LA GLOCK 9MM */}
        {/* ======================================================== */}
        {activeArticle.ballisticsCases && activeArticle.ballisticsCases.length > 0 && (!isChinaPoloReport || activeDossierSection === 'balistica' || activeDossierSection === 'completo') && (
          <section className="space-y-4 pt-2 animate-in fade-in duration-300">
            <div className="p-5 sm:p-8 rounded-3xl bg-[#031308] border border-emerald-500/40 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                    CAPÍTULO 04 // PERITAJE BALÍSTICO DIRINCRI · REPORTE AMÉRICA NOTICIAS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-rose-500" />
                    <span>La Glock 9mm: Un Arma Vinculada a Seis Atentados de Sangre</span>
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-black/80 px-3 py-1 rounded-full border border-emerald-500/40 self-start sm:self-auto">
                  Robada en Villa El Salvador (2023)
                </span>
              </div>

              {/* Responsive Layout: Desktop Table (min-w-700px with smooth scroll) */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-emerald-900/80 bg-black/80">
                <table className="w-full min-w-[700px] text-left text-xs sm:text-sm font-sans">
                  <thead>
                    <tr className="border-b border-emerald-900/80 bg-[#061a0f] text-emerald-300 font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 w-32">Fecha</th>
                      <th className="py-3 px-4 w-44">Lugar / Distrito</th>
                      <th className="py-3 px-4">Hecho Vinculado según la Pericia Policial</th>
                      <th className="py-3 px-4 text-right w-36">Resultado Balístico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/60 font-sans">
                    {activeArticle.ballisticsCases.map((bc, idx) => (
                      <tr key={idx} className="hover:bg-[#072414]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-emerald-400 whitespace-nowrap font-bold">
                          {bc.date}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                          {bc.location}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 leading-snug">
                          {bc.event}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[11px] text-[#00ff88] whitespace-nowrap">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 font-bold">
                            {bc.status || 'Coincidente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Responsive Cards: Zero clipping, spacious, tactile */}
              <div className="block md:hidden space-y-3">
                <div className="text-[11px] font-mono text-slate-400 pb-1 flex items-center justify-between">
                  <span>Registro de 6 atentados balísticos:</span>
                  <span className="text-[#00ff88] font-bold">DIRINCRI PNP</span>
                </div>
                {activeArticle.ballisticsCases.map((bc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-black/90 border border-emerald-900/80 space-y-2.5 shadow-md hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-emerald-950/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-xs font-bold text-emerald-300">{bc.date}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30">
                        {bc.status || 'Coincidente'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{bc.location}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans pl-5">
                      {bc.event}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-emerald-900/60 text-xs text-slate-400 leading-relaxed font-mono">
                <span className="text-amber-400 font-bold block mb-1">Precisión Jurídica Obligatoria:</span>
                La conexión determinada por la DIRINCRI es de naturaleza balística: identifica que el cañón y percutor de la misma pistola Glock 9mm fueron empleados en los seis sucesos. Ello no demuestra que todos los crímenes tuvieran el mismo autor intelectual ni que el efectivo policial al que le sustrajeron el arma en 2023 mantenga vínculo con la banda criminal.
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* CAPÍTULO V: ADVERTENCIAS, GARANTÍAS Y RELEVO POLICIAL */}
        {/* ======================================================== */}
        {isChinaPoloReport && (activeDossierSection === 'cronica' || activeDossierSection === 'completo') && (
          <section className="space-y-4 pt-2 animate-in fade-in duration-300">
            <div className="border-b border-emerald-500/30 pb-3">
              <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest block mb-1">
                CAPÍTULO 05 // SEGURIDAD ESTATAL Y CONTROVERSIAS DE PROTECCIÓN
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-emerald-400" />
                <span>Las Alertas Previas: Garantías de Julio y Amenazas Penitenciarias</span>
              </h2>
            </div>

            <div className="space-y-4 text-slate-200 text-base sm:text-lg leading-relaxed">
              <p>
                Antes de su trágica muerte, Susy Aponte Polo había formulado advertencias concretas sobre el riesgo que corría. En julio de 2026 presentó una solicitud formal de garantías personales señalando a Juan Lázaro Calderón Altamirano (expolicía y pariente) como una persona de la que temía una agresión directa. Calderón rechazó enfáticamente dichas imputaciones en entrevistas de prensa, alegando motivaciones de disputa política local.
              </p>
              <p>
                Asimismo, trascendió que el 10 de septiembre el general PNP Víctor Revoredo le advirtió de amenazas en curso procedentes de internos de tres establecimientos penitenciarios del país. Sobre las medidas de protección conviven versiones encontradas: mientras el comando policial sostuvo que Polo contó con custodia en Chimbote hasta la noche previa, la subprefecta de Huaylas, Sheila Herrera Pablo, afirmó que la organización política no había solicitado garantías para la actividad proselitista de Caraz.
              </p>
              <div className="p-4 rounded-2xl bg-[#06180f] border-l-4 border-emerald-400 text-slate-100 text-sm font-sans">
                La Defensoría del Pueblo exigió esclarecer con urgencia qué autoridades conocían el nivel real de amenaza, qué órdenes se cursaron y por qué se interrumpió el resguardo efectivo durante los desplazamientos de campaña de la candidata. El posterior relevo del general Revoredo desató suspicacias que el ministro del Interior, César Astudillo, desmintió asegurando que obedecía a rotaciones preparadas con anterioridad.
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* CAPÍTULO VI: HIPÓTESIS POLÍTICAS Y REUNIÓN FRUSTRADA */}
        {/* ======================================================== */}
        {isChinaPoloReport && (activeDossierSection === 'cronica' || activeDossierSection === 'completo') && (
          <section className="space-y-4 pt-2 animate-in fade-in duration-300">
            <div className="border-b border-emerald-500/30 pb-3">
              <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest block mb-1">
                CAPÍTULO 06 // INVESTIGACIONES PERIODÍSTICAS Y MÓVILES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Scale className="w-6 h-6 text-emerald-400" />
                <span>Hipótesis Políticas y la Cita Frustrada con la Fiscalía de la Nación</span>
              </h2>
            </div>

            <div className="space-y-4 text-slate-200 text-base sm:text-lg leading-relaxed">
              <p>
                Las investigaciones periodísticas que Susy Aponte Polo preparaba sobre autoridades de la región Áncash colocaron bajo escrutinio al alcalde provincial del Santa, Walter Soto, y al burgomaestre de Nuevo Chimbote, Ladislao Cruz Villachica ("Lalo Villa"). Ambas autoridades negaron cualquier vinculación con el asesinato; la abogada Rosa Bartra, en defensa de Soto, declaró en Exitosa que no existía nexo probatorio alguno entre su patrocinado y los sicarios.
              </p>
              <p>
                Una vertiente adicional surgió tras la divulgación en programas televisivos de un audio donde se afirmaba que el objetivo sicarial original era Brenda Campos, una fiscalizadora vecinal, y que posteriormente el ataque se redirigió contra la periodista. No existe a la fecha resolución fiscal que valide judicialmente esta versión.
              </p>
              <p>
                Otro episodio documentado por Día D da cuenta de que Polo había coordinado con Luis Miguel Llanos encontrarse el domingo 20 de septiembre —un día después del atentado— para gestionar una futura reunión con la Fiscalía de la Nación y entregar voluminosos expedientes que consideraba de extrema gravedad.
              </p>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* CAPÍTULO VII: MUERTES EN VENEZUELA Y DESINFORMACIÓN */}
        {/* ======================================================== */}
        {isChinaPoloReport && (activeDossierSection === 'cronica' || activeDossierSection === 'completo') && (
          <section className="space-y-4 pt-2 animate-in fade-in duration-300">
            <div className="border-b border-emerald-500/30 pb-3">
              <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest block mb-1">
                CAPÍTULO 07 // CONFUSIONES MEDIÁTICAS Y ESCLARECIMIENTOS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Users className="w-6 h-6 text-emerald-400" />
                <span>El Accidente en Portuguesa, la Captura de Solís y las Muertes Cruzadas</span>
              </h2>
            </div>

            <div className="space-y-4 text-slate-200 text-base sm:text-lg leading-relaxed">
              <p>
                El 30 de septiembre de 2026 se produjo el fallecimiento de Beángel Alexandra Toro (media hermana de Ronald Toro y pareja de Adrián Solís) en un accidente de tránsito en el estado Portuguesa, Venezuela, siniestro en el que también perdió la vida su menor hija. Dicho hecho generó especulaciones sobre si habría sido silenciada; no obstante, las autoridades periciales no han presentado indicios de sabotaje vehicular.
              </p>
              <p>
                Adrián José Solís Ruiz ("José"), quien viajaba en la unidad y sobrevivió, fugó del centro hospitalario pero fue finalmente capturado el 9 de octubre en Calabozo, estado de Guárico. Aunque inicialmente se solicitó su extradición, las autoridades venezolanas informaron que no será extraditado y que prestará declaraciones vía asistencia judicial internacional.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#041208] border border-emerald-900/60 text-xs sm:text-sm text-slate-300 space-y-1">
                  <span className="text-emerald-400 font-bold block font-mono">Olimpia Pachas Osorio (72 años):</span>
                  Víctima civil inocente que resultó herida de gravedad durante la balacera en Caraz y falleció días después en el hospital de Huaraz. No mantenía ningún vínculo con el móvil criminal.
                </div>
                <div className="p-4 rounded-2xl bg-[#041208] border border-emerald-900/60 text-xs sm:text-sm text-slate-300 space-y-1">
                  <span className="text-emerald-400 font-bold block font-mono">Edwin Iván Cotrina Quijano ("Cojo Giordano"):</span>
                  Mencionado por Polo por una advertencia previa sobre amenazas, pero su asesinato ocurrió en marzo de 2025; no forma parte de una supuesta purga posterior a los hechos de Caraz.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* MATRIZ DE IMPLICADOS Y SITUACIÓN JUDICIAL ACTUAL */}
        {/* ======================================================== */}
        {activeArticle.suspects && activeArticle.suspects.length > 0 && (!isChinaPoloReport || activeDossierSection === 'red-criminal' || activeDossierSection === 'completo') && (
          <section className="space-y-4 pt-2 animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#020e06] border border-emerald-500/40 space-y-5 shadow-xl">
              <div className="border-b border-emerald-950 pb-3">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">
                  REGISTRO PROCESAL // FUENTES JUDICIALES
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00ff88]" />
                  <span>Situación Pública de los Principales Investigados</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeArticle.suspects.map((s, idx) => {
                  let badgeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                  if (s.statusType === 'detenido') badgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-700/80';
                  if (s.statusType === 'capturado') badgeStyle = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80';
                  if (s.statusType === 'fallecido') badgeStyle = 'bg-zinc-900 text-zinc-400 border-zinc-700';
                  if (s.statusType === 'fugitivo') badgeStyle = 'bg-rose-950/80 text-rose-300 border-rose-700/80';
                  if (s.statusType === 'investigado') badgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-700/80';

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-black/75 border border-emerald-900/60 flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {s.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${badgeStyle}`}>
                            {s.statusType}
                          </span>
                        </div>
                        {s.alias && (
                          <span className="text-xs font-mono text-[#00ff88] block">
                            Alias: {s.alias}
                          </span>
                        )}
                        <p className="text-xs text-slate-300 leading-snug">
                          {s.role}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-emerald-950 text-[11px] font-mono text-slate-400">
                        <span className="text-slate-200 font-semibold">Situación:</span> {s.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* PREGUNTAS ABIERTAS DECISIVAS DE LA INVESTIGACIÓN */}
        {/* ======================================================== */}
        {activeArticle.openQuestions && activeArticle.openQuestions.length > 0 && (!isChinaPoloReport || activeDossierSection === 'preguntas' || activeDossierSection === 'completo') && (
          <section className="space-y-4 pt-2 animate-in fade-in duration-300">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#03150c] via-[#052415] to-[#021008] border border-emerald-500/50 space-y-4 shadow-xl">
              <div className="border-b border-emerald-500/30 pb-3">
                <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-widest block mb-0.5">
                  LÍNEAS DE INVESTIGACIÓN PENDIENTES
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  <span>Lo que Falta Esclarecer: Las Seis Preguntas Decisivas</span>
                </h3>
              </div>

              <div className="space-y-3">
                {activeArticle.openQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-black/70 border border-emerald-900/80 flex items-start gap-3 hover:border-emerald-400/60 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/60 text-[#00ff88] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed font-sans">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-mono text-slate-400">Etiquetas del caso:</span>
          {activeArticle.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-mono bg-[#06190f] text-emerald-400 border border-emerald-500/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom Contact / OSINT Assistance Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#03180d] via-[#052917] to-[#02120a] border-2 border-emerald-500/50 shadow-[0_0_35px_rgba(0,255,136,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">
              ASISTENCIA TÉCNICA // INVESTIGACIÓN OSINT
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              ¿Posees información o requieres verificar este expediente?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Nuestros analistas reciben reportes con estricta reserva de identidad y cifrado extremo a extremo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenTelegram(activeArticle)}
            className="px-7 py-3.5 rounded-full font-black text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all cursor-pointer whitespace-nowrap font-mono uppercase active:scale-95"
          >
            Contactar con @{activeArticle.authorTelegram}
          </button>
        </div>

        {/* Related Articles Showcase */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-emerald-950">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white tracking-tight">
                Otras publicaciones de la revista
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleSelectArticle(rel)}
                  className="p-4 rounded-2xl bg-[#041208] border border-emerald-900/60 hover:border-emerald-400/80 transition-all cursor-pointer flex flex-col justify-between group shadow-md hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                >
                  <div className="space-y-2.5">
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-black">
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/imagenes/leak-doc-analysis.jpg';
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#00ff88] block">
                      {rel.categoryLabel}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="pt-3 mt-3 border-t border-emerald-950 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{rel.readTime}</span>
                    <span className="text-[#00ff88] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Leer informe</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Back Button */}
        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={handleBackToNews}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-mono font-bold text-slate-300 hover:text-white bg-[#06180e] hover:bg-[#0a2a18] border border-emerald-500/40 hover:border-[#00ff88] shadow-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00ff88]" />
            <span>Volver a la Revista & Leaks</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* LIGHTBOX MODAL: FULL-SCREEN IMAGE INSPECTOR */}
        {/* ======================================================== */}
        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <div
              className="max-w-4xl w-full rounded-3xl bg-[#041209] border border-emerald-500/60 overflow-hidden shadow-2xl relative cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/80 hover:bg-emerald-950 text-slate-300 hover:text-white border border-emerald-500/50 cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[72vh] bg-black flex items-center justify-center overflow-hidden p-2">
                <img
                  src={zoomedImage.url}
                  alt={zoomedImage.title}
                  className="w-full h-full object-contain max-h-[70vh]"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/imagenes/china-polo-dossier.jpg';
                  }}
                />
              </div>

              <div className="p-5 sm:p-6 bg-[#020b05] border-t border-emerald-950 space-y-1.5">
                {zoomedImage.tag && (
                  <span className="text-[10px] font-mono text-[#00ff88] font-bold block uppercase">
                    {zoomedImage.tag}
                  </span>
                )}
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {zoomedImage.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {zoomedImage.caption}
                </p>
              </div>
            </div>
          </div>
        )}

      </article>
    );
  }

  // ==========================================
  // VIEW: MAIN MAGAZINE COVER & CATALOG VIEW
  // ==========================================
  const isDefaultMagazineView = selectedCategory === 'todo' && !searchQuery.trim();

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Title */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/35 bg-gradient-to-r from-[#03150d] via-[#052917] to-[#021008] p-6 sm:p-10 shadow-[0_0_50px_rgba(0,255,136,0.12)]">
        <div className="absolute top-0 right-0 w-96 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#00ff88] bg-black/60 border border-emerald-500/40 shadow-inner">
            <Radio className="w-3 h-3 text-[#00ff88] animate-pulse" />
            <span>REVISTA DIGITAL // INTELIGENCIA OSINT & FILTRACIONES</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Filtraciones, Brechas & Ciberseguridad Perú
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Reportajes especiales de investigación, auditorías forenses a bases de datos expuestas, expedientes clasificados y guías de protección digital para usuarios y empresas en el Perú.
          </p>
        </div>
      </div>

      {/* 2. Magazine Filter Pill Bar & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-emerald-500/20">
        
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_25px_rgba(0,255,136,0.45)] scale-102 font-black'
                    : 'bg-[#07190f]/90 text-slate-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/60 hover:bg-[#0a2617]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/80">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por DNI, base, banco, caso..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#06170e]/95 border border-emerald-500/30 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(0,255,136,0.25)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Magazine View (When "Todo" & No Search) */}
      {isDefaultMagazineView ? (
        <div className="space-y-9">
          
          {/* Top 2-Column Section: Left Hero Lead + Right Latest Publications */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Featured Large Lead Card (Hero - China Polo) */}
            {heroArticle && (
              <div
                onClick={() => handleSelectArticle(heroArticle)}
                className="lg:col-span-8 group relative rounded-3xl overflow-hidden border border-emerald-500/35 bg-[#030d07] min-h-[440px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-9 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(0,255,136,0.1)] hover:border-emerald-400/80 transition-all duration-500"
              >
                <img
                  src={heroArticle.imageUrl}
                  alt={heroArticle.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 pointer-events-none"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/imagenes/china-polo-dossier.jpg';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020904] via-[#020904]/80 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020904]/85 via-[#020904]/30 to-transparent pointer-events-none" />

                <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-black/75 text-[#00ff88] border border-emerald-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,136,0.25)] flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#00ff88] animate-pulse" />
                    <span>INVESTIGACIÓN ESPECIAL // LEAK #01</span>
                  </span>
                </div>

                <div className="relative z-10 space-y-3.5">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase ${getTagBadgeStyle(heroArticle.categoryLabel)}`}>
                      {heroArticle.categoryLabel}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] group-hover:text-emerald-300 transition-colors">
                    {heroArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {heroArticle.summary}
                  </p>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20">
                    <div className="flex items-center gap-2.5 text-slate-300 font-mono text-xs">
                      <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-400/60 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                        <img
                          src={getAuthorAvatar(heroArticle.authorTelegram)}
                          alt={heroArticle.author}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/imagenes/monograma.png';
                          }}
                        />
                      </div>
                      <span className="font-bold text-white">{heroArticle.author}</span>
                      <span className="text-emerald-500">·</span>
                      <span className="text-slate-400">{heroArticle.readTime}</span>
                    </div>

                    <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00d670] text-slate-950 font-black text-xs sm:text-sm font-mono shadow-[0_0_25px_rgba(0,255,136,0.45)] flex items-center gap-1.5 group-hover:scale-105 transition-all">
                      <span>Leer informe completo</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right: "Últimas publicaciones" Column */}
            <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-[#092215]/95 via-[#06170e]/95 to-[#020a05] border border-emerald-500/30 p-5 sm:p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08),0_0_35px_rgba(0,255,136,0.08)] relative overflow-hidden backdrop-blur-xl">
              
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-emerald-500/20">
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <span>Últimas publicaciones</span>
                  </h3>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-emerald-500/40 text-[10px] font-mono font-bold text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                    </span>
                    <span>EN VIVO</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {latestArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleSelectArticle(art)}
                      className="group/item relative p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2a1b]/70 via-[#081c12]/80 to-[#040f09]/90 border border-emerald-500/20 hover:border-emerald-400/80 hover:bg-gradient-to-r hover:from-[#113824]/90 hover:via-[#0c291b]/90 hover:to-[#06180e] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,255,136,0.22)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-3.5 overflow-hidden"
                    >
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#00ff88] opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 shadow-[0_0_12px_#00ff88]" />

                      <div className="w-22 h-18 sm:w-26 sm:h-20 rounded-xl overflow-hidden bg-black shrink-0 relative border border-emerald-500/30 group-hover/item:border-emerald-400/70 transition-colors shadow-md">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/imagenes/leak-doc-analysis.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase ${getTagBadgeStyle(art.categoryLabel)}`}>
                            {art.categoryLabel}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-[13.5px] font-black text-white leading-snug line-clamp-2 group-hover/item:text-[#00ff88] transition-colors tracking-tight">
                          {art.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1.5 pt-0.5">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3 h-3 text-emerald-400/80" />
                            <span>{art.readTime}</span>
                          </span>
                          <span className="text-[#00ff88] font-bold text-[10px] opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all flex items-center gap-0.5">
                            <span>Leer</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-emerald-500/20 relative z-10">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('filtraciones')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#081e12] hover:bg-[#0c2f1c] border border-emerald-500/30 hover:border-emerald-400/70 text-xs font-mono font-bold text-[#00ff88] flex items-center justify-between transition-all group/btn shadow-[0_4px_15px_rgba(0,0,0,0.4)] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#00ff88]" />
                    <span>Ver todas las publicaciones ({articles.length})</span>
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* 4. Second Section: "Explora la revista" */}
          <div className="space-y-4 pt-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">
                  EXPLORADOR TÉCNICO
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Explora la revista
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory('ciberseguridad')}
                className="px-4 py-2 rounded-full bg-[#07190f] hover:bg-[#0b2718] border border-emerald-500/30 text-xs sm:text-sm font-bold text-[#00ff88] hover:text-[#00e676] inline-flex items-center gap-1.5 font-mono transition-all cursor-pointer shadow-sm group"
              >
                <span>Ver más artículos</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {exploreArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleSelectArticle(art)}
                  className="group relative rounded-3xl bg-gradient-to-r from-[#0b2417]/80 via-[#071a10]/85 to-[#030e08]/95 border border-emerald-500/25 p-4 sm:p-4.5 hover:border-emerald-400/80 hover:bg-gradient-to-r hover:from-[#0f3120]/90 hover:via-[#0a2316]/90 hover:to-[#05150d] transition-all duration-300 cursor-pointer flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_35px_rgba(0,255,136,0.22)] hover:-translate-y-0.5 overflow-hidden"
                >
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_12px_#00ff88]" />

                  <div className="w-24 h-20 sm:w-28 sm:h-22 rounded-2xl overflow-hidden bg-black shrink-0 border border-emerald-500/30 group-hover:border-emerald-400/70 relative shadow-md">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/imagenes/leak-doc-analysis.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase ${getTagBadgeStyle(art.categoryLabel)}`}>
                      {art.categoryLabel}
                    </span>

                    <h4 className="text-xs sm:text-sm font-black text-white leading-snug line-clamp-2 group-hover:text-[#00ff88] transition-colors tracking-tight">
                      {art.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-emerald-400/80" />
                        <span>{art.readTime}</span>
                      </span>
                      <span className="text-[#00ff88] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <span>Leer</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Telegram Callout Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#061e12] via-[#04160d] to-[#020b06] border border-emerald-500/40 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(0,255,136,0.12)] overflow-hidden">
            <div className="absolute top-0 right-1/4 w-80 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1.5 text-center md:text-left relative z-10">
              <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">
                CANAL DE INTELIGENCIA // COMUNIDAD VIP
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                ¿Tienes reportes o alertas de filtraciones en Perú?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Nuestro canal de Telegram publica alertas en tiempo real sobre caídas de sistemas bancarios, breaches locales y reportajes de investigación.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenTelegram()}
              className="px-7 py-3.5 rounded-full font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-[#00ff88] to-[#00d670] hover:from-[#00e676] hover:to-[#00c853] shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all cursor-pointer whitespace-nowrap font-mono uppercase active:scale-95 relative z-10 shrink-0"
            >
              Unirse al Canal de Leaks
            </button>
          </div>

        </div>
      ) : (
        /* 4. Filtered / Search Results Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Resultados encontrados: {filteredArticles.length} artículos</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#00ff88] hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => handleSelectArticle(art)}
                className="group rounded-3xl bg-[#041208] border border-emerald-500/25 hover:border-emerald-400/80 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,255,136,0.2)] hover:-translate-y-1 cursor-pointer overflow-hidden shadow-lg"
              >
                <div className="space-y-3.5">
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-black relative border border-emerald-900/60">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/imagenes/leak-doc-analysis.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase ${getTagBadgeStyle(art.categoryLabel)}`}>
                      {art.categoryLabel}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00ff88] transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-950 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{art.readTime}</span>
                  <span className="text-[#00ff88] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Leer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
