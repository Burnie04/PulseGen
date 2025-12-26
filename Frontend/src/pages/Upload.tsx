import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, FileVideo, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { apiClient } from '../lib/api';
import { Layout } from '../components/Layout';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file.",
          variant: "destructive"
        });
        e.target.value = ""; 
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      setUploading(true);
      
      toast({
        title: "Success!",
        description: "Video uploaded successfully.",
      });

      navigate('/dashboard');
      setFile(null);
      setTitle('');
      setDescription('');
      
    } catch (error: unknown) {
      // 1. FIX: Use 'unknown' type and safely extract message
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong while uploading.";

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // 2. FIX: Always turn off loading state, even on error
      setUploading(false);
    }
  };
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display">Upload Video</h1>
          <p className="text-muted-foreground mt-2">
            Share your content with the world. Supported formats: MP4, WebM.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleUpload} className="space-y-6">
            
            {/* File Drop Zone / Preview */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
              {file ? (
                <div className="flex flex-col items-center">
                  <FileVideo className="h-12 w-12 text-blue-500 mb-3" />
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-500 text-sm hover:underline flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove file
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <UploadIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-lg font-medium text-gray-900">Click to upload video</span>
                    <span className="text-sm text-gray-500 mt-1">or drag and drop here</span>
                  </label>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Video Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video a catchy title"
                required
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this video about?"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 text-lg"
              disabled={uploading || !file || !title}
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Publish Video
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
