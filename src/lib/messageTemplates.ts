// Mensajes listos para Telegram y WhatsApp. Funciones puras (sin red ni pantalla).
// Los textos usan datos entre llaves, como {cliente} o {vence}, que se rellenan con la venta elegida.
import { formatDay, money, relativeDays, subscriptionInfo, type Sale } from './salesMath';

export interface TemplateDef {
  id: string;
  title: string;
  /** Cuándo conviene usarlo */
  when: string;
  text: string;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'bienvenida',
    title: 'Entrega y bienvenida',
    when: 'Después de vender, al entregar el producto.',
    text: '¡Hola {cliente}! 🙌 Gracias por tu compra en {tienda}.\n\nTu {producto} ya está listo. Si algo no funciona o tienes dudas, escríbenos por aquí y lo resolvemos enseguida.\n\n¡Disfrútalo!'
  },
  {
    id: 'por-vencer',
    title: 'Tu suscripción vence pronto',
    when: 'Unos días antes de que venza una suscripción.',
    text: 'Hola {cliente} 👋 te escribimos de {tienda}. Tu {producto} vence el {vence} ({dias}).\n\n¿Quieres renovarlo por {monto}? Puedes pagar por {medios}. Respóndeme y te lo dejo listo.'
  },
  {
    id: 'vencida',
    title: 'Ya venció: ofrecer renovar',
    when: 'Cuando una suscripción ya venció y quieres recuperar al cliente.',
    text: 'Hola {cliente}, tu {producto} venció el {vence}. Si quieres seguir disfrutándolo, lo renovamos por {monto}. ¿Lo dejamos activo hoy? 🙂'
  },
  {
    id: 'cobro',
    title: 'Recordatorio de pago pendiente',
    when: 'Cuando una venta quedó pendiente de pago.',
    text: 'Hola {cliente}, te recuerdo que quedó pendiente el pago de {monto} por tu {producto}. Puedes pagar por {medios}. En cuanto lo hagas, me envías la captura y lo activo al instante. ¡Gracias!'
  },
  {
    id: 'garantia-recibida',
    title: 'Recibimos tu reporte (garantía)',
    when: 'Apenas un cliente reporta un problema.',
    text: 'Hola {cliente}, recibimos tu reporte sobre {producto}. Ya lo estamos revisando y te respondemos lo antes posible. Gracias por avisarnos 🙏\n— {tienda}'
  },
  {
    id: 'solucionado',
    title: 'Solucionado o cuenta repuesta',
    when: 'Cuando resolviste el problema o repusiste la cuenta.',
    text: 'Hola {cliente}, ya quedó solucionado tu {producto} ✅. Te dejamos todo listo; si vuelve a fallar, escríbenos y lo cubrimos con la garantía. ¡Gracias por tu paciencia!'
  },
  {
    id: 'gracias',
    title: 'Gracias y recomendación',
    when: 'Unos días después de la compra, para pedir una recomendación.',
    text: '¡Gracias por confiar en {tienda}, {cliente}! 💚 Si quedaste contento con tu {producto}, nos ayudas mucho recomendándonos con un amigo. ¡Hasta pronto!'
  }
];

export const VARIABLES: { name: string; label: string }[] = [
  { name: 'cliente', label: 'Nombre del cliente' },
  { name: 'producto', label: 'Producto y plan' },
  { name: 'monto', label: 'Monto de la venta' },
  { name: 'vence', label: 'Fecha de vencimiento' },
  { name: 'dias', label: 'Días que faltan' },
  { name: 'tienda', label: 'Nombre de tu tienda' },
  { name: 'medios', label: 'Formas de pago' },
  { name: 'yape', label: 'Número de Yape' }
];
const KNOWN = new Set(VARIABLES.map((v) => v.name));
export type Vars = Partial<Record<string, string>>;

export interface Rendered {
  text: string;
  /** Datos que el texto pide y no se pudieron rellenar (se dejan como están, entre llaves) */
  missing: string[];
  /** Datos que no existen (un error de escritura, como {cliete}) */
  unknown: string[];
}

export function renderTemplate(text: string, vars: Vars): Rendered {
  const missing = new Set<string>();
  const unknown = new Set<string>();
  const out = text.replace(/\{([a-z_]+)\}/g, (whole, name: string) => {
    if (!KNOWN.has(name)) {
      unknown.add(name);
      return whole;
    }
    const v = vars[name];
    if (v && v.trim()) return v.trim();
    missing.add(name);
    return whole;
  });
  return { text: out, missing: [...missing], unknown: [...unknown] };
}

export interface StoreInfo {
  name: string;
  paymentLabels: string[];
  yape?: string;
}

/** Rellena los datos con lo que se sabe de la venta y de la tienda. Lo que no se sabe queda vacío (nunca se inventa). */
export function varsFromSale(sale: Sale | null, store: StoreInfo, now: number = Date.now()): Vars {
  const vars: Vars = { tienda: store.name, medios: store.paymentLabels.join(', '), yape: store.yape || '' };
  if (!sale) return vars;
  const info = subscriptionInfo(sale, now);
  return {
    ...vars,
    cliente: sale.customerName.trim().split(/\s+/)[0] || '',
    producto: `${sale.productTitle}${sale.plan ? ` (${sale.plan})` : ''}`,
    monto: sale.amount ? money(sale.amount) : '',
    vence: sale.expiresAt ? formatDay(sale.expiresAt) : '',
    dias: info ? relativeDays(info.daysLeft) : ''
  };
}

/** Qué mensaje conviene según el estado de la venta. */
export function suggestTemplate(sale: Sale | null, now: number = Date.now()): string {
  if (!sale) return 'bienvenida';
  if (sale.status === 'pending') return 'cobro';
  const info = subscriptionInfo(sale, now);
  if (info?.state === 'expired') return 'vencida';
  if (info?.state === 'expiring') return 'por-vencer';
  return 'bienvenida';
}

// ---------------------------------------------------------------- textos propios (solo en este navegador)
const KEY = 'dp_msg_templates';
export function loadCustomTexts(): Record<string, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const out: Record<string, string> = {};
    if (raw && typeof raw === 'object') for (const t of TEMPLATES) if (typeof raw[t.id] === 'string' && raw[t.id].trim()) out[t.id] = raw[t.id].slice(0, 1500);
    return out;
  } catch {
    return {};
  }
}
export function saveCustomTexts(map: Record<string, string>): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}
