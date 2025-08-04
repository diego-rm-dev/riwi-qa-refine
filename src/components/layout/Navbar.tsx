import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { logoutUser } from '@/services/api';
import { 
  Home, 
  Clock, 
  History, 
  TestTube, 
  FolderOpen, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { authState, projectState, authDispatch, projectDispatch } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Limpiar estado inmediatamente
    authDispatch({ type: 'LOGOUT' });
    projectDispatch({ type: 'CLEAR_PROJECTS' });
    
    // Limpiar localStorage
    logoutUser();
    
    // Redirigir inmediatamente
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/pending', label: 'Pendientes', icon: Clock },
    { to: '/history', label: 'Historial', icon: History },
    { to: '/tests', label: 'Tests', icon: TestTube },
    { to: '/projects', label: 'Proyectos', icon: FolderOpen },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QA Platform
                </span>
              </Link>
            </div>
            
            {/* Navegación desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Lado derecho - Usuario */}
            <div className="flex items-center space-x-4">
              {/* Información del usuario desktop */}
              {authState.user && (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{authState.user.username}</div>
                      <div className="text-xs text-gray-500">{authState.user.email}</div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors px-4"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </div>
              )}

              {/* Botón hamburguesa móvil */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                  <span>Menú</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              
              {authState.user && (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex items-center px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{authState.user.username}</div>
                        <div className="text-xs text-gray-500">{authState.user.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-red-600 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Barra de proyecto activo */}
      {projectState.activeProject && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end py-2">
              <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-lg border border-blue-300">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <div className="text-sm">
                  <span className="font-medium text-blue-900">Proyecto Activo:</span>
                  <span className="ml-2 text-blue-700">{projectState.activeProject.name}</span>
                  <span className="ml-2 text-xs text-blue-500">
                    ({projectState.activeProject.azure_org}/{projectState.activeProject.azure_project})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}