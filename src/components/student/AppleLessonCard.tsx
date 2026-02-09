'use client';

import { Play, CheckCircle, Lock, Clock } from 'lucide-react';
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
}: AppleLessonCardProps) {
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
      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    };
  };

  return (
    <Link href={isLocked ? '#' : `/cursos/${moduleId}/${lessonId}`}>
      <div
        className={cn(
          'relative bg-white rounded-2xl p-5 transition-all duration-200',
          // Sombras suaves estilo Apple
          'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)]',
          'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
          isLocked && 'opacity-55 cursor-not-allowed hover:shadow-none hover:translate-y-0',
          isCurrent && 'shadow-[0_4px_12px_rgba(59,130,246,0.15)]'
        )}
        style={isCurrent ? {
          borderLeft: '3px solid #3B82F6',
        } : {}}
      >
        <div className="flex gap-4">
          {/* Thumbnail con estilo Apple */}
          <div
            className="flex-shrink-0 w-48 h-28 rounded-xl overflow-hidden bg-gray-100 relative transition-transform duration-200"
            style={getThumbnailStyle()}
          >
            {/* Overlay para bloqueadas */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                <Lock className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
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
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-green-500 shadow-md">
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
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-semibold">
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
            <p className="text-xs text-gray-500 font-medium mb-1.5">
              Clase {orderIndex}
            </p>

            {/* Título */}
            <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">
              {title}
            </h3>

            {/* Descripción (opcional) */}
            {description && (
              <p className="text-sm text-gray-500 line-clamp-1">
                {description}
              </p>
            )}

            {/* Estado y puntos */}
            <div className="mt-2">
              {isCompleted ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completada · +10 puntos</span>
                </div>
              ) : isLocked ? (
                <p className="text-sm text-gray-400">
                  Completa la clase anterior
                </p>
              ) : isCurrent ? (
                <p className="text-sm text-blue-600 font-medium">
                  ▶ Reproduciendo ahora
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
