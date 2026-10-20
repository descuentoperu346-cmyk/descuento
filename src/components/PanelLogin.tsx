import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Shield, Unlock } from 'lucide-react';

interface PanelLoginProps {
  /** Devuelve el mensaje de error, o null si el acceso fue correcto. */
  onLogin: (username: string, pin: string) => Promise<string | null>;
  onBackToStore: () => void;
}

/** Acceso al panel: usuario + clave contra el servidor. No lista usuarios ni da pistas. */
export const PanelLogin: React.FC<PanelLoginProps> = ({ onLogin, onBackToStore }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!username.trim() || !pin) {
      setError('Escribe tu usuario y tu clave.');
      return;
    }
    setBusy(true);
    setError('');
    const message = await onLogin(username.trim(), pin);
    if (message) {
      setError(message);
      setPin('');
      setBusy(false);
    }
  };

  const fieldClass =
    'w-full rounded-2xl border border-zinc-700 bg-[#070707] px-4 py-3 text-white outline-none transition-colors focus:border-[#00ff88] placeholder:text-slate-500';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] p-4 font-sans text-slate-100 selection:bg-[#00ff88] selection:text-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,255,136,0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      <main className="relative w-full max-w-md rounded-3xl border-2 border-zinc-700 bg-[#0c0c0c]/95 p-6 sm:p-10">
        <div className="mx-auto mb-5 h-20 w-20 overflow-hidden rounded-3xl border-2 border-[#00ff88] bg-black/80 p-2">
          <img src="/imagenes/monograma.png" alt="Descuentos Perú" width={80} height={80} className="h-full w-full object-contain" />
        </div>

        <p className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#00ff88]">
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          Acceso restringido
        </p>
        <h1 className="text-center text-2xl font-black tracking-tight text-white sm:text-3xl">Panel de administración</h1>
        <p className="mt-2 text-center text-sm text-slate-400">Inicia sesión para continuar.</p>

        <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
          <div>
            <label htmlFor="panel-user" className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Usuario
            </label>
            <input
              id="panel-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="panel-pin" className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Clave
            </label>
            <div className="relative">
              <input
                id="panel-pin"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete="current-password"
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                aria-label={showPin ? 'Ocultar clave' : 'Mostrar clave'}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 font-mono text-xs text-rose-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00ff88] py-3.5 font-mono text-sm font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-[#00e676] disabled:opacity-60 cursor-pointer"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Unlock className="h-4 w-4 stroke-[3]" aria-hidden="true" />}
            {busy ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>

        <button
          type="button"
          onClick={onBackToStore}
          className="mx-auto mt-6 flex items-center gap-1.5 font-mono text-xs font-bold text-[#00ff88] hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a la web
        </button>
      </main>
    </div>
  );
};
