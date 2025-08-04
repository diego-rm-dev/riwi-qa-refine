import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginUser, getCurrentUser } from '@/services/api';
import { useAppContext } from '@/context/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const { authState, authDispatch } = useAppContext();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Verificar si ya está autenticado
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/');
    }
  }, [authState.isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    authDispatch({ type: 'LOGIN_START' });

    try {
      // Login
      const authResponse = await loginUser(formData);
      
      // Obtener información del usuario
      const user = await getCurrentUser();
      
      authDispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: authResponse.access_token
        }
      });

      navigate('/');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
      authDispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Error al iniciar sesión'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta de QA
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceso al Sistema</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nombre de usuario"
                  disabled={authState.loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu contraseña"
                  disabled={authState.loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={authState.loading}
              >
                {authState.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login; 