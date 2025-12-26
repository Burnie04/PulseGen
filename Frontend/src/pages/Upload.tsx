import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, FileVideo } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { UploadProgress } from '@/components/UploadProgress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
      } else {
        toast({ title: 'Invalid file', description: 'Please upload a video file', variant: 'destructive' });
      }
    }
  }, [title, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !title.trim()) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Simulate progress for upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Create video record
      const { error: dbError } = await supabase.from('videos').insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        status: 'processing',
        processing_progress: 0,
      });

      if (dbError) throw dbError;

      setUploadStatus('success');
      toast({ title: 'Upload complete!', description: 'Your video is now being processed.' });
      
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Upload Video</h1>
          <p className="text-muted-foreground mt-1">Upload a video for content analysis</p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-6">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
            }`}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drag and drop your video here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-4">Supports MP4, WebM, MOV up to 500MB</p>
          </div>

          {file && uploadStatus === 'idle' && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileVideo className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium truncate">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {uploadStatus !== 'idle' && file && (
            <UploadProgress
              fileName={file.name}
              progress={uploadProgress}
              status={uploadStatus === 'uploading' ? 'uploading' : uploadStatus === 'success' ? 'success' : 'error'}
            />
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                className="bg-secondary min-h-[100px]"
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !title.trim() || uploadStatus === 'uploading'}
            className="w-full glow-soft"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Video'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
