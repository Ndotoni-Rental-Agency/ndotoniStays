import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = 'TZS'): string {
  if (currency === 'TZS') {
    return `TZS ${amount.toLocaleString()}`;
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString()}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Format date range for display
 */
export function formatDateRange(checkIn: string, checkOut: string): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = new Date(checkIn).toLocaleDateString('en-US', options);
  const end = new Date(checkOut).toLocaleDateString('en-US', options);
  return `${start} – ${end}`;
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get CDN URL for an image path
 */
export function getCdnUrl(path: string): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || '';
  return `${cdnBase}/${path}`;
}

/**
 * Generate WhatsApp URL
 */
export function getWhatsAppUrl(message: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '255756502853';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function findAvailableRanges(
  blockedDates: Set<string>,
  requiredNights: number,
  startSearchFrom: string,
  count = 3
) {
  const results: Array<{
    checkIn: string;
    checkOut: string;
  }> = [];

  const cursor = new Date(startSearchFrom);

  while (results.length < count) {
    let valid = true;

    // Entire stay must be available
    for (let n = 0; n < requiredNights; n++) {
      const day = new Date(cursor);
      day.setDate(day.getDate() + n);

      const key = day.toISOString().split('T')[0];

      if (blockedDates.has(key)) {
        valid = false;
        break;
      }
    }

    if (valid) {
      const checkIn = new Date(cursor);

      const checkOut = new Date(cursor);
      checkOut.setDate(checkOut.getDate() + requiredNights);

      results.push({
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
      });

      cursor.setDate(cursor.getDate() + requiredNights + 1);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }

    // Stop searching after 1 year
    const oneYearLater = new Date(startSearchFrom);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    if (cursor > oneYearLater) {
      break;
    }
  }

  return results;
}