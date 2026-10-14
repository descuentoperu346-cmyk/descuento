export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'wallet' | 'bank' | 'crypto' | 'card' | 'other';
  icon: string; // identifier or emoji
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
    icon: '🟣',
    active: true,
    beneficiaryName: 'Descuentos Perú Oficial',
    phoneNumber: '999 888 777',
    instructions: 'Envía captura del comprobante al Telegram de tu vendedor para activación en minutos.'
  },
  {
    id: 'plin',
    name: 'Plin',
    type: 'wallet',
    icon: '🔵',
    active: true,
    beneficiaryName: 'Descuentos Perú Oficial',
    phoneNumber: '999 888 777',
    instructions: 'Acepta transferencias interbancarias inmediatas desde BBVA, Interbank y Scotiabank.'
  },
  {
    id: 'bcp',
    name: 'BCP Banco de Crédito',
    type: 'bank',
    icon: '🏦',
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
    icon: '🟩',
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
    icon: '🟦',
    active: false,
    beneficiaryName: 'Descuentos Perú',
    accountNumber: '0011-0123-0200123456',
    cciNumber: '011-123-000200123456-12',
    instructions: 'Depósito o transferencia BBVA sin comisiones nacionales.'
  },
  {
    id: 'binance',
    name: 'Binance Pay / USDT',
    type: 'crypto',
    icon: '🟡',
    active: true,
    beneficiaryName: 'DescuentosPeru_Binance',
    accountNumber: 'Pay ID: 789456123',
    cryptoNetwork: 'USDT (TRC20 / BEP20)',
    cryptoWallet: 'TN3x9XjL8...K91mP',
    instructions: 'Cero comisiones con Binance Pay (Pay ID) o envíos directos USDT red TRC20/BEP20.'
  }
];

export const PAYMENTS_STORAGE_KEY = 'dp_payment_methods';

export function getStoredPaymentMethods(): PaymentMethodItem[] {
  try {
    const saved = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
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
