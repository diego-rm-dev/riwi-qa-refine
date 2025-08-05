import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PendingHU, FilterOptions, AppState, AppAction, AuthState, AuthAction, ProjectState, ProjectAction } from '@/types';

// ==================== REDUCER PARA APP STATE ====================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PENDING_HUS':
      return {
        ...state,
        pendingHUs: action.payload,
        loading: false,
        error: null
      };
    case 'SET_CURRENT_HU':
      return {
        ...state,
        currentHU: action.payload
      };
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'APPROVE_HU':
      return {
        ...state,
        pendingHUs: state.pendingHUs.map(hu =>
          hu.id === action.payload.id
            ? { ...hu, status: 'accepted' as const, qaReviewer: action.payload.qaReviewer }
            : hu
        ),
        currentHU: state.currentHU?.id === action.payload.id
          ? { ...state.currentHU, status: 'accepted' as const, qaReviewer: action.payload.qaReviewer }
          : state.currentHU
      };
    case 'REJECT_HU':
      return {
        ...state,
        pendingHUs: state.pendingHUs.map(hu =>
          hu.id === action.payload.id
            ? { ...hu, status: 'rejected' as const, feedback: action.payload.feedback, qaReviewer: action.payload.qaReviewer }
            : hu
        ),
        currentHU: state.currentHU?.id === action.payload.id
          ? { ...state.currentHU, status: 'rejected' as const, feedback: action.payload.feedback, qaReviewer: action.payload.qaReviewer }
          : state.currentHU
      };
    case 'ADD_PENDING_HU':
      return {
        ...state,
        pendingHUs: [action.payload, ...state.pendingHUs]
      };
    default:
      return state;
  }
}

// ==================== REDUCER PARA AUTH STATE ====================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

// ==================== REDUCER PARA PROJECT STATE ====================

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        loading: false,
        error: null
      };
    case 'SET_ACTIVE_PROJECT':
      return {
        ...state,
        activeProject: action.payload
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects]
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        ),
        activeProject: state.activeProject?.id === action.payload.id ? action.payload : state.activeProject
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        activeProject: state.activeProject?.id === action.payload ? null : state.activeProject
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

// ==================== CONTEXT TYPES ====================

interface AppContextType {
  // App State
  appState: AppState;
  appDispatch: React.Dispatch<AppAction>;
  
  // Auth State
  authState: AuthState;
  authDispatch: React.Dispatch<AuthAction>;
  
  // Project State
  projectState: ProjectState;
  projectDispatch: React.Dispatch<ProjectAction>;
}

// ==================== INITIAL STATES ====================

const initialAppState: AppState = {
  pendingHUs: [],
  currentHU: null,
  filters: {
    search: '',
    module: '',
    feature: '',
    status: ''
  },
  loading: false,
  error: null
};

const initialAuthState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false, // Cambiar a false por defecto
  loading: false,
  error: null
};

const initialProjectState: ProjectState = {
  projects: [],
  activeProject: null,
  loading: false,
  error: null
};

// ==================== CONTEXT ====================

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appState, appDispatch] = useReducer(appReducer, initialAppState);
  const [authState, authDispatch] = useReducer(authReducer, initialAuthState);
  const [projectState, projectDispatch] = useReducer(projectReducer, initialProjectState);

  // Debug logs
  console.log('🔧 AppProvider - initialAppState:', initialAppState);
  console.log('🔧 AppProvider - appState:', appState);
  console.log('🔧 AppProvider - authState:', authState);
  console.log('🔧 AppProvider - projectState:', projectState);

  // Verificación de que los estados se inicializaron correctamente
  if (!appState || !authState || !projectState) {
    console.error('❌ AppProvider - States not initialized correctly');
    throw new Error('AppProvider states not initialized correctly');
  }

  const contextValue = {
    appState,
    appDispatch,
    authState,
    authDispatch,
    projectState,
    projectDispatch
  };

  console.log('🔧 AppProvider - Context value created:', contextValue);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    console.error('❌ useAppContext must be used within an AppProvider');
    console.error('❌ Context is undefined');
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  // Verificación adicional de la estructura del contexto
  if (!context.appState || !context.authState || !context.projectState) {
    console.error('❌ Context structure is incomplete:', context);
    throw new Error('AppContext structure is incomplete');
  }
  
  console.log('✅ useAppContext - Context is valid:', {
    appState: context.appState,
    authState: context.authState,
    projectState: context.projectState
  });
  
  return context;
}