import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PaletteItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  /** Palabras extra para encontrarlo (sin tildes da igual) */
  keywords?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Puntaje simple: todas las palabras deben aparecer; gana lo que empieza igual y lo que está en el título. */
function score(item: PaletteItem, tokens: string[]): number {
  if (!tokens.length) return 1;
  const label = norm(item.label);
  const rest = norm(`${item.hint || ''} ${item.keywords || ''} ${item.group}`);
  let total = 0;
  for (const t of tokens) {
    if (label.startsWith(t)) total += 4;
    else if (label.includes(` ${t}`)) total += 3;
    else if (label.includes(t)) total += 2;
    else if (rest.includes(t)) total += 1;
    else return 0;
  }
  return total;
}

const MAX_RESULTS = 30;

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, items }) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      returnFocusRef.current?.focus?.();
    }
  }, [open]);

  const results = useMemo(() => {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    // Los grupos conservan el orden en que llegan; dentro de cada grupo gana el que mejor coincide
    const groupOrder = new Map<string, number>();
    items.forEach((it) => !groupOrder.has(it.group) && groupOrder.set(it.group, groupOrder.size));
    return items
      .map((item, index) => ({ item, index, s: score(item, tokens) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => groupOrder.get(a.item.group)! - groupOrder.get(b.item.group)! || b.s - a.s || a.index - b.index)
      .slice(0, MAX_RESULTS)
      .map((r) => r.item);
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  // Mantiene visible la opción marcada al moverse con el teclado
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const choose = (item?: PaletteItem) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Tab') {
      // El foco se queda dentro del cuadro mientras está abierto
      e.preventDefault();
    }
  };

  let lastGroup = '';
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Buscar en el panel" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-700 bg-[#101013] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="panel-palette-list"
            aria-activedescendant={results[active] ? `panel-palette-${results[active].id}` : undefined}
            aria-label="Buscar productos, tiendas, artículos o secciones"
            placeholder="Busca un producto, una tienda, un artículo o una sección…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-sm text-white placeholder:text-zinc-400 focus:outline-none"
          />
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-px font-sans text-[10px] font-semibold text-zinc-300">Esc</kbd>
        </div>

        <ul ref={listRef} id="panel-palette-list" role="listbox" aria-label="Resultados" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-zinc-400">No encontré nada con “{query}”. Prueba con otra palabra.</li>}
          {results.map((item, i) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            const Icon = item.icon;
            const isActive = i === active;
            return (
              <React.Fragment key={item.id}>
                {showGroup && (
                  <li role="presentation" className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {item.group}
                  </li>
                )}
                <li
                  id={`panel-palette-${item.id}`}
                  role="option"
                  aria-selected={isActive}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-emerald-400/10 text-white' : 'text-zinc-200'}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#00ff88]' : 'text-zinc-400'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="hidden max-w-[40%] truncate text-xs text-zinc-400 sm:block">{item.hint}</span>}
                  {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden="true" />}
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-400">
          <span>↑ ↓ para moverte</span>
          <span>Enter para abrir</span>
          <span className="ml-auto">{results.length} resultado{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
};
