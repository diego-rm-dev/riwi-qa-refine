import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'accepted' | 'rejected';
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: '⏳'
    },
    accepted: {
      label: 'Aceptado',
      className: 'bg-success/10 text-success border-success/20',
      icon: '✅'
    },
    rejected: {
      label: 'Rechazado',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: '❌'
    }
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
}