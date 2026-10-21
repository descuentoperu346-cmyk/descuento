import { useEffect, useSyncExternalStore } from 'react';
import { CONTENT_DB_ENABLED } from './contentEnv';
import { setAdminHint } from './adminHint';
import type { StaffRole } from './roles';

/**
 * Cuenta con sesión en la web (comprador o equipo). Este archivo es liviano: la librería de Supabase
 * solo se descarga si la persona ya tenía una sesión guardada o si abre el formulario de cuenta.
 */

/** Dónde guarda Supabase la sesión en el navegador (se usa también al crear el cliente). */
export const AUTH_STORAGE_KEY = 'dp-panel-auth';

/**
 * true  -> para comprar hay que tener cuenta (el botón "Comprar" pide registrarse o iniciar sesión).
 * false -> cualquiera puede comprar sin cuenta; el registro queda opcional.
 * Solo aplica cuando la base de datos está conectada (sin base no hay cuentas).
 */
export const REQUIRE_ACCOUNT_TO_BUY = true;

export interface AccountInfo {
  kind: 'buyer' | 'staff';
  id: string;
  email: string;
  name: string;
  phone?: string;
  /** Solo equipo */
  username?: string;
  role?: StaffRole;
}

export interface AccountState {
  status: 'loading' | 'out' | 'in';
  account: AccountInfo | null;
}

export interface AuthRequest {
  /** Texto de contexto, p. ej. "Para comprar necesitas una cuenta". */
  reason?: string;
  mode?: 'login' | 'register' | 'account';
  /** Muestra directo "¡Listo!" (p. ej. al volver de Google con la sesión ya iniciada). */
  welcome?: boolean;
  /** Se ejecuta al pulsar "Continuar" tras entrar (así el navegador permite abrir Telegram/WhatsApp). */
  onContinue?: () => void;
}

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    }
  };
}

function hasStoredSession(): boolean {
  try {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return false;
  }
}

const accountStore = createStore<AccountState>({
  status: CONTENT_DB_ENABLED && typeof window !== 'undefined' && hasStoredSession() ? 'loading' : 'out',
  account: null
});
const requestStore = createStore<AuthRequest | null>(null);

export function setAccount(account: AccountInfo | null): void {
  accountStore.set(account ? { status: 'in', account } : { status: 'out', account: null });
}

let inflight: Promise<void> | null = null;

/** Consulta quién tiene sesión. Si no hay sesión guardada no descarga nada. */
export function refreshAccount(): Promise<void> {
  if (!CONTENT_DB_ENABLED) return Promise.resolve();
  if (!hasStoredSession()) {
    setAccount(null);
    return Promise.resolve();
  }
  if (!inflight) {
    inflight = import('./supabaseBrowser')
      .then((m) => m.accountGet())
      .then(setAccount)
      .catch(() => setAccount(null))
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function signOutAccount(): Promise<void> {
  setAdminHint(false);
  setAccount(null);
  try {
    const m = await import('./supabaseBrowser');
    await m.panelSignOut();
  } catch {
    // la sesión local ya se limpió
  }
}

// Si se cierra o abre sesión en otra pestaña, esta se entera.
if (typeof window !== 'undefined' && CONTENT_DB_ENABLED) {
  window.addEventListener('storage', (e) => {
    if (e.key === AUTH_STORAGE_KEY) void refreshAccount();
  });
}

export function useAccount(): AccountState {
  const state = useSyncExternalStore(accountStore.subscribe, accountStore.get, accountStore.get);
  useEffect(() => {
    if (accountStore.get().status !== 'loading') return;
    // Quien ya tenía sesión: se confirma cuando el navegador está libre, para no competir con la carga de la página.
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => void refreshAccount(), { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(() => void refreshAccount(), 1200);
    return () => window.clearTimeout(timer);
  }, []);
  return state;
}

/** true si esta persona puede comprar ahora mismo (o si no se exige cuenta). */
export function canBuy(state: AccountState): boolean {
  return !CONTENT_DB_ENABLED || !REQUIRE_ACCOUNT_TO_BUY || state.status === 'in';
}

export const requestAuth = (request: AuthRequest = {}) => requestStore.set(request);
export const closeAuth = () => requestStore.set(null);
export const useAuthRequest = (): AuthRequest | null =>
  useSyncExternalStore(requestStore.subscribe, requestStore.get, requestStore.get);

// Al volver de Google la dirección trae ?code=… Solo se atiende si fue esta web quien mandó a la persona a Google
// (queda guardado un código de verificación): cualquier otro "?code=" se ignora.
function pendingGoogleReturn(): boolean {
  try {
    const q = new URLSearchParams(window.location.search);
    return (q.has('code') || q.has('error_description') || q.has('error')) && !!localStorage.getItem(`${AUTH_STORAGE_KEY}-code-verifier`);
  } catch {
    return false;
  }
}
if (typeof window !== 'undefined' && CONTENT_DB_ENABLED && pendingGoogleReturn()) {
  void import('./supabaseBrowser')
    .then(async (m) => ({ m, res: await m.finishOAuthRedirect() }))
    .then(({ m, res }) => {
      if (!res) return;
      if (res.account) {
        setAccount(res.account);
        setAdminHint(res.account.kind === 'staff');
        const back = m.takeOAuthReturn();
        if (back && back !== window.location.hash) window.location.hash = back;
        requestAuth({ mode: 'login', welcome: true });
      } else {
        requestAuth({ mode: 'login', reason: res.error || 'No se pudo entrar con Google. Inténtalo de nuevo.' });
      }
    })
    .catch(() => requestAuth({ mode: 'login', reason: 'No se pudo entrar con Google. Inténtalo de nuevo.' }));
}
