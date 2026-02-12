'use client';

import { Play, Lock, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LessonThumbnailProps {
  title: string;
  videoPath?: string | null;
  orderIndex: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  primaryColor: string;
  secondaryColor: string;
  duration?: string; // Duración estimada "3:45"
}

export function LessonThumbnail({
  title,
  videoPath,
  orderIndex,
  isCompleted,
  isLocked,
  isCurrent,
  primaryColor,
  secondaryColor,
  duration = '~15 min',
}: LessonThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  // Generar thumbnail URL o usar placeholder
  const getThumbnailStyle = () => {
    if (videoPath && !imageError) {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
        url.pathname = `/storage/v1/object/public/lesson-videos/${videoPath}`;
        return {
          backgroundImage: `url(${url.toString()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      } catch {
        setImageError(true);
      }
    }

    // Placeholder con gradiente
    return {
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    };
  };

  return (
    <div
      className={cn(
        'relative w-32 h-20 rounded-lg overflow-hidden bg-slate-900 transition-all duration-300',
        !isLocked && 'group-hover:scale-105',
        isCurrent && 'ring-2 ring-blue-500 ring-offset-2',
        isLocked && 'opacity-70'
      )}
      style={getThumbnailStyle()}
    >
      {/* Overlay para estados */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
          <Lock className="h-6 w-6 text-white/90" />
        </div>
      )}

      {!isLocked && !isCompleted && !isCurrent && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="p-2 rounded-full bg-white/90 shadow-lg">
            <Play className="h-4 w-4 text-slate-900 fill-slate-900 ml-0.5" />
          </div>
        </div>
      )}

      {isCurrent && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="p-2 rounded-full bg-white/95 shadow-xl animate-pulse">
            <Play className="h-5 w-5 text-blue-600 fill-blue-600 ml-0.5" />
          </div>
        </div>
      )}

      {/* Checkmark para completadas */}
      {isCompleted && (
        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-500 shadow-lg">
          <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Duración */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm">
        <span className="text-[10px] font-medium text-white leading-tight flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {duration}
        </span>
      </div>

      {/* Número de clase (solo si no hay imagen) */}
      {imageError && !videoPath && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white/90">{orderIndex}</span>
        </div>
      )}

      {/* Indicador "Reproduciendo" */}
      {isCurrent && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500">
          <div className="h-full w-full animate-pulse bg-blue-400" />
        </div>
      )}
    </div>
  );
}
