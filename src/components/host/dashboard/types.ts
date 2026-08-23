export interface HostProperty {
  propertyId: string;
  title: string;
  region: string;
  district: string;
  nightlyRate: number;
  currency: string;
  thumbnail: string | null;
  status: string;
  maxGuests: number;
  bedrooms: number | null;
  bathrooms: number | null;
  groupId?: string | null;
  isPrimaryUnit?: boolean | null;
  unitLabel?: string | null;
}

export type CardItem =
  | { kind: 'single'; property: HostProperty }
  | { kind: 'group'; groupId: string; primary: HostProperty; units: HostProperty[] };

/** Groups properties sharing a groupId into one card, primary unit first. Ungrouped properties pass through unchanged. */
export function groupProperties(properties: HostProperty[]): CardItem[] {
  const items: CardItem[] = [];
  const groupUnits = new Map<string, HostProperty[]>();
  const groupOrder: string[] = [];

  for (const property of properties) {
    if (!property.groupId) {
      items.push({ kind: 'single', property });
      continue;
    }
    if (!groupUnits.has(property.groupId)) {
      groupOrder.push(property.groupId);
      groupUnits.set(property.groupId, []);
    }
    groupUnits.get(property.groupId)!.push(property);
  }

  for (const groupId of groupOrder) {
    const units = groupUnits.get(groupId)!;
    const primary = units.find(u => u.isPrimaryUnit) || units[0];
    const rest = units.filter(u => u.propertyId !== primary.propertyId);
    items.push({ kind: 'group', groupId, primary, units: [primary, ...rest] });
  }

  return items;
}
