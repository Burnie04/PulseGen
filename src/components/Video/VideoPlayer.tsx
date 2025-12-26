import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, AlertTriangle } from 'lucide-react';

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

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      loadVideo();
    }
  }, [video.id, token]);

  const loadVideo = () => {
    if (!token) {
      setError('Please sign in to watch videos');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const streamUrl = `${apiUrl}/stream/${video.id}`;
    setVideoUrl(streamUrl);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">{video.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {video.sensitivityStatus === 'flagged' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Content Warning</p>
                <p className="text-sm text-yellow-700">
                  This video has been flagged as potentially sensitive content.
                  Sensitivity Score: {(video.sensitivityScore * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              {error}
            </div>
          ) : (
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                controls
                className="w-full"
                style={{ maxHeight: '60vh' }}
              >
                <source src={videoUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {video.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                <p className="text-gray-600">{video.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">File Size:</span>
                <span className="ml-2 text-gray-600">{formatFileSize(video.fileSize)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Uploaded:</span>
                <span className="ml-2 text-gray-600">{formatDate(video.createdAt)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 ${
                  video.sensitivityStatus === 'safe' ? 'text-green-600' :
                  video.sensitivityStatus === 'flagged' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {video.sensitivityStatus.charAt(0).toUpperCase() + video.sensitivityStatus.slice(1)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-600">{video.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
