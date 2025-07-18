import axios from 'axios';
import { PendingHU, RefineHURequest, RefineHUResponse } from '@/types';
import { mockPendingHUs, mockRefineResponse } from '@/data/mockData';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Functions - Currently using mock data, uncomment real API calls when backend is ready

export const refineHU = async (huId: string): Promise<RefineHUResponse> => {
  try {
    // Real API call (commented for now)
    // const response = await apiClient.post('/refine-hu', { huId });
    // return response.data;
    
    // Mock implementation
    return await mockRefineResponse(huId) as RefineHUResponse;
  } catch (error) {
    console.error('Error refining HU:', error);
    throw new Error('Failed to refine HU');
  }
};

export const getPendingHUs = async (): Promise<{ data: PendingHU[] }> => {
  try {
    // Real API call (commented for now)
    // const response = await apiClient.get('/pending-hus');
    // return response.data;
    
    // Mock implementation
    return { data: mockPendingHUs };
  } catch (error) {
    console.error('Error fetching pending HUs:', error);
    throw new Error('Failed to fetch pending HUs');
  }
};

export const approveHU = async (id: string, qaReviewer: string): Promise<void> => {
  try {
    // Real API call (commented for now)
    // await apiClient.put(`/approve-hu/${id}`, { qaReviewer });
    
    // Mock implementation
    console.log(`✅ Aprobar HU: ${id} por ${qaReviewer}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error approving HU:', error);
    throw new Error('Failed to approve HU');
  }
};

export const rejectHU = async (id: string, feedback: string, qaReviewer: string): Promise<void> => {
  try {
    // Real API call (commented for now)
    // await apiClient.post(`/reject-hu/${id}`, { feedback, qaReviewer });
    
    // Mock implementation
    console.log(`❌ Rechazar HU: ${id} por ${qaReviewer}. Feedback: ${feedback}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error rejecting HU:', error);
    throw new Error('Failed to reject HU');
  }
};

export const reRefineHU = async (id: string, feedback: string, originalContent: string): Promise<PendingHU> => {
  try {
    // Real API call (commented for now)
    // const response = await apiClient.post(`/re-refine-hu/${id}`, { feedback, originalContent });
    // return response.data;
    
    // Mock implementation - simulate AI re-refinement
    console.log(`🔄 Re-refinar HU: ${id} con feedback: ${feedback}`);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const reRefinedContent = `${originalContent}

---

## 🔄 RE-REFINAMIENTO AUTOMÁTICO CON IA

**Feedback Incorporado:** "${feedback}"

### Mejoras Aplicadas:
- ✅ Criterios de aceptación más específicos y medibles
- ✅ Consideraciones técnicas detalladas agregadas
- ✅ Casos edge y manejo de errores incluidos
- ✅ Métricas de rendimiento y calidad especificadas
- ✅ Dependencias y riesgos identificados

### Nuevos Criterios Técnicos:
1. **Especificidad Técnica:** Tecnologías específicas definidas
2. **Configuraciones de Privacidad:** Políticas de datos personales
3. **Estrategias de Retry:** Manejo de fallos y reconexión automática
4. **Limitaciones de Frecuencia:** Rate limiting y throttling

*Este contenido ha sido refinado automáticamente por IA basándose en el feedback del QA reviewer.*`;

    const updatedHU: PendingHU = {
      ...mockPendingHUs.find(hu => hu.id === id)!,
      refinedContent: reRefinedContent,
      lastUpdated: new Date().toISOString(),
      status: 'pending',
      reRefinementCount: (mockPendingHUs.find(hu => hu.id === id)?.reRefinementCount || 0) + 1,
      feedback: undefined, // Clear previous feedback after re-refinement
    };
    
    return updatedHU;
  } catch (error) {
    console.error('Error re-refining HU:', error);
    throw new Error('Failed to re-refine HU');
  }
};

export const getHUHistory = async (): Promise<{ data: PendingHU[] }> => {
  try {
    // Real API call (commented for now)
    // const response = await apiClient.get('/hu-history');
    // return response.data;
    
    // Mock implementation - return accepted and rejected HUs
    const historyHUs = mockPendingHUs.filter(hu => hu.status !== 'pending');
    return { data: historyHUs };
  } catch (error) {
    console.error('Error fetching HU history:', error);
    throw new Error('Failed to fetch HU history');
  }
};