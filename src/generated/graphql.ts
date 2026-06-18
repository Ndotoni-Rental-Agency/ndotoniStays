/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AWSDate: { input: string; output: string; }
  AWSDateTime: { input: string; output: string; }
  AWSEmail: { input: string; output: string; }
  AWSIPAddress: { input: unknown; output: unknown; }
  AWSJSON: { input: string; output: string; }
  AWSPhone: { input: string; output: string; }
  AWSTime: { input: unknown; output: unknown; }
  AWSTimestamp: { input: unknown; output: unknown; }
  AWSURL: { input: string; output: string; }
};

export type AccountStatus =
  | 'ACTIVE'
  | 'PENDING_LANDLORD_VERIFICATION'
  | 'PENDING_VERIFICATION'
  | 'SUSPENDED';

export type Address = {
  __typename?: 'Address';
  coordinates?: Maybe<Coordinates>;
  district: Scalars['String']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
  region: Scalars['String']['output'];
  street?: Maybe<Scalars['String']['output']>;
  ward?: Maybe<Scalars['String']['output']>;
};

export type AddressInput = {
  coordinates?: InputMaybe<CoordinatesInput>;
  district: Scalars['String']['input'];
  postalCode?: InputMaybe<Scalars['String']['input']>;
  region: Scalars['String']['input'];
  street?: InputMaybe<Scalars['String']['input']>;
  ward?: InputMaybe<Scalars['String']['input']>;
};

export type Admin = {
  __typename?: 'Admin';
  accountStatus?: Maybe<AccountStatus>;
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['AWSDateTime']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailNotifications?: Maybe<Scalars['Boolean']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hasProperties?: Maybe<Scalars['Boolean']['output']>;
  isEmailVerified?: Maybe<Scalars['Boolean']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  nationalIdLast4?: Maybe<Scalars['String']['output']>;
  occupation?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Scalars['String']['output']>>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  pushNotifications?: Maybe<Scalars['Boolean']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  smsNotifications?: Maybe<Scalars['Boolean']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  userType: UserType;
  ward?: Maybe<Scalars['String']['output']>;
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type Agent = {
  __typename?: 'Agent';
  accountStatus?: Maybe<AccountStatus>;
  address?: Maybe<Scalars['String']['output']>;
  agencyName?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['AWSDateTime']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailNotifications?: Maybe<Scalars['Boolean']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hasProperties?: Maybe<Scalars['Boolean']['output']>;
  isEmailVerified?: Maybe<Scalars['Boolean']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  licenseNumber?: Maybe<Scalars['String']['output']>;
  nationalIdLast4?: Maybe<Scalars['String']['output']>;
  occupation?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  pushNotifications?: Maybe<Scalars['Boolean']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  smsNotifications?: Maybe<Scalars['Boolean']['output']>;
  specializations?: Maybe<Array<Scalars['String']['output']>>;
  street?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  userType: UserType;
  ward?: Maybe<Scalars['String']['output']>;
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type ApplicantDetails = {
  __typename?: 'ApplicantDetails';
  emergencyContact: EmergencyContact;
  hasPets: Scalars['Boolean']['output'];
  leaseDuration: Scalars['Int']['output'];
  monthlyIncome: Scalars['Float']['output'];
  moveInDate: Scalars['AWSDateTime']['output'];
  numberOfOccupants: Scalars['Int']['output'];
  occupation: Scalars['String']['output'];
  petDetails?: Maybe<Scalars['String']['output']>;
  smokingStatus: SmokingStatus;
};

export type ApplicantDetailsInput = {
  emergencyContact: EmergencyContactInput;
  employmentStatus: EmploymentStatus;
  hasPets: Scalars['Boolean']['input'];
  leaseDuration: Scalars['Int']['input'];
  monthlyIncome: Scalars['Float']['input'];
  moveInDate: Scalars['AWSDateTime']['input'];
  numberOfOccupants: Scalars['Int']['input'];
  occupation: Scalars['String']['input'];
  petDetails?: InputMaybe<Scalars['String']['input']>;
  smokingStatus: SmokingStatus;
};

export type Application = {
  __typename?: 'Application';
  applicant?: Maybe<TenantBasicInfo>;
  applicantDetails: ApplicantDetails;
  applicationId: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  landlord?: Maybe<LandlordBasicInfo>;
  landlordNotes?: Maybe<Scalars['String']['output']>;
  property?: Maybe<Property>;
  propertyId: Scalars['ID']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status: ApplicationStatus;
  submittedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  updatedAt?: Maybe<Scalars['AWSDateTime']['output']>;
};

export type ApplicationListResponse = {
  __typename?: 'ApplicationListResponse';
  applications: Array<Application>;
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type ApplicationResponse = {
  __typename?: 'ApplicationResponse';
  applicationId?: Maybe<Scalars['ID']['output']>;
  message: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  submittedAt?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ApplicationStats = {
  __typename?: 'ApplicationStats';
  approved: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
  submitted: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  underReview: Scalars['Int']['output'];
  withdrawn: Scalars['Int']['output'];
};

export type ApplicationStatus =
  | 'APPROVED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'WITHDRAWN';

export type AssociateWhatsAppResponse = {
  __typename?: 'AssociateWhatsAppResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type BlockDatesInput = {
  endDate: Scalars['AWSDate']['input'];
  propertyId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['AWSDate']['input'];
};

export type BlockedDateRange = {
  __typename?: 'BlockedDateRange';
  endDate: Scalars['AWSDate']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['AWSDate']['output'];
};

export type BlockedDatesResponse = {
  __typename?: 'BlockedDatesResponse';
  blockedRanges: Array<BlockedDateRange>;
  propertyId: Scalars['ID']['output'];
};

export type Booking = {
  __typename?: 'Booking';
  bookingId: Scalars['ID']['output'];
  bookingType: BookingType;
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['AWSDateTime']['output']>;
  checkInDate: Scalars['AWSDate']['output'];
  checkOutDate: Scalars['AWSDate']['output'];
  completedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  confirmedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  createdAt: Scalars['AWSDateTime']['output'];
  guest?: Maybe<PropertyUser>;
  guestId: Scalars['ID']['output'];
  hostNotes?: Maybe<Scalars['String']['output']>;
  numberOfAdults: Scalars['Int']['output'];
  numberOfChildren: Scalars['Int']['output'];
  numberOfGuests: Scalars['Int']['output'];
  numberOfInfants: Scalars['Int']['output'];
  numberOfNights: Scalars['Int']['output'];
  paymentIntentId?: Maybe<Scalars['String']['output']>;
  paymentStatus: PaymentStatus;
  pricing: BookingPricing;
  property?: Maybe<ShortTermProperty>;
  propertyId: Scalars['ID']['output'];
  specialRequests?: Maybe<Scalars['String']['output']>;
  status: BookingStatus;
  updatedAt: Scalars['AWSDateTime']['output'];
};

export type BookingListResponse = {
  __typename?: 'BookingListResponse';
  bookings: Array<Booking>;
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type BookingPricing = {
  __typename?: 'BookingPricing';
  cleaningFee: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  nightlyRate: Scalars['Float']['output'];
  numberOfNights: Scalars['Int']['output'];
  refundAmount?: Maybe<Scalars['Float']['output']>;
  refundPercentage?: Maybe<Scalars['Float']['output']>;
  serviceFee: Scalars['Float']['output'];
  subtotal: Scalars['Float']['output'];
  taxes: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type BookingStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'NO_SHOW'
  | 'PENDING';

export type BookingType =
  | 'INSTANT'
  | 'REQUEST';

export type BusyBlock = {
  __typename?: 'BusyBlock';
  createdAt: Scalars['String']['output'];
  endUtc: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  recurrence?: Maybe<BusyBlockRecurrence>;
  startUtc: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type BusyBlockRecurrence = {
  __typename?: 'BusyBlockRecurrence';
  days?: Maybe<Array<Scalars['Int']['output']>>;
  endDate: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type BusyBlockRecurrenceInput = {
  days?: InputMaybe<Array<Scalars['Int']['input']>>;
  endDate: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type CancelBookingResponse = {
  __typename?: 'CancelBookingResponse';
  booking: Booking;
  message: Scalars['String']['output'];
  refundAmount: Scalars['Float']['output'];
  refundPercentage: Scalars['Float']['output'];
};

export type CancellationPolicy =
  | 'FLEXIBLE'
  | 'MODERATE'
  | 'STRICT';

export type CategorizedPropertiesResponse = {
  __typename?: 'CategorizedPropertiesResponse';
  favorites?: Maybe<CategoryPropertyResponse>;
  lowestPrice: CategoryPropertyResponse;
  more?: Maybe<CategoryPropertyResponse>;
  mostViewed?: Maybe<CategoryPropertyResponse>;
  nearby: CategoryPropertyResponse;
  recentlyViewed?: Maybe<CategoryPropertyResponse>;
};

export type CategoryPropertyResponse = {
  __typename?: 'CategoryPropertyResponse';
  category: PropertyCategory;
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  properties: Array<PropertyCard>;
};

export type ChatInitializationResponse = {
  __typename?: 'ChatInitializationResponse';
  conversationId: Scalars['ID']['output'];
  landlordInfo: ChatLandlordInfo;
  propertyId: Scalars['ID']['output'];
  propertyTitle: Scalars['String']['output'];
};

export type ChatLandlordInfo = {
  __typename?: 'ChatLandlordInfo';
  businessName?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  profileImage?: Maybe<Scalars['String']['output']>;
};

export type ChatMessage = {
  __typename?: 'ChatMessage';
  content: Scalars['String']['output'];
  conversationId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isMine: Scalars['Boolean']['output'];
  isRead: Scalars['Boolean']['output'];
  senderId?: Maybe<Scalars['String']['output']>;
  senderName: Scalars['String']['output'];
  timestamp: Scalars['AWSDateTime']['output'];
};

export type CognitoUserPool = {
  userPoolId: Scalars['String']['input'];
};

export type CombinedPropertyListResponse = {
  __typename?: 'CombinedPropertyListResponse';
  longTermProperties: Array<Property>;
  nextToken?: Maybe<Scalars['String']['output']>;
  shortTermProperties: Array<ShortTermProperty>;
  totalCount: Scalars['Int']['output'];
};

export type CombinedPropertyStats = {
  __typename?: 'CombinedPropertyStats';
  longTerm: PropertyStats;
  shortTerm: PropertyStats;
  total: PropertyStats;
};

export type ContactInquiry = {
  __typename?: 'ContactInquiry';
  adminNotes?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['AWSDateTime']['output'];
  email: Scalars['String']['output'];
  handledBy?: Maybe<Scalars['String']['output']>;
  inquiryId: Scalars['ID']['output'];
  inquiryType: InquiryType;
  message: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  status: InquiryStatus;
  subject: Scalars['String']['output'];
  updatedAt: Scalars['AWSDateTime']['output'];
};

export type ContactInquiryListResponse = {
  __typename?: 'ContactInquiryListResponse';
  count: Scalars['Int']['output'];
  items: Array<ContactInquiry>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type ContactInquiryResponse = {
  __typename?: 'ContactInquiryResponse';
  createdAt: Scalars['AWSDateTime']['output'];
  inquiryId: Scalars['ID']['output'];
  message: Scalars['String']['output'];
};

export type ContactInquiryStats = {
  __typename?: 'ContactInquiryStats';
  byType: Array<InquiryTypeCount>;
  inProgress: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  resolved: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type Conversation = {
  __typename?: 'Conversation';
  createdAt: Scalars['AWSDateTime']['output'];
  id: Scalars['String']['output'];
  lastMessage: Scalars['String']['output'];
  lastMessageTime: Scalars['AWSDateTime']['output'];
  otherPartyImage?: Maybe<Scalars['String']['output']>;
  otherPartyName: Scalars['String']['output'];
  propertyTitle: Scalars['String']['output'];
  unreadCount: Scalars['Int']['output'];
  updatedAt: Scalars['AWSDateTime']['output'];
};

export type Coordinates = {
  __typename?: 'Coordinates';
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type CoordinatesInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type CreateBookingInput = {
  checkInDate: Scalars['AWSDate']['input'];
  checkOutDate: Scalars['AWSDate']['input'];
  numberOfAdults: Scalars['Int']['input'];
  numberOfChildren: Scalars['Int']['input'];
  numberOfGuests: Scalars['Int']['input'];
  numberOfInfants: Scalars['Int']['input'];
  paymentMethodId: Scalars['String']['input'];
  propertyId: Scalars['ID']['input'];
  specialRequests?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBookingResponse = {
  __typename?: 'CreateBookingResponse';
  booking: Booking;
  message: Scalars['String']['output'];
  paymentStatus: PaymentStatus;
};

export type CreateLocationInput = {
  name: Scalars['String']['input'];
  parent?: InputMaybe<Scalars['String']['input']>;
  type: LocationType;
};

export type CreatePropertyDraftInput = {
  available: Scalars['Boolean']['input'];
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  currency: Scalars['String']['input'];
  district: Scalars['String']['input'];
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestPhoneNumber?: InputMaybe<Scalars['String']['input']>;
  guestWhatsappNumber?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  monthlyRent: Scalars['Float']['input'];
  propertyType: PropertyType;
  region: Scalars['String']['input'];
  street?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  videos?: InputMaybe<Array<Scalars['String']['input']>>;
  ward?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePropertyInput = {
  address: AddressInput;
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  availability: PropertyAvailabilityInput;
  description?: InputMaybe<Scalars['String']['input']>;
  media?: InputMaybe<PropertyMediaInput>;
  pricing: PropertyPricingInput;
  propertyType: PropertyType;
  specifications: PropertySpecificationsInput;
  title: Scalars['String']['input'];
};

export type CreatePropertyResponse = {
  __typename?: 'CreatePropertyResponse';
  isGuestUser: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  propertyId: Scalars['ID']['output'];
  status: PropertyStatus;
  success: Scalars['Boolean']['output'];
};

export type CreateReviewInput = {
  accuracy: Scalars['Float']['input'];
  bookingId: Scalars['ID']['input'];
  cleanliness: Scalars['Float']['input'];
  comment: Scalars['String']['input'];
  communication: Scalars['Float']['input'];
  location: Scalars['Float']['input'];
  overallRating: Scalars['Float']['input'];
  photos?: InputMaybe<Array<Scalars['String']['input']>>;
  propertyId: Scalars['ID']['input'];
  value: Scalars['Float']['input'];
};

export type CreateShortTermPropertyDraftInput = {
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  cleaningFee?: InputMaybe<Scalars['Float']['input']>;
  currency: Scalars['String']['input'];
  district: Scalars['String']['input'];
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestPhoneNumber?: InputMaybe<Scalars['String']['input']>;
  guestWhatsappNumber?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  maxGuests?: InputMaybe<Scalars['Int']['input']>;
  minimumStay?: InputMaybe<Scalars['Int']['input']>;
  nightlyRate: Scalars['Float']['input'];
  propertyType: ShortTermPropertyType;
  region: Scalars['String']['input'];
  title: Scalars['String']['input'];
  videos?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateShortTermPropertyInput = {
  address: ShortTermAddressInput;
  advanceBookingDays: Scalars['Int']['input'];
  allowsChildren: Scalars['Boolean']['input'];
  allowsInfants: Scalars['Boolean']['input'];
  allowsPets: Scalars['Boolean']['input'];
  allowsSmoking: Scalars['Boolean']['input'];
  amenities: Array<Scalars['String']['input']>;
  cancellationPolicy: CancellationPolicy;
  checkInInstructions?: InputMaybe<Scalars['String']['input']>;
  checkInTime: Scalars['String']['input'];
  checkOutTime: Scalars['String']['input'];
  cleaningFee?: InputMaybe<Scalars['Float']['input']>;
  coordinates?: InputMaybe<CoordinatesInput>;
  currency: Scalars['String']['input'];
  description: Scalars['String']['input'];
  district: Scalars['String']['input'];
  houseRules?: InputMaybe<Array<Scalars['String']['input']>>;
  images: Array<Scalars['String']['input']>;
  instantBookEnabled: Scalars['Boolean']['input'];
  maxAdults?: InputMaybe<Scalars['Int']['input']>;
  maxChildren?: InputMaybe<Scalars['Int']['input']>;
  maxGuests: Scalars['Int']['input'];
  maxInfants?: InputMaybe<Scalars['Int']['input']>;
  maximumStay?: InputMaybe<Scalars['Int']['input']>;
  minimumStay: Scalars['Int']['input'];
  nightlyRate: Scalars['Float']['input'];
  propertyType: ShortTermPropertyType;
  region: Scalars['String']['input'];
  serviceFeePercentage: Scalars['Float']['input'];
  taxPercentage: Scalars['Float']['input'];
  thumbnail: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateShortTermPropertyResponse = {
  __typename?: 'CreateShortTermPropertyResponse';
  isGuestUser: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  propertyId?: Maybe<Scalars['String']['output']>;
  status: PropertyStatus;
  success: Scalars['Boolean']['output'];
};

export type DataType =
  | 'LOCATIONS'
  | 'PROPERTIES';

export type DeleteResponse = {
  __typename?: 'DeleteResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type District = {
  __typename?: 'District';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  regionId: Scalars['ID']['output'];
};

export type EmergencyContact = {
  __typename?: 'EmergencyContact';
  email?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  relationship: Scalars['String']['output'];
};

export type EmergencyContactInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  relationship: Scalars['String']['input'];
};

export type EmploymentStatus =
  | 'CONTRACT'
  | 'EMPLOYED_FULL_TIME'
  | 'EMPLOYED_PART_TIME'
  | 'RETIRED'
  | 'SELF_EMPLOYED'
  | 'STUDENT'
  | 'UNEMPLOYED';

export type EnrichPropertyInput = {
  address?: InputMaybe<AddressInput>;
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  availability?: InputMaybe<PropertyAvailabilityInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  media?: InputMaybe<PropertyMediaInput>;
  pricing?: InputMaybe<PropertyPricingInput>;
  specifications?: InputMaybe<PropertySpecificationsInput>;
};

export type FavoriteResponse = {
  __typename?: 'FavoriteResponse';
  isFavorited: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type HousingRequest = {
  __typename?: 'HousingRequest';
  adminNotes?: Maybe<Scalars['String']['output']>;
  assignedAdmin?: Maybe<Scalars['String']['output']>;
  bedrooms?: Maybe<Scalars['Int']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['AWSDateTime']['output'];
  currency: Scalars['String']['output'];
  description: Scalars['String']['output'];
  district?: Maybe<Scalars['String']['output']>;
  fulfilledPropertyId?: Maybe<Scalars['String']['output']>;
  matchedLandlords?: Maybe<Array<Scalars['String']['output']>>;
  maxBudget?: Maybe<Scalars['Float']['output']>;
  minBudget?: Maybe<Scalars['Float']['output']>;
  moveInDate?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  propertyType?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  requestId: Scalars['ID']['output'];
  source: HousingRequestSource;
  status: HousingRequestStatus;
  street?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['AWSDateTime']['output'];
  userId?: Maybe<Scalars['String']['output']>;
  ward?: Maybe<Scalars['String']['output']>;
};

export type HousingRequestListResponse = {
  __typename?: 'HousingRequestListResponse';
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  requests: Array<HousingRequest>;
};

export type HousingRequestSource =
  | 'ADMIN'
  | 'WEB'
  | 'WHATSAPP';

export type HousingRequestStatus =
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FULFILLED'
  | 'MATCHED'
  | 'OPEN';

export type InitialAppState = {
  __typename?: 'InitialAppState';
  categorizedProperties: CategorizedPropertiesResponse;
};

export type InitiatePaymentInput = {
  bookingId?: InputMaybe<Scalars['ID']['input']>;
  listingPlan?: InputMaybe<ListingPlan>;
  phoneNumber: Scalars['String']['input'];
};

export type InitiatePaymentResponse = {
  __typename?: 'InitiatePaymentResponse';
  amount: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  message: Scalars['String']['output'];
  reference: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type InquiryStatus =
  | 'CLOSED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'RESOLVED';

export type InquiryType =
  | 'GENERAL'
  | 'PARTNERSHIP'
  | 'PROPERTY'
  | 'SUPPORT';

export type InquiryTypeCount = {
  __typename?: 'InquiryTypeCount';
  count: Scalars['Int']['output'];
  type: InquiryType;
};

export type Landlord = {
  __typename?: 'Landlord';
  accountStatus?: Maybe<AccountStatus>;
  address?: Maybe<Scalars['String']['output']>;
  businessLicense?: Maybe<Scalars['String']['output']>;
  businessName?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['AWSDateTime']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailNotifications?: Maybe<Scalars['Boolean']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hasProperties?: Maybe<Scalars['Boolean']['output']>;
  isEmailVerified?: Maybe<Scalars['Boolean']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  nationalIdLast4?: Maybe<Scalars['String']['output']>;
  occupation?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  pushNotifications?: Maybe<Scalars['Boolean']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  smsNotifications?: Maybe<Scalars['Boolean']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  taxId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  userType: UserType;
  verificationDocuments?: Maybe<Array<Scalars['String']['output']>>;
  ward?: Maybe<Scalars['String']['output']>;
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type LandlordApplication = {
  __typename?: 'LandlordApplication';
  address?: Maybe<Scalars['String']['output']>;
  adminNotes?: Maybe<Scalars['String']['output']>;
  alternatePhone?: Maybe<Scalars['String']['output']>;
  applicant?: Maybe<TenantBasicInfo>;
  applicationId: Scalars['ID']['output'];
  birthDate?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  nationalId?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  status?: Maybe<LandlordApplicationStatus>;
  submittedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  updatedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  userId: Scalars['ID']['output'];
};

export type LandlordApplicationInput = {
  address: AddressInput;
  alternatePhone?: InputMaybe<Scalars['String']['input']>;
  birthDate: Scalars['String']['input'];
  nationalId: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type LandlordApplicationListResponse = {
  __typename?: 'LandlordApplicationListResponse';
  applications: Array<LandlordApplication>;
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type LandlordApplicationStats = {
  __typename?: 'LandlordApplicationStats';
  approved: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  underReview: Scalars['Int']['output'];
};

export type LandlordApplicationStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'UNDER_REVIEW';

export type LandlordBasicInfo = {
  __typename?: 'LandlordBasicInfo';
  businessName?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
};

export type LandlordProfile = {
  __typename?: 'LandlordProfile';
  businessName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  maxPrice?: Maybe<Scalars['Float']['output']>;
  minPrice?: Maybe<Scalars['Float']['output']>;
  operatingDistricts: Array<Scalars['String']['output']>;
  operatingRegions: Array<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  propertyCount: Scalars['Int']['output'];
  propertyTypes: Array<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
  ward?: Maybe<Scalars['String']['output']>;
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type LandlordProfileListResponse = {
  __typename?: 'LandlordProfileListResponse';
  count: Scalars['Int']['output'];
  landlords: Array<LandlordProfile>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type LandlordPropertiesInfo = {
  __typename?: 'LandlordPropertiesInfo';
  count: Scalars['Int']['output'];
  landlord: LandlordPublicInfo;
  nextToken?: Maybe<Scalars['String']['output']>;
  properties: Array<Property>;
};

export type LandlordPublicInfo = {
  __typename?: 'LandlordPublicInfo';
  businessName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type LandlordRegistration = {
  __typename?: 'LandlordRegistration';
  adminNotes?: Maybe<Array<Scalars['String']['output']>>;
  area?: Maybe<Scalars['String']['output']>;
  assignedTo?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  registrationId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type LandlordRegistrationListResponse = {
  __typename?: 'LandlordRegistrationListResponse';
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  registrations: Array<LandlordRegistration>;
};

export type ListingEntitlement = {
  __typename?: 'ListingEntitlement';
  activePlan?: Maybe<Scalars['String']['output']>;
  canList: Scalars['Boolean']['output'];
  freeListingsRemaining: Scalars['Int']['output'];
  message: Scalars['String']['output'];
};

export type ListingPlan =
  | 'MONTHLY'
  | 'PER_LISTING'
  | 'YEARLY';

export type LocationCreateResponse = {
  __typename?: 'LocationCreateResponse';
  location: LocationResult;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type LocationImportResponse = {
  __typename?: 'LocationImportResponse';
  errors?: Maybe<Array<Scalars['String']['output']>>;
  imported: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  skipped: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type LocationJsonResponse = {
  __typename?: 'LocationJsonResponse';
  cloudfrontUrl: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type LocationResult = District | Region | Street | Ward;

export type LocationType =
  | 'DISTRICT'
  | 'REGION'
  | 'STREET'
  | 'WARD';

export type LocationUpdateResponse = {
  __typename?: 'LocationUpdateResponse';
  location?: Maybe<Region>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type MediaFile = {
  __typename?: 'MediaFile';
  contentType: Scalars['String']['output'];
  fileName?: Maybe<Scalars['String']['output']>;
  fileUrl: Scalars['String']['output'];
};

export type MediaItem = {
  __typename?: 'MediaItem';
  actionTime: Scalars['Float']['output'];
  additionalFiles?: Maybe<Array<Maybe<MediaFile>>>;
  media?: Maybe<PropertyMedia>;
  userId: Scalars['String']['output'];
};

export type MediaUploadResponse = {
  __typename?: 'MediaUploadResponse';
  fileUrl: Scalars['String']['output'];
  key: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addBusyBlock: BusyBlock;
  addLandlordRegistrationNote: SuccessResponse;
  addReferralNote: SuccessResponse;
  adminDeleteApplication: SuccessResponse;
  adminDeleteLandlordApplication: SuccessResponse;
  adminDeleteProperty: SuccessResponse;
  adminUpdateApplicationStatus: Application;
  adminUpdatePropertyStatus: SuccessResponse;
  approveBooking: Booking;
  approveProperty: SuccessResponse;
  assignPropertyAgent: SuccessResponse;
  associateMediaWithProperty: Property;
  blockDates: SuccessResponse;
  cancelBooking: CancelBookingResponse;
  confirmWhatsAppAssociation: AssociateWhatsAppResponse;
  createBooking: CreateBookingResponse;
  createHousingRequest: HousingRequest;
  createLocation: LocationCreateResponse;
  createProperty: CreatePropertyResponse;
  createPropertyDraft: CreatePropertyResponse;
  createReview: Review;
  createShortTermProperty: ShortTermProperty;
  createShortTermPropertyDraft: CreateShortTermPropertyResponse;
  deactivateShortTermProperty: SuccessResponse;
  declineBooking: Booking;
  deleteConversation: DeleteResponse;
  deleteMediaItem?: Maybe<MediaItem>;
  deleteMessage: DeleteResponse;
  deleteProperty: SuccessResponse;
  deleteTeamMeeting: SuccessResponse;
  deleteUser: SuccessResponse;
  dummyMutation?: Maybe<Scalars['String']['output']>;
  forgotPassword: SuccessResponse;
  generateDataUploadUrl: UploadUrlResponse;
  getMediaUploadUrl: MediaUploadResponse;
  importLocationsFromCSV: LocationImportResponse;
  importPropertiesFromCSV: PropertyImportResult;
  initializePropertyChat: ChatInitializationResponse;
  initiatePayment: InitiatePaymentResponse;
  initiateWhatsAppAssociation: AssociateWhatsAppResponse;
  markAsRead: Conversation;
  markLandlordContacted: SuccessResponse;
  markPropertyAsAvailable: Property;
  markPropertyAsRented: Property;
  publishNewPropertyEvent?: Maybe<SubscriptionPublishResponse>;
  publishProperty: SuccessResponse;
  publishPropertyUpdateEvent?: Maybe<PropertyUpdateEvent>;
  publishShortTermProperty: ShortTermProperty;
  regenerateLocationJson: LocationJsonResponse;
  rejectProperty: SuccessResponse;
  removeBusyBlock: SuccessResponse;
  removePropertyAgent: SuccessResponse;
  resendVerificationCode: SuccessResponse;
  resetPassword: SuccessResponse;
  respondToReview: Review;
  reviewLandlordApplication: LandlordApplication;
  scheduleMeeting: TeamMeeting;
  sendMessage: ChatMessage;
  sendWhatsAppMessage: SuccessResponse;
  signIn: AuthResponse;
  signUp: SuccessResponse;
  submitApplication: Application;
  submitContactInquiry: ContactInquiryResponse;
  submitLandlordApplication: ApplicationResponse;
  submitLandlordRegistration: LandlordRegistration;
  submitReferral: ReferralSubmission;
  toggleFavorite: FavoriteResponse;
  unblockDates: SuccessResponse;
  updateApplication: Application;
  updateApplicationStatus: Application;
  updateContactInquiryStatus: ContactInquiry;
  updateHousingRequestStatus: SuccessResponse;
  updateLandlordRegistrationStatus: SuccessResponse;
  updateLocation: LocationUpdateResponse;
  updateProperty: SuccessResponse;
  updatePropertyStatus: Property;
  updateReferralStatus: SuccessResponse;
  updateShortTermProperty: ShortTermProperty;
  updateUser: SuccessResponse;
  updateUserRole: SuccessResponse;
  updateUserStatus: SuccessResponse;
  verifyEmail: SuccessResponse;
};


export type MutationAddBusyBlockArgs = {
  endUtc: Scalars['String']['input'];
  recurrence?: InputMaybe<BusyBlockRecurrenceInput>;
  startUtc: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddLandlordRegistrationNoteArgs = {
  createdAt: Scalars['String']['input'];
  note: Scalars['String']['input'];
  registrationId: Scalars['ID']['input'];
};


export type MutationAddReferralNoteArgs = {
  createdAt: Scalars['String']['input'];
  note: Scalars['String']['input'];
  referralId: Scalars['ID']['input'];
};


export type MutationAdminDeleteApplicationArgs = {
  applicationId: Scalars['ID']['input'];
};


export type MutationAdminDeleteLandlordApplicationArgs = {
  applicationId: Scalars['ID']['input'];
};


export type MutationAdminDeletePropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationAdminUpdateApplicationStatusArgs = {
  applicationId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  status: ApplicationStatus;
};


export type MutationAdminUpdatePropertyStatusArgs = {
  notes?: InputMaybe<Scalars['String']['input']>;
  propertyId: Scalars['ID']['input'];
  status: PropertyStatus;
};


export type MutationApproveBookingArgs = {
  bookingId: Scalars['ID']['input'];
  hostNotes?: InputMaybe<Scalars['String']['input']>;
};


export type MutationApprovePropertyArgs = {
  notes?: InputMaybe<Scalars['String']['input']>;
  propertyId: Scalars['ID']['input'];
};


export type MutationAssignPropertyAgentArgs = {
  agentId: Scalars['ID']['input'];
  propertyId: Scalars['ID']['input'];
};


export type MutationAssociateMediaWithPropertyArgs = {
  media: PropertyMediaInput;
  propertyId: Scalars['ID']['input'];
};


export type MutationBlockDatesArgs = {
  input: BlockDatesInput;
};


export type MutationCancelBookingArgs = {
  bookingId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationConfirmWhatsAppAssociationArgs = {
  code: Scalars['String']['input'];
  whatsappNumber: Scalars['String']['input'];
};


export type MutationCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationCreateHousingRequestArgs = {
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  district?: InputMaybe<Scalars['String']['input']>;
  maxBudget?: InputMaybe<Scalars['Float']['input']>;
  minBudget?: InputMaybe<Scalars['Float']['input']>;
  moveInDate?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  propertyType?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  source: HousingRequestSource;
  street?: InputMaybe<Scalars['String']['input']>;
  ward?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateLocationArgs = {
  input: CreateLocationInput;
};


export type MutationCreatePropertyArgs = {
  input: CreatePropertyInput;
};


export type MutationCreatePropertyDraftArgs = {
  input: CreatePropertyDraftInput;
};


export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};


export type MutationCreateShortTermPropertyArgs = {
  input: CreateShortTermPropertyInput;
};


export type MutationCreateShortTermPropertyDraftArgs = {
  input: CreateShortTermPropertyDraftInput;
};


export type MutationDeactivateShortTermPropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationDeclineBookingArgs = {
  bookingId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationDeleteConversationArgs = {
  conversationId: Scalars['String']['input'];
};


export type MutationDeleteMediaItemArgs = {
  fileUrl: Scalars['String']['input'];
};


export type MutationDeleteMessageArgs = {
  messageId: Scalars['String']['input'];
};


export type MutationDeletePropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationDeleteTeamMeetingArgs = {
  meetingId: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationGenerateDataUploadUrlArgs = {
  dataType: DataType;
  filename?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGetMediaUploadUrlArgs = {
  contentType: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
};


export type MutationImportLocationsFromCsvArgs = {
  csvData: Scalars['String']['input'];
};


export type MutationImportPropertiesFromCsvArgs = {
  csvData: Scalars['String']['input'];
};


export type MutationInitializePropertyChatArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationInitiatePaymentArgs = {
  input: InitiatePaymentInput;
};


export type MutationInitiateWhatsAppAssociationArgs = {
  whatsappNumber: Scalars['String']['input'];
};


export type MutationMarkAsReadArgs = {
  conversationId: Scalars['String']['input'];
};


export type MutationMarkLandlordContactedArgs = {
  createdAt: Scalars['String']['input'];
  landlordId: Scalars['ID']['input'];
  requestId: Scalars['ID']['input'];
};


export type MutationMarkPropertyAsAvailableArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationMarkPropertyAsRentedArgs = {
  propertyId: Scalars['ID']['input'];
  tenantId: Scalars['ID']['input'];
};


export type MutationPublishNewPropertyEventArgs = {
  propertyId: Scalars['ID']['input'];
  region: Scalars['String']['input'];
};


export type MutationPublishPropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationPublishPropertyUpdateEventArgs = {
  input: PropertyUpdateEventInput;
};


export type MutationPublishShortTermPropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationRejectPropertyArgs = {
  propertyId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRemoveBusyBlockArgs = {
  blockId: Scalars['ID']['input'];
  blockStartUtc: Scalars['String']['input'];
};


export type MutationRemovePropertyAgentArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationResendVerificationCodeArgs = {
  email: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  confirmationCode: Scalars['String']['input'];
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationRespondToReviewArgs = {
  input: RespondToReviewInput;
};


export type MutationReviewLandlordApplicationArgs = {
  applicationId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  status: LandlordApplicationStatus;
};


export type MutationScheduleMeetingArgs = {
  attendeeIds: Array<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endUtc: Scalars['String']['input'];
  link?: InputMaybe<Scalars['String']['input']>;
  startUtc: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSendWhatsAppMessageArgs = {
  message: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};


export type MutationSignInArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationSubmitApplicationArgs = {
  input: SubmitApplicationInput;
};


export type MutationSubmitContactInquiryArgs = {
  input: SubmitContactInquiryInput;
};


export type MutationSubmitLandlordApplicationArgs = {
  input: LandlordApplicationInput;
};


export type MutationSubmitLandlordRegistrationArgs = {
  area?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
};


export type MutationSubmitReferralArgs = {
  landlordArea: Scalars['String']['input'];
  landlordName: Scalars['String']['input'];
  landlordNotes?: InputMaybe<Scalars['String']['input']>;
  landlordPhone: Scalars['String']['input'];
  referrerName: Scalars['String']['input'];
  referrerNida?: InputMaybe<Scalars['String']['input']>;
  referrerPhone: Scalars['String']['input'];
};


export type MutationToggleFavoriteArgs = {
  propertyId: Scalars['ID']['input'];
};


export type MutationUnblockDatesArgs = {
  input: UnblockDatesInput;
};


export type MutationUpdateApplicationArgs = {
  applicationId: Scalars['ID']['input'];
  input: UpdateApplicationInput;
};


export type MutationUpdateApplicationStatusArgs = {
  applicationId: Scalars['ID']['input'];
  input: UpdateApplicationStatusInput;
};


export type MutationUpdateContactInquiryStatusArgs = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  inquiryId: Scalars['ID']['input'];
  status: InquiryStatus;
};


export type MutationUpdateHousingRequestStatusArgs = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  createdAt: Scalars['String']['input'];
  requestId: Scalars['ID']['input'];
  status: HousingRequestStatus;
};


export type MutationUpdateLandlordRegistrationStatusArgs = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  createdAt: Scalars['String']['input'];
  registrationId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateLocationArgs = {
  locationId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdatePropertyArgs = {
  input: UpdatePropertyInput;
  propertyId: Scalars['ID']['input'];
};


export type MutationUpdatePropertyStatusArgs = {
  propertyId: Scalars['ID']['input'];
  status: PropertyStatus;
};


export type MutationUpdateReferralStatusArgs = {
  adminNotes?: InputMaybe<Scalars['String']['input']>;
  createdAt: Scalars['String']['input'];
  referralId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateShortTermPropertyArgs = {
  input: UpdateShortTermPropertyInput;
  propertyId: Scalars['ID']['input'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateUserRoleArgs = {
  userId: Scalars['ID']['input'];
  userType: UserType;
};


export type MutationUpdateUserStatusArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
  status: AccountStatus;
  userId: Scalars['ID']['input'];
};


export type MutationVerifyEmailArgs = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  bookingId: Scalars['ID']['output'];
  completedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  conversationID?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['AWSDateTime']['output'];
  currency: Scalars['String']['output'];
  customerEmail?: Maybe<Scalars['String']['output']>;
  customerPhone?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  paymentId: Scalars['ID']['output'];
  provider: PaymentProvider;
  refundAmount?: Maybe<Scalars['Float']['output']>;
  refundReason?: Maybe<Scalars['String']['output']>;
  refundedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  status: PaymentStatus;
  thirdPartyConversationID: Scalars['String']['output'];
  transactionID?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['AWSDateTime']['output'];
};

export type PaymentProvider =
  | 'MPESA'
  | 'PAYPAL'
  | 'STRIPE';

export type PaymentStatus =
  | 'AUTHORIZED'
  | 'CANCELLED'
  | 'CAPTURED'
  | 'FAILED'
  | 'PAID'
  | 'PENDING'
  | 'PROCESSING'
  | 'REFUNDED';

export type Property = {
  __typename?: 'Property';
  address: Address;
  agent?: Maybe<PropertyUser>;
  agentId?: Maybe<Scalars['ID']['output']>;
  amenities?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  availability?: Maybe<PropertyAvailability>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  landlord?: Maybe<PropertyUser>;
  media?: Maybe<PropertyMedia>;
  pricing?: Maybe<PropertyPricing>;
  propertyId: Scalars['ID']['output'];
  propertyType: PropertyType;
  specifications?: Maybe<PropertySpecifications>;
  status: PropertyStatus;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type PropertyAvailability = {
  __typename?: 'PropertyAvailability';
  available: Scalars['Boolean']['output'];
  availableFrom?: Maybe<Scalars['AWSDateTime']['output']>;
  maximumLeaseTerm?: Maybe<Scalars['Int']['output']>;
  minimumLeaseTerm?: Maybe<Scalars['Int']['output']>;
};

export type PropertyAvailabilityInput = {
  available: Scalars['Boolean']['input'];
  availableFrom?: InputMaybe<Scalars['AWSDateTime']['input']>;
  maximumLeaseTerm?: InputMaybe<Scalars['Int']['input']>;
  minimumLeaseTerm?: InputMaybe<Scalars['Int']['input']>;
};

export type PropertyAvailabilityRange = {
  __typename?: 'PropertyAvailabilityRange';
  available: Scalars['Boolean']['output'];
  endDate: Scalars['AWSDate']['output'];
  propertyId: Scalars['ID']['output'];
  startDate: Scalars['AWSDate']['output'];
  unavailableDates: Array<Scalars['AWSDate']['output']>;
};

export type PropertyCard = {
  __typename?: 'PropertyCard';
  bedrooms?: Maybe<Scalars['Int']['output']>;
  currency: Scalars['String']['output'];
  district: Scalars['String']['output'];
  monthlyRent: Scalars['Float']['output'];
  propertyId: Scalars['ID']['output'];
  propertyType: PropertyType;
  region: Scalars['String']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type PropertyCardsResponse = {
  __typename?: 'PropertyCardsResponse';
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  properties: Array<PropertyCard>;
};

export type PropertyCategory =
  | 'FAVORITES'
  | 'LOWEST_PRICE'
  | 'MORE'
  | 'MOST_VIEWED'
  | 'NEARBY'
  | 'RECENTLY_VIEWED';

export type PropertyChange = {
  __typename?: 'PropertyChange';
  field: Scalars['String']['output'];
  newValue: Scalars['AWSJSON']['output'];
  oldValue?: Maybe<Scalars['AWSJSON']['output']>;
};

export type PropertyChangeInput = {
  field: Scalars['String']['input'];
  newValue: Scalars['AWSJSON']['input'];
  oldValue?: InputMaybe<Scalars['AWSJSON']['input']>;
};

export type PropertyEventType =
  | 'ARCHIVED'
  | 'AVAILABILITY_CHANGED'
  | 'CREATED'
  | 'DELETED'
  | 'DESCRIPTION_UPDATED'
  | 'MEDIA_UPDATED'
  | 'PRICE_CHANGED'
  | 'PROPERTY_CREATED'
  | 'PUBLISHED'
  | 'STATUS_CHANGED'
  | 'UPDATED';

export type PropertyImage = {
  __typename?: 'PropertyImage';
  caption?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type PropertyImageInput = {
  caption?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  url: Scalars['String']['input'];
};

export type PropertyImportResult = {
  __typename?: 'PropertyImportResult';
  errors: Array<Scalars['String']['output']>;
  imported: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  skipped: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  updated: Scalars['Int']['output'];
};

export type PropertyListResponse = {
  __typename?: 'PropertyListResponse';
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  properties: Array<Property>;
};

export type PropertyMedia = {
  __typename?: 'PropertyMedia';
  floorPlan?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  videos?: Maybe<Array<Scalars['String']['output']>>;
  virtualTour?: Maybe<Scalars['String']['output']>;
};

export type PropertyMediaInput = {
  floorPlan?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  videos?: InputMaybe<Array<Scalars['String']['input']>>;
  virtualTour?: InputMaybe<Scalars['String']['input']>;
};

export type PropertyPricing = {
  __typename?: 'PropertyPricing';
  currency: Scalars['String']['output'];
  deposit?: Maybe<Scalars['Float']['output']>;
  monthlyRent: Scalars['Float']['output'];
  serviceCharge?: Maybe<Scalars['Float']['output']>;
  utilitiesIncluded?: Maybe<Scalars['Boolean']['output']>;
};

export type PropertyPricingInput = {
  currency: Scalars['String']['input'];
  deposit?: InputMaybe<Scalars['Float']['input']>;
  monthlyRent: Scalars['Float']['input'];
  serviceCharge?: InputMaybe<Scalars['Float']['input']>;
  utilitiesIncluded?: InputMaybe<Scalars['Boolean']['input']>;
};

export type PropertyRatingSummary = {
  __typename?: 'PropertyRatingSummary';
  accuracy: Scalars['Float']['output'];
  averageRating: Scalars['Float']['output'];
  cleanliness: Scalars['Float']['output'];
  communication: Scalars['Float']['output'];
  fiveStars: Scalars['Int']['output'];
  fourStars: Scalars['Int']['output'];
  location: Scalars['Float']['output'];
  oneStar: Scalars['Int']['output'];
  threeStars: Scalars['Int']['output'];
  totalReviews: Scalars['Int']['output'];
  twoStars: Scalars['Int']['output'];
  value: Scalars['Float']['output'];
};

export type PropertySearchInput = {
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  propertyType?: InputMaybe<PropertyType>;
  region?: InputMaybe<Scalars['String']['input']>;
};

export type PropertySearchResponse = {
  __typename?: 'PropertySearchResponse';
  count: Scalars['Int']['output'];
  from: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  properties: Array<Property>;
  size: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PropertySortOption =
  | 'NEWEST_FIRST'
  | 'PRICE_HIGH_LOW'
  | 'PRICE_LOW_HIGH';

export type PropertySpecifications = {
  __typename?: 'PropertySpecifications';
  bathrooms?: Maybe<Scalars['Int']['output']>;
  bedrooms?: Maybe<Scalars['Int']['output']>;
  floors?: Maybe<Scalars['Int']['output']>;
  furnished?: Maybe<Scalars['Boolean']['output']>;
  parkingSpaces?: Maybe<Scalars['Int']['output']>;
  squareMeters?: Maybe<Scalars['Float']['output']>;
};

export type PropertySpecificationsInput = {
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  floors?: InputMaybe<Scalars['Int']['input']>;
  furnished?: InputMaybe<Scalars['Boolean']['input']>;
  parkingSpaces?: InputMaybe<Scalars['Int']['input']>;
  squareMeters?: InputMaybe<Scalars['Float']['input']>;
};

export type PropertyStats = {
  __typename?: 'PropertyStats';
  availableProperties: Scalars['Int']['output'];
  deletedProperties: Scalars['Int']['output'];
  draftProperties: Scalars['Int']['output'];
  maintenanceProperties: Scalars['Int']['output'];
  newPropertiesThisMonth: Scalars['Int']['output'];
  newPropertiesThisWeek: Scalars['Int']['output'];
  rentedProperties: Scalars['Int']['output'];
  totalProperties: Scalars['Int']['output'];
};

export type PropertyStatus =
  | 'AVAILABLE'
  | 'DELETED'
  | 'DRAFT'
  | 'MAINTENANCE'
  | 'RENTED';

export type PropertyType =
  | 'APARTMENT'
  | 'COMMERCIAL'
  | 'HOUSE'
  | 'LAND'
  | 'ROOM'
  | 'STUDIO';

export type PropertyUpdateEvent = {
  __typename?: 'PropertyUpdateEvent';
  changes: Array<PropertyChange>;
  eventType: PropertyEventType;
  property: Property;
  propertyId: Scalars['ID']['output'];
  timestamp: Scalars['AWSDateTime']['output'];
};

export type PropertyUpdateEventInput = {
  changes: Array<PropertyChangeInput>;
  eventType: PropertyEventType;
  property: Scalars['AWSJSON']['input'];
  propertyId: Scalars['ID']['input'];
  timestamp: Scalars['AWSDateTime']['input'];
};

export type PropertyUser = {
  __typename?: 'PropertyUser';
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type PublishResult = {
  __typename?: 'PublishResult';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  calculateBookingPrice: BookingPricing;
  checkAvailability: PropertyAvailabilityRange;
  checkListingEntitlement: ListingEntitlement;
  checkPhoneEntitlement: ListingEntitlement;
  dummyQuery?: Maybe<Scalars['String']['output']>;
  getAdminApplicationStats: ApplicationStats;
  getAdminPropertyStats: PropertyStats;
  getApplication?: Maybe<Application>;
  getApplicationDocumentUploadUrl: MediaUploadResponse;
  getApplicationStats: ApplicationStats;
  getBlockedDates: BlockedDatesResponse;
  getBooking?: Maybe<Booking>;
  getBookingPayments: Array<Payment>;
  getCategorizedProperties: CategorizedPropertiesResponse;
  getContactInquiry?: Maybe<ContactInquiry>;
  getContactInquiryStats: ContactInquiryStats;
  getConversationMessages: Array<ChatMessage>;
  getDistricts: Array<District>;
  getHousingRequest?: Maybe<HousingRequest>;
  getInitialAppState: InitialAppState;
  getInitialAppStateFast: InitialAppState;
  getLandlordApplication?: Maybe<LandlordApplication>;
  getLandlordApplicationStats: LandlordApplicationStats;
  getLandlordPropertiesInfo: LandlordPropertiesInfo;
  getLandlordRegistration?: Maybe<LandlordRegistration>;
  getMe?: Maybe<UserProfile>;
  getMediaLibrary?: Maybe<MediaItem>;
  getMyBusyBlocks: Array<BusyBlock>;
  getMyLandlordApplication?: Maybe<LandlordApplication>;
  getPayment?: Maybe<Payment>;
  getPropertiesByCategory: CategoryPropertyResponse;
  getPropertiesByLocation: PropertyCardsResponse;
  getProperty?: Maybe<Property>;
  getPropertyRatingSummary: PropertyRatingSummary;
  getPropertyReviews: ReviewListResponse;
  getReferralSubmission?: Maybe<ReferralSubmission>;
  getRegions: Array<Region>;
  getRelatedProperties: RelatedPropertiesResponse;
  getShortTermProperty?: Maybe<ShortTermProperty>;
  getStreets: Array<Street>;
  getSuggestedLandlords: Array<SuggestedLandlord>;
  getTeamAvailability: TeamAvailabilityResponse;
  getUnreadCount: Scalars['Int']['output'];
  getUserByEmail?: Maybe<UserProfile>;
  getUserById?: Maybe<UserProfile>;
  getUserConversations: Array<Conversation>;
  getUserStats: UserStats;
  getWards: Array<Ward>;
  getWhatsAppChatHistory: WhatsAppConversationSummary;
  listAgentProperties: PropertyListResponse;
  listAllApplications: ApplicationListResponse;
  listAllLandlordApplications: LandlordApplicationListResponse;
  listAllProperties: CombinedPropertyListResponse;
  listAllUsers: UserListResponse;
  listContactInquiries: ContactInquiryListResponse;
  listHousingRequests: HousingRequestListResponse;
  listLandlordProperties: PropertyListResponse;
  listLandlordRegistrations: LandlordRegistrationListResponse;
  listMyApplications: ApplicationListResponse;
  listMyBookings: BookingListResponse;
  listMyShortTermProperties: ShortTermPropertyListResponse;
  listPropertyApplications: ApplicationListResponse;
  listPropertyBookings: BookingListResponse;
  listPropertyOwners: LandlordProfileListResponse;
  listReferralSubmissions: ReferralSubmissionListResponse;
  listWhatsAppConversations: Array<WhatsAppConversationRow>;
  queryPaymentStatus: Payment;
  searchLandlordProfiles: LandlordProfileListResponse;
  searchShortTermProperties: ShortTermPropertyListResponse;
};


export type QueryCalculateBookingPriceArgs = {
  checkInDate: Scalars['AWSDate']['input'];
  checkOutDate: Scalars['AWSDate']['input'];
  numberOfGuests: Scalars['Int']['input'];
  propertyId: Scalars['ID']['input'];
};


export type QueryCheckAvailabilityArgs = {
  checkInDate: Scalars['AWSDate']['input'];
  checkOutDate: Scalars['AWSDate']['input'];
  propertyId: Scalars['ID']['input'];
};


export type QueryCheckPhoneEntitlementArgs = {
  phoneNumber: Scalars['String']['input'];
};


export type QueryGetApplicationArgs = {
  applicationId: Scalars['ID']['input'];
};


export type QueryGetApplicationDocumentUploadUrlArgs = {
  applicationId: Scalars['ID']['input'];
  fileName: Scalars['String']['input'];
  fileType: Scalars['String']['input'];
};


export type QueryGetApplicationStatsArgs = {
  landlordId: Scalars['ID']['input'];
};


export type QueryGetBlockedDatesArgs = {
  endDate?: InputMaybe<Scalars['AWSDate']['input']>;
  propertyId: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['AWSDate']['input']>;
};


export type QueryGetBookingArgs = {
  bookingId: Scalars['ID']['input'];
};


export type QueryGetBookingPaymentsArgs = {
  bookingId: Scalars['ID']['input'];
};


export type QueryGetCategorizedPropertiesArgs = {
  limitPerCategory?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetContactInquiryArgs = {
  inquiryId: Scalars['ID']['input'];
};


export type QueryGetConversationMessagesArgs = {
  conversationId: Scalars['String']['input'];
};


export type QueryGetDistrictsArgs = {
  regionId: Scalars['ID']['input'];
};


export type QueryGetHousingRequestArgs = {
  createdAt: Scalars['String']['input'];
  requestId: Scalars['ID']['input'];
};


export type QueryGetInitialAppStateArgs = {
  limitPerCategory?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetInitialAppStateFastArgs = {
  limitPerCategory?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetLandlordApplicationArgs = {
  applicationId: Scalars['ID']['input'];
};


export type QueryGetLandlordPropertiesInfoArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
};


export type QueryGetLandlordRegistrationArgs = {
  createdAt: Scalars['String']['input'];
  registrationId: Scalars['ID']['input'];
};


export type QueryGetPaymentArgs = {
  paymentId: Scalars['ID']['input'];
};


export type QueryGetPropertiesByCategoryArgs = {
  category: PropertyCategory;
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetPropertiesByLocationArgs = {
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  moveInDate?: InputMaybe<Scalars['AWSDate']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  propertyType?: InputMaybe<PropertyType>;
  region: Scalars['String']['input'];
  sortBy?: InputMaybe<PropertySortOption>;
};


export type QueryGetPropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type QueryGetPropertyRatingSummaryArgs = {
  propertyId: Scalars['ID']['input'];
};


export type QueryGetPropertyReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  propertyId: Scalars['ID']['input'];
};


export type QueryGetReferralSubmissionArgs = {
  createdAt: Scalars['String']['input'];
  referralId: Scalars['ID']['input'];
};


export type QueryGetRelatedPropertiesArgs = {
  landlordLimit?: InputMaybe<Scalars['Int']['input']>;
  locationLimit?: InputMaybe<Scalars['Int']['input']>;
  priceLimit?: InputMaybe<Scalars['Int']['input']>;
  propertyId: Scalars['ID']['input'];
};


export type QueryGetShortTermPropertyArgs = {
  propertyId: Scalars['ID']['input'];
};


export type QueryGetStreetsArgs = {
  wardId: Scalars['ID']['input'];
};


export type QueryGetSuggestedLandlordsArgs = {
  createdAt: Scalars['String']['input'];
  requestId: Scalars['ID']['input'];
};


export type QueryGetTeamAvailabilityArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryGetUserByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryGetWardsArgs = {
  districtId: Scalars['ID']['input'];
};


export type QueryGetWhatsAppChatHistoryArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  phone: Scalars['String']['input'];
};


export type QueryListAgentPropertiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListAllApplicationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ApplicationStatus>;
};


export type QueryListAllLandlordApplicationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<LandlordApplicationStatus>;
};


export type QueryListAllPropertiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  propertyType?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PropertyStatus>;
};


export type QueryListAllUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  userType?: InputMaybe<UserType>;
};


export type QueryListContactInquiriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<InquiryStatus>;
};


export type QueryListHousingRequestsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<HousingRequestStatus>;
};


export type QueryListLandlordPropertiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListLandlordRegistrationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListMyApplicationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ApplicationStatus>;
};


export type QueryListMyBookingsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BookingStatus>;
};


export type QueryListMyShortTermPropertiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListPropertyApplicationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  propertyId: Scalars['ID']['input'];
  status?: InputMaybe<ApplicationStatus>;
};


export type QueryListPropertyBookingsArgs = {
  endDate?: InputMaybe<Scalars['AWSDate']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  propertyId: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['AWSDate']['input']>;
  status?: InputMaybe<BookingStatus>;
};


export type QueryListPropertyOwnersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListReferralSubmissionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryListWhatsAppConversationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryQueryPaymentStatusArgs = {
  paymentId: Scalars['ID']['input'];
};


export type QuerySearchLandlordProfilesArgs = {
  district?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  propertyType?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchShortTermPropertiesArgs = {
  input: ShortTermSearchInput;
};

export type ReferralSubmission = {
  __typename?: 'ReferralSubmission';
  adminNotes?: Maybe<Array<Scalars['String']['output']>>;
  assignedTo?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  landlordArea: Scalars['String']['output'];
  landlordName: Scalars['String']['output'];
  landlordNotes?: Maybe<Scalars['String']['output']>;
  landlordPhone: Scalars['String']['output'];
  listingRewardStatus: Scalars['String']['output'];
  profitShareRewardStatus: Scalars['String']['output'];
  referralId: Scalars['ID']['output'];
  referrerName: Scalars['String']['output'];
  referrerNida?: Maybe<Scalars['String']['output']>;
  referrerPhone: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type ReferralSubmissionListResponse = {
  __typename?: 'ReferralSubmissionListResponse';
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  submissions: Array<ReferralSubmission>;
};

export type Region = {
  __typename?: 'Region';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type RelatedPropertiesResponse = {
  __typename?: 'RelatedPropertiesResponse';
  landlordProperties: Array<PropertyCard>;
  similarLocationProperties: Array<PropertyCard>;
  similarPriceProperties: Array<PropertyCard>;
};

export type RespondToReviewInput = {
  response: Scalars['String']['input'];
  reviewId: Scalars['ID']['input'];
};

export type Review = {
  __typename?: 'Review';
  accuracy: Scalars['Float']['output'];
  bookingId: Scalars['ID']['output'];
  cleanliness: Scalars['Float']['output'];
  comment: Scalars['String']['output'];
  communication: Scalars['Float']['output'];
  createdAt: Scalars['AWSDateTime']['output'];
  guest?: Maybe<PropertyUser>;
  guestId: Scalars['ID']['output'];
  hostResponse?: Maybe<Scalars['String']['output']>;
  hostResponseDate?: Maybe<Scalars['AWSDateTime']['output']>;
  location: Scalars['Float']['output'];
  overallRating: Scalars['Float']['output'];
  photos?: Maybe<Array<Scalars['String']['output']>>;
  propertyId: Scalars['ID']['output'];
  reviewId: Scalars['ID']['output'];
  updatedAt: Scalars['AWSDateTime']['output'];
  value: Scalars['Float']['output'];
  verifiedStay: Scalars['Boolean']['output'];
};

export type ReviewListResponse = {
  __typename?: 'ReviewListResponse';
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  reviews: Array<Review>;
};

export type SendMessageInput = {
  content: Scalars['String']['input'];
  conversationId: Scalars['String']['input'];
};

export type ShortTermAddress = {
  __typename?: 'ShortTermAddress';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  district?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  region: Scalars['String']['output'];
  street: Scalars['String']['output'];
};

export type ShortTermAddressInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  district?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  region: Scalars['String']['input'];
  street: Scalars['String']['input'];
};

export type ShortTermProperty = {
  __typename?: 'ShortTermProperty';
  address?: Maybe<ShortTermAddress>;
  advanceBookingDays?: Maybe<Scalars['Int']['output']>;
  allowsChildren?: Maybe<Scalars['Boolean']['output']>;
  allowsInfants?: Maybe<Scalars['Boolean']['output']>;
  allowsPets?: Maybe<Scalars['Boolean']['output']>;
  allowsSmoking?: Maybe<Scalars['Boolean']['output']>;
  amenities?: Maybe<Array<Scalars['String']['output']>>;
  averageRating?: Maybe<Scalars['Float']['output']>;
  cancellationPolicy?: Maybe<CancellationPolicy>;
  checkInInstructions?: Maybe<Scalars['String']['output']>;
  checkInTime?: Maybe<Scalars['String']['output']>;
  checkOutTime?: Maybe<Scalars['String']['output']>;
  cleaningFee?: Maybe<Scalars['Float']['output']>;
  coordinates?: Maybe<Coordinates>;
  createdAt: Scalars['AWSDateTime']['output'];
  currency: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  district: Scalars['String']['output'];
  host?: Maybe<PropertyUser>;
  hostId: Scalars['ID']['output'];
  houseRules?: Maybe<Array<Scalars['String']['output']>>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  videos?: Maybe<Array<Scalars['String']['output']>>;
  instantBookEnabled?: Maybe<Scalars['Boolean']['output']>;
  maxAdults?: Maybe<Scalars['Int']['output']>;
  maxChildren?: Maybe<Scalars['Int']['output']>;
  maxGuests?: Maybe<Scalars['Int']['output']>;
  maxInfants?: Maybe<Scalars['Int']['output']>;
  maximumStay?: Maybe<Scalars['Int']['output']>;
  minimumStay?: Maybe<Scalars['Int']['output']>;
  nightlyRate: Scalars['Float']['output'];
  propertyId: Scalars['ID']['output'];
  propertyType: ShortTermPropertyType;
  publishedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  ratingSummary?: Maybe<PropertyRatingSummary>;
  region: Scalars['String']['output'];
  serviceFeePercentage?: Maybe<Scalars['Float']['output']>;
  status: PropertyStatus;
  taxPercentage?: Maybe<Scalars['Float']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['AWSDateTime']['output'];
};

export type ShortTermPropertyCard = {
  __typename?: 'ShortTermPropertyCard';
  averageRating?: Maybe<Scalars['Float']['output']>;
  currency: Scalars['String']['output'];
  district: Scalars['String']['output'];
  instantBookEnabled: Scalars['Boolean']['output'];
  maxGuests: Scalars['Int']['output'];
  nightlyRate: Scalars['Float']['output'];
  propertyId: Scalars['ID']['output'];
  propertyType: ShortTermPropertyType;
  region: Scalars['String']['output'];
  thumbnail: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalReviews?: Maybe<Scalars['Int']['output']>;
};

export type ShortTermPropertyListResponse = {
  __typename?: 'ShortTermPropertyListResponse';
  nextToken?: Maybe<Scalars['String']['output']>;
  properties: Array<ShortTermProperty>;
};

export type ShortTermPropertyType =
  | 'APARTMENT'
  | 'BUNGALOW'
  | 'COTTAGE'
  | 'GUESTHOUSE'
  | 'HOSTEL'
  | 'HOTEL'
  | 'HOUSE'
  | 'RESORT'
  | 'ROOM'
  | 'STUDIO'
  | 'VILLA';

export type ShortTermSearchInput = {
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  checkInDate: Scalars['AWSDate']['input'];
  checkOutDate: Scalars['AWSDate']['input'];
  district?: InputMaybe<Scalars['String']['input']>;
  instantBookOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  minRating?: InputMaybe<Scalars['Float']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
  numberOfAdults?: InputMaybe<Scalars['Int']['input']>;
  numberOfChildren?: InputMaybe<Scalars['Int']['input']>;
  numberOfGuests: Scalars['Int']['input'];
  numberOfInfants?: InputMaybe<Scalars['Int']['input']>;
  propertyType?: InputMaybe<ShortTermPropertyType>;
  region: Scalars['String']['input'];
  sortBy?: InputMaybe<ShortTermSortOption>;
};

export type ShortTermSortOption =
  | 'NEWEST_FIRST'
  | 'PRICE_HIGH_LOW'
  | 'PRICE_LOW_HIGH'
  | 'RATING_HIGH_LOW'
  | 'ROTATION';

export type SignUpInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type SmokingStatus =
  | 'NON_SMOKER'
  | 'OCCASIONAL'
  | 'SMOKER';

export type Street = {
  __typename?: 'Street';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  wardId: Scalars['ID']['output'];
};

export type SubmitApplicationInput = {
  applicantDetails: ApplicantDetailsInput;
  propertyId: Scalars['ID']['input'];
};

export type SubmitContactInquiryInput = {
  email: Scalars['String']['input'];
  inquiryType: InquiryType;
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  subject: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  dummySubscription?: Maybe<Scalars['String']['output']>;
  onNewMessage?: Maybe<ChatMessage>;
  onNewPropertyInRegion?: Maybe<SubscriptionPublishResponse>;
  onPropertyUpdated?: Maybe<PropertyUpdateEvent>;
};


export type SubscriptionOnNewMessageArgs = {
  conversationId: Scalars['String']['input'];
};


export type SubscriptionOnNewPropertyInRegionArgs = {
  region: Scalars['String']['input'];
};


export type SubscriptionOnPropertyUpdatedArgs = {
  propertyId: Scalars['ID']['input'];
};

export type SubscriptionPublishResponse = {
  __typename?: 'SubscriptionPublishResponse';
  message?: Maybe<Scalars['String']['output']>;
  propertyId?: Maybe<Scalars['ID']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SuccessResponse = {
  __typename?: 'SuccessResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type SuggestedLandlord = {
  __typename?: 'SuggestedLandlord';
  landlord: LandlordProfile;
  matchReasons: Array<Scalars['String']['output']>;
};

export type TeamAvailabilityResponse = {
  __typename?: 'TeamAvailabilityResponse';
  busyBlocks: Array<BusyBlock>;
  meetings: Array<TeamMeeting>;
};

export type TeamMeeting = {
  __typename?: 'TeamMeeting';
  attendeeIds: Array<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdBy: Scalars['String']['output'];
  createdByName: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endUtc: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  link?: Maybe<Scalars['String']['output']>;
  startUtc: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Tenant = {
  __typename?: 'Tenant';
  accountStatus?: Maybe<AccountStatus>;
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['AWSDateTime']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailNotifications?: Maybe<Scalars['Boolean']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hasProperties?: Maybe<Scalars['Boolean']['output']>;
  isEmailVerified?: Maybe<Scalars['Boolean']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  nationalIdLast4?: Maybe<Scalars['String']['output']>;
  occupation?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  pushNotifications?: Maybe<Scalars['Boolean']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  smsNotifications?: Maybe<Scalars['Boolean']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['AWSDateTime']['output']>;
  userType: UserType;
  ward?: Maybe<Scalars['String']['output']>;
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type TenantBasicInfo = {
  __typename?: 'TenantBasicInfo';
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
};

export type UnblockDatesInput = {
  endDate: Scalars['AWSDate']['input'];
  propertyId: Scalars['ID']['input'];
  startDate: Scalars['AWSDate']['input'];
};

export type UnreadCountUpdate = {
  __typename?: 'UnreadCountUpdate';
  totalUnread: Scalars['Int']['output'];
};

export type UpdateApplicationInput = {
  applicantDetails?: InputMaybe<ApplicantDetailsInput>;
};

export type UpdateApplicationStatusInput = {
  landlordNotes?: InputMaybe<Scalars['String']['input']>;
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  status: ApplicationStatus;
};

export type UpdatePropertyInput = {
  address?: InputMaybe<AddressInput>;
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  availability?: InputMaybe<PropertyAvailabilityInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  media?: InputMaybe<PropertyMediaInput>;
  pricing?: InputMaybe<PropertyPricingInput>;
  propertyType?: InputMaybe<PropertyType>;
  specifications?: InputMaybe<PropertySpecificationsInput>;
  status?: InputMaybe<PropertyStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateShortTermPropertyInput = {
  address?: InputMaybe<ShortTermAddressInput>;
  advanceBookingDays?: InputMaybe<Scalars['Int']['input']>;
  allowsChildren?: InputMaybe<Scalars['Boolean']['input']>;
  allowsInfants?: InputMaybe<Scalars['Boolean']['input']>;
  allowsPets?: InputMaybe<Scalars['Boolean']['input']>;
  allowsSmoking?: InputMaybe<Scalars['Boolean']['input']>;
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  cancellationPolicy?: InputMaybe<CancellationPolicy>;
  checkInInstructions?: InputMaybe<Scalars['String']['input']>;
  checkInTime?: InputMaybe<Scalars['String']['input']>;
  checkOutTime?: InputMaybe<Scalars['String']['input']>;
  cleaningFee?: InputMaybe<Scalars['Float']['input']>;
  coordinates?: InputMaybe<CoordinatesInput>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  houseRules?: InputMaybe<Array<Scalars['String']['input']>>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  instantBookEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxAdults?: InputMaybe<Scalars['Int']['input']>;
  maxChildren?: InputMaybe<Scalars['Int']['input']>;
  maxGuests?: InputMaybe<Scalars['Int']['input']>;
  maxInfants?: InputMaybe<Scalars['Int']['input']>;
  maximumStay?: InputMaybe<Scalars['Int']['input']>;
  minimumStay?: InputMaybe<Scalars['Int']['input']>;
  nightlyRate?: InputMaybe<Scalars['Float']['input']>;
  propertyType?: InputMaybe<ShortTermPropertyType>;
  region?: InputMaybe<Scalars['String']['input']>;
  serviceFeePercentage?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<PropertyStatus>;
  taxPercentage?: InputMaybe<Scalars['Float']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['AWSDateTime']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  hasProperties?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  nationalId?: InputMaybe<Scalars['String']['input']>;
  occupation?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferences?: InputMaybe<Scalars['AWSJSON']['input']>;
  profileImage?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  ward?: InputMaybe<Scalars['String']['input']>;
  whatsappNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UploadUrlResponse = {
  __typename?: 'UploadUrlResponse';
  fileKey: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type UserListResponse = {
  __typename?: 'UserListResponse';
  count: Scalars['Int']['output'];
  nextToken?: Maybe<Scalars['String']['output']>;
  users: Array<UserWithId>;
};

export type UserProfile = Admin | Agent | Landlord | Tenant;

export type UserStats = {
  __typename?: 'UserStats';
  activeUsers: Scalars['Int']['output'];
  newUsersThisMonth: Scalars['Int']['output'];
  newUsersThisWeek: Scalars['Int']['output'];
  totalAdmins: Scalars['Int']['output'];
  totalAgents: Scalars['Int']['output'];
  totalLandlords: Scalars['Int']['output'];
  totalTenants: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type UserType =
  | 'ADMIN'
  | 'AGENT'
  | 'GUEST'
  | 'LANDLORD'
  | 'TENANT';

export type UserWithId = {
  __typename?: 'UserWithId';
  profile: UserProfile;
  userId: Scalars['ID']['output'];
};

export type Ward = {
  __typename?: 'Ward';
  districtId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type WhatsAppChatEntry = {
  __typename?: 'WhatsAppChatEntry';
  direction: Scalars['String']['output'];
  lang?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  replyId?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  step?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  ts: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type WhatsAppConversationRow = {
  __typename?: 'WhatsAppConversationRow';
  contactName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  lang?: Maybe<Scalars['String']['output']>;
  lastMessageAt: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  step: Scalars['String']['output'];
};

export type WhatsAppConversationSummary = {
  __typename?: 'WhatsAppConversationSummary';
  contactName?: Maybe<Scalars['String']['output']>;
  entries: Array<WhatsAppChatEntry>;
  hasMore?: Maybe<Scalars['Boolean']['output']>;
  lastMessageAt?: Maybe<Scalars['String']['output']>;
  linkedUser?: Maybe<WhatsAppLinkedUser>;
  messageCount: Scalars['Int']['output'];
  oldestTs?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
};

export type WhatsAppLinkedUser = {
  __typename?: 'WhatsAppLinkedUser';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  userType: Scalars['String']['output'];
  whatsappNumber?: Maybe<Scalars['String']['output']>;
};

export type _ApplicationPlaceholder = {
  __typename?: '_ApplicationPlaceholder';
  _temp?: Maybe<Scalars['String']['output']>;
};

export type _PropertyPlaceholder = {
  __typename?: '_PropertyPlaceholder';
  _temp?: Maybe<Scalars['String']['output']>;
};
