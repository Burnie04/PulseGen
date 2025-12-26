import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type VideoStatus = 'all' | 'uploading' | 'processing' | 'safe' | 'flagged' | 'error';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: VideoStatus;
  onStatusChange: (value: VideoStatus) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-48 bg-secondary border-border">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Videos</SelectItem>
          <SelectItem value="uploading">Uploading</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="safe">Safe</SelectItem>
          <SelectItem value="flagged">Flagged</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
