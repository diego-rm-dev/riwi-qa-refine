import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getProjectHUs, deleteProject, deleteHU } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import ReactMarkdown from 'react-markdown';
import { Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onProjectDeleted: () => void;
}

const ProjectDeleteModal: React.FC<ProjectDeleteModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectDeleted
}) => {
  const { projectDispatch } = useAppContext();
  const [projectHUs, setProjectHUs] = useState<{ project: any; hus: any[]; total_count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHU, setSelectedHU] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && project) {
      loadProjectHUs();
    }
  }, [isOpen, project]);

  const loadProjectHUs = async () => {
    if (!project) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProjectHUs(project.id);
      setProjectHUs(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHU = async (huId: string) => {
    if (!project) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteHU(huId);
      loadProjectHUs(); // Reload HUs to update status
      setSelectedHU(null); // Clear selected HU
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleGoToPending = () => {
    onClose(); // Close the modal
    navigate('/pending'); // Navigate to pending page
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      await deleteProject(project.id);
      projectDispatch({ type: 'DELETE_PROJECT', payload: project.id });
      onProjectDeleted();
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  const pendingHUs = projectHUs?.hus.filter(hu => hu.status === 'pending') || [];
  const approvedHUs = projectHUs?.hus.filter(hu => hu.status === 'accepted') || [];
  const rejectedHUs = projectHUs?.hus.filter(hu => hu.status === 'rejected') || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Eliminar Proyecto: {project?.name}</DialogTitle>
          <DialogDescription>
            Este proyecto tiene HUs asociadas. Revisa las HUs antes de proceder con la eliminación.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando HUs del proyecto...</p>
            </div>
          </div>
        ) : projectHUs ? (
          <div className="flex gap-6 flex-1 min-h-0">
            {/* Panel izquierdo - Lista de HUs */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Resumen del proyecto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre</p>
                      <p className="text-sm">{projectHUs.project.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de HUs</p>
                      <p className="text-sm">{projectHUs.total_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas de HUs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado de las HUs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {pendingHUs.length} Pendientes
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {approvedHUs.length} Aceptadas
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {rejectedHUs.length} Rechazadas
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de HUs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">HUs Asociadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectHUs.hus.map((hu, index) => (
                      <div 
                        key={hu.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedHU?.id === hu.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedHU(hu)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{hu.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">Azure ID: {hu.azure_id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(hu.status)}>
                              {getStatusText(hu.status)}
                            </Badge>
                            <div className="flex gap-2">
                              {hu.status === 'accepted' ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteHU(hu.id);
                                  }}
                                  disabled={deleting}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGoToPending();
                                  }}
                                  disabled={deleting}
                                  className="h-8 px-3 text-xs"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Ir a Pendientes
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {hu.feature && (
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {hu.feature}
                            </Badge>
                          </div>
                        )}
                        
                        {hu.module && (
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {hu.module}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Advertencia si hay HUs pendientes */}
              {pendingHUs.length > 0 && (
                <Alert>
                  <AlertDescription>
                    ⚠️ Este proyecto tiene <strong>{pendingHUs.length} HUs pendientes</strong>. 
                    Considera revisar y procesar estas HUs antes de eliminar el proyecto.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Panel derecho - Vista completa de markdown */}
            <div className="w-1/2 border-l pl-6 flex flex-col">
              <div className="sticky top-0 bg-white pb-4 z-10">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedHU ? `Contenido de: ${selectedHU.name}` : 'Selecciona una HU para ver su contenido'}
                </h3>
              </div>
              
              {selectedHU ? (
                <div className="flex-1 overflow-y-auto pr-4">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{selectedHU.refined_content || 'Sin contenido disponible'}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Selecciona una HU de la lista para ver su contenido completo</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          {projectHUs && projectHUs.total_count === 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject}
              disabled={deleting || loading}
            >
              {deleting ? 'Eliminando...' : 'Eliminar Proyecto'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDeleteModal; 