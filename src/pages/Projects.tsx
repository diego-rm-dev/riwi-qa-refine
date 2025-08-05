import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createNewProject, getUserProjects, setActiveProject, getActiveProject, updateProject, deleteProject, getProjectHUs } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import ProjectDeleteModal from '@/components/ui/ProjectDeleteModal';
import SimpleDeleteModal from '@/components/ui/SimpleDeleteModal';
import PasswordConfirmModal from '@/components/ui/PasswordConfirmModal';
import { Project, ProjectCreate } from '@/types';

const Projects = () => {
  const { projectState, projectDispatch, authState } = useAppContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    description: '',
    azure_devops_token: '',
    azure_org: '',
    azure_project: '',
    client_id: '',
    client_secret: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ProjectCreate>>({});
  const [showSimpleDelete, setShowSimpleDelete] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
    loadActiveProject();
  }, []);

  const loadProjects = async () => {
    try {
      projectDispatch({ type: 'SET_LOADING', payload: true });
      const response = await getUserProjects();
      projectDispatch({ type: 'SET_PROJECTS', payload: response.projects });
    } catch (error: any) {
      console.error('❌ Error loading projects:', error);
      projectDispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadActiveProject = async () => {
    try {
      const activeProject = await getActiveProject();
      projectDispatch({ type: 'SET_ACTIVE_PROJECT', payload: activeProject });
    } catch (error: any) {
      console.error('❌ Error loading active project:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const newProject = await createNewProject(formData);
      projectDispatch({ type: 'ADD_PROJECT', payload: newProject });
      
      setSuccess('Proyecto creado exitosamente');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        azure_devops_token: '',
        azure_org: '',
        azure_project: '',
        client_id: '',
        client_secret: ''
      });
    } catch (error: any) {
      console.error('❌ Error creating project:', error);
      setError(error.message || 'Error al crear proyecto');
    }
  };

  const handleSetActiveProject = async (projectId: string) => {
    try {
      const activeProject = await setActiveProject(projectId);
      projectDispatch({ type: 'SET_ACTIVE_PROJECT', payload: activeProject });
      
      // Recargar la lista de proyectos para actualizar el estado is_active
      await loadProjects();
      
      setSuccess(`Proyecto "${activeProject.name}" establecido como activo`);
    } catch (error: any) {
      console.error('❌ Error setting active project:', error);
      setError(error.message || 'Error al establecer proyecto activo');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditFormData({
      name: project.name,
      description: project.description || '',
      azure_devops_token: '',
      azure_org: project.azure_org,
      azure_project: project.azure_project,
      client_id: project.client_id || '',
      client_secret: ''
    });
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    try {
      setError(null);
      setSuccess(null);

      const updatedProject = await updateProject(editingProject.id, editFormData);
      projectDispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      
      setSuccess('Proyecto actualizado exitosamente');
      setEditingProject(null);
      setEditFormData({});
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      // Primero verificar si el proyecto tiene HUs asociadas
      const projectHUs = await getProjectHUs(project.id);
      
      if (projectHUs.total_count === 0) {
        // No tiene HUs, mostrar modal simple
        setProjectToDelete(project);
        setShowSimpleDelete(true);
      } else {
        // Tiene HUs, mostrar modal detallado
        setDeletingProject(project);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSimpleDeleteConfirm = () => {
    if (projectToDelete) {
      setShowSimpleDelete(false);
      setShowPasswordConfirm(true);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!projectToDelete) return;
    
    try {
      // La contraseña ya fue validada en el modal, solo proceder con la eliminación
      await deleteProject(projectToDelete.id);
      projectDispatch({ type: 'DELETE_PROJECT', payload: projectToDelete.id });
      setProjectToDelete(null);
      setShowPasswordConfirm(false);
      loadProjects(); // Recargar la lista
    } catch (error: any) {
      throw new Error('Error al eliminar el proyecto');
    }
  };

  const handleProjectDeleted = () => {
    loadProjects(); // Recargar la lista después de eliminar
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Proyectos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus proyectos y credenciales de Azure DevOps y XRay
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancelar' : 'Nuevo Proyecto'}
          </Button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Formulario de creación */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Crear Nuevo Proyecto</CardTitle>
              <CardDescription>
                Completa la información del proyecto y sus credenciales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Proyecto *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: Proyecto QA Principal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descripción opcional del proyecto"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Credenciales Azure DevOps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="azure_devops_token">Token de Azure DevOps *</Label>
                      <Input
                        id="azure_devops_token"
                        name="azure_devops_token"
                        type="password"
                        required
                        value={formData.azure_devops_token}
                        onChange={handleInputChange}
                        placeholder="Token de acceso personal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="azure_org">Organización *</Label>
                      <Input
                        id="azure_org"
                        name="azure_org"
                        required
                        value={formData.azure_org}
                        onChange={handleInputChange}
                        placeholder="Ej: mi-organizacion"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="azure_project">Proyecto *</Label>
                      <Input
                        id="azure_project"
                        name="azure_project"
                        required
                        value={formData.azure_project}
                        onChange={handleInputChange}
                        placeholder="Ej: MiProyecto"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Credenciales XRay</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="client_id">Client ID *</Label>
                      <Input
                        id="client_id"
                        name="client_id"
                        required
                        value={formData.client_id}
                        onChange={handleInputChange}
                        placeholder="Client ID de XRay"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client_secret">Client Secret *</Label>
                      <Input
                        id="client_secret"
                        name="client_secret"
                        type="password"
                        required
                        value={formData.client_secret}
                        onChange={handleInputChange}
                        placeholder="Client Secret de XRay"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Crear Proyecto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de proyectos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Proyectos ({projectState.projects.length})
          </h2>

          {projectState.loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando proyectos...</p>
            </div>
          ) : projectState.projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600 mb-4">No tienes proyectos creados</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Crear tu primer proyecto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectState.projects.map((project: Project) => (
                <Card key={project.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {project.description || 'Sin descripción'}
                        </CardDescription>
                      </div>
                      {project.is_active && (
                        <Badge className="bg-green-100 text-green-800">
                          Activo
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Azure DevOps</p>
                      <p className="text-sm text-gray-600">
                        {project.azure_org} / {project.azure_project}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Creado</p>
                      <p className="text-sm text-gray-600">
                        {new Date(project.created_at || '').toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!project.is_active && (
                        <Button
                          size="sm"
                          onClick={() => handleSetActiveProject(project.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Activar
                        </Button>
                      )}
                      {project.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                        >
                          Proyecto Activo
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProject(project)}
                      >
                        Editar
                      </Button>
                      {!project.is_active && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProject(project)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Proyecto activo */}
        {projectState.activeProject && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-green-800">Proyecto Activo</span>
                <Badge className="bg-green-600">Activo</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nombre</p>
                  <p className="text-lg font-semibold text-green-800">
                    {projectState.activeProject.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Azure DevOps</p>
                  <p className="text-sm text-gray-600">
                    {projectState.activeProject.azure_org} / {projectState.activeProject.azure_project}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo de edición */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
            <DialogDescription>
              Modifica la información del proyecto. Los campos de contraseña se pueden dejar vacíos para mantener los valores actuales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre del Proyecto *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  value={editFormData.name || ''}
                  onChange={handleEditInputChange}
                  placeholder="Ej: Proyecto QA Principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditInputChange}
                  placeholder="Descripción opcional del proyecto"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Credenciales Azure DevOps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-azure_devops_token">Token de Azure DevOps</Label>
                  <Input
                    id="edit-azure_devops_token"
                    name="azure_devops_token"
                    type="password"
                    value={editFormData.azure_devops_token || ''}
                    onChange={handleEditInputChange}
                    placeholder="Dejar vacío para mantener el actual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-azure_org">Organización *</Label>
                  <Input
                    id="edit-azure_org"
                    name="azure_org"
                    required
                    value={editFormData.azure_org || ''}
                    onChange={handleEditInputChange}
                    placeholder="Ej: mi-organizacion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-azure_project">Proyecto *</Label>
                  <Input
                    id="edit-azure_project"
                    name="azure_project"
                    required
                    value={editFormData.azure_project || ''}
                    onChange={handleEditInputChange}
                    placeholder="Ej: MiProyecto"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Credenciales XRay</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-client_id">Client ID</Label>
                  <Input
                    id="edit-client_id"
                    name="client_id"
                    value={editFormData.client_id || ''}
                    onChange={handleEditInputChange}
                    placeholder="Dejar vacío para mantener el actual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-client_secret">Client Secret</Label>
                  <Input
                    id="edit-client_secret"
                    name="client_secret"
                    type="password"
                    value={editFormData.client_secret || ''}
                    onChange={handleEditInputChange}
                    placeholder="Dejar vacío para mantener el actual"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingProject(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUpdateProject}
              className="bg-green-600 hover:bg-green-700"
            >
              Actualizar Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de eliminación detallada */}
      {deletingProject && (
        <ProjectDeleteModal
          isOpen={!!deletingProject}
          onClose={() => setDeletingProject(null)}
          project={deletingProject}
          onProjectDeleted={handleProjectDeleted}
        />
      )}

      {/* Modal de eliminación simple */}
      <SimpleDeleteModal
        isOpen={showSimpleDelete}
        onClose={() => {
          setShowSimpleDelete(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleSimpleDeleteConfirm}
        projectName={projectToDelete?.name || ''}
        loading={false}
      />

      {/* Modal de confirmación con contraseña */}
      <PasswordConfirmModal
        isOpen={showPasswordConfirm}
        onClose={() => {
          setShowPasswordConfirm(false);
          setProjectToDelete(null);
        }}
        onConfirm={handlePasswordConfirm}
        projectName={projectToDelete?.name || ''}
      />
    </div>
  );
};

export default Projects; 