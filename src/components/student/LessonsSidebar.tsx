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
  activityPoints: number;
  primaryColor: string;
  secondaryColor: string;
}

export function LessonsSidebar({
  lessons,
  moduleId,
  currentLessonId,
  completedLessonIds,
  activityPoints,
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
    <Card
      className="sticky top-24 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border-2 overflow-hidden"
      style={{ borderColor: `${primaryColor}20` }}
    >
      {/* Header Premium con Puntos */}
      <div
        className="p-6 border-b-2"
        style={{
          background: `linear-gradient(to right, ${primaryColor}08 0%, ${secondaryColor}05 100%)`,
          borderColor: `${primaryColor}15`
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
              }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Contenido del tema</h3>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg"
            style={{
              background: `linear-gradient(to right, ${primaryColor} 0%, ${secondaryColor} 100%)`
            }}
          >
            <Zap className="h-4 w-4" />
            <span>{activityPoints} pts</span>
          </div>
        </div>

        {/* Progress Bar mejorado */}
        <div className="space-y-3">
          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 shadow-sm"
              style={{
                width: `${progressPercentage}%`,
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-semibold">
              {completedCount} de {lessons.length} clases
            </span>
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {estimatedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de lecciones con miniaturas */}
      <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
        <div className="divide-y divide-slate-100">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = completedLessonIds.has(lesson.id);
            const isLocked = index > currentIndex && !isCompleted;

            return (
              <Link
                key={lesson.id}
                href={isLocked ? '#' : `/cursos/${moduleId}/${lesson.id}`}
                className={cn(
                  'block transition-all duration-300 group',
                  isLocked && 'cursor-not-allowed opacity-60',
                  !isLocked && 'hover:bg-slate-50 hover:shadow-sm'
                )}
              >
                <div
                  className={cn(
                    'p-5 flex gap-4 items-center',
                    isCurrent && 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500'
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
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          'text-xs font-bold px-2.5 py-1 rounded-full',
                          isCurrent
                            ? 'bg-blue-500 text-white'
                            : isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : isLocked
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        Clase {index + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                          ▶ Reproduciendo
                        </span>
                      )}
                      {isCompleted && !isCurrent && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          ✓ Completada
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <p
                      className={cn(
                        'text-sm font-semibold leading-snug line-clamp-2 mb-1.5',
                        isCurrent
                          ? 'text-blue-700'
                          : isLocked
                            ? 'text-slate-500'
                            : 'text-slate-900 group-hover:text-blue-600 transition-colors'
                      )}
                    >
                      {lesson.title}
                    </p>

                    {/* Duración (si no es bloqueada) */}
                    {!isLocked && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        ~15 min
                        {isCompleted && (
                          <span className="text-emerald-600 font-bold ml-2">
                            +10 pts
                          </span>
                        )}
                      </p>
                    )}

                    {/* Texto especial para bloqueadas */}
                    {isLocked && (
                      <p className="text-xs text-slate-400">
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
        <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20">
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
