import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Send, Share2, ShieldCheck } from 'lucide-react';
import type { LeakArticle } from '../data/leaksData';
import { ArticleBody } from './ArticleBody';

interface MagazineArticleProps {
  article: LeakArticle;
  related: LeakArticle[];
  copied: boolean;
  authorAvatar: string;
  onBack: () => void;
  onShare: () => void;
  onAsk: () => void;
  onSelect: (a: LeakArticle) => void;
}

const CHANNEL_URL = 'https://t.me/descuentosper2';
const AI_NOTE = 'Ilustración referencial generada con IA. Los textos, nombres, cifras y fechas que aparecen en la imagen no corresponden a documentos reales.';

/** Barra fina de progreso de lectura, fija arriba. */
const ReadingProgress: React.FC = () => {
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
      <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
    </div>
  );
};

export const MagazineArticle: React.FC<MagazineArticleProps> = ({
  article,
  related,
  copied,
  authorAvatar,
  onBack,
  onShare,
  onAsk,
  onSelect
}) => {
  const sidebar = article.sidebar;

  return (
    <article className="mx-auto w-full max-w-6xl pb-24 animate-in fade-in duration-300">
      <ReadingProgress />

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
        <span className="hidden font-mono text-[11px] uppercase tracking-widest text-zinc-500 sm:block">{article.dossierCode}</span>
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
        <figure className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-black">
          <img
            src={article.imageUrl}
            alt="Ilustración del expediente: carpeta, resoluciones y un mapa de relaciones sobre una mesa de trabajo"
            width={1376}
            height={768}
            decoding="async"
            fetchPriority="high"
            className="aspect-[16/10] w-full object-cover sm:aspect-[16/8]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
            <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-bold uppercase tracking-widest">
              <span className="rounded bg-rose-500 px-2.5 py-1 text-white">Leak #02 · Expediente</span>
              <span className="text-zinc-300">Caso archivado · sin condena</span>
            </p>
            <h1 className="max-w-4xl font-serif text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {article.title}
            </h1>
          </figcaption>
        </figure>
        <p className="mt-2 text-[11px] italic leading-snug text-zinc-500">{AI_NOTE}</p>

        {article.subtitle && (
          <p className="mt-6 max-w-3xl font-serif text-xl leading-relaxed text-slate-200 sm:text-2xl">{article.subtitle}</p>
        )}

        {/* Firma */}
        <div className="mt-6 flex flex-col gap-4 border-y border-zinc-800 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={authorAvatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-zinc-700 object-cover" />
            <div className="text-sm leading-tight">
              <p className="font-bold text-white">{article.author}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
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
        <div className="min-w-0">
          <ArticleBody blocks={article.content} stats={article.keyStats} sectionImages={article.sectionImages} aiNote={AI_NOTE} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {sidebar && (
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
                <p className="font-mono text-[11px] uppercase tracking-widest text-rose-400">Perfil</p>
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
                    className="flex items-center justify-between rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-rose-400"
                  >
                    Ver ficha completa
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </section>
          )}

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
        </aside>
      </div>

      {/* Videos del leak (archivos de Supabase Storage o de /public) */}
      {article.videos && article.videos.length > 0 && (
        <section className="mt-14" aria-label="Material audiovisual">
          <h2 className="mb-5 border-b border-zinc-800 pb-3 font-serif text-2xl font-black text-white">Material audiovisual</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {article.videos.map((v) => (
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

      {/* Preguntas abiertas */}
      {article.openQuestions && article.openQuestions.length > 0 && (
        <section className="mt-14 rounded-3xl border border-zinc-800 bg-[#0c0c0c] p-6 sm:p-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-rose-400">Sin respuesta</p>
          <h2 className="mt-1 font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">Lo que todavía falta esclarecer</h2>
          <ol className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {article.openQuestions.map((q, i) => (
              <li key={i} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className="font-serif text-3xl font-black leading-none text-rose-500">{i + 1}</span>
                <p className="text-sm leading-relaxed text-slate-200">{q}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

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
                <img src={r.imageUrl} alt="" loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />
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
