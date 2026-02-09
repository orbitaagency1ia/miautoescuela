'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LessonThumbnail } from './LessonThumbnail';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  video_path?: string | null;
  order_index: number;
}

interface LessonsSidebarProps {
  lessons: Lesson[];
  moduleId: string;
  currentLessonId: string;
  completedLessonIds: Set<string>;
  primaryColor: string;
  secondaryColor: string;
}

export function LessonsSidebar({
  lessons,
  moduleId,
  currentLessonId,
  completedLessonIds,
  primaryColor,
  secondaryColor,
}: LessonsSidebarProps) {
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  const completedCount = completedLessonIds.size;
  const progressPercentage = lessons.length > 0
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  // Calcular tiempo estimado restante
  const remainingLessons = lessons.length - completedCount;
  const estimatedTime = `${remainingLessons * 15} min`;

  return (
    <Card className="sticky top-24 shadow-premium border-2 border-gray-100 overflow-hidden">
      {/* Header Premium */}
      <div className="p-5 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-700" />
            <h3 className="font-bold text-gray-900 text-base">Contenido del tema</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-md">
            <Zap className="h-3.5 w-3.5" />
            <span>{progressPercentage}%</span>
          </div>
        </div>

        {/* Progress Bar mejorado */}
        <div className="space-y-2">
          <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">
              {completedCount} de {lessons.length} clases
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {estimatedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de lecciones con miniaturas */}
      <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = completedLessonIds.has(lesson.id);
            const isLocked = index > currentIndex && !isCompleted;

            return (
              <Link
                key={lesson.id}
                href={isLocked ? '#' : `/cursos/${moduleId}/${lesson.id}`}
                className={cn(
                  'block transition-all duration-200 group',
                  isLocked && 'cursor-not-allowed opacity-60',
                  !isLocked && 'hover:bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'p-4 flex gap-3 items-center',
                    isCurrent && 'bg-blue-50/50 border-l-4 border-l-blue-500'
                  )}
                >
                  {/* Miniatura */}
                  <div className="flex-shrink-0">
                    <LessonThumbnail
                      title={lesson.title}
                      videoPath={lesson.video_path}
                      orderIndex={index + 1}
                      isCompleted={isCompleted}
                      isLocked={isLocked}
                      isCurrent={isCurrent}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    {/* Número de clase y estado */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          isCurrent
                            ? 'bg-blue-500 text-white'
                            : isCompleted
                              ? 'bg-green-100 text-green-700'
                              : isLocked
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        Clase {index + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                          ▶ Reproduciendo
                        </span>
                      )}
                      {isCompleted && !isCurrent && (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                          ✓ Completada
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <p
                      className={cn(
                        'text-sm font-medium leading-snug line-clamp-2 mb-1',
                        isCurrent
                          ? 'text-blue-700'
                          : isLocked
                            ? 'text-gray-500'
                            : 'text-gray-900 group-hover:text-blue-600'
                      )}
                    >
                      {lesson.title}
                    </p>

                    {/* Duración (si no es bloqueada) */}
                    {!isLocked && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~15 min
                        {isCompleted && (
                          <span className="text-green-600 font-medium ml-2">
                            +10 pts
                          </span>
                        )}
                      </p>
                    )}

                    {/* Texto especial para bloqueadas */}
                    {isLocked && (
                      <p className="text-xs text-gray-400">
                        Completa la clase anterior
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer con recompensa */}
      {progressPercentage === 100 && (
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">¡Tema completado!</p>
              <p className="text-xs opacity-90">
                Has ganado {lessons.length * 10} puntos
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
