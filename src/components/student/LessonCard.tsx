'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Play, CheckCircle, Lock, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LessonCardProps {
  lessonId: string;
  moduleId: string;
  title: string;
  description?: string;
  videoPath?: string | null;
  orderIndex: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export function LessonCard({
  lessonId,
  moduleId,
  title,
  description,
  videoPath,
  orderIndex,
  isCompleted,
  isLocked,
  isCurrent,
  primaryColor,
  secondaryColor,
}: LessonCardProps) {
  const [imageError, setImageError] = useState(false);

  // Generar thumbnail URL o placeholder
  const getThumbnailUrl = () => {
    if (!videoPath || imageError) {
      return null;
    }
    // Intentar obtener thumbnail de Supabase
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
      url.pathname = `/storage/v1/object/public/lesson-videos/${videoPath}`;
      // Añadir parámetro de transformación para obtener thumbnail
      url.searchParams.set('width', '400');
      url.searchParams.set('height', '225');
      return url.toString();
    } catch {
      return null;
    }
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <Link href={isLocked ? '#' : `/cursos/${moduleId}/${lessonId}`}>
      <Card
        className={cn(
          'group relative overflow-hidden rounded-[20px] transition-all duration-300 border-2',
          isLocked && 'opacity-60 cursor-not-allowed',
          !isLocked && 'hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer',
          isCurrent && 'shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-2',
          !isCurrent && !isLocked && 'shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
        )}
        style={isCurrent ? {
          borderColor: primaryColor,
          background: `linear-gradient(to right, ${primaryColor}08 0%, transparent 100%)`,
        } : {}}
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail / Number Badge */}
            <div className="relative flex-shrink-0 w-full sm:w-48 h-32 sm:h-auto overflow-hidden bg-slate-100">
              {thumbnailUrl ? (
                <>
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={() => setImageError(true)}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Play button overlay */}
                  {!isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                      >
                        <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)` }}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(${primaryColor}30 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                    }} />
                  </div>

                  {/* Number or icon */}
                  <div className="relative z-10">
                    {isLocked ? (
                      <div className="p-4 rounded-2xl bg-slate-200/80 backdrop-blur-sm">
                        <Lock className="h-8 w-8 text-slate-500" />
                      </div>
                    ) : isCompleted ? (
                      <div
                        className="p-4 rounded-2xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)' }}
                      >
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div
                        className="p-4 rounded-2xl shadow-lg animate-pulse"
                        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                      >
                        <Play className="h-8 w-8 text-white fill-white ml-0.5" />
                      </div>
                    ) : (
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                      >
                        {orderIndex}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~15 min
              </div>

              {/* Status badge */}
              {isCompleted && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                  <CheckCircle className="h-3 w-3" />
                  Completada
                </div>
              )}
              {isLocked && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-slate-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Lock className="h-3 w-3" />
                  Bloqueada
                </div>
              )}
              {isCurrent && !isCompleted && !isLocked && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-white text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse"
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                >
                  <Eye className="h-3 w-3" />
                  Actual
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
              <div className="space-y-2">
                {/* Lesson number for mobile */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: isCurrent
                        ? `${primaryColor}20`
                        : isCompleted
                          ? 'bg-emerald-100'
                          : 'bg-slate-100',
                      color: isCurrent
                        ? primaryColor
                        : isCompleted
                          ? '#16a34a'
                          : 'text-slate-600'
                    }}
                  >
                    Clase {orderIndex}
                  </span>
                  {isCurrent && (
                    <span className="text-xs font-semibold" style={{ color: primaryColor }}>
                      ← Reproduciendo ahora
                    </span>
                  )}
                </div>

                <h3 className={cn(
                  'font-bold text-base sm:text-lg leading-tight line-clamp-2',
                  isCurrent && `text-[${primaryColor}]`
                )} style={isCurrent ? { color: primaryColor } : {}}>
                  {title}
                </h3>

                {description && (
                  <p className="text-sm text-slate-500 line-clamp-2 hidden sm:block">
                    {description}
                  </p>
                )}

                {/* Progress indicator */}
                {isCompleted && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completada - +10 puntos</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action indicator */}
            <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2">
              <div
                className={cn(
                  'p-3 rounded-xl transition-all duration-300',
                  isLocked && 'bg-slate-200',
                  isCompleted && 'bg-emerald-100',
                  isCurrent && 'shadow-lg scale-110',
                  !isLocked && !isCompleted && !isCurrent && 'opacity-0 group-hover:opacity-100'
                )}
                style={!isLocked && !isCompleted && !isCurrent ? {
                  background: `${primaryColor}20`
                } : isCurrent ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                } : {}}
              >
                {isLocked ? (
                  <Lock className="h-5 w-5 text-slate-500" />
                ) : isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Play className={cn(
                    'h-5 w-5',
                    isCurrent && 'text-white fill-white ml-0.5'
                  )} style={!isCurrent ? { color: primaryColor } : {}} />
                )}
              </div>
            </div>
          </div>

          {/* Bottom accent line for current lesson */}
          {isCurrent && (
            <div className="absolute bottom-0 left-0 right-0 h-1 animate-pulse"
              style={{
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
