import React from 'react';
import { User, UserCheck } from 'lucide-react';
import { CONTENT_DB_ENABLED } from '../lib/contentEnv';
import { requestAuth, useAccount } from '../lib/accountStore';

/**
 * Botón de la barra superior: "Ingresar" para visitantes y el nombre de la persona cuando ya tiene sesión.
 * Solo aparece si la base de datos está conectada (sin base no hay cuentas).
 */
export const AccountButton: React.FC = () => {
  const { status, account } = useAccount();
  if (!CONTENT_DB_ENABLED) return null;

  const signedIn = status === 'in' && account;
  const label = signedIn ? (account.kind === 'staff' && account.username ? `@${account.username}` : account.name.split(' ')[0]) : 'Ingresar';

  return (
    <button
      type="button"
      onClick={() => requestAuth({ mode: signedIn ? 'account' : 'login' })}
      aria-label={signedIn ? `Mi cuenta: ${account.name}` : 'Ingresar o crear cuenta'}
      aria-busy={status === 'loading'}
      title={signedIn ? 'Mi cuenta' : 'Ingresar o crear cuenta'}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap sm:px-4 ${
        signedIn
          ? 'border-emerald-500/50 bg-emerald-500/10 text-[#00ff88] hover:border-emerald-400 hover:bg-emerald-500/20'
          : 'border-zinc-700 bg-[#111111] text-slate-200 hover:border-[#00ff88] hover:text-white'
      }`}
    >
      {signedIn ? <UserCheck className="h-4 w-4 shrink-0" aria-hidden="true" /> : <User className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <span className="hidden max-w-[7.5rem] truncate sm:inline">{label}</span>
    </button>
  );
};
