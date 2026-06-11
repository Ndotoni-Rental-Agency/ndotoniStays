/**
 * Earnings Calculator
 *
 * Deduplicates revenue by date: each calendar date can only contribute
 * to ONE booking's revenue. If multiple bookings claim the same date,
 * paid bookings take priority. Among same-tier bookings, the highest
 * nightly rate wins.
 *
 * This prevents inflated earnings/potential numbers from overlapping bookings.
 */

export interface EarningsBooking {
  bookingId: string;
  status: string;
  paymentStatus: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricing: {
    total: number;
    currency: string;
  } | null;
}

export interface EarningsResult {
  totalPaid: number;
  totalPotential: number;
  currency: string;
}

/**
 * Calculate deduplicated earnings from a list of bookings.
 *
 * Rules:
 * - Only active bookings count (CONFIRMED, COMPLETED, PENDING)
 * - Each date is assigned to at most one booking
 * - Paid (CAPTURED) bookings always take priority over unpaid
 * - Among same payment tier, highest per-night rate wins
 * - "Earned" = sum of per-night values for dates won by paid bookings
 * - "Potential" = sum of per-night values for dates won by unpaid bookings
 */
export function calculateEarnings(
  bookings: EarningsBooking[],
  fallbackCurrency = 'TZS'
): EarningsResult {
  // Only consider active bookings (not cancelled/declined)
  const activeBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED' || b.status === 'PENDING'
  );

  // Build a map of date → best booking claim
  const dateMap = new Map<string, { perNight: number; paid: boolean }>();

  for (const booking of activeBookings) {
    if (!booking.checkInDate || !booking.checkOutDate || !booking.pricing) continue;

    const isPaid = booking.paymentStatus === 'CAPTURED';
    const nights = booking.numberOfNights || 1;
    const perNight = (booking.pricing.total || 0) / nights;

    // Expand booking into individual dates (check-in inclusive, check-out exclusive)
    const start = new Date(booking.checkInDate + 'T00:00:00');
    const end = new Date(booking.checkOutDate + 'T00:00:00');
    const cursor = new Date(start);

    while (cursor < end) {
      const dateStr = cursor.toISOString().split('T')[0];
      const existing = dateMap.get(dateStr);

      // Priority: paid > unpaid, then highest rate
      const shouldReplace = !existing
        || (isPaid && !existing.paid)
        || (isPaid === existing.paid && perNight > existing.perNight);

      if (shouldReplace) {
        dateMap.set(dateStr, { perNight, paid: isPaid });
      }

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Sum up earnings from the date map
  let totalPaid = 0;
  let totalPotential = 0;

  for (const entry of dateMap.values()) {
    if (entry.paid) {
      totalPaid += entry.perNight;
    } else {
      totalPotential += entry.perNight;
    }
  }

  // Detect currency from first paid booking, or first booking, or fallback
  const paidBooking = activeBookings.find((b) => b.paymentStatus === 'CAPTURED');
  const currency = paidBooking?.pricing?.currency
    || activeBookings[0]?.pricing?.currency
    || fallbackCurrency;

  return { totalPaid, totalPotential, currency };
}
