import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, ArrowRight, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useHUs } from '@/hooks/useHUs';

const Index = () => {
  const [huId, setHuId] = useState('');
  const [isValidFormat, setIsValidFormat] = useState(true);
  const [language, setLanguage] = useState<'es' | 'en'>('es'); // 'es' = español, 'en' = inglés
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

  const handleLanguageChange = (checked: boolean) => {
    setLanguage(checked ? 'en' : 'es');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!huId.trim() || !isValidFormat) return;

    try {
      await refineHUById(huId, language);
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
                {/* Language Selection */}
                <div className="flex items-center justify-center space-x-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Idioma de Refinamiento</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium transition-colors ${language === 'es' ? 'text-primary' : 'text-muted-foreground'}`}>
                      Español
                    </span>
                    <Switch
                      checked={language === 'en'}
                      onCheckedChange={handleLanguageChange}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className={`text-sm font-medium transition-colors ${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>
                      English
                    </span>
                  </div>
                </div>

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
                    <p className="text-sm text-destructive">
                      Formato inválido. Usa el formato HU-XXX (ej: HU-120)
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Refinando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Refinar con IA
                    </>
                  )}
                </Button>
              </form>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate('/pending')}
                  className="flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Ver Pendientes
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/history')}
                  className="flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Ver Historial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
