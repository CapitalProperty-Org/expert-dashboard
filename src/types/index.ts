import type { LucideIcon } from "lucide-react";

export interface NavItemType {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
  children?: NavItemType[];
}

export interface StatCardType {
  value: string | number;
  label: string;
  description: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterType {
  label: string;
  options: FilterOption[];
}

export interface SelectOption {
  value: number | string;
  label: string;
}

export interface ListingState {
  uae_emirate: 'dubai' | 'abu_dhabi' | 'northern_emirates' | '';
  permitType: 'rera' | 'dtcm' | 'none' | 'adrec' | 'non-adrec' | null;
  reraPermitNumber: string;
  dtcmPermitNumber: string;
  category: 'residential' | 'commercial' | null;
  offeringType: 'rent' | 'sale' | null;
  rentalPeriod: 'yearly' | 'monthly' | 'weekly' | 'daily' | null;
  propertyType: string;
  propertyLocation: SelectOption | null;
  assignedAgent: SelectOption | null;
  reference: string;
  available: 'immediately' | 'fromDate';
  availableDate: Date | null;
  size: string;
  bedrooms: string;
  bathrooms: string;
  developer: string;
  unitNumber: string;
  parkingSlots: string;
  furnishingType: 'furnished' | 'unfurnished' | 'semi-furnished' | null;
  age: string;
  numberOfFloors: string;
  projectStatus: string;
  ownerName: string;
  price: string;
  downPayment: string;
  numberOfCheques?: string;
  amenities: string[];
  title: string;
  description: string;
  images: (File | { url: string; preview?: string; })[]; // تم تعديل هنا
  latitude?: number | null;
  longitude?: number | null;
  googleAddress?: string | null;
  googleAddressComponents?: any; // or specific type
}

export type ListingAction =
  | { type: 'UPDATE_FIELD'; field: keyof ListingState; value: unknown; }
  | { type: 'RESET_PERMIT' }
  | { type: 'RESET_REQUIREMENTS' }
  | { type: 'SET_IMAGES'; value: (File | { url: string; preview?: string; })[] }
  | { type: 'SET_STATE'; payload: Partial<ListingState> };

export interface Notification {
  id: string;
  userId: number;
  notificationTypeId: number;
  title: string;
  body: string;
  reference: {
    type: string;
    id: string;
  };
  action: {
    type: string;
    payload: string;
  };
  seenAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  meta: {
    total: number;
    totalSeen: number;
    totalNotSeen: number;
  };
}

export interface NotificationPreference {
  typeId: number;
  receiveInApp: boolean;
  receiveEmail: boolean;
  receiveSMS: boolean;
  receivePush: boolean;
}

export interface NotificationPreferencesResponse {
  data: NotificationPreference[];
}

export interface UpdateNotificationPreferenceRequest {
  data: NotificationPreference[];
}

export interface UpdateNotificationPreferenceResponse {
  status: string;
  message: string;
  data: Array<{
    id: number;
    userId: string;
    notificationTypeId: number;
    receiveInApp: boolean;
    receiveEmail: boolean;
    receiveSMS: boolean;
    receivePush: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface WatermarkImage {
  url: string;
}

export interface WatermarkText {
  text: string;
  fontFamily: string;
  fontRatio: number;
}

export interface Watermark {
  position: string;
  type: 'image' | 'text';
  opacity: number;
  image: WatermarkImage;
  text: WatermarkText;
  ratio: number;
  status: string;
}

export interface Developer {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  logo_url: string;
  properties_count: number;
}

export interface DevelopersResponse {
  status: string;
  message: string;
  data: Developer[];
}

export interface WatermarkResponse {
  status: string;
  data: {
    clientId: string;
    watermark: Watermark;
    isDisabled: boolean;
  };
}