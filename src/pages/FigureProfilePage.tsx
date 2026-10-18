import React from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Send, AlertTriangle, ShieldCheck, CalendarClock, Scale, Lock } from 'lucide-react';
import { CONGRESO_FIGURES } from '../components/UpcomingLeakCountdownBanner';
import { FIGURE_PROFILES, CASE_STATUS_META, getFigureBadge, PREVIEW_CASE_COUNT } from '../data/figureProfiles';
import { useLeakCountdown, LEAK_DEADLINE_LABEL } from '../hooks/useLeakCountdown';

interface FigureProfilePageProps {
  figureId: string;
}

const TONE_CLASSES: Record<'red' | 'amber' | 'green' | 'zinc', string> = {
  red: 'bg-rose-500/15 text-rose-300 border-rose-500/50',
  amber: 'bg-amber-400/15 text-amber-300 border-amber-400/50',
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50',
  zinc: 'bg-zinc-700/40 text-zinc-300 border-zinc-600'
};

/** Perfil completo de una figura del expediente: página propia en #/leaks/figura/<id> */
export const FigureProfilePage: React.FC<FigureProfilePageProps> = ({ figureId }) => {
  const { isExpired } = useLeakCountdown();
  const idx = CONGRESO_FIGURES.findIndex((f) => f.id === figureId);
  const fig = idx >= 0 ? CONGRESO_FIGURES[idx] : null;

  if (!fig) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-xl font-black text-white">No encontramos esa ficha</h1>
        <a href="#/leaks" className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold text-zinc-950 bg-[#00ff88]">
          Volver a Leaks
        </a>
      </div>
    );
  }

  const profile = FIGURE_PROFILES[fig.id];
  const badge = getFigureBadge(fig.id);
  const prev = CONGRESO_FIGURES[(idx - 1 + CONGRESO_FIGURES.length) % CONGRESO_FIGURES.length];
  const next = CONGRESO_FIGURES[(idx + 1) % CONGRESO_FIGURES.length];

  // La figura destacada muestra solo un adelanto hasta que cierra el contador
  const gated = !!fig.featured && !isExpired && !!profile;
  const visibleCases = profile ? (gated ? profile.cases.slice(0, PREVIEW_CASE_COUNT) : profile.cases) : [];
  const hiddenCases = profile ? profile.cases.length - visibleCases.length : 0;

  return (
    <article className="space-y-8">
      <a
        href="#/leaks"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al expediente
      </a>

      {/* Cabecera */}
      <header className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-4 sm:p-7 flex flex-col sm:flex-row gap-5 sm:gap-8">
        <img
          src={fig.imageUrl}
          alt={fig.name}
          width={176}
          height={224}
          className="w-36 h-44 sm:w-44 sm:h-56 rounded-2xl object-cover shrink-0 mx-auto sm:mx-0 border border-zinc-700"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.onerror = null;
            t.src = '/imagenes/monograma.png';
          }}
        />
        <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
          <p className="font-mono text-[11px] tracking-widest uppercase text-rose-400">
            {fig.code} · {fig.tag}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{fig.name}</h1>
          {profile && <p className="text-sm sm:text-base text-zinc-300">{profile.headline}</p>}
          {badge && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold ${TONE_CLASSES[badge.tone]}`}>
              <Scale className="w-3.5 h-3.5" />
              {badge.label}
            </span>
          )}
          <p className="text-sm text-zinc-400 leading-relaxed">{profile ? profile.summary : fig.role}</p>
          <div className="pt-1">
            <a
              href="https://t.me/Tin9o"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors"
            >
              <Send className="w-4 h-4 -rotate-12" />
              Pide más información (@Tin9o)
            </a>
          </div>
        </div>
      </header>

      {/* Datos clave y cronología */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <section className="lg:col-span-2 space-y-3">
            <p className="section-eyebrow">Datos clave</p>
            <dl className="rounded-xl border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800">
              {profile.facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-0.5 px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{f.label}</dt>
                  <dd className="text-sm font-semibold text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
            <a
              href={profile.bioSource.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white"
            >
              <ExternalLink className="w-3 h-3" />
              {profile.bioSource.title}
            </a>
          </section>

          <section className="lg:col-span-3 space-y-3">
            <p className="section-eyebrow">Cronología</p>
            <ol className="relative border-l border-zinc-700 ml-2 space-y-5">
              {profile.timeline.map((t) => (
                <li key={t.date + t.text} className="pl-5 relative">
                  <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-[#07090a]" />
                  <p className="font-mono text-[11px] font-bold text-rose-300">{t.date}</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{t.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}

      {/* Historial */}
      {profile ? (
        <section className="space-y-4">
          <p className="section-eyebrow">{gated ? 'Adelanto del historial' : 'Historial y casos'}</p>
          {gated && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/5 p-3 text-sm text-amber-200">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              Se revelará información sobre sus casos más polémicos. Esto es un pequeño vistazo: el resto permanece oculto hasta el cierre del contador ({LEAK_DEADLINE_LABEL}).
            </p>
          )}
          <ol className="space-y-4">
            {visibleCases.map((c) => {
              const meta = CASE_STATUS_META[c.status];
              return (
                <li key={c.name} className="hud-card rounded-xl bg-zinc-900/50 p-4 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-mono font-bold uppercase tracking-wide ${TONE_CLASSES[meta.tone]}`}>
                      {meta.label}
                    </span>
                    {c.period && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                        <CalendarClock className="w-3.5 h-3.5" />
                        {c.period}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">{c.name}</h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">{c.summary}</p>
                  <ul className="flex flex-wrap gap-2 pt-1">
                    {c.sources.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-500 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
            {Array.from({ length: hiddenCases }).map((_, i) => (
              <li key={`locked-${i}`} className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-4 sm:p-5 flex items-center gap-3">
                <Lock className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="flex-1 space-y-2" aria-hidden="true">
                  <span className="block h-3 w-2/3 rounded bg-zinc-700/60" />
                  <span className="block h-2.5 w-full rounded bg-zinc-800" />
                </span>
                <span className="shrink-0 text-[11px] font-mono uppercase text-zinc-500">Caso reservado</span>
              </li>
            ))}
          </ol>

          {!gated && profile.unverifiedClaims && profile.unverifiedClaims.length > 0 && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 sm:p-5 space-y-2">
              <p className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                Señalamientos de este expediente sin fuente enlazada
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-300">
                {profile.unverifiedClaims.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
          <p className="section-eyebrow">Entrada del expediente</p>
          <p className="text-sm text-zinc-300">{fig.role}</p>
          <p className="text-sm text-zinc-400">{fig.notes}</p>
          <p className="text-xs font-mono text-zinc-500">
            Esta entrada es institucional: no identifica a una persona concreta ni incluye historial individual.
          </p>
        </section>
      )}

      {/* Aviso */}
      <p className="flex items-start gap-2 text-xs text-zinc-500 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        Esta ficha recopila información pública con fuente enlazada. Una investigación o denuncia no equivale a una condena y rige la
        presunción de inocencia. Si detectas un dato desactualizado o incorrecto, escríbenos por Telegram para corregirlo. Última verificación: octubre de 2026.
      </p>

      {/* Navegación entre fichas */}
      <nav className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800" aria-label="Otras fichas">
        <a href={`#/leaks/figura/${prev.id}`} className="group flex items-center gap-2 p-3 rounded-lg hover:bg-zinc-900 transition-colors text-left">
          <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0" />
          <span className="min-w-0">
            <span className="block text-[10px] font-mono uppercase text-zinc-500">Anterior</span>
            <span className="block text-sm font-bold text-white truncate">{prev.name}</span>
          </span>
        </a>
        <a href={`#/leaks/figura/${next.id}`} className="group flex items-center justify-end gap-2 p-3 rounded-lg hover:bg-zinc-900 transition-colors text-right">
          <span className="min-w-0">
            <span className="block text-[10px] font-mono uppercase text-zinc-500">Siguiente</span>
            <span className="block text-sm font-bold text-white truncate">{next.name}</span>
          </span>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0" />
        </a>
      </nav>
    </article>
  );
};
