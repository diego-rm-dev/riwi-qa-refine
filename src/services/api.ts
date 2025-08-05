import axios from 'axios';
import { PendingHU, RefineHURequest, RefineHUResponse, LoginRequest, RegisterRequest, AuthResponse, User, ProjectCreate, Project, ProjectListResponse } from '@/types';

// ✅ CORREGIDO: Variables de entorno sin dotenv
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3500';
const API_KEY = import.meta.env.VITE_API_KEY;

console.log('🔧 API Configuration:');
console.log('   Base URL:', API_BASE_URL);
console.log('   API Key:', API_KEY ? '✅ Configured' : '❌ Missing');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // ✅ Aumentado por el procesamiento de IA
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para obtener token JWT del localStorage
const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función para guardar token en localStorage
const setStoredToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Función para eliminar token del localStorage
const removeStoredToken = (): void => {
  localStorage.removeItem('token');
};

// Add interceptor to include Bearer token in every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = getStoredToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Authorization header added to request');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
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
      data: error.response?.data,
      message: error.message
    });
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      console.error('🔐 Unauthorized - removing token');
      removeStoredToken();
      // Redirigir al login si es necesario
      window.location.href = '/login';
    }
    
    // Manejar errores de CORS específicamente
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('🌐 CORS/Network Error detected');
      return Promise.reject(new Error('Error de conexión: Verifica que el servidor esté disponible y la configuración de CORS sea correcta'));
    }
    
    return Promise.reject(error);
  }
);

// ==================== SERVICIOS DE AUTENTICACIÓN ====================

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    console.log('🔐 Iniciando sesión...');
    
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await axios.post(`${API_BASE_URL}/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const authResponse: AuthResponse = response.data;
    setStoredToken(authResponse.access_token);
    
    console.log('✅ Login exitoso');
    return authResponse;
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
  }
};

export const registerUser = async (userData: RegisterRequest): Promise<User> => {
  try {
    console.log('📝 Registrando usuario...');
    
    const response = await apiClient.post('/auth/register', userData);
    
    console.log('✅ Registro exitoso');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    throw new Error(error.response?.data?.detail || 'Error al registrar usuario');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('👤 Obteniendo información del usuario...');
    
    const response = await apiClient.get('/auth/me');
    
    console.log('✅ Información del usuario obtenida');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo usuario:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener información del usuario');
  }
};

export const logoutUser = (): void => {
  console.log('🚪 Cerrando sesión...');
  removeStoredToken();
  console.log('✅ Sesión cerrada');
};

// ==================== SERVICIOS DE GESTIÓN DE PROYECTOS ====================

export const createNewProject = async (projectData: ProjectCreate): Promise<Project> => {
  try {
    console.log('🏗️ Creando proyecto...');
    
    const response = await apiClient.post('/projects', projectData);
    
    console.log('✅ Proyecto creado exitosamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creando proyecto:', error);
    throw new Error(error.response?.data?.detail || 'Error al crear proyecto');
  }
};

export const getUserProjects = async (): Promise<ProjectListResponse> => {
  try {
    console.log('📋 Obteniendo proyectos del usuario...');
    
    const response = await apiClient.get('/projects');
    
    console.log('✅ Proyectos obtenidos exitosamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo proyectos:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener proyectos');
  }
};

export const setActiveProject = async (projectId: string): Promise<Project> => {
  try {
    console.log(`🔄 Estableciendo proyecto ${projectId} como activo...`);
    
    const response = await apiClient.post(`/projects/${projectId}/activate`);
    
    console.log('✅ Proyecto activado exitosamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error activando proyecto:', error);
    throw new Error(error.response?.data?.detail || 'Error al activar proyecto');
  }
};

export const getActiveProject = async (): Promise<Project | null> => {
  try {
    console.log('🔍 Obteniendo proyecto activo...');
    
    const response = await apiClient.get('/projects/active');
    
    console.log('✅ Proyecto activo obtenido');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo proyecto activo:', error);
    // Si no hay proyecto activo, retornar null
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.detail || 'Error al obtener proyecto activo');
  }
};

export const updateProject = async (projectId: string, projectData: Partial<ProjectCreate>): Promise<Project> => {
  try {
    console.log('✏️ Actualizando proyecto...');
    
    const response = await apiClient.put(`/projects/${projectId}`, projectData);
    
    console.log('✅ Proyecto actualizado exitosamente');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error actualizando proyecto:', error);
    throw new Error(error.response?.data?.detail || 'Error al actualizar proyecto');
  }
};

export const deleteProject = async (projectId: string): Promise<{ message: string }> => {
  try {
    console.log('🗑️ Eliminando proyecto...');
    
    const response = await apiClient.delete(`/projects/${projectId}`);
    
    console.log('✅ Proyecto eliminado');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error eliminando proyecto:', error);
    throw new Error(error.response?.data?.detail || 'Error al eliminar proyecto');
  }
};

export const getProjectHUs = async (projectId: string): Promise<{ project: any; hus: any[]; total_count: number }> => {
  try {
    console.log('🔍 Obteniendo HUs del proyecto...');
    
    const response = await apiClient.get(`/projects/${projectId}/hus`);
    
    console.log('✅ HUs del proyecto obtenidas');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo HUs del proyecto:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener HUs del proyecto');
  }
};

export const deleteHU = async (huId: string): Promise<{ message: string }> => {
  try {
    console.log('🗑️ Eliminando HU...');
    
    const response = await apiClient.delete(`/hus/${huId}`);
    
    console.log('✅ HU eliminada');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error eliminando HU:', error);
    throw new Error(error.response?.data?.detail || 'Error al eliminar HU');
  }
};

export const validatePassword = async (password: string): Promise<{ message: string; valid: boolean }> => {
  try {
    console.log('🔐 Validando contraseña...');
    
    const response = await apiClient.post('/auth/validate-password', { password });
    
    console.log('✅ Contraseña válida');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error validando contraseña:', error);
    
    // Manejar específicamente el error de contraseña incorrecta
    if (error.response?.status === 422) {
      throw new Error('Contraseña incorrecta');
    }
    
    // Para otros errores (401, 500, etc.), mantener el comportamiento original
    throw new Error(error.response?.data?.detail || 'Error al validar contraseña');
  }
};

// ==================== SERVICIOS EXISTENTES (ACTUALIZADOS) ====================

// ✅ CORREGIDO: Crear/Refinar HU desde Azure ID
export const refineHU = async (azureId: string, language: 'es' | 'en' = 'es'): Promise<RefineHUResponse> => {
  try {
    console.log('🤖 Refining HU with Azure ID:', azureId, 'Language:', language);
    
    const response = await apiClient.post('/hus', { 
      azure_id: azureId,
      language: language
    });
    
    // ✅ Mapear respuesta del backend al formato PendingHU
    const huData = response.data;
    const pendingHU: PendingHU = {
      id: huData.id,
      originalId: huData.azure_id,
      title: huData.name,
      status: huData.status,
      createdAt: huData.created_at,
      lastUpdated: huData.updated_at,
      featureAssigned: huData.feature || 'Sin asignar',
      featureColor: getFeatureColor(huData.feature),
      moduleAssigned: huData.module || 'Sin asignar',
      moduleColor: getModuleColor(huData.module),
      refinedContent: huData.refined_response || 'Sin contenido refinado',
      qaReviewer: undefined,
      reRefinementCount: 0
    };
    
    console.log('✅ HU refined successfully');
    return {
      success: true,
      message: 'HU refinada exitosamente',
      data: pendingHU
    };
    
  } catch (error: any) {
    console.error('❌ Error refining HU:', error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Error al refinar HU',
      data: undefined
    };
  }
};

export const getPendingHUs = async (): Promise<{ data: PendingHU[] }> => {
  try {
    console.log('📋 Fetching pending HUs...');
    
    const response = await apiClient.get('/hus?status=pending');
    
    const pendingHUs: PendingHU[] = response.data.data.map((hu: any) => ({
      id: hu.id,
      originalId: hu.azure_id,
      title: hu.name,
      status: hu.status,
      createdAt: hu.created_at,
      lastUpdated: hu.updated_at,
      featureAssigned: hu.feature || 'Sin asignar',
      featureColor: getFeatureColor(hu.feature),
      moduleAssigned: hu.module || 'Sin asignar',
      moduleColor: getModuleColor(hu.module),
      refinedContent: hu.refined_response || 'Sin contenido refinado',
      qaReviewer: undefined,
      reRefinementCount: 0
    }));
    
    console.log(`✅ ${pendingHUs.length} pending HUs fetched`);
    return { data: pendingHUs };
    
  } catch (error: any) {
    console.error('❌ Error fetching pending HUs:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener HUs pendientes');
  }
};

export const approveHU = async (id: string, qaReviewer: string): Promise<void> => {
  try {
    console.log(`✅ Approving HU: ${id}`);
    
    await apiClient.patch(`/hus/${id}/status`, {
      status: 'accepted'
    });
    
    console.log('✅ HU approved successfully');
  } catch (error: any) {
    console.error('❌ Error approving HU:', error);
    throw new Error(error.response?.data?.detail || 'Error al aprobar HU');
  }
};

export const rejectHU = async (id: string, feedback: string, qaReviewer: string): Promise<void> => {
  try {
    console.log(`❌ Rejecting HU: ${id}`);
    
    await apiClient.patch(`/hus/${id}/status`, {
      status: 'rejected',
      feedback: feedback
    });
    
    console.log('✅ HU rejected successfully');
  } catch (error: any) {
    console.error('❌ Error rejecting HU:', error);
    throw new Error(error.response?.data?.detail || 'Error al rechazar HU');
  }
};

export const getHUHistory = async (): Promise<{ data: PendingHU[] }> => {
  try {
    console.log('📚 Fetching HU history...');
    
    const response = await apiClient.get('/hus');
    
    const historyHUs: PendingHU[] = response.data.data.map((hu: any) => ({
      id: hu.id,
      originalId: hu.azure_id,
      title: hu.name,
      status: hu.status,
      createdAt: hu.created_at,
      lastUpdated: hu.updated_at,
      featureAssigned: hu.feature || 'Sin asignar',
      featureColor: getFeatureColor(hu.feature),
      moduleAssigned: hu.module || 'Sin asignar',
      moduleColor: getModuleColor(hu.module),
      refinedContent: hu.refined_response || 'Sin contenido refinado',
      qaReviewer: undefined,
      reRefinementCount: 0
    }));
    
    console.log(`✅ ${historyHUs.length} HUs in history fetched`);
    return { data: historyHUs };
    
  } catch (error: any) {
    console.error('❌ Error fetching HU history:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener historial de HUs');
  }
};

export const getHUById = async (id: string): Promise<PendingHU> => {
  try {
    console.log(`🔍 Fetching HU by ID: ${id}`);
    
    const response = await apiClient.get(`/hus/${id}`);
    const hu = response.data;
    
    const pendingHU: PendingHU = {
      id: hu.id,
      originalId: hu.azure_id,
      title: hu.name,
      status: hu.status,
      createdAt: hu.created_at,
      lastUpdated: hu.updated_at,
      featureAssigned: hu.feature || 'Sin asignar',
      featureColor: getFeatureColor(hu.feature),
      moduleAssigned: hu.module || 'Sin asignar',
      moduleColor: getModuleColor(hu.module),
      refinedContent: hu.refined_response || 'Sin contenido refinado',
      qaReviewer: undefined,
      reRefinementCount: 0
    };
    
    console.log('✅ HU fetched successfully');
    return pendingHU;
    
  } catch (error: any) {
    console.error('❌ Error fetching HU by ID:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener HU');
  }
};

export const getAllHUs = async (): Promise<{ data: PendingHU[] }> => {
  try {
    console.log('📋 Fetching all HUs...');
    
    const response = await apiClient.get('/hus');
    
    const allHUs: PendingHU[] = response.data.data.map((hu: any) => ({
      id: hu.id,
      originalId: hu.azure_id,
      title: hu.name,
      status: hu.status,
      createdAt: hu.created_at,
      lastUpdated: hu.updated_at,
      featureAssigned: hu.feature || 'Sin asignar',
      featureColor: getFeatureColor(hu.feature),
      moduleAssigned: hu.module || 'Sin asignar',
      moduleColor: getModuleColor(hu.module),
      refinedContent: hu.refined_response || 'Sin contenido refinado',
      qaReviewer: undefined,
      reRefinementCount: 0
    }));
    
    console.log(`✅ ${allHUs.length} HUs fetched`);
    return { data: allHUs };
    
  } catch (error: any) {
    console.error('❌ Error fetching all HUs:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener todas las HUs');
  }
};

export const generateTests = async (azureId: string, xrayPath: string): Promise<any> => {
  try {
    console.log(`🧪 Generating tests for HU: ${azureId}`);
    
    const response = await apiClient.post('/generate-tests', {
      azure_id: azureId,
      xray_path: xrayPath
    });
    
    console.log('✅ Tests generated successfully');
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Error generating tests:', error);
    throw new Error(error.response?.data?.detail || 'Error al generar tests');
  }
};

export const debugListHUs = async (): Promise<any> => {
  try {
    console.log('🔍 Debug: Listing all HUs...');
    
    const response = await apiClient.get('/debug/hus');
    
    console.log('✅ Debug HUs listed successfully');
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Error in debug list HUs:', error);
    throw new Error(error.response?.data?.detail || 'Error en debug list HUs');
  }
};

export const debugFindHU = async (azureId: string): Promise<any> => {
  try {
    console.log(`🔍 Debug: Finding HU: ${azureId}`);
    
    const response = await apiClient.get(`/debug/hu/${azureId}`);
    
    console.log('✅ Debug HU found successfully');
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Error in debug find HU:', error);
    throw new Error(error.response?.data?.detail || 'Error en debug find HU');
  }
};

// ==================== FUNCIONES AUXILIARES ====================

const getFeatureColor = (feature: string | null): string => {
  if (!feature) return '#6B7280';
  
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
  ];
  
  const hash = feature.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

const getModuleColor = (module: string | null): string => {
  if (!module) return '#6B7280';
  
  const colors = [
    '#DC2626', '#EA580C', '#16A34A', '#2563EB', '#7C3AED',
    '#DB2777', '#EA580C', '#65A30D', '#0891B2', '#4F46E5'
  ];
  
  const hash = module.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

export const isApiConfigured = (): boolean => {
  return !!(API_BASE_URL && API_KEY);
};

export const debugEnvVars = (): void => {
  console.log('🔧 Environment Variables Debug:');
  console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('   VITE_API_KEY:', import.meta.env.VITE_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   API_BASE_URL:', API_BASE_URL);
  console.log('   API_KEY:', API_KEY ? '✅ Set' : '❌ Not set');
};

// ==================== FUNCIONES DEPRECADAS (MANTENER PARA COMPATIBILIDAD) ====================

export const fetchProjects = async (): Promise<any[]> => {
  console.warn('⚠️ fetchProjects is deprecated, use getUserProjects instead');
  try {
    const response = await getUserProjects();
    return response.projects;
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    return [];
  }
};

export const createProject = async (projectData: { name: string; key: string; description?: string }): Promise<any> => {
  console.warn('⚠️ createProject is deprecated, use createNewProject with new interface instead');
  try {
    // Convertir formato antiguo al nuevo
    const newProjectData: ProjectCreate = {
      name: projectData.name,
      description: projectData.description,
      azure_devops_token: '', // Requerido en el nuevo formato
      azure_org: '', // Requerido en el nuevo formato
      azure_project: projectData.key,
      client_id: '', // Requerido en el nuevo formato
      client_secret: '' // Requerido en el nuevo formato
    };
    
    return await createNewProject(newProjectData);
  } catch (error) {
    console.error('❌ Error creating project:', error);
    throw error;
  }
};

export const fetchProjectByKey = async (projectKey: string): Promise<any> => {
  console.warn('⚠️ fetchProjectByKey is deprecated');
  try {
    const projects = await getUserProjects();
    return projects.projects.find((p: any) => p.azure_project === projectKey);
  } catch (error) {
    console.error('❌ Error fetching project by key:', error);
    return null;
  }
};

export const setCurrentProjectKey = (projectKey: string | null): void => {
  console.warn('⚠️ setCurrentProjectKey is deprecated, use setActiveProject instead');
  // Esta función ya no es necesaria con el nuevo sistema
};
