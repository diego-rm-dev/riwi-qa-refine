import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { refineHU, getPendingHUs, approveHU, rejectHU, reRefineHU } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export function useHUs() {
  const { state, dispatch } = useAppContext();

  const loadPendingHUs = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await getPendingHUs();
      dispatch({ type: 'SET_PENDING_HUS', payload: response.data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error loading HUs';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  }, [dispatch]);

  const refineHUById = useCallback(async (huId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await refineHU(huId);
      if (response.success && response.data) {
        dispatch({ type: 'ADD_PENDING_HU', payload: response.data });
        toast({
          title: 'HU Refinada Exitosamente',
          description: `La historia ${huId} ha sido refinada y está lista para revisión.`
        });
        return response.data;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error refinando HU';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: 'Error al Refinar',
        description: message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const approveHUById = useCallback(async (id: string, qaReviewer: string = 'QA Reviewer') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await approveHU(id, qaReviewer);
      dispatch({ type: 'APPROVE_HU', payload: { id, qaReviewer } });
      toast({
        title: 'HU Aprobada',
        description: 'La historia de usuario ha sido aprobada exitosamente.'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error aprobando HU';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: 'Error al Aprobar',
        description: message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const rejectHUById = useCallback(async (id: string, feedback: string, qaReviewer: string = 'QA Reviewer') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // First reject the HU
      await rejectHU(id, feedback, qaReviewer);
      dispatch({ type: 'REJECT_HU', payload: { id, feedback, qaReviewer } });

      // Then automatically re-refine it
      const currentHU = state.pendingHUs.find(hu => hu.id === id);
      if (currentHU) {
        toast({
          title: 'HU Rechazada',
          description: 'Iniciando re-refinamiento automático con IA...'
        });

        try {
          const reRefinedHU = await reRefineHU(id, feedback, currentHU.refinedContent);
          
          // Update the HU with re-refined content and set back to pending
          const updatedHUs = state.pendingHUs.map(hu =>
            hu.id === id ? reRefinedHU : hu
          );
          dispatch({ type: 'SET_PENDING_HUS', payload: updatedHUs });
          
          // Update current HU if it's the one being viewed
          if (state.currentHU?.id === id) {
            dispatch({ type: 'SET_CURRENT_HU', payload: reRefinedHU });
          }

          toast({
            title: 'Re-refinamiento Completado',
            description: 'La HU ha sido re-refinada automáticamente y está lista para nueva revisión.'
          });
        } catch (reRefineError) {
          console.error('Error in re-refinement:', reRefineError);
          toast({
            title: 'Error en Re-refinamiento',
            description: 'La HU fue rechazada pero falló el re-refinamiento automático.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error rechazando HU';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: 'Error al Rechazar',
        description: message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, state.pendingHUs, state.currentHU]);

  const setCurrentHU = useCallback((hu: any) => {
    dispatch({ type: 'SET_CURRENT_HU', payload: hu });
  }, [dispatch]);

  return {
    ...state,
    loadPendingHUs,
    refineHUById,
    approveHUById,
    rejectHUById,
    setCurrentHU
  };
}