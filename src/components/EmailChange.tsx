import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  'w-full rounded-2xl border border-zinc-700 bg-[#070707] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#00ff88] placeholder:text-slate-500';
const labelClass = 'mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400';
const codeClass = `${fieldClass} text-center font-mono text-xl tracking-[0.4em]`;

interface Props {
  currentEmail: string;
  /** Se llama cuando el correo ya cambió, con el correo nuevo. */
  onChanged: (email: string) => void;
}

/** "Cambiar correo" de la cuenta de un comprador: se confirma con códigos de 6 dígitos que llegan por correo. */
export const EmailChange: React.FC<Props> = ({ currentEmail, onChanged }) => {
  const [step, setStep] = useState<'idle' | 'codes'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [codeCurrent, setCodeCurrent] = useState('');
  const [codeNew, setCodeNew] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reset = () => {
    setStep('idle');
    setNewEmail('');
    setCodeCurrent('');
    setCodeNew('');
    setError('');
  };

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const target = newEmail.trim();
    if (!EMAIL_RE.test(target)) return setError('Escribe un correo válido.');
    if (target.toLowerCase() === currentEmail.toLowerCase()) return setError('Ese ya es el correo de tu cuenta.');
    setBusy(true);
    setError('');
    setNotice('');
    const m = await import('../lib/supabaseBrowser');
    const msg = await m.buyerRequestEmailChange(target);
    setBusy(false);
    if (msg) return setError(msg);
    setStep('codes');
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!codeCurrent && !codeNew) return setError('Escribe el código que te llegó por correo.');
    if ((codeCurrent && codeCurrent.length !== 6) || (codeNew && codeNew.length !== 6)) return setError('Cada código tiene 6 dígitos.');
    setBusy(true);
    setError('');
    const m = await import('../lib/supabaseBrowser');
    const res = await m.buyerConfirmEmailChange(currentEmail, newEmail, codeCurrent, codeNew);
    setBusy(false);
    if (res.email) {
      onChanged(res.email);
      reset();
      setNotice(`Listo: tu correo ahora es ${res.email}.`);
      return;
    }
    if (res.pending) {
      setError('Falta confirmar el otro código. Escribe también el del correo que no llenaste.');
      return;
    }
    setError(res.error || 'No se pudo cambiar el correo. Inténtalo de nuevo.');
  };

  return (
    <div className="space-y-3 border-t border-zinc-800 pt-5">
      {step === 'idle' ? (
        <form onSubmit={request} className="space-y-3" noValidate>
          <div>
            <label htmlFor="acc-new-email" className={labelClass}>
              Cambiar correo
            </label>
            <input
              id="acc-new-email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Tu correo nuevo"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
          {notice && (
            <p role="status" className="flex items-center gap-2 font-mono text-xs text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {notice}
            </p>
          )}
          <ErrorLine message={error} />
          <button
            type="submit"
            disabled={busy || !newEmail.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 py-2.5 text-xs font-bold text-white transition-colors hover:border-[#00ff88] disabled:opacity-50 cursor-pointer"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {busy ? 'Enviando…' : 'Enviar código'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirm} className="space-y-3" noValidate>
          <p className="text-xs leading-relaxed text-slate-300">
            Te enviamos un código de 6 dígitos a <strong className="text-white">{newEmail.trim()}</strong>. Si tu cuenta pide doble confirmación, también llegó otro a{' '}
            <strong className="text-white">{currentEmail}</strong>: escribe los dos.
          </p>
          <div>
            <label htmlFor="acc-code-new" className={labelClass}>
              Código del correo nuevo
            </label>
            <input
              id="acc-code-new"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={codeNew}
              onChange={(e) => setCodeNew(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={codeClass}
            />
          </div>
          <div>
            <label htmlFor="acc-code-current" className={labelClass}>
              Código del correo actual <span className="font-normal normal-case text-slate-400">(si te llegó)</span>
            </label>
            <input
              id="acc-code-current"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={codeCurrent}
              onChange={(e) => setCodeCurrent(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={codeClass}
            />
          </div>
          <ErrorLine message={error} />
          <button
            type="submit"
            disabled={busy || (!codeCurrent && !codeNew)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00ff88] py-3 text-sm font-black text-slate-950 transition-colors hover:bg-[#00e676] disabled:opacity-60 cursor-pointer"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {busy ? 'Verificando…' : 'Confirmar el cambio'}
          </button>
          <button type="button" onClick={reset} className="w-full text-xs text-slate-400 hover:text-white hover:underline cursor-pointer">
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
};

const ErrorLine: React.FC<{ message: string }> = ({ message }) =>
  message ? (
    <p role="alert" className="flex items-start gap-2 font-mono text-xs text-rose-400">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  ) : null;
