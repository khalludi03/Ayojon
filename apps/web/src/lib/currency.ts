import type { CurrencyCode } from '@/types';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  rate: number; // Conversion rate from BDT (base currency)
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    locale: 'en-BD',
    rate: 1,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    rate: 0.76, // Mock rate: 1 BDT = 0.76 INR
  },
  PKR: {
    code: 'PKR',
    symbol: 'Rs',
    name: 'Pakistani Rupee',
    locale: 'en-PK',
    rate: 2.53, // Mock rate: 1 BDT = 2.53 PKR
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    rate: 0.0091, // Mock rate: 1 BDT = 0.0091 USD
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'BDT';

/**
 * Convert price from BDT to target currency
 */
export function convertPrice(priceInBDT: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCIES[targetCurrency];
  return Math.round(priceInBDT * config.rate);
}

/**
 * Format price in the specified currency
 */
export function formatCurrencyPrice(
  priceInBDT: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY
): string {
  const config = CURRENCIES[currencyCode];
  const convertedPrice = convertPrice(priceInBDT, currencyCode);

  // For USD, show decimal places
  if (currencyCode === 'USD') {
    return `${config.symbol}${(priceInBDT * config.rate).toFixed(2)}`;
  }

  // For other currencies, format with locale
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedPrice);

  return `${config.symbol}${formatted}`;
}

/**
 * Get currency display info
 */
export function getCurrencyDisplay(code: CurrencyCode): string {
  const config = CURRENCIES[code];
  return `${config.symbol} ${config.code}`;
}

/**
 * Get all available currencies as array
 */
export function getAvailableCurrencies(): Array<CurrencyConfig> {
  return Object.values(CURRENCIES);
}
