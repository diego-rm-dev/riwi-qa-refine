import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/layout/Navbar';
import Index from './pages/Index';
import Pending from './pages/Pending';
import History from './pages/History';
import Tests from './pages/Tests';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import { getCurrentUser, getActiveProject } from './services/api';

// Componente para inicializar la aplicación
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const { authState, authDispatch, projectDispatch } = useAppContext();

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      
      if (token && !authState.user) {
        try {
          console.log('🔧 AppInitializer - Verificando token válido...');
          
          // Obtener información del usuario
          const user = await getCurrentUser();
          console.log('✅ Usuario obtenido:', user);
          
          authDispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              token
            }
          });

          // Obtener proyecto activo
          try {
            const activeProject = await getActiveProject();
            if (activeProject) {
              projectDispatch({
                type: 'SET_ACTIVE_PROJECT',
                payload: activeProject
              });
            }
          } catch (projectError) {
            console.log('ℹ️ No hay proyecto activo:', projectError);
          }
          
        } catch (error) {
          console.error('❌ Error verificando token:', error);
          // Token inválido, limpiar localStorage
          localStorage.removeItem('token');
          authDispatch({
            type: 'LOGIN_FAILURE',
            payload: 'Token inválido'
          });
        }
      }
    };

    initializeApp();
  }, [authDispatch, projectDispatch, authState.user]);

  return <>{children}</>;
};

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAppContext();
  
  if (!authState.isAuthenticated || !authState.user) {
    console.log('🔒 Redirigiendo al login - Usuario no autenticado');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente para rutas públicas (solo si no está autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAppContext();
  
  if (authState.isAuthenticated && authState.user) {
    console.log('🔒 Redirigiendo al home - Usuario ya autenticado');
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Rutas públicas de autenticación */}
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    <Route path="/register" element={
      <PublicRoute>
        <Register />
      </PublicRoute>
    } />
    
    {/* Rutas protegidas */}
    <Route path="/" element={
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Index />
          </main>
        </div>
      </ProtectedRoute>
    } />
    
    <Route path="/pending" element={
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Pending />
          </main>
        </div>
      </ProtectedRoute>
    } />
    
    <Route path="/history" element={
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <History />
          </main>
        </div>
      </ProtectedRoute>
    } />
    
    <Route path="/tests" element={
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Tests />
          </main>
        </div>
      </ProtectedRoute>
    } />
    
    <Route path="/projects" element={
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Projects />
          </main>
        </div>
      </ProtectedRoute>
    } />
    
    {/* Ruta 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  console.log('🔧 App - Component rendering');
  
  return (
    <AppProvider>
      <AppInitializer>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AppInitializer>
    </AppProvider>
  );
};

export default App;
