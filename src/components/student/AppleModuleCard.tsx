'use client';

import { BookOpen, CheckCircle, Clock, Lock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons: Lesson[];
}

interface AppleModuleCardProps {
  module: Module;
  completedCount: number;
  progressPercentage: number;
  isCompleted: boolean;
  isLocked?: boolean;
  index: number;
}

export function AppleModuleCard({
  module,
  completedCount,
  progressPercentage,
  isCompleted,
  isLocked = false,
  index,
}: AppleModuleCardProps) {
  const lessons = module.lessons || [];

  if (isLocked) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] opacity-60">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {module.description}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-xs text-gray-400">Completa los temas anteriores</p>
      </div>
    );
  }

  return (
    <Link href={`/cursos/${module.id}`} className="block">
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 h-full">
        {/* Icono y header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {module.description}
              </p>
            )}
          </div>

          {/* Icono */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4",
            isCompleted ? "bg-green-50" : "bg-blue-50"
          )}>
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-600" strokeWidth={2} />
            ) : (
              <BookOpen className="h-6 w-6 text-blue-600" />
            )}
          </div>
        </div>

        {/* Info de lecciones */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {lessons.length} {lessons.length === 1 ? 'clase' : 'clases'}
          </span>
          <span className="font-semibold" style={{
            color: isCompleted ? '#10B981' : '#3B82F6'
          }}>
            {progressPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercentage}%`,
              background: isCompleted
                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
            }}
          />
        </div>

        {/* Detalles */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-500">
            {completedCount} de {lessons.length} completadas
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <CheckCircle className="h-4 w-4" />
              Completado
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
