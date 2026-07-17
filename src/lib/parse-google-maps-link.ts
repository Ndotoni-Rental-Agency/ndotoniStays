/**
 * Parse coordinates from various Google Maps URL formats.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GoogleMapsParser {
  static parse(input: string): Coordinates | null {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    return (
      GoogleMapsParser.fromAtSign(trimmed) ||
      GoogleMapsParser.fromQueryParam(trimmed) ||
      GoogleMapsParser.fromPlaceCoords(trimmed) ||
      GoogleMapsParser.fromRawCoords(trimmed)
    );
  }

  static async parseAsync(input: string): Promise<Coordinates | null> {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    const direct = GoogleMapsParser.parse(trimmed);
    if (direct) return direct;

    if (GoogleMapsParser.isShortLink(trimmed)) {
      const resolved = await GoogleMapsParser.resolveShortLink(trimmed);
      if (resolved) return GoogleMapsParser.parse(resolved);
    }

    return null;
  }

  static isShortLink(url: string): boolean {
    return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(url);
  }

  static async resolveShortLink(shortUrl: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.url || null;
    } catch {
      return null;
    }
  }

  static fromAtSign(url: string): Coordinates | null {
    const match = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    return match ? GoogleMapsParser.validate(parseFloat(match[1]), parseFloat(match[2])) : null;
  }

  static fromQueryParam(url: string): Coordinates | null {
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) return GoogleMapsParser.validate(parseFloat(qMatch[1]), parseFloat(qMatch[2]));

    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) return GoogleMapsParser.validate(parseFloat(llMatch[1]), parseFloat(llMatch[2]));

    const centerMatch = url.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (centerMatch) return GoogleMapsParser.validate(parseFloat(centerMatch[1]), parseFloat(centerMatch[2]));

    return null;
  }

  static fromPlaceCoords(url: string): Coordinates | null {
    const match = url.match(/\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    return match ? GoogleMapsParser.validate(parseFloat(match[1]), parseFloat(match[2])) : null;
  }

  static fromRawCoords(text: string): Coordinates | null {
    const match = text.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    return match ? GoogleMapsParser.validate(parseFloat(match[1]), parseFloat(match[2])) : null;
  }

  static validate(lat: number, lng: number): Coordinates | null {
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;
    return { latitude: lat, longitude: lng };
  }
}

export const parseGoogleMapsLink = GoogleMapsParser.parse;
