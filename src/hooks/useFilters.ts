import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { PendingHU, FilterOptions } from '@/types';

export function useFilters() {
  const { appState, appDispatch } = useAppContext();

  const updateFilter = (updates: Partial<FilterOptions>) => {
    appDispatch({ type: 'UPDATE_FILTERS', payload: updates });
  };

  const clearFilters = () => {
    appDispatch({
      type: 'UPDATE_FILTERS',
      payload: { search: '', module: '', feature: '', status: '' }
    });
  };

  const filteredHUs = useMemo(() => {
    return appState.pendingHUs.filter((hu: PendingHU) => {
      const { search, module, feature, status } = appState.filters;

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
  }, [appState.pendingHUs, appState.filters]);

  const hasActiveFilters = useMemo(() => {
    const { search, module, feature, status } = appState.filters;
    return !!(search || (module && module !== 'all') || (feature && feature !== 'all') || (status && status !== 'all'));
  }, [appState.filters]);

  const filterCounts = useMemo(() => {
    const counts = {
      total: appState.pendingHUs.length,
      pending: appState.pendingHUs.filter(hu => hu.status === 'pending').length,
      accepted: appState.pendingHUs.filter(hu => hu.status === 'accepted').length,
      rejected: appState.pendingHUs.filter(hu => hu.status === 'rejected').length,
      filtered: filteredHUs.length
    };
    return counts;
  }, [appState.pendingHUs, filteredHUs]);

  return {
    filters: appState.filters,
    filteredHUs,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterCounts
  };
}