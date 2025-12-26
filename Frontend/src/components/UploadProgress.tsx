import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export function UploadProgress({ 
  fileName, 
  progress, 
  status, 
  errorMessage 
}: UploadProgressProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      status === 'success' && "bg-success/10 border-success/30",
      status === 'error' && "bg-destructive/10 border-destructive/30",
      status === 'uploading' && "bg-muted/50 border-border"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          status === 'success' && "bg-success/20",
          status === 'error' && "bg-destructive/20",
          status === 'uploading' && "bg-primary/20"
        )}>
          {status === 'uploading' && (
            <Upload className="h-5 w-5 text-primary animate-pulse" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-5 w-5 text-success" />
          )}
          {status === 'error' && (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          {status === 'uploading' && (
            <div className="mt-2 flex items-center gap-2">
              <Progress value={progress} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground min-w-[3ch]">
                {Math.round(progress)}%
              </span>
            </div>
          )}
          {status === 'success' && (
            <p className="text-xs text-success mt-1">Upload complete</p>
          )}
          {status === 'error' && errorMessage && (
            <p className="text-xs text-destructive mt-1">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
