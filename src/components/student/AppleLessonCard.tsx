'use client';

import { Play, CheckCircle, Lock, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AppleLessonCardProps {
  lessonId: string;
  moduleId: string;
  title: string;
  description?: string;
  videoPath?: string | null;
  orderIndex: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  cardIndex?: number;
}

export function AppleLessonCard({
  lessonId,
  moduleId,
  title,
  description,
  videoPath,
  orderIndex,
  isCompleted,
  isLocked,
  isCurrent,
  cardIndex = 0,
}: AppleLessonCardProps) {
  const animationDelay = Math.min(cardIndex * 75, 500);
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

    // Placeholder con gradiente suave
    return {
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
    };
  };

  return (
    <Link
      href={isLocked ? '#' : `/cursos/${moduleId}/${lessonId}`}
      className={cn(
        'block',
        isLocked && 'pointer-events-none'
      )}
    >
      <div
        className={cn(
          'relative bg-white rounded-[20px] p-5 transition-all duration-300 animate-fade-in select-none group border-2 border-transparent',
          // Premium shadow pattern
          'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
          // Premium hover effect
          'hover:shadow-[0_12px_32px_rgba(59,130,246,0.12)] hover:-translate-y-1 hover:border-blue-200',
          isLocked && 'opacity-55 cursor-not-allowed hover:shadow-none hover:translate-y-0',
          isCurrent && 'shadow-[0_4px_12px_rgba(59,130,246,0.15)] border-l-4 border-l-blue-500'
        )}
        style={{
          animationDelay: `${animationDelay}ms`,
        }}
      >
        <div className="flex gap-4 items-center">
          {/* Thumbnail con estilo premium */}
          <div
            className="flex-shrink-0 w-48 h-28 rounded-xl overflow-hidden bg-slate-100 relative transition-transform duration-200"
            style={getThumbnailStyle()}
          >
            {/* Overlay para bloqueadas */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                <Lock className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
              </div>
            )}

            {/* Botón play para clases disponibles */}
            {!isLocked && !isCompleted && !isCurrent && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                  <Play className="h-5 w-5 text-blue-600 fill-blue-600 ml-0.5" />
                </div>
              </div>
            )}

            {/* Clase actual - botón play prominente */}
            {isCurrent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 shadow-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Checkmark para completadas */}
            {isCompleted && (
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-emerald-500 shadow-md">
                <CheckCircle className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
            )}

            {/* Badge de estado */}
            {isCurrent && !isCompleted && (
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
                Actual
              </div>
            )}

            {isLocked && (
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold">
                Bloqueada
              </div>
            )}

            {/* Duración */}
            {!isLocked && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm">
                <span className="text-[10px] font-medium text-white">~15 min</span>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
            {/* Número de clase */}
            <p className="text-xs text-slate-500 font-medium mb-1.5">
              Clase {orderIndex}
            </p>

            {/* Título */}
            <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>

            {/* Descripción (opcional) */}
            {description && (
              <p className="text-sm text-slate-500 line-clamp-1">
                {description}
              </p>
            )}

            {/* Estado y puntos */}
            <div className="mt-2">
              {isCompleted ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completada · +10 puntos</span>
                </div>
              ) : isLocked ? (
                <p className="text-sm text-slate-400">
                  Completa la clase anterior
                </p>
              ) : isCurrent ? (
                <p className="text-sm text-blue-600 font-medium">
                  ▶ Reproduciendo ahora
                </p>
              ) : null}
            </div>
          </div>

          {/* Chevron indicator */}
          {!isLocked && (
            <div className="flex items-center justify-center ml-2 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
