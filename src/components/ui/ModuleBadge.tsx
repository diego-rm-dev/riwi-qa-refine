import { cn } from '@/lib/utils';

interface ModuleBadgeProps {
  name: string;
  color: string;
  className?: string;
}

export default function ModuleBadge({ name, color, className }: ModuleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-secondary/50 text-secondary-foreground border border-border',
        className
      )}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}