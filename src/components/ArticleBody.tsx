import React, { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export interface ArticleStat {
  value: string;
  label: string;
}

export interface SectionImage {
  src: string;
  alt: string;
  caption: string;
}

interface ArticleBodyProps {
  blocks: string[];
  stats?: ArticleStat[];
  /** Imagen de la sección, indexada por el texto exacto del subtítulo */
  sectionImages?: Record<string, SectionImage>;
  /** Aviso que se muestra bajo cada ilustración */
  aiNote?: string;
}

interface Section {
  id: string;
  title: string;
  /** Resumen de una o dos frases (línea "?? "). Sin resumen, la sección va siempre abierta. */
  summary?: string;
  blocks: string[];
  words: number;
}

const WORDS_PER_MIN = 200;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const countWords = (s: string) => s.split(/\s+/).filter(Boolean).length;
const minutes = (words: number) => Math.max(1, Math.round(words / WORDS_PER_MIN));

/** Separa "Etiqueta: texto" solo si la etiqueta es corta (evita partir frases largas). */
const splitLabel = (text: string): [string, string] | null => {
  const idx = text.indexOf(': ');
  if (idx < 1 || idx > 70) return null;
  return [text.slice(0, idx), text.slice(idx + 2)];
};

const isMoney = (value: string) => /^((US\$|S\/)\s?[\d.,]+|[\d.,]+\.?$)/.test(value) && value.length <= 110;

const buildSections = (blocks: string[]): Section[] => {
  const sections: Section[] = [];
  let current: Section | null = null;
  blocks.forEach((b) => {
    if (b.startsWith('## ')) {
      const title = b.slice(3);
      current = { id: `sec-${slugify(title)}`, title, blocks: [], words: 0 };
      sections.push(current);
    } else if (current) {
      if (b.startsWith('?? ')) {
        current.summary = b.slice(3);
      } else {
        current.blocks.push(b);
        current.words += countWords(b);
      }
    }
  });
  return sections;
};

type Mode = 'cards' | 'timeline' | 'default';

/** Tablas largas (p. ej. 17 retiros) se pliegan para no alargar la página. */
const LONG_LEDGER = 8;

const renderList = (items: string[], mode: Mode, key: string) => {
  if (mode === 'cards') {
    return (
      <ul key={key} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((t, i) => {
          const parts = splitLabel(t);
          return (
            <li key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              {parts && <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-rose-400">{parts[0]}</p>}
              <p className="text-sm leading-relaxed text-slate-200">
                {parts ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : t}
              </p>
            </li>
          );
        })}
      </ul>
    );
  }

  if (mode === 'timeline') {
    return (
      <ol key={key} className="relative ml-2 space-y-4 border-l border-zinc-700">
        {items.map((t, i) => {
          const parts = splitLabel(t);
          return (
            <li key={i} className="relative pl-5">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-[#070707]" />
              {parts && <p className="font-mono text-[11px] font-bold text-rose-300">{parts[0]}</p>}
              <p className="text-sm leading-relaxed text-slate-300">{parts ? parts[1] : t}</p>
            </li>
          );
        })}
      </ol>
    );
  }

  const ledger = items.every((t) => {
    const p = splitLabel(t);
    return p !== null && isMoney(p[1]);
  });

  if (ledger) {
    const rows = (
      <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
        {items.map((t, i) => {
          const p = splitLabel(t)!;
          return (
            <li key={i} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
              <span className="text-sm text-slate-300">{p[0]}</span>
              <span className="min-w-0 break-words text-right font-mono text-sm font-bold tabular-nums text-white">{p[1].replace(/\.$/, '')}</span>
            </li>
          );
        })}
      </ul>
    );
    if (items.length <= LONG_LEDGER) return <div key={key}>{rows}</div>;
    return (
      <details key={key} className="group rounded-xl border border-zinc-800 bg-zinc-900/30">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-white">
          <span>Ver la tabla completa ({items.length} filas)</span>
          <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="px-3 pb-3">{rows}</div>
      </details>
    );
  }

  return (
    <ul key={key} className="space-y-2.5">
      {items.map((t, i) => {
        const parts = splitLabel(t);
        return (
          <li key={i} className="flex gap-3 font-serif text-[17px] leading-relaxed text-slate-300">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" aria-hidden="true" />
            <span>
              {parts ? <strong className="font-sans text-[15px] font-bold text-white">{parts[0]}: </strong> : null}
              {parts ? parts[1] : t}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

const renderBlocks = (blocks: string[], mode: Mode) => {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (k: number) => {
    if (list.length) {
      out.push(<React.Fragment key={`l-${k}`}>{renderList(list, mode, `l-${k}`)}</React.Fragment>);
      list = [];
    }
  };

  blocks.forEach((b, i) => {
    if (b.startsWith('- ')) {
      list.push(b.slice(2));
      return;
    }
    flush(i);
    if (b.startsWith('!! ')) {
      out.push(
        <p
          key={i}
          className="flex gap-3 rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-sm leading-relaxed text-amber-100 sm:text-[15px]"
        >
          <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span>{b.slice(3)}</span>
        </p>
      );
    } else if (b.startsWith('>> ')) {
      out.push(
        <blockquote key={i} className="my-2 border-l-4 border-rose-500 py-1 pl-5 sm:pl-7">
          <p className="font-serif text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl">{b.slice(3)}</p>
        </blockquote>
      );
    } else {
      out.push(
        <p key={i} className="font-serif text-[17px] leading-[1.8] text-slate-300 sm:text-[19px]">
          {b}
        </p>
      );
    }
  });
  flush(blocks.length);
  return out;
};

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};

/**
 * Cuerpo de un leak largo, en dos capas: primero "Lo esencial" y un resumen de cada capítulo;
 * el detalle completo se abre solo cuando el lector lo pide.
 */
export const ArticleBody: React.FC<ArticleBodyProps> = ({ blocks, stats, sectionImages, aiNote }) => {
  const sections = useMemo(() => buildSections(blocks), [blocks]);
  const collapsible = useMemo(() => sections.filter((s) => s.summary), [sections]);
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const essential = sections.filter((s) => !s.summary);
  const summaryWords = useMemo(
    () => essential.reduce((n, s) => n + s.words, 0) + collapsible.reduce((n, s) => n + countWords(s.summary ?? ''), 0),
    [essential, collapsible]
  );
  const totalWords = useMemo(() => sections.reduce((n, s) => n + s.words + countWords(s.summary ?? ''), 0), [sections]);

  const allOpen = collapsible.length > 0 && open.size === collapsible.length;

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const closeSection = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    requestAnimationFrame(() => scrollToId(id));
  }, []);

  const openAll = () => setOpen(new Set(collapsible.map((s) => s.id)));
  const closeAll = () => setOpen(new Set());

  const modeBtn = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-mono font-bold transition-colors cursor-pointer ${
      active ? 'bg-white text-zinc-950' : 'text-zinc-300 hover:text-white'
    }`;

  return (
    <div className="space-y-10">
      {stats && stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/70 to-zinc-950 p-4">
              <dd className="font-serif text-2xl font-black leading-none tracking-tight text-white sm:text-3xl">{s.value}</dd>
              <dt className="mt-2 font-mono text-[11px] uppercase leading-snug tracking-wider text-zinc-400">{s.label}</dt>
            </div>
          ))}
        </dl>
      )}

      {/* Lo esencial: siempre visible */}
      {essential.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-24 space-y-5">
          <h3 className="flex items-baseline gap-3 border-b border-zinc-800 pb-3 font-serif text-2xl font-black tracking-tight text-white sm:text-[28px]">
            <span className="font-mono text-sm font-bold text-rose-400">{minutes(s.words)} min</span>
            <span>{s.title}</span>
          </h3>
          {renderBlocks(s.blocks, 'cards')}
        </section>
      ))}

      {collapsible.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-rose-400">El expediente por capítulos</p>
              <p className="mt-1 max-w-md text-sm leading-snug text-zinc-400">
                Cada capítulo empieza con su idea central. Abre solo los que te interesen.
              </p>
            </div>
            <div role="group" aria-label="Modo de lectura" className="inline-flex shrink-0 rounded-full border border-zinc-700 p-1">
              <button type="button" aria-pressed={!allOpen} onClick={closeAll} className={modeBtn(!allOpen)}>
                Resumen · {minutes(summaryWords)} min
              </button>
              <button type="button" aria-pressed={allOpen} onClick={openAll} className={modeBtn(allOpen)}>
                Completo · {minutes(totalWords)} min
              </button>
            </div>
          </div>

          <ol className="space-y-4">
            {collapsible.map((s, i) => {
              const img = sectionImages?.[s.title];
              const isOpen = open.has(s.id);
              const bodyId = `${s.id}-detalle`;
              const mode: Mode = /cronolog/i.test(s.title) ? 'timeline' : 'default';
              return (
                <li key={s.id} id={s.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
                  <div className={`grid grid-cols-1 gap-0 ${img ? 'sm:grid-cols-[minmax(0,1fr)_220px]' : ''}`}>
                    <div className="order-2 flex min-w-0 flex-col gap-3 p-5 sm:order-1 sm:p-6">
                      <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                        <span className="font-bold text-rose-400">{String(i + 1).padStart(2, '0')}</span>
                        <span className="mx-2 text-zinc-700">/</span>
                        {minutes(s.words)} min de detalle
                      </p>
                      <h4 className="font-serif text-xl font-black leading-snug tracking-tight text-white sm:text-2xl">{s.title}</h4>
                      <p className="text-[15px] leading-relaxed text-slate-300">{s.summary}</p>
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        aria-expanded={isOpen}
                        aria-controls={bodyId}
                        className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-mono font-bold text-white transition-colors hover:border-rose-400 cursor-pointer"
                      >
                        {isOpen ? 'Ocultar el detalle' : 'Leer el detalle'}
                        {isOpen ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                    {img && (
                      <figure className="relative order-1 h-36 sm:order-2 sm:h-auto">
                        <img
                          src={img.src}
                          alt={img.alt}
                          width={1376}
                          height={768}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        <figcaption className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-rose-300">
                          Ilustración referencial · IA
                        </figcaption>
                      </figure>
                    )}
                  </div>

                  {isOpen && (
                    <div id={bodyId} className="space-y-5 border-t border-zinc-800 bg-[#0a0a0a] p-5 sm:p-8">
                      {img && (
                        <p className="text-[12px] italic leading-snug text-zinc-500">
                          {img.caption} {aiNote}
                        </p>
                      )}
                      {renderBlocks(s.blocks, mode)}
                      <button
                        type="button"
                        onClick={() => closeSection(s.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-mono font-bold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white cursor-pointer"
                      >
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        Cerrar este capítulo
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};
