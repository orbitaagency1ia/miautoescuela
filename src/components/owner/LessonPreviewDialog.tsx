'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, Clock, X, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface LessonPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: {
    id: string;
    title: string;
    description: string | null;
    video_path: string | null;
    video_duration_seconds: number | null;
  };
  primaryColor: string;
  secondaryColor: string;
}

export function LessonPreviewDialog({
  open,
  onOpenChange,
  lesson,
  primaryColor,
  secondaryColor,
}: LessonPreviewDialogProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (open && lesson.video_path) {
      loadVideo();
    }
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [open, lesson.video_path]);

  const loadVideo = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.storage
        .from('lesson-videos')
        .createSignedUrl(lesson.video_path!, 3600);

      if (error) throw error;
      setVideoUrl(data?.signedUrl || null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el video');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlay = () => {
    const video = document.getElementById('preview-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Vista Previa</h2>
              <p className="text-sm text-slate-500">{lesson.title}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Video Content */}
        <div className="bg-slate-900">
          {loading && (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="text-white mt-4 text-sm">Cargando video...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-red-500/20 mb-4">
                  <AlertCircle className="h-12 w-12 text-red-400" />
                </div>
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && videoUrl && (
            <div className="relative aspect-video">
              <video
                id="preview-video"
                src={videoUrl}
                className="w-full h-full"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          {!loading && !error && !videoUrl && (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div
                  className="inline-flex p-6 rounded-3xl mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
                  }}
                >
                  <AlertCircle className="h-16 w-16" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Video no disponible
                </h3>
                <p className="text-slate-400">
                  Esta clase aún no tiene video
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {lesson.description && (
          <div className="px-6 py-4 bg-white">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Descripción</h3>
            <p className="text-sm text-slate-600">{lesson.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
