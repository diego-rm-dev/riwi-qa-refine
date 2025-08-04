import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validatePassword } from '@/services/api';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  projectName: string;
}

const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primero validar la contraseña con el backend
      await validatePassword(password);
      
      // Si la contraseña es válida, proceder con la eliminación
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (error: any) {
      // Mostrar mensaje específico según el tipo de error
      if (error.message === 'Contraseña incorrecta') {
        setError('La contraseña ingresada es incorrecta. Por favor, intenta de nuevo.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogDescription>
            Para eliminar el proyecto "{projectName}", ingresa tu contraseña para confirmar.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading || !password.trim()}
          >
            {loading ? 'Validando...' : 'Confirmar Eliminación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordConfirmModal; 