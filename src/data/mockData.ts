import { Module, Feature, PendingHU } from '@/types';

export const mockModules: Module[] = [
  { id: '1', name: 'Seguridad', color: '#DC2626', features: ['1', '2'] },
  { id: '2', name: 'Analytics', color: '#059669', features: ['3', '4'] },
  { id: '3', name: 'Integraciones', color: '#7C3AED', features: ['5', '6'] },
  { id: '4', name: 'Core Platform', color: '#0891B2', features: ['7', '8'] },
];

export const mockFeatures: Feature[] = [
  { id: '1', name: 'Autenticación', color: '#3B82F6', moduleId: '1' },
  { id: '2', name: 'Autorización', color: '#1E40AF', moduleId: '1' },
  { id: '3', name: 'Dashboard', color: '#10B981', moduleId: '2' },
  { id: '4', name: 'Reportes', color: '#F59E0B', moduleId: '2' },
  { id: '5', name: 'API Externa', color: '#8B5CF6', moduleId: '3' },
  { id: '6', name: 'Webhooks', color: '#A855F7', moduleId: '3' },
  { id: '7', name: 'Notificaciones', color: '#0E7490', moduleId: '4' },
  { id: '8', name: 'Configuración', color: '#6B7280', moduleId: '4' },
];

export const mockPendingHUs: PendingHU[] = [
  {
    id: '1',
    originalId: 'HU-120',
    title: 'Sistema de autenticación JWT',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-15T10:30:00Z',
    featureAssigned: 'Autenticación',
    featureColor: '#3B82F6',
    moduleAssigned: 'Seguridad',
    moduleColor: '#DC2626',
    refinedContent: `# Historia de Usuario: Sistema de Autenticación JWT

**Módulo:** Seguridad  
**Feature:** Autenticación  
**ID:** HU-120  

## Descripción
Como desarrollador del sistema, necesito implementar un sistema de autenticación JWT robusto y seguro para manejar sesiones de usuario de manera eficiente y escalable.

## Contexto del Negocio
El sistema actual carece de un mecanismo de autenticación centralizado, lo que genera problemas de seguridad y experiencia de usuario inconsistente.

## Criterios de Aceptación

### 1. Registro de Usuario
- **AC1.1:** El sistema debe permitir registro con email único y validación en tiempo real
- **AC1.2:** La contraseña debe cumplir políticas de seguridad (mín. 8 caracteres, mayús, minus, número, símbolo)
- **AC1.3:** Debe enviar email de confirmación antes de activar la cuenta

### 2. Proceso de Login
- **AC2.1:** Generar JWT con expiración de 24 horas tras login exitoso
- **AC2.2:** El token debe incluir claims: user_id, role, permissions, exp
- **AC2.3:** Implementar refresh token con expiración de 7 días

### 3. Seguridad y Auditoría
- **AC3.1:** Rate limiting: máximo 5 intentos fallidos por IP en 15 minutos
- **AC3.2:** Logs de auditoría para todos los eventos de autenticación
- **AC3.3:** Bloqueo temporal de cuenta tras 3 intentos fallidos consecutivos

### 4. Validación de Token
- **AC4.1:** Middleware para validar JWT en rutas protegidas
- **AC4.2:** Manejo automático de token expirado con redirección a login
- **AC4.3:** Blacklist de tokens para logout seguro

## Definición de Terminado
- [ ] Pruebas unitarias con cobertura >= 90%
- [ ] Pruebas de integración para flujos completos
- [ ] Documentación API con ejemplos
- [ ] Code review aprobado por arquitecto de seguridad
- [ ] Pruebas de penetración básicas completadas
- [ ] Performance testing: < 200ms respuesta promedio

## Consideraciones Técnicas
- Usar biblioteca JWT estándar (jsonwebtoken)
- Hash de contraseñas con bcrypt (salt rounds: 12)
- Almacenar refresh tokens en base de datos
- Implementar rotación de secrets JWT

## Riesgos Identificados
- **Alto:** Vulnerabilidades de seguridad si implementación incorrecta
- **Medio:** Performance degradada sin cache adecuado
- **Bajo:** Incompatibilidad con sistemas legacy`,
    reRefinementCount: 0
  },
  {
    id: '2',
    originalId: 'HU-121',
    title: 'Dashboard de métricas tiempo real',
    status: 'pending',
    createdAt: '2024-01-15T11:00:00Z',
    lastUpdated: '2024-01-15T11:00:00Z',
    featureAssigned: 'Dashboard',
    featureColor: '#10B981',
    moduleAssigned: 'Analytics',
    moduleColor: '#059669',
    refinedContent: `# Historia de Usuario: Dashboard de Métricas en Tiempo Real

**Módulo:** Analytics  
**Feature:** Dashboard  
**ID:** HU-121  

## Descripción
Como administrador del sistema, necesito un dashboard interactivo que muestre métricas clave del negocio en tiempo real para tomar decisiones informadas y monitorear el performance del sistema.

## Contexto del Negocio
La ausencia de visibilidad en tiempo real sobre métricas críticas está impactando la capacidad de respuesta ante incidentes y la toma de decisiones estratégicas.

## Criterios de Aceptación

### 1. Métricas Core
- **AC1.1:** Mostrar usuarios activos en tiempo real (últimos 5 min, 1h, 24h)
- **AC1.2:** Transacciones por minuto con tendencia de las últimas 4 horas
- **AC1.3:** Tasa de error del sistema con alertas visuales si > 5%
- **AC1.4:** Latencia promedio de API con distribución percentiles P50, P95, P99

### 2. Visualización de Datos
- **AC2.1:** Gráficos de líneas para tendencias temporales
- **AC2.2:** Gráficos de barras para comparativas
- **AC2.3:** KPI cards con indicadores de cambio (+/- porcentual vs período anterior)
- **AC2.4:** Heat map para actividad por regiones geográficas

### 3. Actualización en Tiempo Real
- **AC3.1:** Actualización automática cada 30 segundos vía WebSocket
- **AC3.2:** Indicador visual de "conectado/desconectado" del stream de datos
- **AC3.3:** Fallback a polling cada 60s si WebSocket falla
- **AC3.4:** Botón de refresh manual para forzar actualización

### 4. Interactividad
- **AC4.1:** Filtros por rango de fechas (última hora, día, semana, mes)
- **AC4.2:** Drill-down en métricas para ver detalles
- **AC4.3:** Hover tooltips con información contextual
- **AC4.4:** Exportación de datos a CSV/PDF

## Definición de Terminado
- [ ] Responsive design funcional en desktop, tablet y móvil
- [ ] Performance testing: carga inicial < 3s, actualizaciones < 500ms
- [ ] Documentación de usuario con capturas de pantalla
- [ ] Accesibilidad: cumple WCAG 2.1 nivel AA
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Pruebas de carga con 100+ usuarios concurrentes

## Stack Técnico Recomendado
- Frontend: React + Chart.js/D3.js para visualizaciones
- WebSocket para tiempo real
- Cache en memoria para optimización
- Service Worker para funcionalidad offline básica

## Métricas de Éxito
- Tiempo de detección de incidentes reducido en 60%
- Adopción del dashboard por 90%+ del equipo operativo
- Satisfacción usuario >= 4.5/5 en encuesta post-implementación`,
    reRefinementCount: 0
  },
  {
    id: '3',
    originalId: 'HU-122',
    title: 'Sistema de roles aprobado',
    status: 'accepted',
    createdAt: '2024-01-14T12:00:00Z',
    lastUpdated: '2024-01-14T16:30:00Z',
    featureAssigned: 'Autorización',
    featureColor: '#1E40AF',
    moduleAssigned: 'Seguridad',
    moduleColor: '#DC2626',
    refinedContent: `# Historia de Usuario: Sistema de Roles y Permisos

**Estado:** ✅ **Aceptado por Juan Pérez (QA Lead)** el 14/01/2024

## Resumen de Aprobación
Sistema de roles y permisos granular aprobado para desarrollo. Cumple todos los criterios de aceptación y consideraciones de seguridad requeridas.

## Comentarios del QA Lead
*"Excelente nivel de detalle en los criterios de aceptación. La matriz de permisos está bien estructurada y cubre todos los casos de uso. La implementación de auditoria es robusta. Aprobado para desarrollo inmediato."*

## Próximos Pasos
- Asignar al equipo de desarrollo backend
- Estimación: 3 sprints
- Dependencias: Completar HU-120 (Autenticación JWT)`,
    qaReviewer: 'Juan Pérez',
    reRefinementCount: 0
  },
  {
    id: '4',
    originalId: 'HU-123',
    title: 'Notificaciones push rechazada',
    status: 'rejected',
    createdAt: '2024-01-13T14:00:00Z',
    lastUpdated: '2024-01-13T18:45:00Z',
    featureAssigned: 'Notificaciones',
    featureColor: '#0E7490',
    moduleAssigned: 'Core Platform',
    moduleColor: '#0891B2',
    refinedContent: `# Historia de Usuario: Notificaciones Push

**Estado:** ❌ **Rechazado por Carlos Ruiz** el 13/01/2024

## Motivo del Rechazo
Los criterios de aceptación son demasiado generales y carecen de especificidad técnica necesaria para implementación.

## Feedback Detallado
*"La HU necesita definir tipos específicos de notificaciones, configuraciones de privacidad, tecnologías a usar (FCM, APNs), y casos edge como usuarios offline. Falta también estrategia de retry y limitaciones de frecuencia."*

## Acción Requerida
Re-refinamiento automático programado con el feedback proporcionado.

## Iteración
Esta es la iteración #1 tras rechazo inicial.`,
    qaReviewer: 'Carlos Ruiz',
    feedback: 'Criterios muy generales, falta especificidad técnica. Definir tipos específicos, privacidad, tecnologías.',
    reRefinementCount: 1
  },
  {
    id: '5',
    originalId: 'HU-124',
    title: 'API de reportes automatizados',
    status: 'pending',
    createdAt: '2024-01-16T09:15:00Z',
    lastUpdated: '2024-01-16T09:15:00Z',
    featureAssigned: 'Reportes',
    featureColor: '#F59E0B',
    moduleAssigned: 'Analytics',
    moduleColor: '#059669',
    refinedContent: `# Historia de Usuario: API de Reportes Automatizados

**Módulo:** Analytics  
**Feature:** Reportes  
**ID:** HU-124  

## Descripción
Como usuario del sistema, necesito una API que genere reportes automatizados en múltiples formatos para análisis de datos y compliance.

## Criterios de Aceptación

### 1. Generación de Reportes
- **AC1.1:** Soporte para formatos PDF, Excel, CSV
- **AC1.2:** Reportes programables (diario, semanal, mensual)
- **AC1.3:** Filtros personalizables por fecha, usuario, categoría

### 2. Entrega Automatizada
- **AC2.1:** Envío por email a listas de destinatarios
- **AC2.2:** Almacenamiento en cloud storage (S3/GCS)
- **AC2.3:** Webhooks para notificar generación completada

## Definición de Terminado
- [ ] API REST documentada con OpenAPI
- [ ] Pruebas de integración para todos los formatos
- [ ] Sistema de colas para procesamiento asíncrono
- [ ] Monitoreo y alertas de fallos`,
    reRefinementCount: 0
  }
];

// Helper functions para filtrar datos
export const getModuleById = (id: string): Module | undefined =>
  mockModules.find(module => module.id === id);

export const getFeatureById = (id: string): Feature | undefined =>
  mockFeatures.find(feature => feature.id === id);

export const getFeaturesByModule = (moduleId: string): Feature[] =>
  mockFeatures.filter(feature => feature.moduleId === moduleId);

export const mockRefineResponse = (huId: string) => {
  // Simular delay de API
  return new Promise((resolve) => {
    setTimeout(() => {
      const newHU: PendingHU = {
        id: Date.now().toString(),
        originalId: huId,
        title: `Historia refinada para ${huId}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        featureAssigned: 'Autenticación',
        featureColor: '#3B82F6',
        moduleAssigned: 'Seguridad',
        moduleColor: '#DC2626',
        refinedContent: `# Historia de Usuario Refinada: ${huId}

Esta es una historia de usuario refinada automáticamente mediante IA.

## Criterios de Aceptación
- Criterio 1: Funcionalidad básica
- Criterio 2: Validaciones
- Criterio 3: Seguridad

## Definición de Terminado
- [ ] Pruebas unitarias
- [ ] Code review
- [ ] Documentación`,
        reRefinementCount: 0
      };
      
      resolve({
        success: true,
        message: 'HU refinada exitosamente',
        data: newHU
      });
    }, 2000);
  });
};