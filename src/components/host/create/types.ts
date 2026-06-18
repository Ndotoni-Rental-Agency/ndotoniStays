export interface CreatePropertyFormData {
  title: string;
  propertyType: string;
  stayCategories: string[];
  region: string;
  district: string;
  ward: string;
  street: string;
  nightlyRate: string;
  currency: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  instantBookEnabled: boolean;
  images: string[];
  videos: string[];
  phoneNumber: string;
  lat: number;
  lng: number;
}

export interface StepProps {
  form: CreatePropertyFormData;
  updateField: (field: string, value: string) => void;
  setForm: React.Dispatch<React.SetStateAction<CreatePropertyFormData>>;
}
