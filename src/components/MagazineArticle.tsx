import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Send, Share2, ShieldCheck } from 'lucide-react';
import type { LeakArticle } from '../data/leaksData';
import { ArticleBody, buildSections } from './ArticleBody';
import { ArticleProse, KeyPoints } from './article/ArticleProse';
import { ArticleToc, ArticleTocMobile, useActiveSection, type TocItem } from './article/ArticleToc';
import { ACCENTS, SEVERITY, type Accent } from './article/accent';

interface MagazineArticleProps {
  article: LeakArticle;
  related: LeakArticle[];
  copied: boolean;
  authorAvatar: string;
  onBack: () => void;
  onShare: () => void;
  onAsk: () => void;
  onSelect: (a: LeakArticle) => void;
  /** Material interactivo del artículo (p. ej. el archivo de evidencias de un expediente). Se muestra a todo el ancho. */
  children?: React.ReactNode;
  archiveTitle?: string;
  archiveIntro?: string;
  /** El material de `children` ya incluye sus propias preguntas abiertas */
  hideOpenQuestions?: boolean;
}

const CHANNEL_URL = 'https://t.me/descuentosper2';
const AI_NOTE = 'Ilustración referencial generada con IA. Los textos, nombres, cifras y fechas que aparecen en la imagen no corresponden a documentos reales.';
const FALLBACK_COVER = '/imagenes/leak-doc-analysis.jpg';

const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = FALLBACK_COVER;
};

/** Barra fina de progreso de lectura, fija arriba. */
const ReadingProgress: React.FC<{ accent: Accent }> = ({ accent }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-[3px] w-full bg-transparent" aria-hidden="true">
      <div className={`h-full ${ACCENTS[accent].fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/** Etiqueta corta del tipo de pieza: "Leak #02 · Expediente", "Guía", "Análisis"… */
const kindLabel = (a: LeakArticle): string => {
  if (a.leakNumber) return `Leak #${String(a.leakNumber).padStart(2, '0')} · ${a.evidenceFigures?.length || a.fullBody ? 'Expediente' : 'Investigación'}`;
  const l = a.categoryLabel.toLowerCase();
  return l.charAt(0).toUpperCase() + l.slice(1);
};

export const MagazineArticle: React.FC<MagazineArticleProps> = ({
  article,
  related,
  copied,
  authorAvatar,
  onBack,
  onShare,
  onAsk,
  onSelect,
  children,
  archiveTitle = 'Archivo de evidencias',
  archiveIntro = 'Videos, conversaciones, peritajes y documentos que respaldan el reportaje. Elige un módulo o míralo todo seguido.',
  hideOpenQuestions = false
}) => {
  const sidebar = article.sidebar;
  const hasSections = useMemo(() => article.content.some((b) => b.startsWith('## ')), [article.content]);
  // Expedientes con portada fotográfica: portada inmersiva y acento rosa. Guías y análisis: portada partida y acento verde.
  const immersive = !!article.fullBody || (article.evidenceFigures?.length ?? 0) > 0;
  const accent: Accent = immersive ? 'rose' : 'emerald';
  const a = ACCENTS[accent];
  const deck = article.subtitle || article.summary;
  const showQuestions = !hideOpenQuestions && !!article.openQuestions && article.openQuestions.length > 0;
  const hasVideos = !!article.videos && article.videos.length > 0;
  const severity = SEVERITY[article.severity];

  // Índice del artículo
  const tocItems = useMemo<TocItem[]>(() => {
    const items: TocItem[] = [];
    if (hasSections) {
      let n = 0;
      buildSections(article.content).forEach((s) => {
        if (s.summary) items.push({ id: s.id, label: s.title, n: ++n });
        else items.push({ id: s.id, label: s.title });
      });
    }
    if (hasVideos) items.push({ id: 'videos', label: 'Material audiovisual' });
    if (children) items.push({ id: 'archivo', label: archiveTitle });
    if (showQuestions) items.push({ id: 'preguntas', label: 'Preguntas abiertas' });
    return items;
  }, [article.content, hasSections, hasVideos, children, archiveTitle, showQuestions]);
  const showToc = tocItems.length >= 3;
  const activeId = useActiveSection(showToc ? tocItems.map((t) => t.id) : []);

  const keyPointsTitle = article.category === 'guias' ? 'Lo que necesitas saber' : 'Puntos clave';
  const facts: { label: string; value: string }[] = [
    ...(article.statusLabel ? [{ label: 'Estado', value: article.statusLabel }] : []),
    { label: 'Publicado', value: article.date },
    { label: 'Lectura', value: article.readTime }
  ];

  const chips = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] font-bold uppercase tracking-widest">
      <span className={`rounded px-2.5 py-1 ${accent === 'rose' ? 'bg-rose-600 text-white' : 'bg-[#00ff88] text-zinc-950'}`}>{kindLabel(article)}</span>
      {immersive && article.statusLabel && <span className="text-zinc-300">{article.statusLabel}</span>}
      {!immersive && severity && <span className={`rounded border px-2 py-1 ${severity.cls}`}>{severity.label}</span>}
    </p>
  );

  return (
    <article className="mx-auto w-full max-w-6xl pb-24 animate-in fade-in duration-300">
      <ReadingProgress accent={accent} />

      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-mono font-bold text-slate-200 transition-colors hover:border-zinc-500 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Revista &amp; Leaks
        </button>
        <span className="hidden font-mono text-[11px] uppercase tracking-widest text-zinc-500 sm:block">{article.dossierCode || article.categoryLabel}</span>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-mono font-bold text-slate-200 transition-colors hover:border-zinc-500 hover:text-white cursor-pointer"
        >
          {copied ? <CheckCircle2 className="h-4 w-4 text-[#00ff88]" /> : <Share2 className="h-4 w-4" />}
          {copied ? 'Enlace copiado' : 'Compartir'}
        </button>
      </div>

      {/* Portada */}
      <header className="mt-6">
        {immersive ? (
          <>
            <figure className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              <img
                src={article.imageUrl}
                alt={article.fullBody ? 'Ilustración del expediente: carpeta, resoluciones y un mapa de relaciones sobre una mesa de trabajo' : `Portada: ${article.title}`}
                width={1376}
                height={768}
                decoding="async"
                fetchPriority="high"
                onError={onImgError}
                className="aspect-[16/10] w-full object-cover sm:aspect-[16/8]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 space-y-3 p-5 sm:p-10">
                {chips}
                <h1 className="max-w-4xl font-serif text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">{article.title}</h1>
              </figcaption>
            </figure>
            {article.fullBody && <p className="mt-2 text-[11px] italic leading-snug text-zinc-500">{AI_NOTE}</p>}
            {deck && <p className="mt-6 max-w-3xl font-serif text-xl leading-relaxed text-slate-200 sm:text-2xl">{deck}</p>}
          </>
        ) : (
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
            <div className="space-y-5">
              {chips}
              <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">{article.title}</h1>
              {deck && <p className="font-serif text-xl leading-relaxed text-slate-300 sm:text-[22px]">{deck}</p>}
            </div>
            <figure className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              <img
                src={article.imageUrl}
                alt={`Portada: ${article.title}`}
                width={1376}
                height={860}
                decoding="async"
                fetchPriority="high"
                onError={onImgError}
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>
          </div>
        )}

        {/* Firma */}
        <div className="mt-6 flex flex-col gap-4 border-y border-zinc-800 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-zinc-700 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/imagenes/monograma.png';
              }}
            />
            <div className="text-sm leading-tight">
              <p className="font-bold text-white">{article.author}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {article.authorRole}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {article.date} · <Clock className="mr-0.5 inline h-3 w-3 -translate-y-px" />
                {article.readTime}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAsk}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00ff88] px-5 py-2.5 text-sm font-black text-zinc-950 transition-colors hover:bg-[#2bff9d] cursor-pointer"
          >
            <Send className="h-4 w-4 -rotate-12" />
            Consultar con la redacción
          </button>
        </div>

        {article.classificationNotice && (
          <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 text-xs leading-relaxed text-zinc-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {article.classificationNotice}
          </p>
        )}
      </header>

      {/* Cuerpo + barra lateral */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          {showToc && <ArticleTocMobile items={tocItems} activeId={activeId} accent={accent} />}

          {hasSections ? (
            <ArticleBody blocks={article.content} stats={article.keyStats} sectionImages={article.sectionImages} aiNote={AI_NOTE} />
          ) : (
            <>
              <KeyPoints items={article.compromisedData} title={keyPointsTitle} accent={accent} />
              <ArticleProse blocks={article.content} accent={accent} />
            </>
          )}
        </div>

        <aside className="space-y-5">
          {sidebar ? (
            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
              <img
                src={sidebar.image}
                alt={sidebar.imageAlt}
                width={720}
                height={964}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <div className="space-y-3 p-5">
                <p className={`font-mono text-[11px] uppercase tracking-widest ${a.text}`}>Perfil</p>
                <div>
                  <h2 className="font-serif text-2xl font-black text-white">{sidebar.name}</h2>
                  <p className="mt-1 text-sm leading-snug text-zinc-400">{sidebar.role}</p>
                </div>
                <dl className="divide-y divide-zinc-800 border-t border-zinc-800 text-sm">
                  {sidebar.facts.map((f) => (
                    <div key={f.label} className="flex justify-between gap-4 py-2">
                      <dt className="text-zinc-500">{f.label}</dt>
                      <dd className="text-right font-semibold text-white">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                {sidebar.profileHref && (
                  <a
                    href={sidebar.profileHref}
                    className={`flex items-center justify-between rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-white transition-colors ${a.hoverBorder}`}
                  >
                    Ver ficha completa
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </section>
          ) : (
            <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className={`font-mono text-[11px] uppercase tracking-widest ${a.text}`}>Ficha</p>
              <dl className="divide-y divide-zinc-800 text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 py-2">
                    <dt className="text-zinc-500">{f.label}</dt>
                    <dd className="text-right font-semibold text-white">{f.value}</dd>
                  </div>
                ))}
                {article.affectedScope && (
                  <div className="space-y-1 py-2">
                    <dt className="text-zinc-500">Alcance</dt>
                    <dd className="font-semibold leading-snug text-white">{article.affectedScope}</dd>
                  </div>
                )}
              </dl>
              {!immersive && severity && (
                <p className={`inline-block rounded border px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest ${severity.cls}`}>{severity.label}</p>
              )}
            </section>
          )}

          {/* Esta parte acompaña al lector mientras baja por el artículo */}
          <div className="space-y-5 lg:sticky lg:top-32">
            {showToc && <ArticleToc items={tocItems} activeId={activeId} accent={accent} />}

            <section className="space-y-3 rounded-2xl border border-[#00ff88]/30 bg-zinc-900/50 p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#00ff88]">Únete</p>
              <h2 className="font-serif text-xl font-black leading-snug text-white">Los próximos expedientes salen primero en Telegram</h2>
              <p className="text-sm leading-relaxed text-zinc-400">¿Tienes información? Escríbenos con reserva de identidad.</p>
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#00ff88] px-4 py-3 text-sm font-black text-zinc-950 transition-colors hover:bg-[#2bff9d]"
              >
                <Send className="h-4 w-4 -rotate-12" />
                Unirme al canal
              </a>
              <button
                type="button"
                onClick={onAsk}
                className="w-full rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-zinc-500 cursor-pointer"
              >
                Aportar información
              </button>
            </section>
          </div>
        </aside>
      </div>

      {/* Videos del leak (archivos de Supabase Storage o de /public) */}
      {hasVideos && (
        <section id="videos" className="mt-14 scroll-mt-32" aria-label="Material audiovisual">
          <h2 className="mb-5 border-b border-zinc-800 pb-3 font-serif text-2xl font-black text-white">Material audiovisual</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {article.videos!.map((v) => (
              <figure key={v.src} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <video controls playsInline preload="metadata" poster={v.poster} className="aspect-video w-full bg-black">
                  <source src={v.src} />
                  Tu navegador no puede reproducir este video.
                </video>
                <figcaption className="space-y-1 p-4">
                  <p className="font-serif text-lg font-bold text-white">{v.title}</p>
                  {v.caption && <p className="text-sm leading-relaxed text-slate-300">{v.caption}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Archivo de evidencias (módulos interactivos del expediente) */}
      {children && (
        <section id="archivo" className="mt-14 scroll-mt-32" aria-label={archiveTitle}>
          <div className="mb-6 border-b border-zinc-800 pb-4">
            <p className={`font-mono text-[11px] uppercase tracking-widest ${a.text}`}>Material de investigación</p>
            <h2 className="mt-1 font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">{archiveTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{archiveIntro}</p>
          </div>
          {children}
        </section>
      )}

      {/* Preguntas abiertas */}
      {showQuestions && (
        <section id="preguntas" className="mt-14 scroll-mt-32 rounded-3xl border border-zinc-800 bg-[#0c0c0c] p-6 sm:p-10">
          <p className={`font-mono text-[11px] uppercase tracking-widest ${a.text}`}>Sin respuesta</p>
          <h2 className="mt-1 font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">Lo que todavía falta esclarecer</h2>
          <ol className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {article.openQuestions!.map((q, i) => (
              <li key={i} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className={`font-serif text-3xl font-black leading-none ${a.text}`}>{i + 1}</span>
                <p className="text-sm leading-relaxed text-slate-200">{q}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Etiquetas */}
      {article.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-zinc-500">Etiquetas:</span>
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ¿Tienes información? */}
      <section className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl border border-[#00ff88]/30 bg-gradient-to-r from-zinc-900/70 to-[#0c0c0c] p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#00ff88]">Asistencia técnica · investigación OSINT</p>
          <h2 className="font-serif text-2xl font-black leading-snug text-white">¿Tienes información o necesitas verificar algo de este artículo?</h2>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">Recibimos reportes con reserva de identidad.</p>
        </div>
        <button
          type="button"
          onClick={onAsk}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#00ff88] px-6 py-3 text-sm font-black text-zinc-950 transition-colors hover:bg-[#2bff9d] cursor-pointer"
        >
          <Send className="h-4 w-4 -rotate-12" />
          Contactar a @{article.authorTelegram}
        </button>
      </section>

      {/* Más de la revista */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 border-b border-zinc-800 pb-3 font-serif text-2xl font-black text-white">Más de la revista</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 text-left transition-colors hover:border-zinc-600 cursor-pointer"
              >
                <img src={r.imageUrl} alt="" loading="lazy" decoding="async" onError={onImgError} className="aspect-[16/9] w-full object-cover" />
                <div className="space-y-2 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-rose-400">{r.categoryLabel}</span>
                  <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-white group-hover:underline">{r.title}</h3>
                  <span className="text-xs text-zinc-500">{r.readTime}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
