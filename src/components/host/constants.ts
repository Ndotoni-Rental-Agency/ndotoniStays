import {
  Building2,
  Home,
  Castle,
  Palette,
  BedDouble,
  Hotel,
  Warehouse,
  Trees,
  Tent,
  HardHat,
  Moon,
  PartyPopper,
  Camera,
  Briefcase,
  Plane,
  Users,
  Heart,
  Clapperboard,
  Binoculars,
  Waves,
  Leaf,
  Sparkles,
  Building,
  type LucideIcon,
} from 'lucide-react';

export const PROPERTY_TYPES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'APARTMENT', label: 'Apartment', icon: Building2 },
  { value: 'HOUSE', label: 'House', icon: Home },
  { value: 'VILLA', label: 'Villa', icon: Castle },
  { value: 'STUDIO', label: 'Studio', icon: Palette },
  { value: 'ROOM', label: 'Room', icon: BedDouble },
  { value: 'GUESTHOUSE', label: 'Guesthouse', icon: Hotel },
  { value: 'HOTEL', label: 'Hotel', icon: Warehouse },
  { value: 'COTTAGE', label: 'Cottage', icon: Trees },
  { value: 'BUNGALOW', label: 'Bungalow', icon: Home },
  { value: 'LODGE', label: 'Lodge', icon: Tent },
  { value: 'OTHER', label: 'Other', icon: HardHat },
];

export const STAY_CATEGORIES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'NIGHTLY_STAY', label: 'Nightly Stay', icon: Moon },
  { value: 'PARTY', label: 'Party & Events', icon: PartyPopper },
  { value: 'PHOTOSHOOT', label: 'Photoshoot', icon: Camera },
  { value: 'MEETING', label: 'Meeting & Work', icon: Briefcase },
  { value: 'GETAWAY', label: 'Getaway', icon: Plane },
  { value: 'GROUP_TRIP', label: 'Group Trip', icon: Users },
  { value: 'WEDDING', label: 'Wedding', icon: Heart },
  { value: 'FILMING', label: 'Filming', icon: Clapperboard },
  { value: 'SAFARI', label: 'Safari', icon: Binoculars },
  { value: 'BEACH', label: 'Beach', icon: Waves },
  { value: 'NATURE', label: 'Nature', icon: Leaf },
  { value: 'ROMANTIC', label: 'Romantic', icon: Sparkles },
  { value: 'CITY_LIFE', label: 'City Life', icon: Building },
  { value: 'RETREAT', label: 'Retreat', icon: Trees },
];

export const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar',
  'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Iringa',
];

export const AMENITIES = [
  'WiFi', 'Air Conditioning', 'Pool', 'Kitchen', 'Parking', 'Hot Water',
  'TV', 'Washing Machine', 'Generator', 'Security', 'Garden', 'Beach Access',
  'BBQ', 'Gym', 'Balcony', 'Elevator', 'Workspace', 'Sound System',
  'Breakfast', 'Restaurant',
];
