import { PropertyFormData } from '@/components/host/types';

const MAX_STAY_NIGHTS = 365;
const MAPS_LINK_PATTERN = /^https?:\/\/.*(goo\.gl|google\.\w+\/maps|maps\.app)/i;

/**
 * Validates the fields a host can silently corrupt via `parseFloat(...) || 0`-style
 * fallbacks in handleSave (e.g. clearing the price field would otherwise publish a
 * free listing). Returns a user-facing error message, or null if the form is valid.
 */
export function validatePropertyForm(form: PropertyFormData): string | null {
  // People search by ward, and the street tells us exactly where the place is.
  if (!form.ward?.trim()) return 'Please add the ward (kata) in the Location section.';
  if (!form.street?.trim()) return 'Please add the street (mtaa) in the Location section.';

  const nightlyRate = parseFloat(form.nightlyRate);
  if (!nightlyRate || nightlyRate <= 0) return 'Nightly rate must be greater than 0.';

  const maxGuests = parseInt(form.maxGuests, 10);
  if (!maxGuests || maxGuests < 1) return 'Max guests must be at least 1.';

  const minimumStay = parseInt(form.minimumStay, 10) || 1;
  const maximumStay = parseInt(form.maximumStay, 10) || MAX_STAY_NIGHTS;
  if (maximumStay < minimumStay) return 'Maximum stay cannot be shorter than the minimum stay.';
  if (maximumStay > MAX_STAY_NIGHTS) return `Maximum stay cannot be more than ${MAX_STAY_NIGHTS} nights.`;

  const mapsUrl = form.googleMapsUrl?.trim();
  if (mapsUrl && !MAPS_LINK_PATTERN.test(mapsUrl)) {
    return "That doesn't look like a Google Maps link — paste a valid one or leave it blank.";
  }

  return null;
}
