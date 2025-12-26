import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Play, AlertTriangle, CheckCircle, Clock, Loader } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  fileSize: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingProgress: number;
  sensitivityStatus: 'pending' | 'safe' | 'flagged';
  sensitivityScore: number;
  createdAt: string;
}

interface VideoListProps {
  onVideoSelect: (video: Video) => void;
  refreshTrigger: number;
}

export default function VideoList({ onVideoSelect, refreshTrigger }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'safe' | 'flagged' | 'pending'>('all');
  const { token } = useAuth();

  useEffect(() => {
    loadVideos();
    const interval = setInterval(loadVideos, 2000);
    return () => clearInterval(interval);
  }, [token, refreshTrigger]);

  const loadVideos = async () => {
    if (!token) return;

    try {
      const data = await apiClient.getVideos(token);
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return video.processingStatus === 'pending' || video.sensitivityStatus === 'pending';
    }
    return video.sensitivityStatus === filter;
  });

  const getStatusIcon = (video: Video) => {
    if (video.processingStatus === 'processing') {
      return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    if (video.processingStatus === 'failed') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (video.sensitivityStatus === 'flagged') {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    if (video.sensitivityStatus === 'safe') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (video: Video) => {
    if (video.processingStatus === 'processing') {
      return `Processing ${video.processingProgress}%`;
    }
    if (video.processingStatus === 'failed') {
      return 'Processing Failed';
    }
    if (video.sensitivityStatus === 'flagged') {
      return 'Flagged Content';
    }
    if (video.sensitivityStatus === 'safe') {
      return 'Safe';
    }
    return 'Pending';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Video Library</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'safe'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Safe
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'flagged'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Flagged
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'pending'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {filter === 'all' ? 'No videos uploaded yet' : `No ${filter} videos`}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">{getStatusIcon(video)}</div>

              <div className="flex-grow min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>{getStatusText(video)}</span>
                  <span>{formatFileSize(video.fileSize)}</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                {video.processingStatus === 'processing' && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${video.processingProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {video.processingStatus === 'completed' && (
                <button
                  onClick={() => onVideoSelect(video)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Play
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
