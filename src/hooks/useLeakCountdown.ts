import { useState, useEffect, useCallback } from 'react';

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

// 1 dia, 13 horas y 20 minutos
// 1 day = 86,400s; 13h = 46,800s; 20m = 1,200s => Total = 134,400s = 134,400,000 ms
export const COUNTDOWN_TOTAL_MS = (1 * 86400 + 13 * 3600 + 20 * 60) * 1000;
export const COUNTDOWN_STORAGE_KEY = 'dp_leak_countdown_target_1d13h20m_v1';

export function getCountdownTarget(forceReset = false): number {
  if (typeof window === 'undefined') {
    return Date.now() + COUNTDOWN_TOTAL_MS;
  }

  const now = Date.now();
  if (forceReset) {
    const fresh = now + COUNTDOWN_TOTAL_MS;
    try {
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(fresh));
    } catch {}
    return fresh;
  }

  try {
    const stored = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored);
      // Valid if it is a number in the future and not more than 2 minutes beyond our duration
      if (!isNaN(parsed) && parsed > now && parsed <= now + COUNTDOWN_TOTAL_MS + 120000) {
        return parsed;
      }
    }
  } catch {}

  const fresh = now + COUNTDOWN_TOTAL_MS;
  try {
    localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(fresh));
  } catch {}
  return fresh;
}

export function useLeakCountdown() {
  const [targetTime, setTargetTime] = useState<number>(() => getCountdownTarget(false));
  const [timeLeft, setTimeLeft] = useState<LeakTimeLeft>(() => {
    return {
      days: 1,
      hours: 13,
      minutes: 20,
      seconds: 0,
      totalMs: COUNTDOWN_TOTAL_MS,
      formattedCompact: '1d 13h 20m',
      formattedFull: '01d : 13h : 20m : 00s',
      isExpired: false
    };
  });

  const syncToDefaultDuration = useCallback(() => {
    const fresh = getCountdownTarget(true);
    setTargetTime(fresh);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const current = Date.now();
      const diff = Math.max(0, targetTime - current);

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          formattedCompact: '0d 00h 00m',
          formattedFull: '00d : 00h : 00m : 00s',
          isExpired: true
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const formattedCompact = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
      const formattedFull = `${String(days).padStart(2, '0')}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalMs: diff,
        formattedCompact,
        formattedFull,
        isExpired: false
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return {
    ...timeLeft,
    syncToDefaultDuration
  };
}
