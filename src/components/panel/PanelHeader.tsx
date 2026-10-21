import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Menu, Radio, Search, ShoppingBag, UserCheck } from 'lucide-react';
import type { Vendor } from '../../data/vendorsData';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface PanelHeaderProps {
  userName: string;
  username: string;
  avatar?: string;
  roleText: string;
  /** Perfiles (tiendas) entre los que puede cambiar el DEV, y el rol real de la cuenta de cada una */
  vendors: Vendor[];
  currentVendorId: string;
  roleByStore: Record<string, string>;
  canSwitchStore: boolean;
  onSwitchStore: (vendorId: string) => void;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  onBackToStore: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  connection: { ok: boolean; ms: number | null; label: 'Base de datos' | 'Servidor' };
  saveState: SaveState;
}

const isImageUrl = (v?: string) => !!v && (v.startsWith('/') || v.startsWith('http') || v.includes('.'));

const Avatar: React.FC<{ src?: string; name: string; size?: string }> = ({ src, name, size = 'h-8 w-8' }) =>
  isImageUrl(src) ? (
    <img loading="lazy" decoding="async" src={src} alt="" className={`${size} shrink-0 rounded-full border border-zinc-700 object-cover`} />
  ) : (
    <span aria-hidden="true" className={`${size} flex shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold text-emerald-300`}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  userName,
  username,
  avatar,
  roleText,
  vendors,
  currentVendorId,
  roleByStore,
  canSwitchStore,
  onSwitchStore,
  onOpenSearch,
  onOpenMenu,
  onBackToStore,
  onLogout,
  onOpenProfile,
  connection,
  saveState
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Mismos colores que la lista del equipo: DEV verde, ADMIN celeste, VENDEDOR gris (el rol siempre va escrito)
  const roleBadgeClass =
    roleText === 'DEV' ? 'bg-[#00ff88] text-slate-950' : roleText === 'ADMIN' ? 'bg-sky-400/20 text-sky-200' : 'bg-zinc-800 text-zinc-200';
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Un solo indicador: guardando / guardado / error tienen prioridad sobre la conexión
  const pill =
    saveState === 'saving'
      ? { text: 'Guardando…', tone: 'amber' }
      : saveState === 'error'
        ? { text: 'Error al guardar', tone: 'rose' }
        : saveState === 'saved'
          ? { text: 'Guardado en la base', tone: 'emerald' }
          : connection.ok
            ? { text: `${connection.label} en línea${connection.ms !== null ? ` · ${connection.ms} ms` : ''}`, tone: 'emerald' }
            : { text: `${connection.label} sin conexión`, tone: 'rose' };
  const toneClass =
    pill.tone === 'emerald'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      : pill.tone === 'amber'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
        : 'border-rose-400/40 bg-rose-500/10 text-rose-200';
  const dotClass = pill.tone === 'emerald' ? 'bg-[#00ff88]' : pill.tone === 'amber' ? 'bg-amber-300' : 'bg-rose-400';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-zinc-800/80 bg-[#0b0b0d]/95 px-3 backdrop-blur-md sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir el menú"
        className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300 md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00ff88]/60 bg-[#00ff88]/10">
          <Radio className="h-4 w-4 text-[#00ff88]" />
        </span>
        <div className="hidden leading-tight xl:block">
          <p className="text-sm font-semibold text-white">Descuentos Perú</p>
          <p className="text-[11px] text-zinc-400">Panel de gestión</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenSearch}
        className="ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-[13px] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-emerald-300 sm:max-w-md lg:max-w-lg"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">Buscar productos, tiendas o secciones…</span>
        <kbd className="hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-px font-sans text-[10px] font-semibold text-zinc-300 lg:inline">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span role="status" className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium lg:inline-flex ${toneClass}`}>
          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          {pill.text}
        </span>
        {/* En pantallas chicas: solo un punto de color; el texto queda para lectores de pantalla y al pasar el cursor */}
        <span role="status" title={pill.text} className={`inline-flex h-7 w-7 items-center justify-center rounded-full border lg:hidden ${toneClass}`}>
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClass}`} />
          <span className="sr-only">{pill.text}</span>
        </span>

        {canSwitchStore && (
          <label className="hidden items-center gap-1.5 text-[11px] text-zinc-400 lg:flex">
            <span>Perfil</span>
            <select
              value={currentVendorId}
              onChange={(e) => onSwitchStore(e.target.value)}
              title="Cambiar de perfil (solo DEV)"
              className="max-w-[14rem] cursor-pointer truncate rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs font-medium text-white focus-visible:outline-2 focus-visible:outline-emerald-300"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#0e0e0e] text-white">
                  {v.name.replace(/\s*\((admin|vendedor)\)\s*$/i, '')} · {roleByStore[v.id] ?? (v.role === 'admin' ? 'ADMIN' : 'VENDEDOR')}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={onBackToStore}
          title="Abrir la tienda para clientes"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#00ff88] px-3 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-[#00e676] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
        >
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Ver tienda</span>
          <span className="sr-only sm:hidden">Ver tienda</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Cuenta de ${userName}`}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-emerald-300"
          >
            <Avatar src={avatar} name={userName} />
            <span className="hidden min-w-0 text-left leading-tight md:block">
              <span className="block max-w-[8rem] truncate text-xs font-semibold text-white">{userName}</span>
              <span className={`mt-0.5 inline-block rounded px-1.5 py-px text-[10px] font-bold ${roleBadgeClass}`}>{roleText}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div role="menu" aria-label="Cuenta" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-800 bg-[#111114] p-1.5 shadow-2xl">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <Avatar src={avatar} name={userName} size="h-10 w-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{userName}</p>
                  <p className="truncate text-xs text-zinc-400">@{username}</p>
                  <p className={`mt-1 inline-block rounded px-1.5 py-px text-[10px] font-bold ${roleBadgeClass}`}>{roleText}</p>
                </div>
              </div>
              <div className="my-1 border-t border-zinc-800" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenProfile();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-zinc-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <UserCheck className="h-4 w-4 text-zinc-400" aria-hidden="true" /> Mi perfil y datos
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-rose-300 hover:bg-rose-500/10 focus-visible:outline-2 focus-visible:outline-rose-300"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
