import axios from 'axios';
import { PendingHU, RefineHURequest, RefineHUResponse } from '@/types';

// ❌ PROBLEMA 1: URL incorrecta
// Tu backend NO tiene '/api' en la ruta, está directamente en http://localhost:3000
const API_BASE_URL = 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // ✅ Aumentado por el procesamiento de IA
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ CORREGIDO: Crear/Refinar HU desde Azure ID
export const refineHU = async (azureId: string): Promise<RefineHUResponse> => {
  try {
    const response = await apiClient.post('/hus', { 
      azure_id: azureId
    });
    
    // ✅ Mapear respuesta del backend al formato PendingHU
    const backendHU = response.data;
    
    const pendingHU: PendingHU = {
      id: backendHU.id,
      originalId: `HU-${backendHU.azure_id}`, // Formato HU-XXX
      title: backendHU.name,
      status: backendHU.status as 'pending' | 'accepted' | 'rejected',
      createdAt: backendHU.created_at,
      lastUpdated: backendHU.updated_at,
      featureAssigned: backendHU.feature || "Sin Feature",
      featureColor: getFeatureColor(backendHU.feature), // Función helper
      moduleAssigned: backendHU.module || "Sin Módulo",
      moduleColor: getModuleColor(backendHU.module), // Función helper
      refinedContent: backendHU.refined_response || "🤖 Procesando...",
      reRefinementCount: 0
    };
    
    return {
      success: true,
      message: "HU refinada exitosamente",
      data: pendingHU
    };
  } catch (error: any) {
    console.error('Error refining HU:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to refine HU'
    };
  }
};

// ✅ CORREGIDO: Obtener HUs pendientes
export const getPendingHUs = async (): Promise<{ data: PendingHU[] }> => {
  try {
    const response = await apiClient.get('/hus', {
      params: { status: 'pending' }
    });
    
    // ✅ Mapear respuesta del backend al formato PendingHU
    const pendingHUs: PendingHU[] = response.data.map((hu: any) => ({
      id: hu.id,
      originalId: `HU-${hu.azure_id}`, // Formato HU-XXX
      title: hu.name,
      status: hu.status as 'pending' | 'accepted' | 'rejected',
      createdAt: hu.created_at,
      lastUpdated: hu.updated_at,
      featureAssigned: hu.feature || "Sin Feature",
      featureColor: getFeatureColor(hu.feature),
      moduleAssigned: hu.module || "Sin Módulo", 
      moduleColor: getModuleColor(hu.module),
      refinedContent: hu.refined_response || "🤖 Procesando...",
      reRefinementCount: 0
    }));
    
    return { data: pendingHUs };
  } catch (error: any) {
    console.error('Error fetching pending HUs:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch pending HUs');
  }
};

// ✅ CORREGIDO: Aprobar HU
export const approveHU = async (id: string, qaReviewer: string): Promise<void> => {
  try {
    // ❌ PROBLEMA 5: Endpoint y método incorrectos
    // Tu backend usa PATCH /hus/{id}/status, no PUT /approve-hu/{id}
    await apiClient.patch(`/hus/${id}/status`, {
      status: 'accepted'
      // Nota: qaReviewer no se usa actualmente en el backend
    });
    
    console.log(`✅ HU ${id} aprobada por ${qaReviewer}`);
  } catch (error: any) {
    console.error('Error approving HU:', error);
    throw new Error(error.response?.data?.detail || 'Failed to approve HU');
  }
};

// ✅ CORREGIDO: Rechazar HU (con re-refinamiento automático)
export const rejectHU = async (id: string, feedback: string, qaReviewer: string): Promise<void> => {
  try {
    // ❌ PROBLEMA 6: Endpoint y método incorrectos
    // Tu backend usa PATCH /hus/{id}/status, no POST /reject-hu/{id}
    await apiClient.patch(`/hus/${id}/status`, {
      status: 'rejected',
      feedback: feedback
      // Nota: qaReviewer no se usa actualmente en el backend
    });
    
    console.log(`❌ HU ${id} rechazada por ${qaReviewer}. Re-refinando automáticamente...`);
  } catch (error: any) {
    console.error('Error rejecting HU:', error);
    throw new Error(error.response?.data?.detail || 'Failed to reject HU');
  }
};

// ✅ CORREGIDO: Obtener historial de HUs
export const getHUHistory = async (): Promise<{ data: PendingHU[] }> => {
  try {
    const [approvedResponse, rejectedResponse] = await Promise.all([
      apiClient.get('/hus', { params: { status: 'approved' } }),
      apiClient.get('/hus', { params: { status: 'rejected' } })
    ]);
    
    // Combinar ambas respuestas
    const allHistoryHUs = [...approvedResponse.data, ...rejectedResponse.data];
    
    // ✅ Mapear al formato PendingHU
    const historyHUs: PendingHU[] = allHistoryHUs.map((hu: any) => ({
      id: hu.id,
      originalId: `HU-${hu.azure_id}`,
      title: hu.name,
      status: hu.status as 'pending' | 'accepted' | 'rejected',
      createdAt: hu.created_at,
      lastUpdated: hu.updated_at,
      featureAssigned: hu.feature || "Sin Feature",
      featureColor: getFeatureColor(hu.feature),
      moduleAssigned: hu.module || "Sin Módulo",
      moduleColor: getModuleColor(hu.module),
      refinedContent: hu.refined_response || "Sin contenido refinado",
      reRefinementCount: 0
    }));
    
    return { data: historyHUs };
  } catch (error: any) {
    console.error('Error fetching HU history:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch HU history');
  }
};

// ✅ NUEVA: Función para obtener HU específica
export const getHUById = async (id: string): Promise<PendingHU> => {
  try {
    const response = await apiClient.get(`/hus/${id}`);
    const hu = response.data;
    
    return {
      id: hu.id,
      originalId: `HU-${hu.azure_id}`,
      title: hu.name,
      status: hu.status as 'pending' | 'accepted' | 'rejected',
      createdAt: hu.created_at,
      lastUpdated: hu.updated_at,
      featureAssigned: hu.feature || "Sin Feature",
      featureColor: getFeatureColor(hu.feature),
      moduleAssigned: hu.module || "Sin Módulo",
      moduleColor: getModuleColor(hu.module),
      refinedContent: hu.refined_response || "🤖 Procesando...",
      reRefinementCount: 0
    };
  } catch (error: any) {
    console.error('Error fetching HU by ID:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch HU');
  }
};

// ✅ FUNCIONES HELPER para colores
const getFeatureColor = (feature: string | null): string => {
  if (!feature) return '#6B7280'; // Gray por defecto
  
  // Mapeo de colores por feature
  const featureColors: { [key: string]: string } = {
    'Perfil de Usuario': '#3B82F6', // Blue
    'Registro, login, validación y recuperar contraseña': '#10B981', // Green
    'Gestión de perfil e historial del repartidor': '#F59E0B', // Yellow
    'Gestión de Lotes y Productos': '#EF4444', // Red
    'Catálogo de Productos e Interacción Visual': '#8B5CF6', // Purple
    'Detalle de Productos y Agregado al Carrito': '#06B6D4', // Cyan
    'Navegación por Categorías y Búsqueda Flotante': '#84CC16', // Lime
    'Gestión de estados': '#F97316', // Orange
    'Carrito y Checkout del Dropshipper': '#EC4899', // Pink
    'Dashboard Principal': '#6366F1' // Indigo
  };
  
  return featureColors[feature] || '#6B7280';
};

const getModuleColor = (module: string | null): string => {
  if (!module) return '#6B7280'; // Gray por defecto
  
  // Mapeo de colores por módulo
  const moduleColors: { [key: string]: string } = {
    'Gestión de Información': '#3B82F6', // Blue
    'Gestión de Productos': '#10B981', // Green
    'Gestión de Pedidos': '#F59E0B', // Yellow
    'Gestión de Métricas': '#EF4444' // Red
  };
  
  return moduleColors[module] || '#6B7280';
};