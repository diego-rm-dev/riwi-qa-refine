import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { PendingHU, FilterOptions } from '@/types';

export function useFilters() {
  const { state, dispatch } = useAppContext();

  const updateFilter = (updates: Partial<FilterOptions>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: updates });
  };

  const clearFilters = () => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { search: '', module: '', feature: '', status: '' }
    });
  };

  const filteredHUs = useMemo(() => {
    return state.pendingHUs.filter((hu: PendingHU) => {
      const { search, module, feature, status } = state.filters;

      // Search filter (title, originalId, content)
      if (search && !hu.title.toLowerCase().includes(search.toLowerCase()) &&
          !hu.originalId.toLowerCase().includes(search.toLowerCase()) &&
          !hu.refinedContent.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Module filter
      if (module && module !== 'all' && hu.moduleAssigned !== module) {
        return false;
      }

      // Feature filter
      if (feature && feature !== 'all' && hu.featureAssigned !== feature) {
        return false;
      }

      // Status filter
      if (status && status !== 'all' && hu.status !== status) {
        return false;
      }

      return true;
    });
  }, [state.pendingHUs, state.filters]);

  const hasActiveFilters = useMemo(() => {
    const { search, module, feature, status } = state.filters;
    return !!(search || (module && module !== 'all') || (feature && feature !== 'all') || (status && status !== 'all'));
  }, [state.filters]);

  const filterCounts = useMemo(() => {
    const counts = {
      total: state.pendingHUs.length,
      pending: state.pendingHUs.filter(hu => hu.status === 'pending').length,
      accepted: state.pendingHUs.filter(hu => hu.status === 'accepted').length,
      rejected: state.pendingHUs.filter(hu => hu.status === 'rejected').length,
      filtered: filteredHUs.length
    };
    return counts;
  }, [state.pendingHUs, filteredHUs]);

  return {
    filters: state.filters,
    filteredHUs,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterCounts
  };
}