import { TestTube, Wrench, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';

const Tests = () => {
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
            Herramientas para generar tests automatizados basados en las Historias de Usuario refinadas.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="max-w-2xl mx-auto shadow-elegant">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-warning" />
            </div>
            <CardTitle className="text-2xl">Funcionalidad en Desarrollo</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">
              La generación automática de casos de test está siendo desarrollada. Próximamente podrás:
            </p>

            <div className="grid gap-4 text-left max-w-lg mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium mb-1">Tests Unitarios</h3>
                  <p className="text-sm text-muted-foreground">
                    Generación automática de tests unitarios basados en criterios de aceptación
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium mb-1">Tests de Integración</h3>
                  <p className="text-sm text-muted-foreground">
                    Cases de test para validar flujos completos de las HUs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium mb-1">Tests E2E</h3>
                  <p className="text-sm text-muted-foreground">
                    Pruebas end-to-end para validar experiencia de usuario
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium mb-1">Documentación</h3>
                  <p className="text-sm text-muted-foreground">
                    Generación automática de documentación de testing
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4" />
                <span>Estimado de lanzamiento: Q2 2024</span>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Volver
                </Button>
                
                <Button variant="default" disabled>
                  <TestTube className="w-4 h-4" />
                  Próximamente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TestTube className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">IA Especializada</h3>
            <p className="text-sm text-muted-foreground">
              Modelos entrenados específicamente para generar tests de calidad
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Múltiples Frameworks</h3>
            <p className="text-sm text-muted-foreground">
              Soporte para Jest, Cypress, Playwright y más
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-2">Integración CI/CD</h3>
            <p className="text-sm text-muted-foreground">
              Tests listos para integrar en pipelines automatizados
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tests;