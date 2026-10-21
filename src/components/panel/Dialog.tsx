import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Si es false no se cierra con Esc ni al pulsar fuera (p. ej. mientras se guarda) */
  dismissible?: boolean;
}

interface ConfirmProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Pregunta de confirmación antes de una acción que no se puede deshacer fácilmente. */
export const ConfirmDialog: React.FC<ConfirmProps> = ({ open, title, message, confirmLabel, danger, busy, error, onConfirm, onCancel }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    dismissible={!busy}
    title={title}
    footer={
      <>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          data-autofocus
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-[13px] font-semibold text-zinc-100 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-emerald-300 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
            danger ? 'bg-rose-700 text-white hover:bg-rose-600 focus-visible:outline-rose-200' : 'bg-[#00ff88] text-zinc-950 hover:bg-[#00e676] focus-visible:outline-emerald-200'
          }`}
        >
          {busy ? 'Un momento…' : confirmLabel}
        </button>
      </>
    }
  >
    <div className="space-y-3 text-sm text-zinc-300">
      <div>{message}</div>
      {error && (
        <p role="alert" className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-200">
          {error}
        </p>
      )}
    </div>
  </Dialog>
);

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const WIDTH = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

/** Ventana emergente accesible: el foco queda dentro, Esc la cierra y al cerrar el foco vuelve a donde estaba. */
export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, description, size = 'md', children, footer, dismissible = true }) => {
  const ref = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    returnRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // El foco entra en el primer campo (o en la ventana si no hay campos)
    requestAnimationFrame(() => {
      const first = ref.current?.querySelector<HTMLElement>('[data-autofocus], input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
      (first || ref.current)?.focus();
    });
    return () => {
      document.body.style.overflow = prevOverflow;
      returnRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && dismissible) {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center sm:p-4" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={() => dismissible && onClose()} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full ${WIDTH[size]} flex-col overflow-hidden rounded-t-2xl border border-zinc-700 bg-[#101013] shadow-2xl outline-none sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-white">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-[13px] text-zinc-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="Cerrar ventana"
            className="-mr-1.5 -mt-1 rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300 disabled:opacity-40"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800 bg-[#0d0d10] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};
