export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  stayCategories: string[];
  region: string;
  district: string;
  street: string;
  city: string;
  googleMapsUrl: string;
  nightlyRate: string;
  currency: string;
  cleaningFee: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
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
