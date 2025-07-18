import { useEffect, useState } from 'react';
import { Search, Filter, X, ChevronRight, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { useHUs } from '@/hooks/useHUs';
import { useFilters } from '@/hooks/useFilters';
import StatusBadge from '@/components/ui/StatusBadge';
import ModuleBadge from '@/components/ui/ModuleBadge';
import FeatureBadge from '@/components/ui/FeatureBadge';
import ActionButtons from '@/components/ui/ActionButtons';
import RejectModal from '@/components/ui/RejectModal';
import Navbar from '@/components/layout/Navbar';
import { mockModules, mockFeatures } from '@/data/mockData';
import { PendingHU } from '@/types';

const Pending = () => {
  const { currentHU, loading, loadPendingHUs, setCurrentHU, approveHUById, rejectHUById } = useHUs();
  const { filters, filteredHUs, updateFilter, clearFilters, hasActiveFilters, filterCounts } = useFilters();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingHUs();
  }, [loadPendingHUs]);

  // Set first HU as current if none selected
  useEffect(() => {
    if (!currentHU && filteredHUs.length > 0) {
      setCurrentHU(filteredHUs[0]);
    }
  }, [currentHU, filteredHUs, setCurrentHU]);

  const handleSelectHU = (hu: PendingHU) => {
    setCurrentHU(hu);
  };

  const handleApprove = async () => {
    if (!currentHU) return;
    
    setActionLoading(true);
    try {
      await approveHUById(currentHU.id, 'QA Reviewer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (feedback: string) => {
    if (!currentHU) return;
    
    setActionLoading(true);
    try {
      await rejectHUById(currentHU.id, feedback, 'QA Reviewer');
      setIsRejectModalOpen(false);
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border p-6 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar HUs..."
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Select value={filters.status} onValueChange={(value) => updateFilter({ status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="accepted">Aceptado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.module} onValueChange={(value) => updateFilter({ module: value })}>
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

              <Select value={filters.feature} onValueChange={(value) => updateFilter({ feature: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las features</SelectItem>
                  {mockFeatures.map((feature) => (
                    <SelectItem key={feature.id} value={feature.name}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                <X className="w-4 h-4" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Filter Stats */}
          <div className="mb-6 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">Resultados</div>
            <div className="text-sm font-medium">
              {filterCounts.filtered} de {filterCounts.total} HUs
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="px-2 py-1 bg-warning/10 text-warning rounded">
                {filterCounts.pending} pendientes
              </span>
              <span className="px-2 py-1 bg-success/10 text-success rounded">
                {filterCounts.accepted} aceptadas
              </span>
            </div>
          </div>

          {/* HU List */}
          <div className="space-y-3">
            {loading && filteredHUs.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Cargando HUs...</p>
              </div>
            ) : filteredHUs.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No hay HUs que coincidan con los filtros</p>
              </div>
            ) : (
              filteredHUs.map((hu) => (
                <Card
                  key={hu.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    currentHU?.id === hu.id
                      ? 'ring-2 ring-primary shadow-elegant'
                      : 'hover:shadow-md hover:border-primary/20'
                  }`}
                  onClick={() => handleSelectHU(hu)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-muted-foreground">
                            {hu.originalId}
                          </span>
                          <StatusBadge status={hu.status} />
                        </div>
                        <h3 className="font-medium text-sm leading-tight mb-2">
                          {hu.title}
                        </h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <ModuleBadge name={hu.moduleAssigned} color={hu.moduleColor} />
                      <FeatureBadge name={hu.featureAssigned} color={hu.featureColor} />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(hu.lastUpdated)}
                      </div>
                      {hu.reRefinementCount && hu.reRefinementCount > 0 && (
                        <span className="px-2 py-1 bg-warning/10 text-warning rounded-full">
                          Re-refinado {hu.reRefinementCount}x
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 h-[calc(100vh-4rem)] overflow-y-auto">
          {currentHU ? (
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {currentHU.title}
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        {currentHU.originalId}
                      </span>
                      <StatusBadge status={currentHU.status} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <ModuleBadge name={currentHU.moduleAssigned} color={currentHU.moduleColor} />
                  <FeatureBadge name={currentHU.featureAssigned} color={currentHU.featureColor} />
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Actualizado: {formatDate(currentHU.lastUpdated)}</span>
                  </div>
                  {currentHU.qaReviewer && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Reviewer: {currentHU.qaReviewer}</span>
                    </div>
                  )}
                  {currentHU.reRefinementCount && currentHU.reRefinementCount > 0 && (
                    <span className="px-3 py-1 bg-warning/10 text-warning rounded-full">
                      Re-refinado {currentHU.reRefinementCount} veces
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground mt-6">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground mt-4">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-foreground">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                        code: ({ children }) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{children}</code>,
                        hr: () => <hr className="my-6 border-border" />,
                      }}
                    >
                      {currentHU.refinedContent}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons - Only show for pending HUs */}
              {currentHU.status === 'pending' && (
                <ActionButtons
                  onApprove={handleApprove}
                  onReject={handleReject}
                  loading={actionLoading}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Selecciona una HU</h2>
                <p className="text-muted-foreground">
                  Elige una Historia de Usuario de la lista lateral para ver su contenido
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        loading={actionLoading}
        huTitle={currentHU?.title || ''}
      />
    </div>
  );
};

export default Pending;