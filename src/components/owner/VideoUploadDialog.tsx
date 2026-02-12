'use client';

import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Film, X, FileVideo, Play, Pause, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  onSuccess?: () => void;
  editLesson?: {
    id: string;
    title: string;
    description: string | null;
    video_path: string | null;
    thumbnail_url: string | null;
  } | null;
}

export function VideoUploadDialog({
  open,
  onOpenChange,
  moduleId,
  onSuccess,
  editLesson,
}: VideoUploadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(editLesson?.video_path || null);
  const [formData, setFormData] = useState({
    title: editLesson?.title || '',
    description: editLesson?.description || '',
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const supabase = createClient();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un archivo de video válido');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El video es demasiado grande. Máximo 500MB');
      return;
    }

    setError('');
    setVideoFile(file);
    setUploadedPath(null); // Reset uploaded path when new file is selected

    // Create video preview
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    // Reset player state
    setIsPlaying(false);
    setVideoDuration(0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
    setVideoDuration(0);
    setIsPlaying(false);
    setUploadedPath(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Función para subir video directamente a Supabase Storage
  const uploadVideoToSupabase = async (file: File, schoolId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${schoolId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    // Subir usando el cliente de Supabase con seguimiento de progreso
    const { data, error } = await supabase.storage
      .from('lesson-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Error al subir video: ${error.message}`);
    }

    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      let videoPath = uploadedPath;

      // Si hay un nuevo archivo de video, subirlo directamente a Supabase
      if (videoFile && !uploadedPath) {
        // Obtener school_id del usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No autenticado');
        }

        const { data: membership } = await (supabase
          .from('school_members')
          .select('school_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single() as any);

        if (!membership) {
          throw new Error('No tienes acceso a ninguna autoescuela');
        }

        // Simular progreso de subida
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 15;
          });
        }, 300);

        // Subir video directamente a Supabase Storage
        videoPath = await uploadVideoToSupabase(videoFile, membership.school_id);

        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      // Crear/actualizar lección con la ruta del video
      const response = await fetch(
        editLesson ? `/api/content/lessons/${editLesson.id}` : '/api/content/lessons',
        {
          method: editLesson ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: moduleId,
            title: formData.title,
            description: formData.description,
            video_path: videoPath,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Si falla la creación, eliminar el video subido
        if (videoPath && videoPath !== uploadedPath) {
          await supabase.storage.from('lesson-videos').remove([videoPath]);
        }
        throw new Error(data.error || 'Error al crear la clase');
      }

      // Reset form
      setFormData({ title: '', description: '' });
      setVideoFile(null);
      setVideoPreview('');
      setVideoDuration(0);
      setIsPlaying(false);
      setUploadedPath(null);

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden max-h-[90vh]">
        {/* Header Premium */}
        <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 px-6 py-6 border-b border-purple-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Film className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold text-slate-900">
                {editLesson ? 'Editar Clase' : 'Nueva Clase'}
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                {editLesson ? 'Actualiza los datos de la clase' : 'Añade una nueva clase con video'}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Upload Zone */}
            {!videoPreview ? (
              <div
                className={cn(
                  'relative group cursor-pointer transition-all duration-300',
                  isDragging && 'scale-[1.02]'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300',
                    isDragging
                      ? 'border-violet-400 bg-violet-50/50'
                      : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50/50'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-violet-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-900">
                        Arrastra tu video aquí
                      </p>
                      <p className="text-sm text-slate-500">
                        o haz clic para seleccionarlo
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <FileVideo className="h-3 w-3" />
                      <span>MP4, WebM, MOV • Máx. 500MB</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    className="w-full aspect-video object-contain"
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/30"
                        onClick={handleTogglePlay}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6 text-white fill-white" />
                        ) : (
                          <Play className="h-6 w-6 text-white fill-white ml-1" />
                        )}
                      </Button>
                    </div>
                    {videoDuration > 0 && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                        <Clock className="h-3 w-3 text-white" />
                        <span className="text-xs font-medium text-white">
                          {formatDuration(videoDuration)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Video cargado correctamente
                      </p>
                      <p className="text-xs text-emerald-600">
                        {videoFile?.name || 'Video actual'} • {(videoFile?.size ? (videoFile.size / 1024 / 1024).toFixed(2) : '0') + ' MB'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveVideo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subiendo video...</span>
                  <span className="font-medium text-slate-900">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Título de la Clase <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Introducción a las señales de tráfico"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-11 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe brevemente el contenido de esta clase..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500 resize-none"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
          </div>

          {/* Footer con Glassmorphism */}
          <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-slate-200">
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="rounded-full px-6 h-11"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || (!videoFile && !uploadedPath)}
                className="rounded-full px-6 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? 'Subiendo...' : editLesson ? 'Guardar Cambios' : 'Subir Clase'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
