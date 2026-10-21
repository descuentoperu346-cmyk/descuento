import React, { useMemo } from 'react';
import { AlertTriangle, Check, Lightbulb } from 'lucide-react';
import { parseLevels, parseProse } from './proseParser';
import { ACCENTS, type Accent } from './accent';

const BODY_P = 'font-serif text-[17px] leading-[1.8] text-slate-300 sm:text-[19px]';

interface ProseProps {
  blocks: string[];
  accent: Accent;
}

/** Cuerpo de una guía o análisis corto: entradilla, pasos numerados, avisos y listas de comprobación. */
export const ArticleProse: React.FC<ProseProps> = ({ blocks, accent }) => {
  const nodes = useMemo(() => parseProse(blocks), [blocks]);
  const a = ACCENTS[accent];

  return (
    <div className="space-y-8">
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'lead':
            return (
              <p key={i} className="font-serif text-xl leading-[1.65] text-white sm:text-2xl">
                {node.text}
              </p>
            );

          case 'p':
            return (
              <p key={i} className={BODY_P}>
                {node.text}
              </p>
            );

          case 'steps':
            return (
              <ol key={i} className="relative space-y-4" aria-label="Pasos a seguir">
                <span aria-hidden="true" className="absolute bottom-6 left-[19px] top-6 w-px bg-zinc-800" />
                {node.items.map((s) => (
                  <li key={s.n} className="relative flex gap-4">
                    <span
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${a.bg} font-mono text-sm font-black text-zinc-950 ring-4 ring-[#070707]`}
                    >
                      {s.n}
                    </span>
                    <div className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
                      <p className={`font-mono text-[11px] uppercase tracking-widest ${a.text}`}>Paso {s.n}</p>
                      {s.body ? (
                        <>
                          <h2 className="mt-1 font-serif text-xl font-black leading-snug text-white">{s.title}</h2>
                          <p className="mt-2 text-[15px] leading-relaxed text-slate-300">{s.body}</p>
                        </>
                      ) : (
                        <p className="mt-1.5 text-[17px] font-semibold leading-snug text-white">{s.title}.</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            );

          case 'callout':
            return (
              <aside key={i} className={`flex gap-4 rounded-2xl border ${a.border} ${a.soft} p-5 sm:p-6`}>
                <Lightbulb className={`mt-1 h-5 w-5 shrink-0 ${a.text}`} aria-hidden="true" />
                <div>
                  <p className={`font-mono text-[11px] font-bold uppercase tracking-widest ${a.text}`}>{node.label}</p>
                  <p className="mt-1 font-serif text-lg leading-relaxed text-white sm:text-xl">{node.text}</p>
                </div>
              </aside>
            );

          case 'checklist':
            return (
              <section key={i} className="space-y-4">
                {node.intro && <h2 className="font-serif text-2xl font-black leading-snug tracking-tight text-white">{node.intro}</h2>}
                <ol className="space-y-3">
                  {node.items.map((it, k) => (
                    <li key={k} className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${a.soft} font-mono text-xs font-black ${a.text}`}>{k + 1}</span>
                      <p className="text-[15px] leading-relaxed text-slate-200">{it}</p>
                    </li>
                  ))}
                </ol>
              </section>
            );
        }
      })}
    </div>
  );
};

const LEVEL_STYLES: Record<number, { bar: string; chip: string }> = {
  1: { bar: 'bg-emerald-400', chip: 'bg-emerald-400/15 text-emerald-300' },
  2: { bar: 'bg-yellow-400', chip: 'bg-yellow-400/15 text-yellow-300' },
  3: { bar: 'bg-orange-400', chip: 'bg-orange-400/15 text-orange-300' },
  4: { bar: 'bg-rose-500', chip: 'bg-rose-500/15 text-rose-300' }
};

interface KeyPointsProps {
  items: string[];
  title: string;
  accent: Accent;
}

/** Recuadro "Puntos clave": lista de comprobación, o escala de niveles si los datos vienen como "Nivel 1: …". */
export const KeyPoints: React.FC<KeyPointsProps> = ({ items, title, accent }) => {
  const levels = useMemo(() => parseLevels(items), [items]);
  const a = ACCENTS[accent];
  if (items.length === 0) return null;

  if (levels) {
    return (
      <section aria-label="Escala de exposición" className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <p className={`font-mono text-[11px] font-bold uppercase tracking-widest ${a.text}`}>Escala de exposición</p>
        <ol className="mt-4 space-y-3">
          {levels.map((l) => {
            const s = LEVEL_STYLES[Math.min(4, Math.max(1, l.level))];
            return (
              <li key={l.level} className="flex items-stretch gap-3">
                <span className={`w-1.5 shrink-0 rounded-full ${s.bar}`} aria-hidden="true" />
                <div className="min-w-0">
                  <span className={`inline-block rounded-md px-2 py-0.5 font-mono text-[11px] font-black uppercase tracking-wider ${s.chip}`}>Nivel {l.level}</span>
                  <p className="mt-1 text-[15px] leading-snug text-slate-200">{l.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  return (
    <section aria-label={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
      <p className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest ${a.text}`}>
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-[15px] leading-snug text-slate-200">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${a.text}`} aria-hidden="true" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
