import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPendingHUs, approveHU, rejectHU } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import { PendingHU } from '@/types';
import RejectModal from '@/components/ui/RejectModal';
import FeatureBadge from '@/components/ui/FeatureBadge';
import ModuleBadge from '@/components/ui/ModuleBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import ReactMarkdown from 'react-markdown';

const Pending = () => {
  const { appState, appDispatch, projectState } = useAppContext();
  const [selectedHU, setSelectedHU] = useState<PendingHU | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingHUs();
  }, []);

  const loadPendingHUs = async () => {
    try {
      appDispatch({ type: 'SET_LOADING', payload: true });
      const response = await getPendingHUs();
      appDispatch({ type: 'SET_PENDING_HUS', payload: response.data });
    } catch (error: any) {
      console.error('❌ Error loading pending HUs:', error);
      setError(error.message || 'Error al cargar HUs pendientes');
    }
  };

  const handleSelectHU = (hu: PendingHU) => {
    setSelectedHU(hu);
    appDispatch({ type: 'SET_CURRENT_HU', payload: hu });
  };

  const handleApprove = async () => {
    if (!selectedHU) return;

    setLoading(true);
    try {
      await approveHU(selectedHU.id, 'QA Reviewer');
      appDispatch({
        type: 'APPROVE_HU',
        payload: { id: selectedHU.id, qaReviewer: 'QA Reviewer' }
      });
      setSelectedHU(null);
      appDispatch({ type: 'SET_CURRENT_HU', payload: null });
    } catch (error: any) {
      console.error('❌ Error approving HU:', error);
      setError(error.message || 'Error al aprobar HU');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (feedback: string) => {
    if (!selectedHU) return;

    setLoading(true);
    try {
      await rejectHU(selectedHU.id, feedback, 'QA Reviewer');
      appDispatch({
        type: 'REJECT_HU',
        payload: { id: selectedHU.id, feedback, qaReviewer: 'QA Reviewer' }
      });
      setSelectedHU(null);
      appDispatch({ type: 'SET_CURRENT_HU', payload: null });
      setShowRejectModal(false);
    } catch (error: any) {
      console.error('❌ Error rejecting HU:', error);
      setError(error.message || 'Error al rechazar HU');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStats = () => {
    const total = appState.pendingHUs.length;
    const pending = appState.pendingHUs.filter(hu => hu.status === 'pending').length;
    const accepted = appState.pendingHUs.filter(hu => hu.status === 'accepted').length;
    const rejected = appState.pendingHUs.filter(hu => hu.status === 'rejected').length;

    return { total, pending, accepted, rejected };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">HUs Pendientes</h1>
          </div>
          
          {/* Indicador de proyecto activo */}
          {projectState.activeProject && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  Proyecto Activo
                </Badge>
                <span className="text-sm font-medium text-blue-900">
                  {projectState.activeProject.name}
                </span>
                <span className="text-xs text-blue-600">
                  ({projectState.activeProject.azure_org}/{projectState.activeProject.azure_project})
                </span>
              </div>
            </div>
          )}
          
          <p className="text-muted-foreground">
            Revisa y aprueba las Historias de Usuario que han sido refinadas por IA.
          </p>
        </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total HUs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Aprobadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rechazadas</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {appState.loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando HUs pendientes...</p>
        </div>
      ) : appState.pendingHUs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No hay HUs pendientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de HUs */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900">Lista de HUs</h2>
            <div className="space-y-3">
              {appState.pendingHUs.map((hu) => (
                <Card
                  key={hu.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedHU?.id === hu.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelectHU(hu)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{hu.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {hu.originalId} • {formatDate(hu.createdAt)}
                        </CardDescription>
                      </div>
                      <StatusBadge status={hu.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 mb-3">
                      <FeatureBadge name={hu.featureAssigned} color={hu.featureColor} />
                      <ModuleBadge name={hu.moduleAssigned} color={hu.moduleColor} />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {hu.refinedContent}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Detalle de HU seleccionada */}
          {selectedHU && (
            <div className="space-y-4 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900">Detalle de HU</h2>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedHU.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedHU.originalId} • {formatDate(selectedHU.createdAt)}
                      </CardDescription>
                    </div>
                    <StatusBadge status={selectedHU.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <FeatureBadge name={selectedHU.featureAssigned} color={selectedHU.featureColor} />
                    <ModuleBadge name={selectedHU.moduleAssigned} color={selectedHU.moduleColor} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contenido Refinado</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {selectedHU.refinedContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {selectedHU.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleApprove}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? 'Aprobando...' : 'Aprobar'}
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={loading}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        {loading ? 'Rechazando...' : 'Rechazar'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        loading={loading}
        huTitle={selectedHU?.title || ''}
      />
      </div>
    </div>
  );
};

export default Pending;