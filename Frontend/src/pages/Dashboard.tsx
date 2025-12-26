import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Video, TrendingUp, Clock } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { VideoCard } from '@/components/VideoCard';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
}

export default function Dashboard() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VideoStatus>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVideos();
      subscribeToUpdates();
    }
  }, [user]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
    } else {
      setVideos(data as VideoData[]);
    }
    setLoading(false);
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('videos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVideos(prev => [payload.new as VideoData, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setVideos(prev => prev.map(v => v.id === payload.new.id ? payload.new as VideoData : v));
        } else if (payload.eventType === 'DELETE') {
          setVideos(prev => prev.filter(v => v.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete video', variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Video removed successfully' });
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
