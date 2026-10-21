/**
 * Verificación "no soy un robot" (Cloudflare Turnstile) para crear cuenta e ingresar.
 * Solo se activa si existe la variable VITE_TURNSTILE_SITE_KEY (la llave PÚBLICA del widget).
 * Sin esa variable la web funciona igual que antes (sin verificación). La llave SECRETA va solo en Supabase
 * (Authentication → Attack Protection), nunca en la web ni en variables VITE_.
 */
interface TurnstileApi {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'auto' | 'light' | 'dark';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const TURNSTILE_SITE_KEY = ((import.meta.env as Record<string, string | undefined>).VITE_TURNSTILE_SITE_KEY || '').trim();

/** true si hay llave configurada: solo entonces se muestra la verificación y se envía su resultado. */
export const CAPTCHA_ENABLED = TURNSTILE_SITE_KEY !== '';

let loader: Promise<TurnstileApi> | null = null;

/** Descarga el script de Cloudflare una sola vez. Falla si lo bloquea un bloqueador de anuncios o no hay internet. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loader) {
    loader = new Promise<TurnstileApi>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
      s.onerror = () => {
        loader = null; // permite reintentar al abrir otra vez el formulario
        reject(new Error('turnstile'));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}
