export interface TelemetryEvent {
  id: string;
  timestamp: string; // e.g. "21:18:44"
  type: 'visit' | 'click_telegram' | 'click_whatsapp' | 'view_product' | 'search' | 'audit_leaks' | 'system';
  vendorId?: string;
  vendorName?: string;
  productId?: string;
  productTitle?: string;
  ipMasked?: string;
  location?: string;
  details: string;
}

export interface DayTrafficStat {
  day: string;
  visits: number;
  clicks: number;
  ctr: number;
}

export interface VendorClickStat {
  vendorId: string;
  vendorName: string;
  username: string;
  telegramClicks: number;
  whatsappClicks: number;
  totalClicks: number;
  productViews: number;
  ctr: number;
}

export interface ProductClickStat {
  productId: string;
  title: string;
  category: string;
  vendorName: string;
  views: number;
  clicks: number;
  ctr: number;
}

export interface TelemetryStats {
  activeVisitorsNow: number;
  totalVisitsToday: number;
  totalVisitsWeek: number;
  totalVisitsMonth: number;
  totalUniqueIps: number;
  totalClicksToday: number;
  totalClicksWeek: number;
  totalClicksAllTime: number;
  ctrGlobal: number; // e.g. 16.4
  systemHealth: {
    latencyMs: number;
    uptime: string;
    node: string;
    ssl: string;
    cpuPercent: number;
    supabaseStatus: 'connected' | 'syncing' | 'idle';
  };
  vendorsStats: Record<string, VendorClickStat>;
  productsStats: ProductClickStat[];
  weeklyTraffic: DayTrafficStat[];
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  regionalBreakdown: {
    region: string;
    city: string;
    percentage: number;
    visits: number;
  }[];
  recentEvents: TelemetryEvent[];
}

export const TELEMETRY_STORAGE_KEY = 'dp_telemetry_stats_v3';

const INITIAL_EVENTS: TelemetryEvent[] = [
  {
    id: 'evt-1',
    timestamp: '21:18:02',
    type: 'click_telegram',
    vendorId: 'vendedor-whisky',
    vendorName: 'Whisky Perú',
    productTitle: 'Netflix Premium 4K UHD',
    ipMasked: '190.237.44.xx',
    location: 'Lima, Perú',
    details: 'Usuario abrió chat de Telegram con @whiskyper para solicitar Netflix 4K UHD'
  },
  {
    id: 'evt-2',
    timestamp: '21:17:45',
    type: 'audit_leaks',
    vendorId: 'vendedor-tino',
    vendorName: 'Tin9o',
    productTitle: 'Auditoría de Leaks & Filtraciones',
    ipMasked: '200.48.72.xx',
    location: 'Arequipa, Perú',
    details: 'Consulta de auditoría forense para verificación de credenciales y brechas con @Tin9o'
  },
  {
    id: 'evt-3',
    timestamp: '21:17:10',
    type: 'click_whatsapp',
    vendorId: 'vendedor-nano',
    vendorName: 'El Nano VIP',
    productTitle: 'ChatGPT Plus OpenAI GPT-4o',
    ipMasked: '181.65.112.xx',
    location: 'Trujillo, Perú',
    details: 'Clic en Telegram para solicitar credenciales de ChatGPT Plus con @elnanovip'
  },
  {
    id: 'evt-4',
    timestamp: '21:16:30',
    type: 'view_product',
    productTitle: 'Spotify Premium Individual & Duo',
    ipMasked: '190.119.201.xx',
    location: 'Lima, Perú',
    details: 'Usuario visualizó especificaciones y planes de renovación con @AbbysPeru'
  },
  {
    id: 'evt-5',
    timestamp: '21:15:55',
    type: 'visit',
    ipMasked: '179.6.14.xx',
    location: 'Callao, Perú',
    details: 'Nueva sesión iniciada desde navegador móvil Android (Chrome 128)'
  },
  {
    id: 'evt-6',
    timestamp: '21:15:12',
    type: 'click_telegram',
    vendorId: 'vendedor-tino',
    vendorName: 'Tin9o',
    productTitle: 'Investigación OSINT & Dossier Forense',
    ipMasked: '190.43.88.xx',
    location: 'Cusco, Perú',
    details: 'Clic en Telegram para solicitar búsqueda focalizada de registros públicos con @Tin9o'
  }
];

export const DEFAULT_TELEMETRY: TelemetryStats = {
  activeVisitorsNow: 36,
  totalVisitsToday: 1482,
  totalVisitsWeek: 9840,
  totalVisitsMonth: 38750,
  totalUniqueIps: 12490,
  totalClicksToday: 246,
  totalClicksWeek: 1620,
  totalClicksAllTime: 6890,
  ctrGlobal: 16.6,
  systemHealth: {
    latencyMs: 14,
    uptime: '99.98%',
    node: 'LIM-PE-CENTRAL',
    ssl: 'TLS 1.3 / AES-256',
    cpuPercent: 9,
    supabaseStatus: 'connected'
  },
  vendorsStats: {
    'vendedor-central': {
      vendorId: 'vendedor-central',
      vendorName: 'Descuentos Perú Central',
      username: 'DESCUENTOSPER2',
      telegramClicks: 72,
      whatsappClicks: 38,
      totalClicks: 110,
      productViews: 710,
      ctr: 15.5
    },
    'vendedor-whisky': {
      vendorId: 'vendedor-whisky',
      vendorName: 'Whisky Perú',
      username: 'whiskyper',
      telegramClicks: 94,
      whatsappClicks: 22,
      totalClicks: 116,
      productViews: 640,
      ctr: 18.1
    },
    'vendedor-abby': {
      vendorId: 'vendedor-abby',
      vendorName: 'Abbys Perú',
      username: 'AbbysPeru',
      telegramClicks: 82,
      whatsappClicks: 26,
      totalClicks: 108,
      productViews: 590,
      ctr: 18.3
    },
    'vendedor-nano': {
      vendorId: 'vendedor-nano',
      vendorName: 'El Nano VIP',
      username: 'elnanovip',
      telegramClicks: 114,
      whatsappClicks: 32,
      totalClicks: 146,
      productViews: 780,
      ctr: 18.7
    },
    'vendedor-tino': {
      vendorId: 'vendedor-tino',
      vendorName: 'Tin9o',
      username: 'Tin9o',
      telegramClicks: 88,
      whatsappClicks: 18,
      totalClicks: 106,
      productViews: 610,
      ctr: 17.4
    }
  },
  productsStats: [
    {
      productId: 'netflix-4k',
      title: 'Netflix Premium 4K UHD',
      category: 'streaming',
      vendorName: 'Whisky Perú',
      views: 450,
      clicks: 98,
      ctr: 21.8
    },
    {
      productId: 'leaks-filtraciones',
      title: 'Auditoría de Leaks & Filtraciones',
      category: 'leaks',
      vendorName: 'Tin9o',
      views: 410,
      clicks: 86,
      ctr: 21.0
    },
    {
      productId: 'chatgpt-plus',
      title: 'ChatGPT Plus OpenAI GPT-4o',
      category: 'educacion',
      vendorName: 'El Nano VIP',
      views: 310,
      clicks: 58,
      ctr: 18.7
    },
    {
      productId: 'spotify-premium',
      title: 'Spotify Premium HiFi',
      category: 'streaming',
      vendorName: 'Alex Streaming',
      views: 260,
      clicks: 44,
      ctr: 16.9
    },
    {
      productId: 'osint-dossier',
      title: 'Investigación OSINT & Dossier Forense',
      category: 'investigacion',
      vendorName: 'Marcos Data Analyst',
      views: 220,
      clicks: 39,
      ctr: 17.7
    },
    {
      productId: 'canva-pro',
      title: 'Canva Pro Anual + Brand Kit',
      category: 'educacion',
      vendorName: 'Alex Streaming',
      views: 195,
      clicks: 32,
      ctr: 16.4
    },
    {
      productId: 'windows-office',
      title: 'Windows 11 Pro + Office 365',
      category: 'educacion',
      vendorName: 'Descuentos Perú Central',
      views: 180,
      clicks: 29,
      ctr: 16.1
    }
  ],
  weeklyTraffic: [
    { day: 'Lun', visits: 1150, clicks: 180, ctr: 15.6 },
    { day: 'Mar', visits: 1240, clicks: 202, ctr: 16.3 },
    { day: 'Mié', visits: 1390, clicks: 225, ctr: 16.2 },
    { day: 'Jue', visits: 1410, clicks: 238, ctr: 16.8 },
    { day: 'Vie', visits: 1690, clicks: 295, ctr: 17.4 },
    { day: 'Sáb', visits: 1820, clicks: 318, ctr: 17.5 },
    { day: 'Hoy', visits: 1482, clicks: 246, ctr: 16.6 }
  ],
  deviceBreakdown: {
    mobile: 68,
    desktop: 28,
    tablet: 4
  },
  regionalBreakdown: [
    { region: 'Lima', city: 'Lima Metropolitana & Callao', percentage: 64, visits: 948 },
    { region: 'Arequipa', city: 'Arequipa Ciudad', percentage: 14, visits: 207 },
    { region: 'La Libertad', city: 'Trujillo', percentage: 10, visits: 148 },
    { region: 'Cusco / Piura', city: 'Cusco, Piura y Chiclayo', percentage: 8, visits: 118 },
    { region: 'Otras Regiones', city: 'Huancayo, Iquitos, Tacna', percentage: 4, visits: 61 }
  ],
  recentEvents: INITIAL_EVENTS
};

export function getStoredTelemetry(): TelemetryStats {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.totalVisitsToday === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored telemetry', e);
  }
  return DEFAULT_TELEMETRY;
}

export function saveStoredTelemetry(stats: TelemetryStats): void {
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving telemetry to localStorage', e);
  }
}

export function recordVisitEvent(): TelemetryStats {
  const current = getStoredTelemetry();
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  const updated: TelemetryStats = {
    ...current,
    totalVisitsToday: current.totalVisitsToday + 1,
    totalVisitsWeek: current.totalVisitsWeek + 1,
    totalVisitsMonth: current.totalVisitsMonth + 1,
    totalUniqueIps: current.totalUniqueIps + 1,
    recentEvents: [
      {
        id: `evt-${Date.now()}`,
        timestamp: timeStr,
        type: 'visit',
        ipMasked: `190.${Math.floor(Math.random() * 200 + 40)}.${Math.floor(Math.random() * 200 + 10)}.xx`,
        location: 'Lima, Perú',
        details: 'Nueva visita al catálogo web general de Descuentos Perú'
      },
      ...current.recentEvents.slice(0, 49)
    ]
  };

  saveStoredTelemetry(updated);
  return updated;
}

export function recordVendorClickEvent(
  vendorId: string,
  vendorName: string,
  channel: 'telegram' | 'whatsapp',
  productTitle?: string
): TelemetryStats {
  const current = getStoredTelemetry();
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  // Update vendor click stats
  const vStats = { ...(current.vendorsStats || {}) };
  const existingV = vStats[vendorId] || {
    vendorId,
    vendorName,
    username: vendorId.replace('vendedor-', ''),
    telegramClicks: 0,
    whatsappClicks: 0,
    totalClicks: 0,
    productViews: 10,
    ctr: 15.0
  };

  const updatedV: VendorClickStat = {
    ...existingV,
    vendorName,
    telegramClicks: channel === 'telegram' ? existingV.telegramClicks + 1 : existingV.telegramClicks,
    whatsappClicks: channel === 'whatsapp' ? existingV.whatsappClicks + 1 : existingV.whatsappClicks,
    totalClicks: existingV.totalClicks + 1,
    ctr: Math.round(((existingV.totalClicks + 1) / Math.max(1, existingV.productViews)) * 1000) / 10
  };
  vStats[vendorId] = updatedV;

  // Update product stats if provided
  let pStats = [...(current.productsStats || [])];
  if (productTitle) {
    pStats = pStats.map((p) => {
      if (p.title.toLowerCase().includes(productTitle.toLowerCase()) || productTitle.toLowerCase().includes(p.title.toLowerCase())) {
        const newClicks = p.clicks + 1;
        return {
          ...p,
          clicks: newClicks,
          ctr: Math.round((newClicks / Math.max(1, p.views)) * 1000) / 10
        };
      }
      return p;
    });
  }

  const isLeaks = productTitle?.toLowerCase().includes('leak') || productTitle?.toLowerCase().includes('filtra');
  const eventType: TelemetryEvent['type'] = isLeaks
    ? 'audit_leaks'
    : channel === 'telegram'
    ? 'click_telegram'
    : 'click_whatsapp';

  const newEvent: TelemetryEvent = {
    id: `evt-${Date.now()}`,
    timestamp: timeStr,
    type: eventType,
    vendorId,
    vendorName,
    productTitle,
    ipMasked: `190.${Math.floor(Math.random() * 200 + 40)}.${Math.floor(Math.random() * 200 + 10)}.xx`,
    location: 'Perú',
    details: `Clic en enlace de ${channel.toUpperCase()} (${vendorName}) ${productTitle ? `para "${productTitle}"` : ''}`
  };

  const updated: TelemetryStats = {
    ...current,
    totalClicksToday: current.totalClicksToday + 1,
    totalClicksWeek: current.totalClicksWeek + 1,
    totalClicksAllTime: current.totalClicksAllTime + 1,
    ctrGlobal: Math.round(((current.totalClicksToday + 1) / Math.max(1, current.totalVisitsToday)) * 1000) / 10,
    vendorsStats: vStats,
    productsStats: pStats,
    recentEvents: [newEvent, ...current.recentEvents.slice(0, 49)]
  };

  saveStoredTelemetry(updated);
  return updated;
}

export function recordProductViewEvent(productId: string, productTitle: string): TelemetryStats {
  const current = getStoredTelemetry();
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  const pStats = current.productsStats.map((p) => {
    if (p.productId === productId || p.title.toLowerCase().includes(productTitle.toLowerCase())) {
      const newViews = p.views + 1;
      return {
        ...p,
        views: newViews,
        ctr: Math.round((p.clicks / Math.max(1, newViews)) * 1000) / 10
      };
    }
    return p;
  });

  const isLeaks = productTitle.toLowerCase().includes('leak') || productTitle.toLowerCase().includes('filtra');

  const newEvent: TelemetryEvent = {
    id: `evt-${Date.now()}`,
    timestamp: timeStr,
    type: isLeaks ? 'audit_leaks' : 'view_product',
    productId,
    productTitle,
    ipMasked: `190.${Math.floor(Math.random() * 200 + 40)}.${Math.floor(Math.random() * 200 + 10)}.xx`,
    location: 'Perú',
    details: `Usuario visualizó la ficha técnica de "${productTitle}"`
  };

  const updated: TelemetryStats = {
    ...current,
    productsStats: pStats,
    recentEvents: [newEvent, ...current.recentEvents.slice(0, 49)]
  };

  saveStoredTelemetry(updated);
  return updated;
}

export function generateRandomSimulatedEvent(): TelemetryEvent {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  const sampleEvents: Omit<TelemetryEvent, 'id' | 'timestamp'>[] = [
    {
      type: 'click_telegram',
      vendorId: 'vendedor-whisky',
      vendorName: 'Whisky Perú',
      productTitle: 'Netflix Premium 4K UHD',
      ipMasked: '190.237.112.xx',
      location: 'Lima, Perú',
      details: 'Clic en Telegram para solicitar activación de Netflix 4K UHD con @whiskyper'
    },
    {
      type: 'audit_leaks',
      vendorId: 'vendedor-tino',
      vendorName: 'Tin9o',
      productTitle: 'Auditoría de Leaks & Filtraciones',
      ipMasked: '200.48.33.xx',
      location: 'Arequipa, Perú',
      details: 'Consulta de auditoría y escaneo de brechas de credenciales con @Tin9o'
    },
    {
      type: 'click_telegram',
      vendorId: 'vendedor-tino',
      vendorName: 'Tin9o',
      productTitle: 'Investigación OSINT & Dossier Forense',
      ipMasked: '181.65.20.xx',
      location: 'Trujillo, Perú',
      details: 'Usuario abrió chat de Telegram con @Tin9o para solicitar dossier OSINT'
    },
    {
      type: 'click_whatsapp',
      vendorId: 'vendedor-abby',
      vendorName: 'Abbys Perú',
      productTitle: 'Spotify Premium Individual & Duo',
      ipMasked: '190.43.90.xx',
      location: 'Lima, Perú',
      details: 'Clic en Telegram para renovación de Spotify a cuenta propia con @AbbysPeru'
    },
    {
      type: 'click_telegram',
      vendorId: 'vendedor-nano',
      vendorName: 'El Nano VIP',
      productTitle: 'ChatGPT Plus OpenAI GPT-4o',
      ipMasked: '190.119.20.xx',
      location: 'Piura, Perú',
      details: 'Usuario consultó planes VIP de ChatGPT Plus con @elnanovip'
    },
    {
      type: 'visit',
      ipMasked: '179.7.22.xx',
      location: 'Cusco, Perú',
      details: 'Sesión iniciada desde buscador Google Orgánico'
    }
  ];

  const picked = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
  return {
    ...picked,
    id: `evt-${Date.now()}`,
    timestamp: timeStr
  };
}
