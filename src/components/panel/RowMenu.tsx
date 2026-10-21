import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  hidden?: boolean;
}

/** Menú de acciones de una fila. Se dibuja "fijo" para que no lo recorte la tabla que lo contiene. */
export const RowMenu: React.FC<{ label: string; items: MenuItem[] }> = ({ label, items }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const visible = items.filter((i) => !i.hidden);

  const close = (refocus = true) => {
    setPos(null);
    if (refocus) btnRef.current?.focus();
  };

  const toggle = () => {
    if (pos) return close(false);
    const r = btnRef.current!.getBoundingClientRect();
    const width = 224;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, r.right - width));
    const height = visible.length * 38 + 12;
    const top = r.bottom + height > window.innerHeight - 8 ? Math.max(8, r.top - height - 4) : r.bottom + 4;
    setPos({ top, left });
  };

  useEffect(() => {
    if (!pos) return;
    menuRef.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setPos(null);
    };
    const onScroll = () => setPos(null);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [pos]);

  const onKey = (e: React.KeyboardEvent) => {
    const els = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role=menuitem]') || [])];
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      els[(i + 1) % els.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      els[(i - 1 + els.length) % els.length]?.focus();
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  if (!visible.length) return null;
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        aria-label={label}
        title="Más acciones"
        className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {pos && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          onKeyDown={onKey}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 224 }}
          className="z-[70] rounded-xl border border-zinc-700 bg-[#131316] p-1.5 shadow-2xl"
        >
          {visible.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  close(false);
                  it.onClick();
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] focus-visible:outline-2 focus-visible:outline-emerald-300 ${
                  it.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className={`h-4 w-4 shrink-0 ${it.danger ? '' : 'text-zinc-400'}`} aria-hidden="true" />}
                {it.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
