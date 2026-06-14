export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  stayCategories: string[];
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
  checkInInstructions: CheckInInstructionsForm;
  cancellationPolicy: string;
  houseRules: string;
  instantBookEnabled: boolean;
}

export interface CheckInInstructionsForm {
  wifiName: string;
  wifiPassword: string;
  accessCode: string;
  directions: string;
  parkingInfo: string;
  contactPhone: string;
  contactName: string;
  additionalNotes: string;
  houseRules: string[];
}

export const EMPTY_CHECKIN_INSTRUCTIONS: CheckInInstructionsForm = {
  wifiName: '',
  wifiPassword: '',
  accessCode: '',
  directions: '',
  parkingInfo: '',
  contactPhone: '',
  contactName: '',
  additionalNotes: '',
  houseRules: [],
};

export interface PropertyData {
  propertyId: string;
  title: string;
  description: string;
  propertyType: string;
  stayCategories: string[] | null;
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
  checkInInstructions: {
    wifiName?: string;
    wifiPassword?: string;
    accessCode?: string;
    directions?: string;
    parkingInfo?: string;
    contactPhone?: string;
    contactName?: string;
    additionalNotes?: string;
    houseRules?: string[];
  } | null;
  cancellationPolicy: string;
  houseRules: string[];
  instantBookEnabled: boolean;
  status: string;
}
