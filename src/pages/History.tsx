import { useEffect, useState } from 'react';
import { History as HistoryIcon, Calendar, User, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import StatusBadge from '@/components/ui/StatusBadge';
import ModuleBadge from '@/components/ui/ModuleBadge';
import FeatureBadge from '@/components/ui/FeatureBadge';
import Navbar from '@/components/layout/Navbar';
import { getHUHistory } from '@/services/api';
import { mockModules, mockFeatures } from '@/data/mockData';
import { PendingHU } from '@/types';

const History = () => {
  const [historyHUs, setHistoryHUs] = useState<PendingHU[]>([]);
  const [filteredHUs, setFilteredHUs] = useState<PendingHU[]>([]);
  const [selectedHU, setSelectedHU] = useState<PendingHU | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHUs();
  }, [historyHUs, searchTerm, statusFilter, moduleFilter]);

  const loadHistory = async () => {
    try {
      const response = await getHUHistory();
      setHistoryHUs(response.data);
      if (response.data.length > 0) {
        setSelectedHU(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHUs = () => {
    let filtered = historyHUs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(hu =>
        hu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hu.originalId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(hu => hu.status === statusFilter);
    }

    // Module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(hu => hu.moduleAssigned === moduleFilter);
    }

    setFilteredHUs(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStats = () => {
    const accepted = historyHUs.filter(hu => hu.status === 'accepted').length;
    const rejected = historyHUs.filter(hu => hu.status === 'rejected').length;
    const total = historyHUs.length;
    
    return { accepted, rejected, total };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Historial de HUs</h1>
          </div>
          
          <p className="text-muted-foreground">
            Revisa el historial completo de Historias de Usuario procesadas y sus estados finales.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Procesadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">{stats.accepted}</div>
              <p className="text-sm text-muted-foreground">Aceptadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
              <p className="text-sm text-muted-foreground">Rechazadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">
                {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Tasa de Aceptación</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters and List */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Filtrar Historias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="accepted">Aceptado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los módulos</SelectItem>
                    {mockModules.map((module) => (
                      <SelectItem key={module.id} value={module.name}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground pt-2 border-t">
                  Mostrando {filteredHUs.length} de {stats.total} HUs
                </div>
              </CardContent>
            </Card>

            {/* HU List */}
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Cargando historial...</p>
                </div>
              ) : filteredHUs.length === 0 ? (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No hay HUs que coincidan</p>
                </div>
              ) : (
                filteredHUs.map((hu) => (
                  <Card
                    key={hu.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedHU?.id === hu.id
                        ? 'ring-2 ring-primary shadow-elegant'
                        : 'hover:shadow-md hover:border-primary/20'
                    }`}
                    onClick={() => setSelectedHU(hu)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-muted-foreground">
                              {hu.originalId}
                            </span>
                            <StatusBadge status={hu.status} />
                          </div>
                          <h3 className="font-medium text-sm leading-tight">
                            {hu.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <ModuleBadge name={hu.moduleAssigned} color={hu.moduleColor} />
                        <FeatureBadge name={hu.featureAssigned} color={hu.featureColor} />
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {formatDate(hu.lastUpdated)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Content Detail */}
          <div className="lg:col-span-2">
            {selectedHU ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{selectedHU.title}</CardTitle>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-mono text-muted-foreground">
                          {selectedHU.originalId}
                        </span>
                        <StatusBadge status={selectedHU.status} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ModuleBadge name={selectedHU.moduleAssigned} color={selectedHU.moduleColor} />
                        <FeatureBadge name={selectedHU.featureAssigned} color={selectedHU.featureColor} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Procesado: {formatDate(selectedHU.lastUpdated)}</span>
                    </div>
                    {selectedHU.qaReviewer && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Por: {selectedHU.qaReviewer}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {selectedHU.feedback && (
                    <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <h4 className="font-medium text-destructive mb-2">Feedback del Rechazo</h4>
                      <p className="text-sm text-foreground">{selectedHU.feedback}</p>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-foreground">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-foreground mt-4">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-foreground mt-3">{children}</h3>,
                        p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed text-sm">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-foreground text-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                      }}
                    >
                      {selectedHU.refinedContent}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecciona una HU</h3>
                  <p className="text-muted-foreground">
                    Elige una Historia de Usuario para ver su historial completo
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;