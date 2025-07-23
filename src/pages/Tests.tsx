import React, { useState } from 'react';
import { TestTube, Send, Loader2, CheckCircle, XCircle, AlertTriangle, FolderTree, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/layout/Navbar';

const Tests = () => {
  const [formData, setFormData] = useState({
    xrayPath: '',
    azureId: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.xrayPath.trim()) {
      setError('La ruta de XRay es requerida');
      return false;
    }
    if (!formData.azureId.trim()) {
      setError('El ID de la HU es requerido');
      return false;
    }
    
    // Validar formato básico del ID de HU
    if (!formData.azureId.match(/^\d+$/) && !formData.azureId.match(/^HU-\d+$/)) {
      setError('El ID de la HU debe ser un número (ej: 129) o en formato HU-129');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      // Normalizar el ID de Azure (asegurar que tenga el formato correcto)
      const normalizedAzureId = formData.azureId.startsWith('HU-') 
        ? formData.azureId 
        : `HU-${formData.azureId}`;

      const response = await fetch('http://localhost:3000/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xray_path: formData.xrayPath.trim(),
          azure_id: normalizedAzureId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error generando tests');
      }

      setResult({
        success: true,
        message: data.message,
        hu_name: data.hu_name,
        tests_count: data.tests_generated,
        xray_path: data.xray_path,
        tests: data.tests
      });

      // Limpiar formulario en caso de éxito
      setFormData({ xrayPath: '', azureId: '' });

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ xrayPath: '', azureId: '' });
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TestTube className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Generación de Tests</h1>
          </div>
          
          <p className="text-muted-foreground">
            Genera casos de test automáticamente basados en las Historias de Usuario refinadas y envíalos directamente a XRay.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Formulario */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Generar Tests para HU
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Ruta XRay */}
                <div className="space-y-2">
                  <Label htmlFor="xrayPath" className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    Ruta en XRay
                  </Label>
                  <Input
                    id="xrayPath"
                    name="xrayPath"
                    type="text"
                    placeholder="Ejemplo: Informacion/Funcionales/Basados en Requisitos/Feature-100/HU-129"
                    value={formData.xrayPath}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="font-mono text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Estructura: Módulo/Tipo/Categoría/Feature-XXX/HU-XXX
                  </p>
                </div>

                {/* ID de HU */}
                <div className="space-y-2">
                  <Label htmlFor="azureId" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    ID de Historia de Usuario
                  </Label>
                  <Input
                    id="azureId"
                    name="azureId"
                    type="text"
                    placeholder="Ejemplo: 129 o HU-129"
                    value={formData.azureId}
                    onChange={handleInputChange}
                    disabled={loading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el número de la HU (solo el número o con prefijo HU-)
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generando Tests...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Generar y Enviar a XRay
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            
            <CardContent>
              {!result && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Los resultados aparecerán aquí después de generar los tests</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-lg font-medium mb-2">Generando casos de test...</p>
                  <p className="text-sm text-muted-foreground">
                    Esto puede tomar unos momentos mientras la IA procesa la Historia de Usuario
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Success Alert */}
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {result.message}
                    </AlertDescription>
                  </Alert>

                  {/* Detalles */}
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Historia de Usuario:</span>
                      <span className="text-sm text-muted-foreground">{result.hu_name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Tests Generados:</span>
                      <span className="text-sm font-semibold text-primary">{result.tests_count}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Ruta XRay:</span>
                      <span className="text-xs font-mono text-muted-foreground break-all">
                        {result.xray_path}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Tests Generados */}
                  {result.tests && result.tests.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Casos de Test Generados:</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {result.tests.map((test, index) => (
                          <div key={index} className="p-3 border border-border rounded-lg bg-card">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-medium text-sm">{test.fields?.summary || `Test Case ${index + 1}`}</h5>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {test.testtype || 'Manual'}
                              </span>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {test.fields?.description || 'Sin descripción'}
                            </p>
                            
                            <div className="text-xs text-muted-foreground">
                              {test.steps?.length || 0} step{(test.steps?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    onClick={resetForm} 
                    variant="outline" 
                    className="w-full"
                  >
                    Generar Más Tests
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información Adicional */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                Información Importante
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">📋 Requisitos Previos:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• La HU debe existir en el sistema</li>
                    <li>• La HU debe tener contenido refinado</li>
                    <li>• La ruta de XRay debe ser válida</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">🧪 Tests Generados:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Casos principales (happy path)</li>
                    <li>• Validaciones y reglas de negocio</li>
                    <li>• Casos límite y manejo de errores</li>
                    <li>• Formato Gherkin (Dado/Cuando/Entonces)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-muted-foreground">
                  <strong>Ejemplo de ruta XRay:</strong> <code className="bg-gray-100 px-1 rounded">Informacion/Funcionales/Basados en Requisitos/Feature-100/HU-129</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tests;