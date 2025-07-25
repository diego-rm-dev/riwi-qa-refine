import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, FilterOptions } from '@/types';

const initialState: AppState = {
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
      const approvedHUs = state.pendingHUs.map(hu =>
        hu.id === action.payload.id
          ? {
              ...hu,
              status: 'accepted' as const,
              qaReviewer: action.payload.qaReviewer,
              lastUpdated: new Date().toISOString()
            }
          : hu
      );
      return {
        ...state,
        pendingHUs: approvedHUs,
        currentHU: state.currentHU?.id === action.payload.id
          ? { ...state.currentHU, status: 'accepted', qaReviewer: action.payload.qaReviewer }
          : state.currentHU
      };

    case 'REJECT_HU':
      const rejectedHUs = state.pendingHUs.map(hu =>
        hu.id === action.payload.id
          ? {
              ...hu,
              status: 'rejected' as const,
              feedback: action.payload.feedback,
              qaReviewer: action.payload.qaReviewer,
              lastUpdated: new Date().toISOString()
            }
          : hu
      );
      return {
        ...state,
        pendingHUs: rejectedHUs,
        currentHU: state.currentHU?.id === action.payload.id
          ? {
              ...state.currentHU,
              status: 'rejected',
              feedback: action.payload.feedback,
              qaReviewer: action.payload.qaReviewer
            }
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

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}