import {  clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {ClassValue} from 'clsx';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: string = 'BDT',
  locale: string = 'en-BD'
): string {
  const symbols: Record<string, string> = {
    BDT: '৳',
    INR: '₹',
    PKR: 'Rs',
    USD: '$',
  };

  const symbol = symbols[currency] || currency;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `${symbol}${formatted}`;
}

/**
 * Format discount percentage for display
 */
export function formatDiscount(percentage: number): string {
  return `-${Math.round(percentage)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Promise-based delay for mock services
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random delay between min and max milliseconds
 */
export function randomDelay(min: number = 200, max: number = 500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format countdown time
 */
export function formatCountdown(totalSeconds: number): {
  hours: string;
  minutes: string;
  seconds: string;
} {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

/**
 * Calculate time remaining until a date
 */
export function getTimeRemaining(endDate: string | Date): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}

/**
 * Format rating stars (returns number of filled stars)
 */
export function formatRating(rating: number): number {
  return Math.round(rating * 2) / 2; // Round to nearest 0.5
}

/**
 * Format review count for display
 */
export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  return new Date(date).getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  return new Date(date).getTime() > Date.now();
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
