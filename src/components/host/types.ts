export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  region: string;
  district: string;
  street: string;
  city: string;
  nightlyRate: string;
  currency: string;
  cleaningFee: string;
  maxGuests: string;
  amenities: string[];
  minimumStay: string;
  maximumStay: string;
  checkInTime: string;
  checkOutTime: string;
  checkInInstructions: string;
  cancellationPolicy: string;
  houseRules: string;
  instantBookEnabled: boolean;
}

export interface PropertyData {
  propertyId: string;
  title: string;
  description: string;
  propertyType: string;
  address: {
    street: string;
    city: string;
    region: string;
    district: string;
    country: string;
  } | null;
  region: string;
  district: string;
  nightlyRate: number;
  currency: string;
  cleaningFee: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  minimumStay: number;
  maximumStay: number;
  checkInTime: string;
  checkOutTime: string;
  checkInInstructions: string;
  cancellationPolicy: string;
  houseRules: string[];
  instantBookEnabled: boolean;
  status: string;
}
