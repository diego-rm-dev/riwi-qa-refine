// Types for RIWI QA System

export interface PendingHU {
  id: string;
  originalId: string; // HU-XXX
  title: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  lastUpdated: string;
  featureAssigned: string;
  featureColor: string;
  moduleAssigned: string;
  moduleColor: string;
  refinedContent: string;
  feedback?: string;
  qaReviewer?: string;
  reRefinementCount?: number;
}

export interface Module {
  id: string;
  name: string;
  color: string;
  features: string[];
}

export interface Feature {
  id: string;
  name: string;
  color: string;
  moduleId: string;
}

export interface RefineHURequest {
  huId: string;
}

export interface RefineHUResponse {
  success: boolean;
  message: string;
  data?: PendingHU;
}

export interface FilterOptions {
  search: string;
  module: string;
  feature: string;
  status: string;
}

export interface AppState {
  pendingHUs: PendingHU[];
  currentHU: PendingHU | null;
  filters: FilterOptions;
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_PENDING_HUS'; payload: PendingHU[] }
  | { type: 'SET_CURRENT_HU'; payload: PendingHU | null }
  | { type: 'UPDATE_FILTERS'; payload: Partial<FilterOptions> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'APPROVE_HU'; payload: { id: string; qaReviewer: string } }
  | { type: 'REJECT_HU'; payload: { id: string; feedback: string; qaReviewer: string } }
  | { type: 'ADD_PENDING_HU'; payload: PendingHU };