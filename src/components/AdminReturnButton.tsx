import React, { useEffect, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { checkSessionApi } from '../lib/api';
import { goToPanel } from '../lib/panelRoute';
import { hasAdminHint, setAdminHint } from '../lib/adminHint';

/**
 * Botón flotante "Volver al panel" para administradores con sesión activa.
 * Un visitante normal no tiene la marca local, así que no hace ninguna petición ni lo ve.
 * Quien la tiene: se confirma con el servidor que su sesión sigue vigente y es de administrador.
 */
export const AdminReturnButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasAdminHint()) return;
    let cancelled = false;
    checkSessionApi().then((user) => {
      if (cancelled) return;
      if (user && user.role === 'admin') {
        setVisible(true);
      } else {
        setAdminHint(false); // la sesión venció o ya no es admin
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={goToPanel}
      className="fixed bottom-5 left-5 z-[70] inline-flex items-center gap-2 rounded-full border border-[#00ff88]/60 bg-black/90 px-4 py-2.5 text-xs font-mono font-bold text-[#00ff88] shadow-lg backdrop-blur transition-colors hover:bg-[#00ff88] hover:text-slate-950 cursor-pointer"
      title="Volver al panel de administración"
    >
      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
      Volver al panel
    </button>
  );
};
