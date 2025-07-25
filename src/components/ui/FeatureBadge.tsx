import { cn } from '@/lib/utils';

interface FeatureBadgeProps {
  name: string;
  color: string;
  className?: string;
}

export default function FeatureBadge({ name, color, className }: FeatureBadgeProps) {
  // Convert hex color to RGB for background with opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 139, g: 92, b: 246 }; // fallback to primary purple
  };

  const rgb = hexToRgb(color);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border',
        className
      )}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: color
      }}
    >
      {name}
    </span>
  );
}