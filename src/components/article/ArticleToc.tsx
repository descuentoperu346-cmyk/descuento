import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ACCENTS, type Accent } from './accent';

export interface TocItem {
  id: string;
  label: string;
  /** Número del capítulo (opcional) */
  n?: number;
}

export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};

/** Devuelve el id de la sección que el lector está viendo. */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');
  useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        });
        if (visible.size) {
          const [first] = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
          setActive(first);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

interface TocProps {
  items: TocItem[];
  activeId: string | null;
  accent: Accent;
}

const List: React.FC<TocProps> = ({ items, activeId, accent }) => {
  const a = ACCENTS[accent];
  return (
    <ol className="space-y-0.5">
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(it.id);
              }}
              aria-current={active ? 'true' : undefined}
              className={`flex items-baseline gap-2.5 rounded-lg border-l-2 px-3 py-1.5 text-[13px] leading-snug transition-colors ${
                active ? `${a.activeBorder} bg-white/5 font-bold text-white` : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {it.n !== undefined && <span className={`font-mono text-[11px] ${active ? a.text : 'text-zinc-600'}`}>{String(it.n).padStart(2, '0')}</span>}
              <span>{it.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
};

/** Índice fijo en la columna lateral (escritorio). */
export const ArticleToc: React.FC<TocProps> = (props) => (
  <nav aria-label="En este artículo" className="hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:block">
    <p className="mb-2 px-3 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-500">En este artículo</p>
    <List {...props} />
  </nav>
);

/** Índice plegable al comienzo del artículo (móvil y tableta). */
export const ArticleTocMobile: React.FC<TocProps> = (props) => (
  <details className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 lg:hidden">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-300">
      En este artículo
      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
    </summary>
    <div className="border-t border-zinc-800 p-3">
      <List {...props} />
    </div>
  </details>
);
