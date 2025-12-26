import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VideoUpload from '../Video/VideoUpload';
import VideoList from '../Video/VideoList';
import VideoPlayer from '../Video/VideoPlayer';
import AdminPanel from '../Admin/AdminPanel';
import type { Database } from '../../lib/database.types';
import { Video, Users, LogOut, Upload as UploadIcon } from 'lucide-react';

type VideoType = Database['public']['Tables']['videos']['Row'];

export default function Dashboard() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'upload' | 'admin'>('videos');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { profile, signOut, isEditor, isAdmin } = useAuth();

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('videos');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">VideoStream</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || profile?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'videos'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Video className="w-5 h-5" />
            My Videos
          </button>

          {isEditor && (
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UploadIcon className="w-5 h-5" />
              Upload
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              Admin
            </button>
          )}
        </div>

        {activeTab === 'videos' && (
          <VideoList
            onVideoSelect={setSelectedVideo}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'upload' && isEditor && (
          <VideoUpload onUploadComplete={handleUploadComplete} />
        )}

        {activeTab === 'admin' && isAdmin && <AdminPanel />}

        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </div>
    </div>
  );
}
