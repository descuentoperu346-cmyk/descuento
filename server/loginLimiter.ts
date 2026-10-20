/**
 * Límite de intentos de acceso, en memoria (igual que las sesiones: un solo servidor).
 * - Por IP + usuario: 5 fallos en 15 min bloquean ese par.
 * - Por IP: 20 fallos en 15 min bloquean esa IP, sea cual sea el usuario.
 * Un acceso correcto borra el contador de ese par.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_PAIR = 5;
const MAX_PER_IP = 20;

interface Counter {
  count: number;
  firstAt: number;
}

const pairs = new Map<string, Counter>();
const ips = new Map<string, Counter>();

const fresh = (c: Counter | undefined, now: number): Counter | undefined =>
  c && now - c.firstAt <= WINDOW_MS ? c : undefined;

const bump = (map: Map<string, Counter>, key: string, now: number) => {
  const c = fresh(map.get(key), now);
  if (c) c.count += 1;
  else map.set(key, { count: 1, firstAt: now });
};

/** Segundos que faltan para poder reintentar, o 0 si puede intentar. */
export function lockedForSeconds(ip: string, username: string): number {
  const now = Date.now();
  const pair = fresh(pairs.get(`${ip}|${username}`), now);
  const byIp = fresh(ips.get(ip), now);
  const waits: number[] = [];
  if (pair && pair.count >= MAX_PER_PAIR) waits.push(pair.firstAt + WINDOW_MS - now);
  if (byIp && byIp.count >= MAX_PER_IP) waits.push(byIp.firstAt + WINDOW_MS - now);
  return waits.length ? Math.ceil(Math.max(...waits) / 1000) : 0;
}

export function registerLoginFailure(ip: string, username: string): void {
  const now = Date.now();
  bump(pairs, `${ip}|${username}`, now);
  bump(ips, ip, now);
}

export function clearLoginFailures(ip: string, username: string): void {
  pairs.delete(`${ip}|${username}`);
}

const sweep = setInterval(() => {
  const now = Date.now();
  for (const [k, c] of pairs) if (now - c.firstAt > WINDOW_MS) pairs.delete(k);
  for (const [k, c] of ips) if (now - c.firstAt > WINDOW_MS) ips.delete(k);
}, WINDOW_MS);
sweep.unref();
