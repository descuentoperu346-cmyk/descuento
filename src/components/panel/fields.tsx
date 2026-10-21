import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export const inputCls =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:border-emerald-400/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/30 disabled:opacity-50 aria-[invalid=true]:border-rose-400/70';

/** Interruptor accesible (Publicado/Oculto, Activo/Inactivo…). El texto de `label` es lo que anuncia el lector de pantalla. */
export const Switch: React.FC<{ checked: boolean; label: string; onChange: () => void; disabled?: boolean }> = ({ checked, label, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'border-emerald-400/60 bg-[#00ff88]' : 'border-zinc-600 bg-zinc-800'
    }`}
  >
    <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${checked ? 'translate-x-[18px] bg-zinc-950' : 'translate-x-[3px] bg-zinc-300'}`} />
  </button>
);

/** Sección plegable: el título y un resumen siempre se ven; el contenido solo al abrirla. Sigue en el DOM cuando está cerrada. */
export const Disclosure: React.FC<{ id: string; title: string; summary?: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({ id, title, summary, open, onToggle, children }) => (
  <section className="rounded-xl border border-zinc-800/80 bg-[#101013]">
    <h2 className="text-base font-semibold text-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-xl px-5 py-3.5 text-left hover:bg-zinc-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
      >
        <span className="min-w-0 flex-1">
          <span className="block">{title}</span>
          {summary && <span className="mt-0.5 block truncate text-xs font-normal text-zinc-400">{summary}</span>}
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </h2>
    <div id={`${id}-panel`} hidden={!open} className="space-y-4 border-t border-zinc-800 p-5">
      {children}
    </div>
  </section>
);

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Recibe los atributos de accesibilidad que debe llevar el control */
  children: (a: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean }) => React.ReactNode;
}

/** Etiqueta + control + ayuda/error, con los atributos de accesibilidad ya conectados. */
export const Field: React.FC<FieldProps> = ({ label, hint, error, required, className = '', children }) => {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-zinc-200">
        {label}
        {required && (
          <span className="text-emerald-300" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined })}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-rose-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
