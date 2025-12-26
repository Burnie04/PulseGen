import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Video, TrendingUp, Clock } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { VideoCard } from '@/components/VideoCard';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
// CHANGED: Removed Supabase imports
import { apiClient } from '@/lib/api'; 
import { useToast } from '@/hooks/use-toast';

type VideoStatus = 'uploading' | 'processing' | 'safe' | 'flagged' | 'error';

interface VideoData {
  id: string;
  title: string;
  status: VideoStatus;
  processing_progress: number;
  duration: number | null;
  created_at: string;
  file_path: string;
  thumbnailUrl?: string; // Added to support thumbnails
}

export default function Dashboard() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VideoStatus>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // CHANGED: Auth check using LocalStorage token instead of useAuth hook
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchVideos(token);
  }, [navigate]);

  const fetchVideos = async (token: string) => {
    try {
      // CHANGED: Use apiClient instead of supabase.from()
      const data = await apiClient.getVideos(token);
      
      // MAPPING: Convert MongoDB data (_id) to Frontend structure (id)
      const mappedVideos: VideoData[] = Array.isArray(data) 
        ? data.map((v: any) => ({
            id: v._id,
            title: v.title,
            // Default status to 'safe' since we don't have processing logic yet
            status: 'safe', 
            processing_progress: 100,
            duration: v.duration || 0,
            created_at: v.createdAt,
            file_path: v.videoUrl,
            thumbnailUrl: v.thumbnailUrl
          }))
        : [];

      setVideos(mappedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({ title: 'Error', description: 'Failed to fetch videos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: subscribeToUpdates (Real-time not supported in this simple backend version yet)

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // CHANGED: Use apiClient instead of supabase
      await apiClient.deleteVideo(token, id);
      
      // Update local state
      setVideos(prev => prev.filter(v => v.id !== id));
      toast({ title: 'Deleted', description: 'Video removed successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete video', variant: 'destructive' });
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: videos.length,
    safe: videos.filter(v => v.status === 'safe').length,
    flagged: videos.filter(v => v.status === 'flagged').length,
    processing: videos.filter(v => v.status === 'processing' || v.status === 'uploading').length,
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor your video content</p>
          </div>
          <Button onClick={() => navigate('/upload')} className="glow-soft">
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Videos', value: stats.total, icon: Video, color: 'text-primary' },
            { label: 'Safe Content', value: stats.safe, icon: TrendingUp, color: 'text-success' },
            { label: 'Flagged', value: stats.flagged, icon: Clock, color: 'text-destructive' },
            { label: 'Processing', value: stats.processing, icon: Clock, color: 'text-warning' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No videos yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first video to get started</p>
            <Button onClick={() => navigate('/upload')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                status={video.status}
                processingProgress={video.processing_progress}
                duration={video.duration || undefined}
                createdAt={video.created_at}
                onDelete={() => handleDelete(video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}