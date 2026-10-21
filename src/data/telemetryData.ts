// Registro de visitas y clics. Antes guardaba cifras de ejemplo en el navegador; ahora envía cada evento real
// a la base de datos (ver src/lib/analytics.ts y supabase/07-visitas-y-clics.sql). Los nombres se mantienen
// para no tocar los botones de la web que ya los llaman.
import { track } from '../lib/analytics';

const LEGACY_KEY = 'dp_telemetry_stats_v3';

/** Una visita por sesión del navegador (la llama App una sola vez). */
export function recordVisitEvent(): void {
  try {
    localStorage.removeItem(LEGACY_KEY); // cifras de ejemplo de la versión anterior: ya no se usan
  } catch {
    // sin almacenamiento
  }
  track('visit');
}

/** Clic en el enlace de Telegram o WhatsApp de una tienda. `source` es el botón o producto desde el que se hizo. */
export function recordVendorClickEvent(vendorId: string, _vendorName: string, channel: 'telegram' | 'whatsapp', source?: string, productId?: string): void {
  track('contact_click', { vendorId, channel, source, itemId: productId });
}

/** Alguien abrió la ficha de un producto. */
export function recordProductViewEvent(productId: string, productTitle: string, vendorId?: string): void {
  track('product_view', { itemId: productId, vendorId, source: productTitle });
}
