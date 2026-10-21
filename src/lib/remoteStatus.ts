import { useSyncExternalStore } from 'react';

/** Estado del último guardado en la base de datos, compartido entre la web y el panel. */
export interface RemoteStatus {
  state: 'idle' | 'saving' | 'saved' | 'error';
  message: string;
  at: number;
}

let status: RemoteStatus = { state: 'idle', message: '', at: 0 };
const listeners = new Set<() => void>();

export function setRemoteStatus(s: Omit<RemoteStatus, 'at'>): void {
  status = { ...s, at: Date.now() };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useRemoteStatus = (): RemoteStatus => useSyncExternalStore(subscribe, () => status, () => status);

/**
 * Los guardados se hacen de uno en uno y en orden, para que dos cambios seguidos
 * no se pisen entre sí.
 */
let queue: Promise<unknown> = Promise.resolve();
export function enqueueSave<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

/** Error cuyo mensaje ya está escrito para la persona (no hace falta traducirlo). */
export class UserFacingError extends Error {}

/** Traduce los errores técnicos de Supabase a mensajes que se entienden. */
export function friendlyError(e: unknown): string {
  if (e instanceof UserFacingError) return e.message;
  const err = e as { message?: string; code?: string; status?: number; statusCode?: string | number };
  const msg = String(err?.message || e || '');
  if (err?.code === '42501' || /row-level security|violates row-level|permission denied/i.test(msg)) {
    return 'Tu cuenta no tiene permiso para guardar este cambio.';
  }
  if (/jwt expired|invalid jwt|not authenticated|401/i.test(msg) || err?.status === 401) {
    return 'Tu sesión venció. Vuelve a iniciar sesión.';
  }
  if (/exceeded the maximum allowed size|payload too large|413/i.test(msg)) {
    return 'La imagen es demasiado grande (máximo 10 MB).';
  }
  if (/mime type|not supported/i.test(msg)) {
    return 'Ese formato de archivo no está permitido (usa JPG, PNG, WebP o GIF).';
  }
  if (/duplicate key|unique constraint/i.test(msg)) {
    return 'Ya existe un registro con ese nombre o usuario.';
  }
  if (/failed to fetch|network|load failed/i.test(msg)) {
    return 'No se pudo conectar con la base de datos.';
  }
  return `No se pudo guardar: ${msg.slice(0, 140) || 'error desconocido'}`;
}
