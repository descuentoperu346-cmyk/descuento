// Lectura de las cifras de visitas y clics (función traffic_report del SQL 07).
// Quién puede ver qué lo decide la base de datos: admin/dev ven todo, una tienda solo lo suyo.

export interface TrafficDay {
  day: string;
  visits: number;
  views: number;
  clicks: number;
  visitors: number;
}
export interface TrafficTotals {
  visits: number;
  views: number;
  clicks: number;
  telegram: number;
  whatsapp: number;
  visitors: number;
}
export interface TrafficReport {
  from: string;
  to: string;
  days: number;
  vendor: string | null;
  series: TrafficDay[];
  totals: TrafficTotals;
  previous: Pick<TrafficTotals, 'visits' | 'views' | 'clicks' | 'visitors'>;
  products: { item_id: string; views: number; clicks: number }[];
  vendors: { vendor_id: string; views: number; clicks: number; telegram: number; whatsapp: number }[];
  sources: { source: string; clicks: number }[];
  /** Registros por hora del día (0 a 23, hora de Lima) */
  hours: number[];
}

export interface TrafficResult {
  status: 'ready' | 'missing' | 'error';
  report?: TrafficReport;
  message?: string;
}

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Acepta solo lo esperado y rellena con ceros: una respuesta rara nunca debe romper la pantalla. */
export function normalizeReport(raw: any): TrafficReport {
  const totals = (t: any): TrafficTotals => ({ visits: num(t?.visits), views: num(t?.views), clicks: num(t?.clicks), telegram: num(t?.telegram), whatsapp: num(t?.whatsapp), visitors: num(t?.visitors) });
  const hours: number[] = Array.from({ length: 24 }, (_, i) => num(raw?.hours?.[i]));
  return {
    from: String(raw?.from ?? ''),
    to: String(raw?.to ?? ''),
    days: num(raw?.days),
    vendor: raw?.vendor ? String(raw.vendor) : null,
    series: (Array.isArray(raw?.series) ? raw.series : []).map((d: any) => ({ day: String(d.day), visits: num(d.visits), views: num(d.views), clicks: num(d.clicks), visitors: num(d.visitors) })),
    totals: totals(raw?.totals),
    previous: (({ visits, views, clicks, visitors }) => ({ visits, views, clicks, visitors }))(totals(raw?.previous)),
    products: (Array.isArray(raw?.products) ? raw.products : []).map((p: any) => ({ item_id: String(p.item_id), views: num(p.views), clicks: num(p.clicks) })),
    vendors: (Array.isArray(raw?.vendors) ? raw.vendors : []).map((p: any) => ({ vendor_id: String(p.vendor_id), views: num(p.views), clicks: num(p.clicks), telegram: num(p.telegram), whatsapp: num(p.whatsapp) })),
    sources: (Array.isArray(raw?.sources) ? raw.sources : []).map((p: any) => ({ source: String(p.source), clicks: num(p.clicks) })),
    hours
  };
}

type DbError = { message?: string; code?: string } | null;
export function trafficError(e: DbError): TrafficResult {
  const code = e?.code || '';
  const msg = e?.message || '';
  if (code === 'PGRST202' || /could not find the function|traffic_report/i.test(msg)) return { status: 'missing' };
  if (code === '42501' || /permission denied|No tienes permiso/i.test(msg)) return { status: 'error', message: 'Tu cuenta no tiene permiso para ver estas cifras.' };
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return { status: 'error', message: 'No hay conexión con el servidor. Revisa tu internet.' };
  if (/JWT/i.test(msg)) return { status: 'error', message: 'Tu sesión venció. Vuelve a iniciar sesión.' };
  return { status: 'error', message: 'No se pudieron cargar las cifras. Inténtalo de nuevo.' };
}

export async function loadTraffic(days: number, vendor: string | null): Promise<TrafficResult> {
  try {
    const m = await import('./supabaseBrowser');
    const { data, error } = await m.sb().rpc('traffic_report', { p_days: days, p_vendor: vendor });
    if (error) return trafficError(error);
    return { status: 'ready', report: normalizeReport(data) };
  } catch (e) {
    return trafficError(e as DbError);
  }
}
