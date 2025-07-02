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
uae_emirate: 'dubai' | 'abu_dhabi' | '';
permitType: 'rera' | 'dtcm' | 'none' | null;
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
}

export type ListingAction = 
| { type: 'UPDATE_FIELD'; field: keyof ListingState; value: any; }
| { type: 'RESET_PERMIT' }
| { type: 'RESET_REQUIREMENTS' };