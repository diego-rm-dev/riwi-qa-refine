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

// ==================== TIPOS PARA AUTENTICACIÓN ====================

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

// ==================== TIPOS PARA GESTIÓN DE PROYECTOS ====================

export interface Project {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  azure_org: string;
  azure_project: string;
  client_id?: string;
  client_secret?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  azure_devops_token: string;
  azure_org: string;
  azure_project: string;
  client_id: string;
  client_secret: string;
}

export interface ProjectListResponse {
  projects: Project[];
  active_project_id?: string;
}

export interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  error: string | null;
}

export type ProjectAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_ACTIVE_PROJECT'; payload: Project | null }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };