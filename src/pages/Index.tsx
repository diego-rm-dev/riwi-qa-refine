import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHUs } from '@/hooks/useHUs';
import Navbar from '@/components/layout/Navbar';

const Index = () => {
  const [huId, setHuId] = useState('');
  const [isValidFormat, setIsValidFormat] = useState(true);
  const { loading, refineHUById } = useHUs();
  const navigate = useNavigate();

  const validateHUFormat = (value: string) => {
    const huPattern = /^HU-\d{1,4}$/i;
    return huPattern.test(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setHuId(value);
    
    if (value.length > 0) {
      setIsValidFormat(validateHUFormat(value));
    } else {
      setIsValidFormat(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!huId.trim() || !isValidFormat) return;

    try {
      await refineHUById(huId);
      // Navigate to pending page after successful refinement
      navigate('/pending');
    } catch (error) {
      // Error handling is done in the useHUs hook
      console.error('Error refining HU:', error);
    }
  };

  const isFormValid = huId.length > 0 && isValidFormat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-xl mb-6 shadow-elegant">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Refinamiento de HUs con IA
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Transforma tus Historias de Usuario en especificaciones detalladas y listas para desarrollo mediante inteligencia artificial.
            </p>
          </div>

          {/* Refinement Form */}
          <Card className="shadow-elegant border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <RefreshCw className="w-6 h-6 text-primary" />
                Refinar Historia de Usuario
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="hu-id" className="text-sm font-medium">
                    ID de Historia de Usuario
                  </Label>
                  <Input
                    id="hu-id"
                    type="text"
                    placeholder="Ej: HU-120"
                    value={huId}
                    onChange={handleInputChange}
                    className={`text-center text-lg font-mono ${
                      !isValidFormat && huId.length > 0 
                        ? 'border-destructive focus:ring-destructive' 
                        : ''
                    }`}
                    disabled={loading}
                  />
                  
                  {!isValidFormat && huId.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      Formato inválido. Use: HU-XXX (donde XXX son 1-4 dígitos)
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Ingrese el ID en formato HU-XXX (ej: HU-1, HU-120, HU-1234)
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="xl"
                  className="w-full"
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Refinando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Refinar HU
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Actions */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  ¿Ya tienes HUs refinadas?
                </p>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/pending')}
                >
                  <FileText className="w-4 h-4" />
                  Ver HUs Pendientes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Refinamiento Automático</h3>
              <p className="text-sm text-muted-foreground">
                IA convierte HUs básicas en especificaciones detalladas y completas
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Revisión QA</h3>
              <p className="text-sm text-muted-foreground">
                Sistema de aprobación/rechazo con feedback para mejora continua
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Re-refinamiento</h3>
              <p className="text-sm text-muted-foreground">
                Mejora automática basada en feedback del equipo QA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
