import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback: string) => void;
  loading?: boolean;
  huTitle: string;
}

export default function RejectModal({ isOpen, onClose, onConfirm, loading = false, huTitle }: RejectModalProps) {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!feedback.trim()) {
      setError('El feedback es obligatorio para rechazar una HU');
      return;
    }
    
    if (feedback.trim().length < 10) {
      setError('El feedback debe tener al menos 10 caracteres');
      return;
    }

    setError('');
    onConfirm(feedback.trim());
  };

  const handleClose = () => {
    setFeedback('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Rechazar Historia de Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium text-sm text-muted-foreground mb-1">HU a rechazar:</p>
            <p className="font-semibold">{huTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              Feedback detallado <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback"
              placeholder="Explique detalladamente por qué se rechaza esta HU y qué mejoras específicas se requieren..."
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (error) setError('');
              }}
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres. Este feedback se usará para el re-refinamiento automático.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={loading || !feedback.trim()}
          >
            {loading ? 'Procesando...' : 'Confirmar Rechazo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}