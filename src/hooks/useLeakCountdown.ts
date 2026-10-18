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

function computeTimeLeft(now: number): LeakTimeLeft {
  const diff = Math.max(0, DEADLINE_MS - now);
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

export function useLeakCountdown() {
  const [timeLeft, setTimeLeft] = useState<LeakTimeLeft>(() => computeTimeLeft(Date.now()));

  useEffect(() => {
    const tick = () => setTimeLeft(computeTimeLeft(Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}
