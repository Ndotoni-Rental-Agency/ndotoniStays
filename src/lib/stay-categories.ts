const LABELS: Record<string, string> = { NIGHTLY_STAY: 'Overnight stays', PARTY: 'Party venues', PHOTOSHOOT: 'Photoshoot spaces', BEACH: 'Beach escapes', MEETING: 'Meeting spaces', SAFARI: 'Safari stays' };

export function stayCategoryLabel(value: string) { return LABELS[value] || value.replace(/_/g, ' '); }
