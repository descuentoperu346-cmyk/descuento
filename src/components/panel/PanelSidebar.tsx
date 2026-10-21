import React, { useEffect, useRef } from 'react';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import type { NavGroup, PanelNavId } from './panelNav';

interface PanelSidebarProps {
  groups: NavGroup[];
  current: PanelNavId;
  onNavigate: (id: PanelNavId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavListProps {
  groups: NavGroup[];
  current: PanelNavId;
  onNavigate: (id: PanelNavId) => void;
  compact: boolean;
}

const NavList: React.FC<NavListProps> = ({ groups, current, onNavigate, compact }) => (
  <nav aria-label="Menú del panel" className="panel-scroll flex-1 overflow-y-auto px-2.5 py-3">
    {groups.map((group, gi) => (
      <div key={group.key} className={gi === 0 ? '' : 'mt-5'}>
        {group.title &&
          (compact ? (
            <div className="mx-2 mb-2 border-t border-zinc-800/80" aria-hidden="true" />
          ) : (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{group.title}</p>
          ))}
        <ul className="space-y-0.5">
          {group.items.map((item) => {
            const active = item.id === current;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-nav={item.id}
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? 'page' : undefined}
                  title={compact ? item.label : undefined}
                  aria-label={compact ? item.label : undefined}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                    compact ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-emerald-400/10 text-emerald-200'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {active && <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#00ff88]" />}
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-[#00ff88]' : 'text-zinc-400 group-hover:text-zinc-200'}`} aria-hidden="true" />
                  {!compact && (
                    <>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.tag && (
                        <span className="rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-px text-[10px] font-semibold text-amber-200">
                          {item.tag}
                        </span>
                      )}
                      {typeof item.count === 'number' && (
                        <span className={`rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums ${active ? 'bg-emerald-400/20 text-emerald-100' : 'bg-zinc-800 text-zinc-300'}`}>
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </nav>
);

export const PanelSidebar: React.FC<PanelSidebarProps> = ({ groups, current, onNavigate, collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Menú deslizable en celular: Esc lo cierra y el foco entra en él al abrirse
  useEffect(() => {
    if (!mobileOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* Escritorio */}
      <aside
        className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-zinc-800/80 bg-[#0b0b0d] transition-[width] duration-200 md:flex ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        <NavList groups={groups} current={current} onNavigate={onNavigate} compact={collapsed} />
        <div className="border-t border-zinc-800/80 p-2.5">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expandir el menú' : undefined}
            title={collapsed ? 'Expandir el menú' : 'Contraer menú'}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />}
            {!collapsed && <span>Contraer menú</span>}
          </button>
        </div>
      </aside>

      {/* Celular */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menú del panel">
          <div className="absolute inset-0 bg-black/70" onClick={onCloseMobile} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-zinc-800 bg-[#0b0b0d] shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 px-4">
              <span className="text-sm font-semibold text-white">Menú</span>
              <button
                ref={closeRef}
                type="button"
                onClick={onCloseMobile}
                aria-label="Cerrar el menú"
                className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <NavList
              groups={groups}
              current={current}
              onNavigate={(id) => {
                onNavigate(id);
                onCloseMobile();
              }}
              compact={false}
            />
          </div>
        </div>
      )}
    </>
  );
};
