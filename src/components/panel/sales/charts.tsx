import React, { useEffect, useId, useRef, useState } from 'react';

// Gráficos hechos a mano en SVG (sin librerías). Reglas: marcas finas, una sola escala, cuadrícula casi invisible,
// el texto nunca lleva el color de los datos, y todo valor se puede leer también en una tabla.

const SERIES = '#00ff88'; // color de los datos (verde de la marca)
const SURFACE = '#101013';
const GRID = '#27272a';
const AXIS_TEXT = '#a1a1aa';

export interface ChartPoint {
  key: string;
  /** Texto corto para el eje (p. ej. "20 oct") */
  tick: string;
  /** Texto completo para la ventana de datos (p. ej. "20 de octubre") */
  label: string;
  value: number;
  /** Segunda línea de la ventana de datos (p. ej. "3 ventas") */
  extra?: string;
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(260, Math.round(el.getBoundingClientRect().width))));
    ro.observe(el);
    setW(Math.max(260, Math.round(el.getBoundingClientRect().width)));
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Máximo "redondo" para el eje: 1, 2, 2.5, 5 o 10 por una potencia de diez. */
function niceMax(max: number, ticks = 4): { top: number; step: number } {
  if (max <= 0) return { top: 4, step: 1 };
  const rough = max / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const f = rough / pow;
  const mult = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  const step = mult * pow;
  return { top: Math.ceil(max / step) * step, step };
}

interface BaseProps {
  points: ChartPoint[];
  format: (n: number) => string;
  axisFormat: (n: number) => string;
  ariaLabel: string;
  height?: number;
  /** Qué recorren las flechas, para el lector de pantalla (p. ej. "los meses", "las horas") */
  unit?: string;
}

const M = { top: 14, right: 16, bottom: 28, left: 46 };

/** Tooltip común: valor grande, nombre en gris; una raya del color de la serie como llave. */
const Tip: React.FC<{ p: ChartPoint; format: (n: number) => string; style: React.CSSProperties }> = ({ p, format, style }) => (
  <div role="presentation" style={style} className="pointer-events-none absolute z-10 min-w-[8.5rem] rounded-lg border border-zinc-700 bg-[#18181b] px-3 py-2 shadow-xl">
    <p className="text-xs text-zinc-400">{p.label}</p>
    <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-white">
      <span aria-hidden="true" className="inline-block h-0.5 w-3 rounded" style={{ background: SERIES }} />
      {format(p.value)}
    </p>
    {p.extra && <p className="mt-0.5 text-xs text-zinc-400">{p.extra}</p>}
  </div>
);

// ---------------------------------------------------------------- línea (ingresos por día)
export const LineChart: React.FC<BaseProps> = ({ points, format, axisFormat, ariaLabel, height = 240 }) => {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const descId = useId();
  const n = points.length;
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;
  const max = Math.max(0, ...points.map((p) => p.value));
  const { top, step } = niceMax(max);
  const x = (i: number) => M.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => M.top + innerH - (v / top) * innerH;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const xTickEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 90))));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = n ? `${path} L${x(n - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z` : '';

  const nearest = (clientX: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const rel = clientX - r.left - M.left;
    return Math.max(0, Math.min(n - 1, Math.round((rel / innerW) * (n - 1))));
  };
  const idx = active;
  const p = idx !== null ? points[idx] : null;
  const tipLeft = p && idx !== null ? Math.min(width - 150, Math.max(4, x(idx) + 12)) : 0;
  const tipFlip = p && idx !== null && x(idx) > width - 170;

  const onKey = (e: React.KeyboardEvent) => {
    if (!n) return;
    const cur = active ?? n - 1;
    if (e.key === 'ArrowRight') setActive(Math.min(n - 1, cur + 1));
    else if (e.key === 'ArrowLeft') setActive(Math.max(0, cur - 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(n - 1);
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={wrapRef}
      className="relative select-none rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
      tabIndex={0}
      role="group"
      aria-label={ariaLabel}
      aria-describedby={descId}
      onKeyDown={onKey}
      onFocus={() => {
        setFocused(true);
        if (active === null && n) setActive(n - 1);
      }}
      onBlur={() => {
        setFocused(false);
        setActive(null);
      }}
      onPointerMove={(e) => n && setActive(nearest(e.clientX))}
      onPointerLeave={() => !focused && setActive(null)}
    >
      <p id={descId} className="sr-only">
        Usa las flechas izquierda y derecha para recorrer los días. {p ? `${p.label}: ${format(p.value)}${p.extra ? `, ${p.extra}` : ''}.` : ''}
      </p>
      <svg width={width} height={height} role="img" aria-hidden="true" className="block">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
            <text x={M.left - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              {axisFormat(v)}
            </text>
          </g>
        ))}
        {points.map((pt, i) =>
          i % xTickEvery === 0 || i === n - 1 ? (
            <text key={pt.key} x={x(i)} y={height - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={11} fill={AXIS_TEXT}>
              {pt.tick}
            </text>
          ) : null
        )}
        {n > 0 && <path d={area} fill={SERIES} fillOpacity={0.1} />}
        {n > 0 && <path d={path} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {idx !== null && <line x1={x(idx)} x2={x(idx)} y1={M.top} y2={M.top + innerH} stroke="#52525b" strokeWidth={1} />}
        {n > 0 && (
          <circle cx={x(idx ?? n - 1)} cy={y(points[idx ?? n - 1].value)} r={4.5} fill={SERIES} stroke={SURFACE} strokeWidth={2} />
        )}
      </svg>
      {p && idx !== null && (
        <Tip p={p} format={format} style={{ top: Math.max(0, y(p.value) - 56), left: tipFlip ? undefined : tipLeft, right: tipFlip ? width - x(idx) + 12 : undefined }} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------- columnas (ingresos por mes)
export const ColumnChart: React.FC<BaseProps> = ({ points, format, axisFormat, ariaLabel, height = 240, unit = 'los meses' }) => {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const descId = useId();
  const n = points.length;
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;
  const max = Math.max(0, ...points.map((p) => p.value));
  const { top, step } = niceMax(max);
  const band = n ? innerW / n : innerW;
  const bw = Math.min(24, Math.max(4, band * 0.6));
  const y = (v: number) => M.top + innerH - (v / top) * innerH;
  const cx = (i: number) => M.left + band * i + band / 2;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const xTickEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 60))));
  const p = active !== null ? points[active] : null;

  const onKey = (e: React.KeyboardEvent) => {
    if (!n) return;
    const cur = active ?? 0;
    if (e.key === 'ArrowRight') setActive(Math.min(n - 1, cur + 1));
    else if (e.key === 'ArrowLeft') setActive(Math.max(0, cur - 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(n - 1);
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };
  // 4 px redondeados solo en la punta; la base queda recta sobre el eje
  const barPath = (i: number, v: number) => {
    const x0 = cx(i) - bw / 2;
    const y0 = y(v);
    const y1 = y(0);
    const h = Math.max(0, y1 - y0);
    const r = Math.min(4, bw / 2, h);
    return h <= 0 ? '' : `M${x0},${y1} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + bw - r} Q${x0 + bw},${y0} ${x0 + bw},${y0 + r} V${y1} Z`;
  };

  return (
    <div
      ref={wrapRef}
      className="relative select-none rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
      tabIndex={0}
      role="group"
      aria-label={ariaLabel}
      aria-describedby={descId}
      onKeyDown={onKey}
      onFocus={() => {
        setFocused(true);
        if (active === null && n) setActive(n - 1);
      }}
      onBlur={() => {
        setFocused(false);
        setActive(null);
      }}
    >
      <p id={descId} className="sr-only">
        Usa las flechas izquierda y derecha para recorrer {unit}. {p ? `${p.label}: ${format(p.value)}${p.extra ? `, ${p.extra}` : ''}.` : ''}
      </p>
      <svg width={width} height={height} aria-hidden="true" className="block">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={width - M.right} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
            <text x={M.left - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              {axisFormat(v)}
            </text>
          </g>
        ))}
        {points.map((pt, i) => (
          <g key={pt.key}>
            {/* zona de contacto más ancha que la barra */}
            <rect x={M.left + band * i} y={M.top} width={band} height={innerH} fill="transparent" onPointerEnter={() => setActive(i)} onPointerLeave={() => !focused && setActive(null)} />
            <path d={barPath(i, pt.value)} fill={SERIES} fillOpacity={active === null || active === i ? 1 : 0.45} />
            {(i % xTickEvery === 0 || i === n - 1) && (
              <text x={cx(i)} y={height - 8} textAnchor="middle" fontSize={11} fill={AXIS_TEXT}>
                {pt.tick}
              </text>
            )}
          </g>
        ))}
      </svg>
      {p && active !== null && <Tip p={p} format={format} style={{ top: Math.max(0, y(p.value) - 58), left: Math.min(width - 150, Math.max(4, cx(active) - 60)) }} />}
    </div>
  );
};

// ---------------------------------------------------------------- lista de barras (productos, métodos de pago…)
export interface BarItem {
  key: string;
  label: string;
  value: number;
  /** Texto a la derecha del valor (p. ej. "12 ventas") */
  sub?: string;
}
export const BarList: React.FC<{ items: BarItem[]; format: (n: number) => string; emptyText: string }> = ({ items, format, emptyText }) => {
  if (!items.length) return <p className="py-6 text-center text-[13px] text-zinc-400">{emptyText}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3.5">
      {items.map((it) => (
        <li key={it.key}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate text-zinc-200" title={it.label}>
              {it.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-white">
              {format(it.value)}
              {it.sub && <span className="ml-2 text-xs font-normal text-zinc-400">{it.sub}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-r bg-emerald-400/10" aria-hidden="true">
            <div className="h-full rounded-r" style={{ width: `${Math.max(2, Math.round((it.value / max) * 100))}%`, background: SERIES }} />
          </div>
        </li>
      ))}
    </ul>
  );
};
