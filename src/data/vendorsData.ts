export interface VendorPaymentConfig {
  yapePhone?: string;
  plinPhone?: string;
  bcpAccount?: string;
  bcpCci?: string;
  interbankAccount?: string;
  binancePayId?: string;
  qrImageUrl?: string;
  paymentInstructions?: string;
}

export interface Vendor {
  id: string;
  role: 'admin' | 'vendor';
  name: string;
  username: string;
  telegramUrl: string;
  whatsapp?: string;
  avatar: string;
  pin: string;
  active: boolean;
  rating: number;
  salesCount: number;
  paymentMethods: string[];
  paymentConfig?: VendorPaymentConfig;
  allowedCategories: ('streaming' | 'leaks' | 'investigacion' | 'educacion')[];
  allowedServiceIds: string[];
  customNotes?: string;
}

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendedor-central',
    role: 'admin',
    name: 'Descuentos Perú Central (Admin)',
    username: 'DESCUENTOSPER2',
    telegramUrl: 'https://t.me/descuentosper2',
    avatar: '/imagenes/monograma.png',
    pin: 'admin123',
    active: true,
    rating: 5.0,
    salesCount: 850,
    paymentMethods: ['Yape', 'Plin', 'BCP', 'Binance USDT'],
    paymentConfig: {
      yapePhone: '999 888 777',
      plinPhone: '999 888 777',
      bcpAccount: '193-98765432-0-12',
      bcpCci: '002-193-009876543201-14',
      binancePayId: '789456123',
      paymentInstructions: 'Envía captura del comprobante al Telegram oficial para activación inmediata.'
    },
    allowedCategories: ['streaming', 'leaks', 'investigacion', 'educacion'],
    allowedServiceIds: [
      'netflix-4k',
      'leaks-filtraciones',
      'spotify-premium',
      'disney-combo',
      'chatgpt-plus',
      'osint-dossier',
      'laboratorio-rat',
      'canva-pro',
      'windows-office'
    ],
    customNotes: 'Administración general, soporte y canal oficial 24/7 de Descuentos Perú.'
  },
  {
    id: 'vendedor-whisky',
    role: 'vendor',
    name: 'Whisky Perú',
    username: 'whiskyper',
    telegramUrl: 'https://t.me/whiskyper',
    avatar: '/imagenes/perfiles/whisky.jpg',
    pin: '1234',
    active: true,
    rating: 5.0,
    salesCount: 340,
    paymentMethods: ['Yape', 'Plin', 'BCP', 'Binance USDT'],
    paymentConfig: {
      yapePhone: '987 112 233',
      plinPhone: '987 112 233',
      paymentInstructions: 'Pagos inmediatos por Yape/Plin. Confirma enviando captura a @whiskyper'
    },
    allowedCategories: ['streaming', 'educacion'],
    allowedServiceIds: ['netflix-4k', 'spotify-premium', 'disney-combo', 'chatgpt-plus', 'canva-pro'],
    customNotes: 'Creador verificado en Descuentos Perú. Especialista en cuentas streaming ultra estables 4K.'
  },
  {
    id: 'vendedor-abby',
    role: 'vendor',
    name: 'Abbys Perú',
    username: 'AbbysPeru',
    telegramUrl: 'https://t.me/AbbysPeru',
    avatar: '/imagenes/perfiles/abby.jpg',
    pin: '1234',
    active: true,
    rating: 4.9,
    salesCount: 420,
    paymentMethods: ['Yape', 'Plin', 'BCP'],
    paymentConfig: {
      yapePhone: '976 543 210',
      plinPhone: '976 543 210',
      paymentInstructions: 'Atención personalizada y entregas al instante vía @AbbysPeru'
    },
    allowedCategories: ['streaming', 'educacion'],
    allowedServiceIds: ['netflix-4k', 'spotify-premium', 'canva-pro', 'windows-office'],
    customNotes: 'Creador verificado. Soporte 24/7 y garantía de renovación continua sin pérdidas de perfil.'
  },
  {
    id: 'vendedor-nano',
    role: 'vendor',
    name: 'El Nano VIP',
    username: 'elnanovip',
    telegramUrl: 'https://t.me/elnanovip',
    avatar: '/imagenes/perfiles/nanovip.jpg',
    pin: '1234',
    active: true,
    rating: 5.0,
    salesCount: 510,
    paymentMethods: ['Yape', 'Plin', 'BCP', 'Binance USDT'],
    paymentConfig: {
      yapePhone: '955 443 322',
      plinPhone: '955 443 322',
      binancePayId: '556677889',
      paymentInstructions: 'Servicios VIP garantizados con activación directa por @elnanovip'
    },
    allowedCategories: ['streaming', 'investigacion', 'educacion'],
    allowedServiceIds: ['netflix-4k', 'spotify-premium', 'disney-combo', 'chatgpt-plus', 'osint-dossier'],
    customNotes: 'Servicio VIP exclusivo de entretenimiento digital, streaming 4K y herramientas de IA.'
  },
  {
    id: 'vendedor-tino',
    role: 'vendor',
    name: 'Tin9o',
    username: 'Tin9o',
    telegramUrl: 'https://t.me/Tin9o',
    whatsapp: '+51 919 192 244',
    avatar: '/imagenes/perfiles/tino.gif',
    pin: '1234',
    active: true,
    rating: 4.9,
    salesCount: 380,
    paymentMethods: ['Yape', 'Plin', 'BCP', 'Binance USDT'],
    paymentConfig: {
      yapePhone: '919 192 244',
      plinPhone: '919 192 244',
      paymentInstructions: 'Atención rápida y segura por Telegram @Tin9o o WhatsApp +51 919 192 244 con reposición garantizada.'
    },
    allowedCategories: ['streaming', 'leaks', 'investigacion'],
    allowedServiceIds: ['netflix-4k', 'disney-combo', 'leaks-filtraciones', 'laboratorio-rat', 'osint-dossier'],
    customNotes: 'Asesor especializado en ciberseguridad, streaming, investigaciones y soporte técnico.'
  }
];

export const VENDORS_STORAGE_KEY = 'dp_vendors_data_v4';

export function getStoredVendors(): Vendor[] {
  try {
    const saved = localStorage.getItem(VENDORS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce WhatsApp rule: only Tin9o has WhatsApp (+51 919 192 244)
        return parsed.map((v: Vendor) => {
          if (v.username === 'Tin9o' || v.id === 'vendedor-tino') {
            return { ...v, whatsapp: '+51 919 192 244' };
          }
          const { whatsapp, ...rest } = v;
          return rest;
        });
      }
    }
  } catch (e) {
    console.warn('Error reading stored vendors, using default data', e);
  }
  return INITIAL_VENDORS;
}

export function saveStoredVendors(vendors: Vendor[]): void {
  try {
    // Sanitize before saving: only Tin9o has whatsapp
    const sanitized = vendors.map((v) => {
      if (v.username === 'Tin9o' || v.id === 'vendedor-tino') {
        return { ...v, whatsapp: '+51 919 192 244' };
      }
      const { whatsapp, ...rest } = v;
      return rest;
    });
    localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving vendors to localStorage', e);
  }
}
