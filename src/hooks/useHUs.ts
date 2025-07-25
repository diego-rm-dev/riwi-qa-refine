import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
// ✅ CORREGIDO: Importación sin reRefineHU
import { refineHU, getPendingHUs, approveHU, rejectHU, getHUById } from '@/services/api'; // Ajusta la ruta según tu estructura
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
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const refineHUById = useCallback(async (huInput: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // ✅ CORREGIDO: Limpiar el input del usuario
      // Extraer solo el número del input (ej: "HU-109" → "109" o "109" → "109")
      const azureId = huInput.replace(/^HU-?/i, '').trim();
      
      // Validar que sea un número válido
      if (!/^\d+$/.test(azureId)) {
        throw new Error('El ID debe ser un número válido. Ejemplo: HU-109 o 109');
      }
      
      const response = await refineHU(azureId);
      if (response.success && response.data) {
        dispatch({ type: 'ADD_PENDING_HU', payload: response.data });
        toast({
          title: 'HU Refinada Exitosamente',
          description: `La historia HU-${azureId} ha sido refinada y está lista para revisión.`
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Error refinando HU');
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
        description: 'La historia de usuario ha sido aprobada exitosamente y actualizada en Azure DevOps.'
      });
      
      // Recargar la lista para actualizar el estado
      await loadPendingHUs();
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
  }, [dispatch, loadPendingHUs]);

  // ✅ CORREGIDO: Re-refinamiento automático eliminado
  const rejectHUById = useCallback(async (id: string, feedback: string, qaReviewer: string = 'QA Reviewer') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Rechazar HU (esto dispara re-refinamiento automático en el backend)
      await rejectHU(id, feedback, qaReviewer);
      dispatch({ type: 'REJECT_HU', payload: { id, feedback, qaReviewer } });

      toast({
        title: 'HU Rechazada',
        description: 'La HU ha sido rechazada y se está re-refinando automáticamente con IA. Esto puede tomar unos momentos...'
      });

      // ✅ NUEVO: Esperar y actualizar la HU re-refinada
      // Dar tiempo al backend para procesar el re-refinamiento
      setTimeout(async () => {
        try {
          // Obtener la HU actualizada con el nuevo contenido refinado
          const updatedHU = await getHUById(id);
          
          // Actualizar la HU en el estado
          const updatedHUs = state.pendingHUs.map(hu =>
            hu.id === id ? updatedHU : hu
          );
          dispatch({ type: 'SET_PENDING_HUS', payload: updatedHUs });
          
          // Actualizar current HU si es la que se está viendo
          if (state.currentHU?.id === id) {
            dispatch({ type: 'SET_CURRENT_HU', payload: updatedHU });
          }

          toast({
            title: 'Re-refinamiento Completado',
            description: 'La HU ha sido re-refinada automáticamente y está lista para nueva revisión.'
          });
        } catch (reRefineError) {
          console.error('Error obteniendo HU re-refinada:', reRefineError);
          toast({
            title: 'Re-refinamiento en Proceso',
            description: 'La HU fue rechazada y se está re-refinando. Actualiza la página en unos momentos.',
            variant: 'default'
          });
        }
      }, 3000); // Esperar 3 segundos para el procesamiento de IA

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

  // ✅ NUEVA: Función para refrescar una HU específica
  const refreshHU = useCallback(async (id: string) => {
    try {
      const updatedHU = await getHUById(id);
      
      // Actualizar en la lista
      const updatedHUs = state.pendingHUs.map(hu =>
        hu.id === id ? updatedHU : hu
      );
      dispatch({ type: 'SET_PENDING_HUS', payload: updatedHUs });
      
      // Actualizar current HU si es la que se está viendo
      if (state.currentHU?.id === id) {
        dispatch({ type: 'SET_CURRENT_HU', payload: updatedHU });
      }
      
      return updatedHU;
    } catch (error) {
      console.error('Error refreshing HU:', error);
      throw error;
    }
  }, [dispatch, state.pendingHUs, state.currentHU]);

  return {
    ...state,
    loadPendingHUs,
    refineHUById,
    approveHUById,
    rejectHUById,
    setCurrentHU,
    refreshHU // Nueva función para refrescar HUs
  };
}