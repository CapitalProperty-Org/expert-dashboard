// Types for listing actions and quality scoring

export interface QualityScoreDetail {
  color: 'red' | 'orange' | 'green';
  tag: string;
  value: number;
  weight: number;
  help?: string;
  group?: string;
}

export interface QualityScore {
  color: 'red' | 'orange' | 'green';
  value: number;
  details: {
    [key: string]: QualityScoreDetail;
  };
}

export interface ApproveListingPayload {
  approved_by: number;
  approval_notes?: string;
  quality_score?: QualityScore;
}

export interface RejectListingPayload {
  rejected_by: number;
  rejection_reason: string;
  rejection_notes?: string;
  required_changes?: string[];
}

export interface ReassignListingPayload {
  reassigned_by: number;
  new_assigned_to: number;
  reassignment_reason?: string;
  reassignment_notes?: string;
}

export interface ListingActionResponse {
  success: boolean;
  message: string;
  listing: any;
  action_details: {
    action_type: 'approve' | 'reject' | 'reassign';
    performed_by: number;
    performed_at: string;
    notes?: string;
    additional_data?: any;
  };
}

export interface ListingState {
  stage: 'draft' | 'live' | 'archived' | 'approved' | 'rejected';
  type: string;
  reasons?: string[];
  approved_at?: string;
  approved_by?: number;
  rejected_at?: string;
  rejected_by?: number;
  rejection_reason?: string;
  rejection_notes?: string;
  required_changes?: string[];
  reassigned_at?: string;
  reassigned_by?: number;
}

export interface Listing {
  id: string;
  title: { en: string; ar?: string };
  description: { en: string; ar?: string };
  price: {
    type: 'sale' | 'rent';
    amounts: {
      sale?: number;
      rent?: number;
      yearly?: number;
      monthly?: number;
      weekly?: number;
      daily?: number;
    };
  };
  location: {
    id: number;
    title_en: string;
    title_ar?: string;
  };
  state: ListingState;
  quality_score?: QualityScore;
  assigned_to: {
    id: number;
    name: string;
    email?: string;
    mobile?: string;
  };
  created_by?: {
    id: number;
    name: string;
  };
  updated_by?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at: string;
  category: string;
  type: string;
  reference: string;
  bedrooms?: string;
  bathrooms?: string;
  size?: number;
  amenities?: string[];
  media?: {
    images?: Array<{ original: { url: string } }>;
    videos?: any;
  };
}

export interface BulkActionOptions {
  action: 'approve' | 'reject' | 'reassign' | 'publish' | 'unpublish' | 'archive' | 'unarchive';
  payload?: any;
  selectedIds: string[];
}

export interface Agent {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
}

// Rejection reasons enum
export enum RejectionReason {
  INCOMPLETE_INFORMATION = 'incomplete_information',
  POOR_QUALITY_PHOTOS = 'poor_quality_photos',
  INACCURATE_PRICING = 'inaccurate_pricing',
  LOCATION_ISSUES = 'location_issues',
  COMPLIANCE_VIOLATIONS = 'compliance_violations',
  DUPLICATE_LISTING = 'duplicate_listing',
  OTHER = 'other'
}

// Reassignment reasons enum
export enum ReassignmentReason {
  WORKLOAD_BALANCE = 'workload_balance',
  AGENT_UNAVAILABLE = 'agent_unavailable',
  SPECIALIZED_EXPERTISE = 'specialized_expertise',
  PERFORMANCE_ISSUES = 'performance_issues',
  CLIENT_REQUEST = 'client_request',
  OTHER = 'other'
}

// Quality score thresholds
export const QUALITY_SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  POOR: 0
} as const;

export const QUALITY_SCORE_COLORS = {
  EXCELLENT: 'green',
  GOOD: 'orange',
  POOR: 'red'
} as const;
