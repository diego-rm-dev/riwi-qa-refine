import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface ActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function ActionButtons({ onApprove, onReject, loading = false, disabled = false }: ActionButtonsProps) {
  return (
    <div className="flex gap-4 justify-center pt-8 border-t border-border mt-8">
      <Button
        variant="success"
        size="lg"
        onClick={onApprove}
        disabled={loading || disabled}
        className="min-w-[120px]"
      >
        <CheckCircle className="w-4 h-4" />
        {loading ? 'Procesando...' : 'Aprobar'}
      </Button>
      
      <Button
        variant="danger"
        size="lg"
        onClick={onReject}
        disabled={loading || disabled}
        className="min-w-[120px]"
      >
        <XCircle className="w-4 h-4" />
        Rechazar
      </Button>
    </div>
  );
}