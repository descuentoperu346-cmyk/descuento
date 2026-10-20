import React from 'react';
import { ArrowRight, Send, Users } from 'lucide-react';
import type { LeakArticle } from '../data/leaksData';

interface LeaksCoverProps {
  /** Leak destacado (el #02). Si no existe, la portada no se muestra. */
  article: LeakArticle | undefined;
  isExpired: boolean;
  onRead: () => void;
  onTogglePeople: () => void;
  peopleOpen: boolean;
}

const CHANNEL_URL = 'https://t.me/descuentosper2';
const SOURCES = ['Tribunal Constitucional', 'SMV', 'SEC', 'La República', 'OjoPúblico', 'IDL-Reporteros'];

/** Portada de la revista: una gran pregunta, tres cifras y lo que nadie ha podido responder. */
export const LeaksCover: React.FC<LeaksCoverProps> = ({ article, isExpired, onRead, onTogglePeople, peopleOpen }) => {
  if (!article) return null;
  const questions = article.openQuestions ?? [];
  const shown = questions.slice(0, 4);
  const extra = questions.length - shown.length;

  return (
    <section aria-label="Leak destacado" className="space-y-3">
      <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        <h1 className="font-bold text-zinc-300">Filtraciones, Brechas &amp; Ciberseguridad Perú</h1>
        <span className="hidden sm:inline">Revista digital · OSINT</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border border-zinc-800 bg-[#0c0c0c]">
        {/* Gancho */}
        <div className="lg:col-span-7 p-6 sm:p-9 lg:p-11 space-y-6 border-b lg:border-b-0 lg:border-r border-zinc-800">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-widest">
            <span className="rounded bg-rose-500 px-2.5 py-1 font-black text-white">
              Leak #02 · {isExpired ? 'Liberado' : 'Próximamente'}
            </span>
            <span className="text-zinc-400">{article.readTime}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">Caso archivado, sin condena</span>
          </div>

          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.02] tracking-tight text-white">
            <span className="text-rose-500">US$17,3 millones</span> atribuidos.
            <br />
            17 retiros en efectivo.
            <br />
            Cero condenas.
          </h2>

          <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
            El caso Cócteles terminó archivado. Entonces, <strong className="text-white">¿qué dicen realmente los documentos?</strong>{' '}
            Lo reconstruimos con la sentencia del TC, la SMV y reportajes con fuente, separando lo probado de lo acusado.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onRead}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3.5 text-sm sm:text-base font-black text-white transition-colors hover:bg-rose-400 cursor-pointer"
            >
              Leer el expediente
              <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00ff88]/60 px-6 py-3.5 text-sm sm:text-base font-bold text-[#00ff88] transition-colors hover:bg-[#00ff88]/10"
            >
              <Send className="h-4 w-4 -rotate-12" />
              Seguir la investigación en Telegram
            </a>
          </div>

          <p className="text-xs leading-relaxed text-zinc-500">
            <span className="font-mono uppercase tracking-wider text-zinc-400">Fuentes: </span>
            {SOURCES.join(' · ')}
          </p>
        </div>

        {/* Lo que nadie ha respondido */}
        <div className="lg:col-span-5 p-6 sm:p-9 lg:p-10 space-y-4 bg-[#101010]">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Lo que nadie ha podido responder</h3>
            <span className="shrink-0 font-mono text-xs font-bold text-rose-400">{questions.length} abiertas</span>
          </div>

          <ol className="space-y-2.5">
            {shown.map((q, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={onRead}
                  className="group flex w-full items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 text-left transition-colors hover:border-rose-500/60 cursor-pointer"
                >
                  <span className="mt-0.5 font-mono text-sm font-black text-rose-500 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="line-clamp-3 text-sm leading-relaxed text-slate-200 group-hover:text-white">{q}</span>
                </button>
              </li>
            ))}
          </ol>

          {extra > 0 && (
            <button
              type="button"
              onClick={onRead}
              className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              + {extra} preguntas más dentro del expediente →
            </button>
          )}

          <button
            type="button"
            onClick={onTogglePeople}
            aria-expanded={peopleOpen}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-zinc-500 cursor-pointer"
          >
            <Users className="h-4 w-4 text-zinc-400" />
            {peopleOpen ? 'Ocultar personas de interés' : 'Ver las personas de interés (9)'}
          </button>
        </div>
      </div>
    </section>
  );
};
