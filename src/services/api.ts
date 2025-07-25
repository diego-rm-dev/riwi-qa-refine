import axios from 'axios';
import { PendingHU, RefineHURequest, RefineHUResponse } from '@/types';

// ✅ CORRECTO: Variables de entorno sin dotenv
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-qa-blackbird.diegormdev.site';
const API_KEY = import.meta.env.VITE_API_KEY;

console.log('🔧 API Configuration:');
console.log('   Base URL:', API_BASE_URL);
console.log('   API Key:', API_KEY ? '✅ Configured' : '❌ Missing');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // ✅ Aumentado por el procesamiento de IA
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Bearer token in every request
apiClient.interceptors.request.use(
  (config) => {
    if (API_KEY) {
      config.headers['Authorization'] = `Bearer ${API_KEY}`;
      console.log('🔐 Authorization header added to request');
    } else {
      console.warn('⚠️ API_KEY not found in .env file');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// ✅ CORREGIDO: Crear/Refinar HU desde Azure ID
export const refineHU = async (azureId: string): Promise<RefineHUResponse> => {
  try {
    console.log('🤖 Refining HU with Azure ID:', azureId);
    
    const response = await apiClient.post('/hus', { 
      azure_id: azureId
    });
    
    // ✅ Mapear respuesta del backend al formato PendingHU
    const backendHU = response.data;
    console.log('✅ HU refined successfully:', backendHU);
    
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
    console.error('❌ Error refining HU:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to refine HU'
    };
  }
};

// ✅ CORREGIDO: Obtener HUs pendientes
export const getPendingHUs = async (): Promise<{ data: PendingHU[] }> => {
  try {
    console.log('📋 Fetching pending HUs...');
    
    const response = await apiClient.get('/hus', {
      params: { status: 'pending' }
    });
    
    console.log(`✅ Found ${response.data.length} pending HUs`);
    
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
    console.error('❌ Error fetching pending HUs:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch pending HUs');
  }
};

// ✅ CORREGIDO: Aprobar HU
export const approveHU = async (id: string, qaReviewer: string): Promise<void> => {
  try {
    console.log(`✅ Approving HU ${id} by ${qaReviewer}`);
    
    // ✅ CORREGIDO: Usar endpoint correcto del backend
    await apiClient.patch(`/hus/${id}/status`, {
      status: 'accepted'
      // Nota: qaReviewer no se usa actualmente en el backend
    });
    
    console.log(`✅ HU ${id} aprobada por ${qaReviewer}`);
  } catch (error: any) {
    console.error('❌ Error approving HU:', error);
    throw new Error(error.response?.data?.detail || 'Failed to approve HU');
  }
};

// ✅ CORREGIDO: Rechazar HU (con re-refinamiento automático)
export const rejectHU = async (id: string, feedback: string, qaReviewer: string): Promise<void> => {
  try {
    console.log(`❌ Rejecting HU ${id} by ${qaReviewer} with feedback:`, feedback);
    
    // ✅ CORREGIDO: Usar endpoint correcto del backend
    await apiClient.patch(`/hus/${id}/status`, {
      status: 'rejected',
      feedback: feedback
      // Nota: qaReviewer no se usa actualmente en el backend
    });
    
    console.log(`❌ HU ${id} rechazada por ${qaReviewer}. Re-refinando automáticamente...`);
  } catch (error: any) {
    console.error('❌ Error rejecting HU:', error);
    throw new Error(error.response?.data?.detail || 'Failed to reject HU');
  }
};

// ✅ CORREGIDO: Obtener historial de HUs
export const getHUHistory = async (): Promise<{ data: PendingHU[] }> => {
  try {
    console.log('📚 Fetching HU history...');
    
    // ✅ CORREGIDO: Usar los valores correctos de status
    const [acceptedResponse, rejectedResponse] = await Promise.all([
      apiClient.get('/hus', { params: { status: 'accepted' } }),
      apiClient.get('/hus', { params: { status: 'rejected' } })
    ]);
    
    // Combinar ambas respuestas
    const allHistoryHUs = [...acceptedResponse.data, ...rejectedResponse.data];
    console.log(`✅ Found ${allHistoryHUs.length} HUs in history`);
    
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
    
    // Ordenar por fecha de actualización (más recientes primero)
    historyHUs.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    return { data: historyHUs };
  } catch (error: any) {
    console.error('❌ Error fetching HU history:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch HU history');
  }
};

// ✅ NUEVA: Función para obtener HU específica
export const getHUById = async (id: string): Promise<PendingHU> => {
  try {
    console.log('🔍 Fetching HU by ID:', id);
    
    const response = await apiClient.get(`/hus/${id}`);
    const hu = response.data;
    
    console.log('✅ HU fetched by ID:', hu);
    
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
    console.error('❌ Error fetching HU by ID:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch HU');
  }
};

// ✅ NUEVA: Obtener todas las HUs (sin filtrar por status)
export const getAllHUs = async (): Promise<{ data: PendingHU[] }> => {
  try {
    console.log('📋 Fetching all HUs...');
    
    const response = await apiClient.get('/hus');
    
    console.log(`✅ Found ${response.data.length} total HUs`);
    
    const allHUs: PendingHU[] = response.data.map((hu: any) => ({
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
    }));
    
    return { data: allHUs };
  } catch (error: any) {
    console.error('❌ Error fetching all HUs:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch all HUs');
  }
};

// ✅ NUEVA: Generar tests para una HU
export const generateTests = async (azureId: string, xrayPath: string): Promise<any> => {
  try {
    console.log(`🧪 Generating tests for HU ${azureId} at path: ${xrayPath}`);
    
    const response = await apiClient.post('/generate-tests', {
      azure_id: azureId,
      xray_path: xrayPath
    });
    
    console.log('✅ Tests generated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error generating tests:', error);
    throw new Error(error.response?.data?.detail || 'Failed to generate tests');
  }
};

// ✅ NUEVA: Debug endpoints
export const debugListHUs = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/debug/hus');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error in debug list HUs:', error);
    throw new Error(error.response?.data?.detail || 'Failed to debug HUs');
  }
};

export const debugFindHU = async (azureId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/debug/hu/${azureId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error in debug find HU:', error);
    throw new Error(error.response?.data?.detail || 'Failed to debug find HU');
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

// ✅ FUNCIÓN DE UTILIDAD: Verificar configuración de API
export const isApiConfigured = (): boolean => {
  const hasApiKey = !!API_KEY;
  const hasBaseUrl = !!API_BASE_URL;
  
  if (!hasApiKey) {
    console.warn('⚠️ VITE_API_KEY not configured in .env file');
  }
  
  if (!hasBaseUrl) {
    console.warn('⚠️ VITE_API_BASE_URL not configured in .env file');
  }
  
  return hasApiKey && hasBaseUrl;
};

// ✅ FUNCIÓN DE DEBUG: Verificar variables de entorno
export const debugEnvVars = (): void => {
  console.log('🔧 Environment Variables Debug:');
  console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('   VITE_API_KEY:', import.meta.env.VITE_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   Resolved API_BASE_URL:', API_BASE_URL);
  console.log('   API_KEY configured:', !!API_KEY);
  console.log('   Is API configured:', isApiConfigured());
};

// ✅ PROYECTO MANAGEMENT FUNCTIONS (para el multi-proyecto)

// Obtener todos los proyectos
export const fetchProjects = async (): Promise<any[]> => {
  try {
    console.log('🔍 Fetching projects from API...');
    
    const response = await apiClient.get('/projects');
    
    console.log(`✅ Found ${response.data.length} projects`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching projects:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch projects');
  }
};

// Crear nuevo proyecto
export const createProject = async (projectData: { name: string; key: string; description?: string }): Promise<any> => {
  try {
    console.log('🚀 Creating project:', projectData);
    
    const response = await apiClient.post('/projects', projectData);
    
    console.log('✅ Project created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating project:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create project');
  }
};

// Obtener proyecto por clave
export const fetchProjectByKey = async (projectKey: string): Promise<any> => {
  try {
    console.log('🔍 Fetching project by key:', projectKey);
    
    const response = await apiClient.get(`/projects/${projectKey}`);
    
    console.log('✅ Project fetched by key:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching project by key:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch project');
  }
};

// ✅ Interceptor para agregar X-Project-Key header automáticamente
let currentProjectKey: string | null = null;

export const setCurrentProjectKey = (projectKey: string | null): void => {
  currentProjectKey = projectKey;
  console.log('🔑 Current project key set to:', projectKey);
};

// Interceptor que agrega el Project-Key header a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Agregar Authorization header
    if (API_KEY) {
      config.headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    // Agregar Project-Key header si hay proyecto seleccionado
    if (currentProjectKey) {
      config.headers['Project-Key'] = currentProjectKey;
      console.log('🗝️ Project-Key header added:', currentProjectKey);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
