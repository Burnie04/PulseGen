import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, Clock, Upload, XCircle } from 'lucide-react';

type VideoStatus = 'uploading' | 'processing' | 'safe' | 'flagged' | 'error';

interface StatusBadgeProps {
  status: VideoStatus;
  className?: string;
}

const statusConfig: Record<VideoStatus, { 
  label: string; 
  icon: typeof CheckCircle; 
  className: string;
}> = {
  uploading: {
    label: 'Uploading',
    icon: Upload,
    className: 'bg-muted text-muted-foreground border-border',
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  safe: {
    label: 'Safe',
    icon: CheckCircle,
    className: 'bg-success/20 text-success border-success/30',
  },
  flagged: {
    label: 'Flagged',
    icon: AlertTriangle,
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  error: {
    label: 'Error',
    icon: XCircle,
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
