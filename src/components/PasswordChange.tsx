import React, { useState } from 'react';

interface PasswordChangeProps {
  onDone: (message: string) => void;
  /** Largo mínimo de la contraseña nueva (el equipo: 10; compradores: 8). */
  minLength?: number;
}

/** Cambio de contraseña de la cuenta del panel (Supabase Authentication). Reemplaza al antiguo "PIN". */
export const PasswordChange: React.FC<PasswordChangeProps> = ({ onDone, minLength = 10 }) => {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (value.length < minLength) {
      onDone(`La contraseña debe tener al menos ${minLength} caracteres.`);
      return;
    }
    setBusy(true);
    try {
      const m = await import('../lib/supabaseBrowser');
      const error = await m.panelChangePassword(value);
      onDone(error ?? 'Contraseña actualizada.');
      if (!error) setValue('');
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
          className="min-w-0 flex-1 px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-[#00ff88] font-mono text-sm focus:border-[#00ff88] outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={busy || value.length === 0}
          className="shrink-0 px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-mono font-bold text-white hover:border-[#00ff88] disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'Guardando…' : 'Cambiar'}
        </button>
      </div>
    </div>
  );
};
