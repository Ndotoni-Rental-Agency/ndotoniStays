/**
 * How a property's location is written.
 *
 *   short: ward, district   "Sinza, Ubungo"   (cards, titles; district, region when there's no ward)
 *   full:  street → region  "Mori, Sinza, Ubungo, Dar es Salaam"
 *
 * Values may be official names, typed names or slugs ("mbezi-beach"); all come out title-cased,
 * and a name repeated by the next level (Kinondoni ward in Kinondoni district) is shown once.
 */

export interface LocationParts {
  street?: string | null;
  ward?: string | null;
  district?: string | null;
  region?: string | null;
}

const SMALL_WORDS = new Set(['es', 'wa', 'ya', 'la', 'na', 'za', 'cha', 'kwa', 'of']);

function titleCase(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map((w, i) => (w === 'cbd' ? 'CBD' : i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

const clean = (v?: string | null) => {
  const s = (v || '').trim();
  return s && s !== 'undefined' && s !== 'null' ? titleCase(s) : undefined;
};

export function locationLine(p: LocationParts | null | undefined, form: 'short' | 'full' = 'short'): string {
  if (!p) return '';
  const street = clean(p.street);
  const ward = clean(p.ward);
  const district = clean(p.district);
  const region = clean(p.region);
  const parts = form === 'full'
    ? [street, ward, district, region]
    : ward ? [ward, district || region] : [district, region];
  return parts
    .filter((x): x is string => !!x)
    .filter((x, i, all) => i === 0 || x.toLowerCase() !== all[i - 1].toLowerCase())
    .join(', ');
}
