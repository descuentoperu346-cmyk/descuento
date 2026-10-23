import React from 'react';
import { ShieldCheck } from 'lucide-react';

/** Correo de contacto que aparece en la política de privacidad y en los términos. */
export const CONTACT_EMAIL = 'descuentosperu346@gmail.com';

/** Un bloque de texto: un párrafo (string), una lista con viñetas (string[]) o contenido ya armado (elemento). */
export type LegalBlock = string | string[] | React.ReactElement;

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

const linkClass = 'font-semibold text-[#00ff88] hover:underline';

// Correos y la web de la autoridad se vuelven enlaces; el resto del texto se muestra tal cual
const TOKEN_RE = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+|www\.minjus\.gob\.pe)/g;

/** Convierte los correos y la web de la autoridad en enlaces. */
export function linkify(text: string): React.ReactNode[] {
  return text.split(TOKEN_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    return part.includes('@') ? (
      <a key={i} href={`mailto:${part}`} className={linkClass}>
        {part}
      </a>
    ) : (
      <a key={i} href={`https://${part}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {part}
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
    );
  });
}

/** Enlace a otra página de la web: con dirección real (/privacidad, /terminos) y sin recargar al pulsarlo. */
export const LegalLink: React.FC<{ href: string; onNavigate: () => void; children: React.ReactNode }> = ({ href, onNavigate, children }) => (
  <a
    href={href}
    onClick={(e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // abrir en otra pestaña funciona normal
      e.preventDefault();
      onNavigate();
    }}
    className={linkClass}
  >
    {children}
  </a>
);

interface LegalDocumentProps {
  title: string;
  /** Fecha de la última actualización, p. ej. "22 de octubre de 2026". */
  updated: string;
  contactEmail: string;
  sections: LegalSection[];
  onNavigateToContact: () => void;
  /** Enlace a la otra página legal (en privacidad apunta a los términos y al revés). */
  related: { href: string; label: string; onNavigate: () => void };
}

/** Página de un documento legal (política de privacidad, términos y condiciones). */
export const LegalDocument: React.FC<LegalDocumentProps> = ({ title, updated, contactEmail, sections, onNavigateToContact, related }) => (
  <article className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-300">
    <header className="space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#00ff88]">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Descuentos Perú
      </div>
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
      <dl className="space-y-1 text-sm text-slate-300">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-white">Sitio web:</dt>
          <dd>descuentos-peru.vercel.app</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-white">Correo de contacto:</dt>
          <dd>{linkify(contactEmail)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-white">Última actualización:</dt>
          <dd>{updated}</dd>
        </div>
      </dl>
    </header>

    {sections.map((s) => (
      <section key={s.title} className="space-y-2">
        <h2 className="text-lg font-bold text-white">{s.title}</h2>
        <div className="space-y-2 text-sm leading-relaxed text-slate-300">
          {s.blocks.map((b, i) =>
            typeof b === 'string' ? (
              <p key={i}>{linkify(b)}</p>
            ) : Array.isArray(b) ? (
              <ul key={i} className="list-disc space-y-1.5 pl-5">
                {b.map((item) => (
                  <li key={item}>{linkify(item)}</li>
                ))}
              </ul>
            ) : (
              React.cloneElement(b, { key: i })
            )
          )}
        </div>
      </section>
    ))}

    <p className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-800 pt-6 text-sm text-slate-300">
      <span>
        ¿Dudas?{' '}
        <button type="button" onClick={onNavigateToContact} className="cursor-pointer font-semibold text-[#00ff88] hover:underline">
          Ir a Contacto
        </button>
      </span>
      <LegalLink href={related.href} onNavigate={related.onNavigate}>
        {related.label}
      </LegalLink>
    </p>
  </article>
);
