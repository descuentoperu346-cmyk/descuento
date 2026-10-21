import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CAPTCHA_ENABLED, TURNSTILE_SITE_KEY, loadTurnstile } from '../lib/captcha';

export interface CaptchaHandle {
  /** Pide una verificación nueva (el resultado de cada una sirve para un solo intento). */
  reset: () => void;
}

interface CaptchaWidgetProps {
  /** Recibe el resultado de la verificación, o null cuando se pierde o vence. */
  onToken: (token: string | null) => void;
}

/** Verificación "no soy un robot" de Cloudflare Turnstile. No muestra nada si no hay llave configurada. */
export const CaptchaWidget = forwardRef<CaptchaHandle, CaptchaWidgetProps>(({ onToken }, ref) => {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const latest = useRef(onToken);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    latest.current = onToken;
  }, [onToken]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        latest.current(null);
        if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
      }
    }),
    []
  );

  useEffect(() => {
    if (!CAPTCHA_ENABLED || !box.current) return;
    let gone = false;
    loadTurnstile()
      .then((t) => {
        if (gone || !box.current) return;
        widgetId.current = t.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          callback: (token) => latest.current(token),
          'expired-callback': () => latest.current(null),
          'error-callback': () => latest.current(null)
        });
      })
      .catch(() => {
        if (!gone) setFailed(true);
      });
    return () => {
      gone = true;
      if (widgetId.current !== null) {
        window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  if (!CAPTCHA_ENABLED) return null;
  if (failed) {
    return (
      <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
        No se pudo cargar la verificación de seguridad. Desactiva el bloqueador de anuncios para esta página o recarga.
      </p>
    );
  }
  return <div ref={box} className="flex min-h-[65px] justify-center" aria-label="Verificación de seguridad" />;
});
CaptchaWidget.displayName = 'CaptchaWidget';
