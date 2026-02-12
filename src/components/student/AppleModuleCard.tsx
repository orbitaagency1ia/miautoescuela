'use client';

import { BookOpen, CheckCircle, Clock, Lock, ChevronRight } from 'lucide-react';
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
  primaryColor?: string;
  secondaryColor?: string;
}

export function AppleModuleCard({
  module,
  completedCount,
  progressPercentage,
  isCompleted,
  isLocked = false,
  index,
  primaryColor = '#3B82F6',
  secondaryColor = '#1E40AF',
}: AppleModuleCardProps) {
  const lessons = module.lessons || [];

  if (isLocked) {
    return (
      <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] opacity-60 select-none cursor-not-allowed">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-400 mb-2">
              {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-slate-400 line-clamp-2">
                {module.description}
              </p>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shadow-sm">
            <Lock className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-xs text-slate-400">Completa los temas anteriores</p>
      </div>
    );
  }

  const animationDelay = Math.min(index * 100, 500);

  return (
    <Link
      href={`/cursos/${module.id}`}
      className="block"
    >
      <div
        className="group relative bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 border-2 border-transparent h-full animate-fade-in select-none cursor-pointer"
        style={{
          animationDelay: `${animationDelay}ms`,
          '--hover-shadow': `${primaryColor}20`
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 12px 32px ${primaryColor}20`;
          e.currentTarget.style.borderColor = `${primaryColor}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        {/* Background gradient on hover */}
        <div
          className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom right, ${primaryColor}08 0%, ${secondaryColor}08 100%)`,
            opacity: 0
          }}
        />
        <div
          className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none group-hover:opacity-100"
          style={{
            background: `linear-gradient(to bottom right, ${primaryColor}15 0%, ${secondaryColor}15 100%)`
          }}
        />

        {/* Icono y header */}
        <div className="flex items-start justify-between mb-4 relative">
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 transition-colors duration-200"
              style={{
                '--hover-color': primaryColor
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#0f172a'}
            >
              {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-slate-500 line-clamp-2">
                {module.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Icono */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
              style={{
                background: isCompleted
                  ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                  : `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
              }}
            >
              {isCompleted ? (
                <CheckCircle className="h-7 w-7 text-emerald-600" strokeWidth={2.5} />
              ) : (
                <BookOpen className="h-7 w-7" style={{ color: primaryColor }} />
              )}
            </div>

            {/* Chevron indicator */}
            <ChevronRight
              className="h-6 w-6 text-slate-300 group-hover:translate-x-0.5 transition-all duration-200"
              style={{
                transitionProperty: 'color, transform'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
            />
          </div>
        </div>

        {/* Info de lecciones */}
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4 relative">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-4 w-4" />
            {lessons.length} {lessons.length === 1 ? 'clase' : 'clases'}
          </span>
          <span
            className="font-bold transition-colors duration-200 px-2.5 py-1 rounded-lg"
            style={{
              background: isCompleted
                ? '#d1fae5'
                : `${primaryColor}20`,
              color: isCompleted
                ? '#059669'
                : primaryColor
            }}
          >
            {progressPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3 shadow-inner">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 relative overflow-hidden",
              isCompleted && "animate-pulse"
            )}
            style={{
              width: `${progressPercentage}%`,
              background: isCompleted
                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            {/* Shimmer effect on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer-progress" />
          </div>
        </div>

        {/* Detalles */}
        <div className="flex items-center justify-between pt-2 relative">
          <span className="text-sm text-slate-500 font-medium">
            {completedCount} de {lessons.length} completadas
          </span>
          {isCompleted ? (
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              Completado
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-sm font-bold"
              style={{ color: primaryColor }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              En progreso
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .group:hover .animate-shimmer-progress {
          animation: shimmer-progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </Link>
  );
}
