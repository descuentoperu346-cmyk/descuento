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
  Lock
} from 'lucide-react';
import { LeakArticle } from '../data/leaksData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface LeaksTabProps {
  articles: LeakArticle[];
  onOpenContact: () => void;
}

export const LeaksTab: React.FC<LeaksTabProps> = ({ articles, onOpenContact }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<LeakArticle | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

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

  // Featured Lead (Left Hero)
  const heroArticle = useMemo(() => {
    return (
      articles.find((a) => a.id === 'leak-hero-db') ||
      articles.find((a) => a.featured) ||
      articles[0]
    );
  }, [articles]);

  // Right column: Últimas publicaciones (3 items)
  const latestArticles = useMemo(() => {
    const list = articles.filter((a) => a.id !== heroArticle?.id);
    const specificOrder = ['leak-fake-alert', 'leak-report-reveal', 'leak-three-steps'];
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
    const topic = art ? `sobre el artículo "${art.title}"` : 'sobre la Revista de Leaks & Ciberseguridad';

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
    if (upper.includes('ANÁLISIS')) {
      return 'border border-emerald-400/60 bg-emerald-950/80 text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.35)]';
    }
    if (upper.includes('GUÍA') || upper.includes('GUÍAS')) {
      return 'border border-cyan-400/60 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]';
    }
    if (upper.includes('PROTECCIÓN')) {
      return 'border border-rose-500/70 bg-rose-950/80 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
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

  // ==========================================
  // VIEW: DEDICATED FULL ARTICLE PAGE (No Modal)
  // ==========================================
  if (activeArticle) {
    const relatedArticles = articles
      .filter((a) => a.id !== activeArticle.id)
      .slice(0, 3);

    return (
      <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-16">
        
        {/* Sticky/Top Navigation Bar with Return Button & Actions */}
        <div className="flex items-center justify-between gap-4 pt-2 pb-4 border-b border-emerald-950 sticky top-16 z-30 bg-[#050b08]/95 backdrop-blur-md">
          <button
            type="button"
            onClick={handleBackToNews}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-mono font-bold text-[#00ff88] bg-[#051a0f] hover:bg-[#092b1a] border border-emerald-500/50 hover:border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Noticias & Leaks</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyArticleLink(activeArticle)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-300 hover:text-white bg-[#06180e] border border-emerald-900 hover:border-emerald-500/60 transition-all cursor-pointer shadow-sm"
              title="Copiar enlace del artículo"
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

        {/* Hero Cover Header */}
        <div className="rounded-3xl overflow-hidden border border-emerald-500/40 bg-[#030d07] shadow-[0_0_50px_rgba(0,255,136,0.18)] relative">
          <div className="relative h-64 sm:h-80 md:h-[380px] w-full overflow-hidden bg-black">
            <img
              src={activeArticle.imageUrl}
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020b05] via-[#020b05]/60 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${getTagBadgeStyle(activeArticle.categoryLabel)}`}>
                {activeArticle.categoryLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/85 text-[10px] text-slate-200 font-mono border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#00ff88]" />
                <span>{activeArticle.readTime}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-black/85 text-[10px] text-slate-300 font-mono border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>{activeArticle.date}</span>
              </span>
            </div>
          </div>

          {/* Title & Author Meta Bar */}
          <div className="p-6 sm:p-8 md:p-10 space-y-5 relative z-10 bg-[#020b05]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {activeArticle.title}
            </h1>

            {/* Author Profile Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-emerald-950">
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400 p-0.5 bg-black shadow-[0_0_15px_rgba(0,255,136,0.3)] shrink-0">
                  <img
                    src={getAuthorAvatar(activeArticle.authorTelegram)}
                    alt={activeArticle.author}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00ff88] border-2 border-black animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{activeArticle.author}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[9px] font-mono text-[#00ff88] uppercase">
                      ANALISTA VERIFICADO
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
                <span>Contactar a @{activeArticle.authorTelegram}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lead Summary Block */}
        <div className="p-6 rounded-3xl bg-[#04170d] border border-emerald-500/40 text-emerald-200 text-sm sm:text-base font-medium leading-relaxed shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <p className="relative z-10 italic">
            "{activeArticle.summary}"
          </p>
        </div>

        {/* Threat Scope / Compromised Indicators (If any) */}
        {activeArticle.compromisedData && activeArticle.compromisedData.length > 0 && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#170505] to-[#0d0303] border border-rose-600/40 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Alcance & Datos Críticos Monitoreados:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {activeArticle.compromisedData.map((d) => (
                <span
                  key={d}
                  className="px-3 py-1.5 rounded-xl bg-black/80 border border-rose-800/50 text-xs text-rose-200 font-mono"
                >
                  ✓ {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Article Full Body Paragraphs */}
        <div className="space-y-6 text-slate-200 text-base sm:text-lg leading-relaxed font-normal px-1">
          {activeArticle.content.map((p, i) => (
            <p key={i} className="leading-relaxed text-slate-200">
              {p}
            </p>
          ))}
        </div>

        {/* Security Checklist Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#031308] border border-emerald-500/40 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-[#00ff88] font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#00ff88]" />
            <span>Medidas de Protección Recomendadas por Descuentos Perú</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#010804] border border-emerald-900/60">
              <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
              <span>Verifica periódicamente tus contraseñas en gestores seguros y cámbialas si hubo filtración.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#010804] border border-emerald-900/60">
              <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
              <span>Activa siempre el Doble Factor de Autenticación (2FA) por app y nunca por SMS.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#010804] border border-emerald-900/60">
              <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
              <span>Evita reutilizar la misma clave de correo electrónico en servicios de entretenimiento.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#010804] border border-emerald-900/60">
              <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
              <span>Consulta con nuestro equipo si sospechas de suplantación o exposición corporativa.</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-mono text-slate-400">Etiquetas:</span>
          {activeArticle.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-mono bg-[#06190f] text-emerald-400 border border-emerald-500/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom Contact Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#03180d] via-[#052917] to-[#02120a] border-2 border-emerald-500/50 shadow-[0_0_35px_rgba(0,255,136,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">
              ASISTENCIA TÉCNICA // INVESTIGACIÓN OSINT
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              ¿Quieres verificar tu exposición en esta brecha?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Nuestros especialistas realizan auditorías de cuentas y números telefónicos con estricta reserva.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenTelegram(activeArticle)}
            className="px-7 py-3.5 rounded-full font-black text-xs sm:text-sm text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all cursor-pointer whitespace-nowrap font-mono uppercase active:scale-95"
          >
            Consultar con @{activeArticle.authorTelegram}
          </button>
        </div>

        {/* Related Articles Showcase */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-emerald-950">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white tracking-tight">
                Otras publicaciones que te pueden interesar
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
                    <span className="text-[#00ff88] font-bold group-hover:translate-x-1 transition-transform">
                      Leer informe →
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
            <span>← Volver a Noticias & Leaks</span>
          </button>
        </div>

      </article>
    );
  }

  const isDefaultMagazineView = selectedCategory === 'todo' && !searchQuery.trim();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Header Title & Eyebrow */}
      <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4 pt-2">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -left-10 w-96 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Kicker Eyebrow with Radar pulse */}
          <div className="inline-flex items-center gap-2 text-[#00ff88] font-mono text-[11px] sm:text-xs font-bold tracking-[0.24em] uppercase mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
            </span>
            <span>REVISTA DIGITAL</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-normal">INTELIGENCIA & AMENAZAS</span>
          </div>

          {/* Main Title with Coral Accent Dot */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none flex items-baseline drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            <span>Leaks & Filtraciones</span>
            <span className="text-[#ff3366] text-4xl sm:text-5xl lg:text-6xl inline-block -ml-0.5 leading-none font-black select-none drop-shadow-[0_0_15px_rgba(255,51,102,0.6)]">.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-xs sm:text-sm mt-2.5 font-medium max-w-2xl leading-relaxed">
            Actualidad, análisis técnico forense y guías de blindaje digital para proteger tu identidad y empresa.
          </p>
        </div>

        {/* Top-Right Badge: CONTENIDO DE EJEMPLO */}
        <div className="self-start md:self-auto pt-1 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-[#06180e]/90 shadow-[0_0_20px_rgba(0,255,136,0.1)] backdrop-blur-md">
            <Radio className="w-3 h-3 text-[#00ff88] animate-pulse" />
            <span>CONTENIDO DE EJEMPLO</span>
          </span>
        </div>
      </div>

      {/* 2. Filter Pills & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
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
            placeholder="Buscar por DNI, base, banco, stealer..."
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
          
          {/* Top 2-Column Section: Left Hero + Right Latest Publications */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Featured Large Lead Card (Hero) */}
            {heroArticle && (
              <div
                onClick={() => handleSelectArticle(heroArticle)}
                className="lg:col-span-8 group relative rounded-3xl overflow-hidden border border-emerald-500/35 bg-[#030d07] min-h-[420px] sm:min-h-[480px] flex flex-col justify-end p-6 sm:p-9 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(0,255,136,0.1)] hover:border-emerald-400/80 transition-all duration-500"
              >
                {/* Background Image with Parallax Hover Zoom */}
                <img
                  src={heroArticle.imageUrl}
                  alt={heroArticle.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 pointer-events-none"
                />

                {/* Cyber Gradient Overlay Stack */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020904] via-[#020904]/80 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020904]/85 via-[#020904]/30 to-transparent pointer-events-none" />

                {/* Top Lead Pill */}
                <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-black/75 text-[#00ff88] border border-emerald-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,136,0.25)] flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#00ff88] animate-pulse" />
                    <span>INVESTIGACIÓN ESPECIAL</span>
                  </span>
                </div>

                {/* Overlaid Article Information */}
                <div className="relative z-10 space-y-3.5">
                  {/* Category Badge */}
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase ${getTagBadgeStyle(heroArticle.categoryLabel)}`}>
                      {heroArticle.categoryLabel}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] group-hover:text-emerald-300 transition-colors">
                    {heroArticle.title}
                  </h2>

                  {/* Summary Snippet */}
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {heroArticle.summary}
                  </p>

                  {/* Meta & CTA Row */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20">
                    <div className="flex items-center gap-2.5 text-slate-300 font-mono text-xs">
                      <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-400/60 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                        <img
                          src={getAuthorAvatar(heroArticle.authorTelegram)}
                          alt={heroArticle.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-white">{heroArticle.author}</span>
                      <span className="text-emerald-500">·</span>
                      <span className="text-slate-400">{heroArticle.readTime}</span>
                    </div>

                    <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00d670] text-slate-950 font-black text-xs sm:text-sm font-mono shadow-[0_0_25px_rgba(0,255,136,0.45)] flex items-center gap-1.5 group-hover:scale-105 transition-all">
                      <span>Leer análisis</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right: "Últimas publicaciones" Column (Redesigned with Tactile Cards & Neon Badges) */}
            <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-[#092215]/95 via-[#06170e]/95 to-[#020a05] border border-emerald-500/30 p-5 sm:p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08),0_0_35px_rgba(0,255,136,0.08)] relative overflow-hidden backdrop-blur-xl">
              
              {/* Subtle Ambient Glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                {/* Header with Live Ping */}
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

                {/* 3 Compact Tactile Articles Stack */}
                <div className="space-y-3">
                  {latestArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleSelectArticle(art)}
                      className="group/item relative p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2a1b]/70 via-[#081c12]/80 to-[#040f09]/90 border border-emerald-500/20 hover:border-emerald-400/80 hover:bg-gradient-to-r hover:from-[#113824]/90 hover:via-[#0c291b]/90 hover:to-[#06180e] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,255,136,0.22)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-3.5 overflow-hidden"
                    >
                      {/* Left Glowing Accent Bar on Hover */}
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#00ff88] opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 shadow-[0_0_12px_#00ff88]" />

                      {/* Thumbnail with Glowing Border */}
                      <div className="w-22 h-18 sm:w-26 sm:h-20 rounded-xl overflow-hidden bg-black shrink-0 relative border border-emerald-500/30 group-hover/item:border-emerald-400/70 transition-colors shadow-md">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0">
                        {/* Glowing Pill Badge */}
                        <div className="mb-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase ${getTagBadgeStyle(art.categoryLabel)}`}>
                            {art.categoryLabel}
                          </span>
                        </div>

                        {/* Article Title */}
                        <h4 className="text-xs sm:text-[13.5px] font-black text-white leading-snug line-clamp-2 group-hover/item:text-[#00ff88] transition-colors tracking-tight">
                          {art.title}
                        </h4>

                        {/* Meta and Hover CTA */}
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

              {/* View all publications footer button */}
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

            {/* 3 Horizontal High-Tech Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {exploreArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleSelectArticle(art)}
                  className="group relative rounded-3xl bg-gradient-to-r from-[#0b2417]/80 via-[#071a10]/85 to-[#030e08]/95 border border-emerald-500/25 p-4 sm:p-4.5 hover:border-emerald-400/80 hover:bg-gradient-to-r hover:from-[#0f3120]/90 hover:via-[#0a2316]/90 hover:to-[#05150d] transition-all duration-300 cursor-pointer flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_35px_rgba(0,255,136,0.22)] hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* Left Accent Neon Line */}
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_12px_#00ff88]" />

                  {/* Thumbnail */}
                  <div className="w-24 h-20 sm:w-28 sm:h-22 rounded-2xl overflow-hidden bg-black shrink-0 border border-emerald-500/30 group-hover:border-emerald-400/70 relative shadow-md">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  </div>

                  {/* Text details */}
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
                      <span className="text-[#00ff88] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Leer →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Telegram Callout Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#061e12] via-[#04160d] to-[#020b06] border border-emerald-500/40 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(0,255,136,0.12)] overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-1/4 w-80 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row relative z-10">
              {/* Llama Magazine Mascot Illustration */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl bg-black/50 border border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-[0_0_25px_rgba(0,255,136,0.35)]">
                <img
                  src="/imagenes/llama-magazine.png"
                  alt="Llama DP Revista Leaks"
                  className="w-full h-full object-contain p-1 filter drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#00ff88] bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    CANAL OFICIAL // ALERTA TEMPRANA
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">@DESCUENTOSPER2</span>
                </div>
                <h4 className="text-base sm:text-xl font-black text-white tracking-tight">
                  La revista de ciberseguridad también está en Telegram
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed max-w-xl">
                  Recibe nuestras últimas alertas de seguridad, desgloses forenses de filtraciones y guías de blindaje directo en tu canal con el equipo de Tin9o y Descuentos Perú.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => handleOpenTelegram()}
              className="px-7 py-3 rounded-full font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-[#00ff88] to-[#00d670] hover:scale-105 shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 font-mono relative z-10"
            >
              <Send className="w-4 h-4 fill-slate-950 -rotate-12" />
              <span>Unirme al canal</span>
            </button>
          </div>

        </div>
      ) : (
        /* Filtered / Search Results Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Resultados para "{categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}"</span>
              {searchQuery && <span className="text-slate-400 font-normal text-xs sm:text-sm">· Buscando "{searchQuery}"</span>}
              <span className="text-xs font-mono text-emerald-400 bg-[#06180e] px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </h3>

            {(selectedCategory !== 'todo' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todo');
                  setSearchQuery('');
                }}
                className="text-xs text-emerald-400 hover:text-white font-mono cursor-pointer underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleSelectArticle(art)}
                  className="group rounded-3xl bg-gradient-to-b from-[#092215]/90 via-[#06170e]/95 to-[#020b06] border border-emerald-500/30 hover:border-emerald-400/80 p-5 transition-all flex flex-col justify-between cursor-pointer hover:shadow-[0_15px_35px_rgba(0,255,136,0.22)] hover:-translate-y-1"
                >
                  <div className="space-y-3.5">
                    {/* Thumbnail */}
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-black relative border border-emerald-500/30 shadow-md">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase ${getTagBadgeStyle(art.categoryLabel)}`}>
                          {art.categoryLabel}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/85 text-[10px] text-slate-300 font-mono border border-slate-700/60">
                        {art.readTime}
                      </div>
                    </div>

                    {/* Metadata Header */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span className="text-emerald-400 font-bold">{art.author}</span>
                      <span>{art.date}</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-black text-white group-hover:text-[#00ff88] transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3.5 mt-3.5 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {art.tags[0] || '#Ciberseguridad'}
                    </span>
                    <span className="text-[#00ff88] font-bold inline-flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                      <span>Leer informe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-[#040e07] rounded-3xl border border-emerald-500/30 p-8 space-y-3">
              <Shield className="w-12 h-12 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No se encontraron artículos</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No hay publicaciones que coincidan con los criterios seleccionados. Prueba buscando por otros términos o restablece los filtros.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todo');
                  setSearchQuery('');
                }}
                className="mt-2 px-5 py-2 rounded-full text-xs font-mono font-bold bg-[#00ff88] text-black cursor-pointer shadow-[0_0_15px_rgba(0,255,136,0.3)]"
              >
                Ver todos los artículos
              </button>
            </div>
          )}
        </div>
      )}



    </div>
  );
};
