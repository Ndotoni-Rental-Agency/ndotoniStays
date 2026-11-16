import 'server-only';
import { cache } from 'react';
import { prepareStays, type Property } from '@/lib/home-stays';

/**
 * Data + copy for the programmatic landing pages:
 *   /places-to-stay                      hub
 *   /places-to-stay/[region]             region (all stay types)
 *   /places-to-stay/[region]/[category]  region + stay category (party venues, beach stays, ...)
 */

export const BASE_URL = 'https://www.ndotonistays.com';
export const BASE_PATH = '/places-to-stay';
/** Minimum available listings before a page is indexable / in the sitemap. */
export const MIN_LISTINGS_TO_INDEX = 3;

export interface RegionInfo {
  slug: string;
  /** Value the search API expects. */
  name: string;
  intro: string;
  tips: string[];
}

export const REGIONS: RegionInfo[] = [
  {
    slug: 'dar-es-salaam',
    name: 'Dar es Salaam',
    intro:
      "Dar es Salaam is Tanzania's largest city and its business capital, so stays here range from city apartments in Masaki, Oyster Bay and Mikocheni to beachside houses around Mbezi Beach and Kigamboni. Traffic is the main thing to plan around: a stay close to where you will spend your days usually saves more time than it costs.",
    tips: [
      'Check the distance to your meetings or event venue at rush hour, not on a map at midday.',
      'Ask the host about backup power and water – both matter for longer stays.',
      'Kigamboni and the north-coast beaches are quieter but need a ferry or a longer drive into town.',
    ],
  },
  {
    slug: 'zanzibar',
    name: 'Zanzibar',
    intro:
      'Zanzibar combines historic Stone Town with long beaches on the north and east coasts. Where you stay changes the trip: Stone Town for culture and food, Nungwi and Kendwa for sunsets and swimming, Paje and Jambiani for kite-surfing and quiet beaches.',
    tips: [
      'Tides on the east coast change how swimmable the beach is – ask the host about low-tide hours.',
      'Book early for December–February and June–August, the busiest periods.',
      'Confirm the nightly rate currency and whether taxes or cleaning fees are added.',
    ],
  },
  {
    slug: 'arusha',
    name: 'Arusha',
    intro:
      'Arusha is the base for northern-circuit safaris, Mount Meru and Kilimanjaro treks. Stays here suit travellers who want a comfortable night before or after a safari, as well as business visitors attending conferences in the city.',
    tips: [
      'Many safari operators collect guests from the accommodation – confirm the pick-up location with your host.',
      'Evenings can be cool; check for hot water and bedding if you are arriving late.',
    ],
  },
  {
    slug: 'mwanza',
    name: 'Mwanza',
    intro:
      'Mwanza sits on the southern shore of Lake Victoria and is the gateway to Serengeti-western-corridor trips and Rubondo Island. Short stays here suit business travellers, lake-view weekends and onward travel.',
    tips: ['Lake-view stays can be breezy and cooler in the evening; check the layout of balconies and windows.'],
  },
  {
    slug: 'dodoma',
    name: 'Dodoma',
    intro:
      "Dodoma is Tanzania's capital, with a steady flow of government and institutional visitors. Short-term apartments and houses are popular for work trips, meetings and conferences.",
    tips: ['Check distance to the government city (Mtumba) or your venue before booking – the city is spread out.'],
  },
  {
    slug: 'mbeya',
    name: 'Mbeya',
    intro:
      'Mbeya is a highland city near Lake Ngozi and the Southern Highlands, popular with business travellers and visitors heading to nearby nature spots.',
    tips: ['Evenings are cold in the highlands; confirm bedding and hot water.'],
  },
  {
    slug: 'morogoro',
    name: 'Morogoro',
    intro:
      'Morogoro lies at the foot of the Uluguru Mountains, a short trip from Dar es Salaam and close to Mikumi National Park. It suits weekend getaways, university visits and small group stays.',
    tips: ['Mikumi is a day trip from many Morogoro stays – ask hosts about local drivers and guides.'],
  },
  {
    slug: 'tanga',
    name: 'Tanga',
    intro:
      'Tanga is a relaxed coastal city near the Usambara Mountains and the Pangani coast, good for beach weekends and quieter alternatives to Dar es Salaam.',
    tips: ['Check distance to the beach and whether the property has its own water supply.'],
  },
  {
    slug: 'kilimanjaro',
    name: 'Kilimanjaro',
    intro:
      'The Kilimanjaro region, centred on Moshi, is the starting point for climbs of Africa’s highest mountain and for coffee-farm and waterfall day trips. Stays here suit trekkers resting before or after a climb.',
    tips: ['Confirm laundry, hot water and secure luggage storage if you are arriving or returning from a climb.'],
  },
  {
    slug: 'iringa',
    name: 'Iringa',
    intro:
      'Iringa is a highland town on the road to Ruaha National Park, with cool weather and an easy pace. Short stays suit overnight stops on the way to the park and quiet weekends away.',
    tips: ['If you are driving to Ruaha, confirm secure parking with the host.'],
  },
];

export interface CategoryInfo {
  slug: string;
  /** StayCategory enum value */
  value: string;
  /** Plural noun phrase, e.g. "party venues" */
  noun: string;
  /** Title-cased label for headings */
  label: string;
  intro: string;
  tips: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'nightly-stays',
    value: 'NIGHTLY_STAY',
    noun: 'nightly stays',
    label: 'Nightly Stays',
    intro: 'Apartments, houses and rooms you can book by the night, with your own space and the freedom of a home instead of a hotel.',
    tips: ['Compare the total price for your dates, not just the nightly rate – cleaning fees and taxes can apply.', 'Read the house rules before booking, especially for check-in time and guests.'],
  },
  {
    slug: 'beach-stays',
    value: 'BEACH',
    noun: 'beach stays',
    label: 'Beach Stays',
    intro: 'Places to stay close to the sea, from simple beach houses to larger villas for families and groups.',
    tips: ['Ask how far the beach really is and whether it is swimmable at low tide.', 'Check for backup power and fresh-water supply in more remote beach locations.'],
  },
  {
    slug: 'safari-stays',
    value: 'SAFARI',
    noun: 'safari stays',
    label: 'Safari Stays',
    intro: 'Stays chosen for travellers heading to or returning from national parks, with easy access to road routes and safari operators.',
    tips: ['Confirm pick-up arrangements with your safari operator and the host.', 'Check for secure parking if you are self-driving.'],
  },
  {
    slug: 'party-venues',
    value: 'PARTY',
    noun: 'party venues',
    label: 'Party Venues',
    intro: 'Spaces that hosts make available for birthdays, gatherings and celebrations. Rules on guests, noise and hours differ from place to place, so check them before you book.',
    tips: ['Ask the host the maximum number of guests and the noise cut-off time before you pay.', 'Confirm whether outside caterers, DJs or decorations are allowed.', 'Check what damage deposit or cleaning fee applies.'],
  },
  {
    slug: 'photoshoot-locations',
    value: 'PHOTOSHOOT',
    noun: 'photoshoot locations',
    label: 'Photoshoot Locations',
    intro: 'Homes, gardens and interiors that photographers and creators can book for shoots, with the space and light to work with.',
    tips: ['Agree the hours, crew size and equipment (lights, backdrops) with the host in advance.', 'Visit at the time of day you plan to shoot to check natural light.'],
  },
  {
    slug: 'meeting-spaces',
    value: 'MEETING',
    noun: 'meeting spaces',
    label: 'Meeting Spaces',
    intro: 'Private spaces for small meetings, workshops and team days away from the office.',
    tips: ['Check seating capacity, internet reliability and backup power.', 'Ask whether refreshments or catering can be arranged.'],
  },
  {
    slug: 'filming-locations',
    value: 'FILMING',
    noun: 'filming locations',
    label: 'Filming Locations',
    intro: 'Properties available for film, video and commercial production, with different looks and layouts.',
    tips: ['Agree the shooting schedule, crew size and any restrictions on moving furniture with the host.', 'Confirm power availability for lighting and equipment.'],
  },
  {
    slug: 'wedding-venues',
    value: 'WEDDING',
    noun: 'wedding venues',
    label: 'Wedding Venues',
    intro: 'Properties hosts offer for weddings and related events, from intimate gatherings to larger celebrations.',
    tips: ['Confirm maximum guest numbers, permitted hours and whether outside vendors are allowed.', 'Visit in person before paying a deposit.'],
  },
  {
    slug: 'romantic-getaways',
    value: 'ROMANTIC',
    noun: 'romantic getaways',
    label: 'Romantic Getaways',
    intro: 'Quiet, private places for couples, anniversaries and short breaks.',
    tips: ['Look at the photos for privacy – walls, gardens and views.', 'Ask the host about any extras they can arrange.'],
  },
  {
    slug: 'group-stays',
    value: 'GROUP_TRIP',
    noun: 'group stays',
    label: 'Group Stays',
    intro: 'Larger homes and multi-bedroom stays that suit friends, families and team trips travelling together.',
    tips: ['Check the number of beds, not only bedrooms, and the maximum guests.', 'Split the cost per person to compare with several smaller bookings.'],
  },
  {
    slug: 'retreats',
    value: 'RETREAT',
    noun: 'retreat venues',
    label: 'Retreat Venues',
    intro: 'Calm places suited to wellness weekends, team offsites and small retreats.',
    tips: ['Ask about kitchen access, outdoor space and quiet hours.'],
  },
  {
    slug: 'city-stays',
    value: 'CITY_LIFE',
    noun: 'city stays',
    label: 'City Stays',
    intro: 'Apartments and homes in central areas, close to restaurants, offices and transport.',
    tips: ['Check noise levels at night and whether parking is included.'],
  },
  {
    slug: 'nature-stays',
    value: 'NATURE',
    noun: 'nature stays',
    label: 'Nature Stays',
    intro: 'Places surrounded by gardens, hills or countryside, away from the noise of town.',
    tips: ['Ask about road access in the rainy season and the nearest shops.'],
  },
  {
    slug: 'weekend-getaways',
    value: 'GETAWAY',
    noun: 'weekend getaways',
    label: 'Weekend Getaways',
    intro: 'Short breaks within easy reach, for a change of scene over a weekend.',
    tips: ['Weekend dates book up first – check availability early.'],
  },
];

export const getRegion = (slug: string) => REGIONS.find((r) => r.slug === slug);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export function pageUrl(regionSlug?: string, categorySlug?: string): string {
  return [BASE_URL + BASE_PATH, regionSlug, categorySlug].filter(Boolean).join('/');
}

const QUERY = `query PlacesToStay($input: ShortTermSearchInput!) {
  searchShortTermProperties(input: $input) {
    nextToken
    properties {
      propertyId title status verified nightlyRate currency propertyType region district
      address { ward street } thumbnail images averageRating
      ratingSummary { averageRating totalReviews } maxGuests bedrooms bathrooms instantBookEnabled stayCategories
    }
  }
}`;

type PageResult = { properties?: (Property & { status?: string })[]; nextToken?: string | null };

const PAGE_SIZE = 100;
const MAX_PAGES = 5;

/**
 * Every available listing for a region (paged). Memoised per request and cached by Next's fetch
 * cache for an hour, so the region page and each category page share one backend fetch.
 * No dates are sent: these pages show what exists, not availability for a specific night.
 */
export const fetchRegionStays = cache(async (region: string): Promise<Property[]> => {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  const key = process.env.NEXT_PUBLIC_API_KEY;
  if (!endpoint || !key) return [];

  const all: (Property & { status?: string })[] = [];
  let nextToken: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key },
        body: JSON.stringify({ query: QUERY, variables: { input: { region, limit: PAGE_SIZE, nextToken } } }),
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) break;
      const json = await res.json();
      const result: PageResult | undefined = json.data?.searchShortTermProperties;
      if (!result || json.errors) break;
      all.push(...(result.properties || []));
      nextToken = result.nextToken || undefined;
      if (!nextToken) break;
    } catch (error) {
      console.error('[stayPages] fetch failed for', region, error);
      break;
    }
  }
  const available = all.filter((p) => !p.status || p.status === 'AVAILABLE');
  return prepareStays(available).sort((a, b) => a.propertyId.localeCompare(b.propertyId));
});

export function filterByCategory(stays: Property[], value: string): Property[] {
  return stays.filter((p) => p.stayCategories?.includes(value as NonNullable<Property['stayCategories']>[number]));
}

/** Categories with enough listings in this region to deserve their own page. */
export function categoriesWithStays(stays: Property[]) {
  return CATEGORIES.map((category) => ({ category, count: filterByCategory(stays, category.value).length })).filter(
    (x) => x.count >= MIN_LISTINGS_TO_INDEX,
  );
}

export interface PriceStats {
  currency: 'TZS' | 'USD' | null;
  min: number | null;
  median: number | null;
  max: number | null;
  count: number;
}

export function priceStats(stays: Property[]): PriceStats {
  for (const currency of ['TZS', 'USD'] as const) {
    const rates = stays
      .filter((p) => (p.currency || 'TZS').toUpperCase() === currency && Number(p.nightlyRate) > 0)
      .map((p) => Number(p.nightlyRate))
      .sort((a, b) => a - b);
    if (rates.length >= 3) {
      const mid = Math.floor(rates.length / 2);
      const median = rates.length % 2 ? rates[mid] : Math.round((rates[mid - 1] + rates[mid]) / 2);
      return { currency, min: rates[0], median, max: rates[rates.length - 1], count: rates.length };
    }
  }
  return { currency: null, min: null, median: null, max: null, count: 0 };
}

export function formatNightly(amount: number, currency: 'TZS' | 'USD'): string {
  if (currency === 'USD') return `$${Math.round(amount).toLocaleString('en-US')}`;
  // Round to the nearest 5,000 so copy doesn't imply false precision.
  return `TZS ${(Math.round(amount / 5000) * 5000).toLocaleString('en-US')}`;
}
