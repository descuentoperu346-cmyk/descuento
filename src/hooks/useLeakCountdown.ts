import { useState, useEffect } from 'react';

export interface LeakTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  formattedCompact: string;
  formattedFull: string;
  isExpired: boolean;
}

/**
 * Fecha de cierre FIJA y común para todos los visitantes:
 * domingo 18 de octubre de 2026, 8:00 pm (hora de Lima, UTC-5).
 * Para cambiarla, edita solo esta constante.
 */
export const LEAK_DEADLINE_ISO = '2026-10-18T20:00:00-05:00';
export const LEAK_DEADLINE_LABEL = 'domingo 18 de octubre · 8:00 pm (hora de Lima)';

const DEADLINE_MS = Date.parse(LEAK_DEADLINE_ISO);

/**
 * Siguiente leak (el #03). Es un contador APARTE del #02: el #02 sigue controlando qué parte
 * de su expediente se ve. Para cambiar fecha o textos del #03, edita solo este bloque.
 */
export const NEXT_LEAK = {
  number: 3,
  deadlineIso: '2026-11-01T20:00:00-05:00',
  deadlineLabel: 'domingo 1 de noviembre · 8:00 pm (hora de Lima)',
  tag: 'Expediente Pisac',
  title: 'Pisac (Cusco) y los ciudadanos israelíes',
  subtitle: 'Vecinos denuncian actividades ruidosas sin autorización · videos y fuentes locales',
  ticker: 'EXPEDIENTE PISAC (CUSCO) · VECINOS DENUNCIAN ACTIVIDADES RUIDOSAS DE CIUDADANOS ISRAELÍES',
  tickerLink: 'Ver Leaks →'
} as const;

const NEXT_DEADLINE_MS = Date.parse(NEXT_LEAK.deadlineIso);

function computeTimeLeft(now: number, deadlineMs: number = DEADLINE_MS): LeakTimeLeft {
  const diff = Math.max(0, deadlineMs - now);
  const pad = (n: number) => String(n).padStart(2, '0');

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff / 3_600_000) % 24);
  const minutes = Math.floor((diff / 60_000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff,
    formattedCompact: `${days}d ${pad(hours)}h ${pad(minutes)}m`,
    formattedFull: `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
    isExpired: diff <= 0
  };
}

function useCountdownTo(deadlineMs: number) {
  const [timeLeft, setTimeLeft] = useState<LeakTimeLeft>(() => computeTimeLeft(Date.now(), deadlineMs));

  useEffect(() => {
    const tick = () => setTimeLeft(computeTimeLeft(Date.now(), deadlineMs));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs]);

  return timeLeft;
}

/** Contador del Leak #02 (el de Keiko Fujimori). */
export function useLeakCountdown() {
  return useCountdownTo(DEADLINE_MS);
}

export interface FeaturedLeak {
  number: number;
  /** Etiqueta corta de la ficha ("Expediente Congreso") */
  tag: string;
  title: string;
  subtitle: string;
  /** Texto del aviso de la barra superior */
  ticker: string;
  tickerLink: string;
  deadlineLabel: string;
  time: LeakTimeLeft;
}

/**
 * Leak que se anuncia en la barra superior y en la portada: el #02 mientras falte su fecha;
 * después, el siguiente (#03), con su propio contador.
 */
export function useFeaturedLeak(): FeaturedLeak {
  const first = useCountdownTo(DEADLINE_MS);
  const next = useCountdownTo(NEXT_DEADLINE_MS);
  if (!first.isExpired) {
    return {
      number: 2,
      tag: 'Expediente Congreso',
      title: 'Expediente Keiko Fujimori',
      subtitle: 'Caso Cócteles: aportes, documentos y estado judicial · 9 fichas',
      ticker: 'EXPEDIENTE KEIKO FUJIMORI - LO QUE DICEN LOS DOCUMENTOS DEL CASO CÓCTELES',
      tickerLink: 'Ver Dossier & 9 Implicados →',
      deadlineLabel: LEAK_DEADLINE_LABEL,
      time: first
    };
  }
  return {
    number: NEXT_LEAK.number,
    tag: NEXT_LEAK.tag,
    title: NEXT_LEAK.title,
    subtitle: NEXT_LEAK.subtitle,
    ticker: NEXT_LEAK.ticker,
    tickerLink: NEXT_LEAK.tickerLink,
    deadlineLabel: NEXT_LEAK.deadlineLabel,
    time: next
  };
}
