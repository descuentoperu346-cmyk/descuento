import React, { useState } from 'react';

interface PasswordChangeProps {
  onDone: (message: string) => void;
  /** Largo mínimo de la contraseña nueva (el equipo: 10; compradores: 8). */
  minLength?: number;
}

const inputClass =
  'min-w-0 flex-1 px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-[#00ff88] font-mono text-sm focus:border-[#00ff88] outline-none';
const buttonClass =
  'shrink-0 px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-mono font-bold text-white hover:border-[#00ff88] disabled:opacity-50 cursor-pointer';

/**
 * Cambio de contraseña de la cuenta con sesión (Supabase Authentication). Reemplaza al antiguo "PIN".
 * Si Supabase pide confirmar la identidad, se manda un código al correo de la cuenta y se pide aquí mismo.
 */
export const PasswordChange: React.FC<PasswordChangeProps> = ({ onDone, minLength = 10 }) => {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  // Paso extra: código de seguridad que llegó al correo
  const [askCode, setAskCode] = useState(false);
  const [code, setCode] = useState('');

  const save = async () => {
    if (value.length < minLength) {
      onDone(`La contraseña debe tener al menos ${minLength} caracteres.`);
      return;
    }
    if (askCode && !/^\d{6}$/.test(code)) {
      onDone('Escribe los 6 dígitos del código de seguridad.');
      return;
    }
    setBusy(true);
    try {
      const m = await import('../lib/supabaseBrowser');
      const res = await m.panelChangePassword(value, askCode ? code : undefined);
      if (res.needsReauth && !askCode) {
        // Supabase pide confirmar que es la misma persona: se envía el código y se espera
        const msg = await m.panelRequestReauth();
        if (msg) {
          onDone(msg);
          return;
        }
        setAskCode(true);
        onDone('Te enviamos un código de seguridad a tu correo. Escríbelo y vuelve a pulsar Cambiar.');
        return;
      }
      onDone(res.error ?? 'Contraseña actualizada.');
      if (!res.error) {
        setValue('');
        setCode('');
        setAskCode(false);
      } else if (askCode) {
        setCode('');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label htmlFor="panel-new-password" className="block text-xs font-mono text-slate-300 mb-1">
        Nueva contraseña (mín. {minLength} caracteres):
      </label>
      <div className="flex gap-2">
        <input
          id="panel-new-password"
          type="password"
          autoComplete="new-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={inputClass}
        />
        <button type="button" onClick={save} disabled={busy || value.length === 0} className={buttonClass}>
          {busy ? 'Guardando…' : 'Cambiar'}
        </button>
      </div>
      {askCode && (
        <div className="mt-3">
          <label htmlFor="panel-reauth-code" className="block text-xs font-mono text-slate-300 mb-1">
            Código de seguridad (6 dígitos):
          </label>
          <input
            id="panel-reauth-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`${inputClass} w-full text-center tracking-[0.4em]`}
          />
        </div>
      )}
    </div>
  );
};
