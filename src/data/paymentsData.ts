export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'wallet' | 'bank' | 'crypto' | 'card' | 'other';
  icon: string;
  logoUrl?: string;
  active: boolean;
  beneficiaryName: string;
  accountNumber?: string;
  cciNumber?: string;
  phoneNumber?: string;
  cryptoNetwork?: string;
  cryptoWallet?: string;
  qrImageUrl?: string;
  instructions?: string;
}

export const INITIAL_PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'yape',
    name: 'Yape',
    type: 'wallet',
    icon: 'wallet',
    logoUrl: '/imagenes/iconos-pago/yape.png',
    active: true,
    beneficiaryName: 'Descuentos Perú Oficial',
    phoneNumber: '999 888 777',
    instructions: 'Envía captura del comprobante al Telegram de tu vendedor para activación en minutos.'
  },
  {
    id: 'plin',
    name: 'Plin',
    type: 'wallet',
    icon: 'wallet',
    logoUrl: '/imagenes/iconos-pago/plin.png',
    active: true,
    beneficiaryName: 'Descuentos Perú Oficial',
    phoneNumber: '999 888 777',
    instructions: 'Acepta transferencias interbancarias inmediatas desde BBVA, Interbank y Scotiabank.'
  },
  {
    id: 'bcp',
    name: 'BCP Banco de Crédito',
    type: 'bank',
    icon: 'bank',
    logoUrl: '/imagenes/iconos-pago/bcp.png',
    active: true,
    beneficiaryName: 'Descuentos Perú',
    accountNumber: '193-98765432-0-12',
    cciNumber: '002-193-009876543201-14',
    instructions: 'Transferencias directas BCP o interbancarias inmediatas sin comisión.'
  },
  {
    id: 'interbank',
    name: 'Interbank',
    type: 'bank',
    icon: 'bank',
    logoUrl: '/imagenes/iconos-pago/interbank.png',
    active: true,
    beneficiaryName: 'Descuentos Perú',
    accountNumber: '200-3001234567',
    cciNumber: '003-200-013001234567-28',
    instructions: 'Transferencia por banca por internet o app Interbank.'
  },
  {
    id: 'bbva',
    name: 'BBVA Continental',
    type: 'bank',
    icon: 'bank',
    logoUrl: '/imagenes/iconos-pago/bbva.png',
    active: true,
    beneficiaryName: 'Descuentos Perú',
    accountNumber: '0011-0123-0200123456',
    cciNumber: '011-123-000200123456-12',
    instructions: 'Depósito o transferencia BBVA sin comisiones nacionales.'
  },
  {
    id: 'lemon',
    name: 'Lemon Cash',
    type: 'wallet',
    icon: 'wallet',
    logoUrl: '/imagenes/iconos-pago/lemon-app.jpg',
    active: true,
    beneficiaryName: 'Descuentos Perú'
  },
  {
    id: 'panda',
    name: 'Panda',
    type: 'wallet',
    icon: 'wallet',
    logoUrl: '/imagenes/iconos-pago/panda-app.jpg',
    active: true,
    beneficiaryName: 'Descuentos Perú'
  },
  {
    id: 'pagoefectivo',
    name: 'PagoEfectivo',
    type: 'other',
    icon: 'other',
    logoUrl: '/imagenes/iconos-pago/pagoefectivo-app.jpg',
    active: true,
    beneficiaryName: 'Descuentos Perú'
  },
  {
    id: 'moni',
    name: 'Moni',
    type: 'wallet',
    icon: 'wallet',
    logoUrl: '/imagenes/iconos-pago/moni-app.jpg',
    active: true,
    beneficiaryName: 'Descuentos Perú'
  },
  {
    id: 'cajaarequipa',
    name: 'Caja Arequipa',
    type: 'bank',
    icon: 'bank',
    logoUrl: '/imagenes/iconos-pago/cajaarequipa-app.jpg',
    active: true,
    beneficiaryName: 'Descuentos Perú'
  },
  {
    id: 'sip',
    name: 'SIP',
    type: 'wallet',
    icon: 'wallet',
    logoUrl: '/imagenes/iconos-pago/sip-app.jpg',
    active: true,
    beneficiaryName: 'Descuentos Perú'
  }
];

export const PAYMENTS_STORAGE_KEY = 'dp_payment_methods';

export function getStoredPaymentMethods(): PaymentMethodItem[] {
  try {
    const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out binance if it was stored in localStorage previously
        const cleaned: PaymentMethodItem[] = parsed
          .filter((p: PaymentMethodItem) => p.id !== 'binance')
          .map((p: PaymentMethodItem) => {
            const init = INITIAL_PAYMENT_METHODS.find((i) => i.id === p.id);
            return {
              ...p,
              // Always use updated high-res logoUrl from initial list if it's one of standard peruvian banks
              logoUrl: init?.logoUrl || p.logoUrl || ''
            };
          });
        // Make sure all 5 initial methods exist
        INITIAL_PAYMENT_METHODS.forEach((initMethod) => {
          if (!cleaned.some((p: PaymentMethodItem) => p.id === initMethod.id)) {
            cleaned.push(initMethod);
          }
        });
        return cleaned;
      }
    }
  } catch (e) {
    console.warn('Error reading stored payment methods, using default', e);
  }
  return INITIAL_PAYMENT_METHODS;
}

export function saveStoredPaymentMethods(methods: PaymentMethodItem[]): void {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(methods));
  } catch (e) {
    console.error('Error saving payment methods to localStorage', e);
  }
}
