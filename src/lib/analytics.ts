/**
 * Visitas y clics reales de la web (SQL 07). Se envía solo lo mínimo para contar:
 *   qué pasó (visita, producto abierto, clic en Telegram/WhatsApp), de qué tienda/producto y un código al azar del navegador.
 * No se envía IP, nombre, correo ni teléfono. Todo falla en silencio: la analítica nunca debe estorbar la compra.
 *
 * No se cuenta a:
 *   · quien tiene activado "No rastrear" (DNT) o "Global Privacy Control",
 *   · robots y vistas previas,
 *   · el equipo con sesión iniciada en este navegador (sus propias pruebas no son visitas).
 */
import { CONTENT_DB_ENABLED, CONTENT_URL, publicHeaders } from './contentEnv';
import { hasAdminHint } from './adminHint';

export type TrackKind = 'visit' | 'product_view' | 'contact_click';

export interface TrackExtra {
  vendorId?: string;
  itemId?: string;
  channel?: 'telegram' | 'whatsapp';
  source?: string;
}

const VISITOR_KEY = 'dp_vid';
const BOTS = /bot|crawl|spider|slurp|preview|lighthouse/i;
const VALID_ID = /^[A-Za-z0-9_-]{8,40}$/;

/** Código al azar de 32 letras/números, guardado en este navegador. Si no se puede guardar, no se cuenta. */
function visitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !VALID_ID.test(id)) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      id = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function trackingAllowed(): boolean {
  if (!CONTENT_DB_ENABLED || typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  if (nav.doNotTrack === '1' || nav.msDoNotTrack === '1' || nav.globalPrivacyControl === true) return false;
  if (BOTS.test(nav.userAgent || '')) return false;
  return !hasAdminHint();
}

export function track(kind: TrackKind, extra: TrackExtra = {}): void {
  try {
    if (!trackingAllowed()) return;
    const visitor = visitorId();
    if (!visitor) return;
    void fetch(`${CONTENT_URL}/rest/v1/rpc/track_event`, {
      method: 'POST',
      headers: { ...publicHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_kind: kind,
        p_visitor: visitor,
        p_vendor: extra.vendorId ?? null,
        p_item: extra.itemId ?? null,
        p_channel: extra.channel ?? null,
        p_source: extra.source ?? null
      }),
      keepalive: true // el clic abre otra pestaña: el aviso debe terminar de enviarse igual
    }).catch(() => {});
  } catch {
    // la analítica nunca debe romper la web
  }
}
