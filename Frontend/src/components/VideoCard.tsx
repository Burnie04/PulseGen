import { formatDistanceToNow } from 'date-fns';
import { Play, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  status: 'uploading' | 'processing' | 'safe' | 'flagged' | 'error';
  processingProgress?: number;
  duration?: number;
  createdAt: string;
  onPlay?: () => void;
  onDelete?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoCard({
  title,
  thumbnailUrl,
  status,
  processingProgress = 0,
  duration,
  createdAt,
  onPlay,
  onDelete,
}: VideoCardProps) {
  const isPlayable = status === 'safe' || status === 'flagged';
  const isProcessing = status === 'processing' || status === 'uploading';

  return (
    <div className="group glass-card rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-fade-in">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <Play className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-background/80 backdrop-blur-sm rounded text-xs font-medium">
            <Clock className="h-3 w-3" />
            {formatDuration(duration)}
          </div>
        )}

        {/* Play overlay */}
        {isPlayable && (
          <button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center glow-soft">
              <Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </button>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="text-sm font-medium mb-2">
              {status === 'uploading' ? 'Uploading...' : 'Analyzing...'}
            </div>
            <div className="w-3/4">
              <Progress value={processingProgress} className="h-1.5" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {processingProgress}%
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate mb-1" title={title}>
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3">
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}
