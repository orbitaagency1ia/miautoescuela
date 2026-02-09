'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { BookOpen, Play, TrendingUp, CheckCircle2, Clock, Lock } from 'lucide-react';
import Link from 'next/link';

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

interface CourseModuleCardProps {
  module: Module;
  completedCount: number;
  progressPercentage: number;
  isCompleted: boolean;
  isLocked?: boolean;
  primaryColor: string;
  secondaryColor: string;
  index: number;
  delay?: number;
}

export function CourseModuleCard({
  module,
  completedCount,
  progressPercentage,
  isCompleted,
  isLocked = false,
  primaryColor,
  secondaryColor,
  index,
  delay = 0,
}: CourseModuleCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Trigger animation on mount
  useState(() => {
    setTimeout(() => setIsVisible(true), delay);
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // 3D tilt effect
  const tiltX = ((mousePosition.y - 50) / 50) * 3;
  const tiltY = ((mousePosition.x - 50) / 50) * -3;

  const lessons = module.lessons || [];

  if (isLocked) {
    return (
      <div
        ref={cardRef}
        className={cn(
          'group relative h-full overflow-hidden rounded-3xl border-2',
          'transition-all duration-500 cursor-default opacity-70'
        )}
        style={{
          animationDelay: `${delay}ms`,
          opacity: isVisible ? 0.7 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Lock overlay */}
        <div className="absolute inset-0 bg-muted/20 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="p-4 rounded-full bg-muted/50 inline-block">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Bloqueado</p>
            <p className="text-xs text-muted-foreground">Completa los temas anteriores</p>
          </div>
        </div>

        {/* Card content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-muted-foreground truncate">
                {module.title}
              </h3>
              {module.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {module.description}
                </p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-muted flex-shrink-0">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/cursos/${module.id}`} className="block">
      <div
        ref={cardRef}
        className={cn(
          'group relative h-full overflow-hidden rounded-3xl border-2',
          'transition-all duration-500 cursor-pointer',
          'hover:shadow-premium-xl hover:scale-[1.02]',
          isCompleted ? 'hover:border-green-500/30' : 'hover:border-primary/30'
        )}
        style={{
          animationDelay: `${delay}ms`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? `translateY(0)`
            : 'translateY(20px)',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dynamic gradient overlay */}
        <div
          className="absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            background: isHovered
              ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--color-primary) / 0.1), transparent 60%)`
              : 'transparent',
          }}
        />

        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10">
          <div
            className="absolute inset-0 rounded-3xl animate-gradient-rotate"
            style={{
              background: isCompleted
                ? 'linear-gradient(90deg, hsl(142 76% 36% / 0.4), transparent, hsl(142 76% 36% / 0.4), transparent, hsl(142 76% 36% / 0.4))'
                : `linear-gradient(90deg, ${primaryColor}40, transparent, ${secondaryColor}40, transparent, ${primaryColor}40)`,
              filter: 'blur(10px)',
              backgroundSize: '300% 300%',
            }}
          />
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer-premium" />
        </div>

        {/* Particles on hover */}
        {isHovered && !isCompleted && (
          <>
            <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary animate-ping" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full bg-secondary animate-ping" style={{ animationDelay: '0.3s' }} />
          </>
        )}

        {/* Celebration particles for completed */}
        {isCompleted && isHovered && (
          <>
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-green-500 animate-ping" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/2 right-8 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full bg-green-600 animate-ping" style={{ animationDelay: '0.4s' }} />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'text-xl font-bold truncate transition-colors duration-300',
                  isCompleted ? 'text-green-600' : 'group-hover:text-primary'
                )}
              >
                {module.title}
              </h3>
              {module.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {module.description}
                </p>
              )}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'relative p-3 rounded-2xl transition-all duration-300 shadow-md flex-shrink-0',
                'group-hover:scale-110 group-hover:rotate-6'
              )}
              style={{
                background: isCompleted
                  ? 'linear-gradient(135deg, #22c55e, #10b981)'
                  : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-2xl blur-lg transition-all duration-300"
                style={{
                  background: isCompleted
                    ? 'rgba(34, 197, 94, 0.4)'
                    : `${primaryColor}66`,
                  opacity: isHovered ? 1 : 0.5,
                  transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                }}
              />

              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-white relative z-10" />
              ) : (
                <BookOpen className="h-6 w-6 text-white relative z-10" />
              )}

              {/* Floating ring on hover */}
              {isHovered && (
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Play className="h-4 w-4" />
                <span>{lessons.length} {lessons.length === 1 ? 'clase' : 'clases'}</span>
              </div>
              <div
                className={cn(
                  'flex items-center gap-2 font-bold text-lg',
                  isCompleted ? 'text-green-600' : ''
                )}
                style={!isCompleted ? { color: primaryColor } : {}}
              >
                <TrendingUp className="h-4 w-4" />
                <span>{progressPercentage}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out relative',
                  'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-shimmer'
                )}
                style={{
                  width: `${progressPercentage}%`,
                  background: isCompleted
                    ? 'linear-gradient(90deg, #22c55e, #10b981)'
                    : `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />
            </div>

            {/* Details */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">
                {completedCount} de {lessons.length} completadas
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  ¡Completado!
                </span>
              )}
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">Duración estimada</span>
              <span className="flex items-center gap-1 font-medium text-sm">
                <Clock className="h-4 w-4" />
                ~{lessons.length * 15} min
              </span>
            </div>
          </div>
        </div>

        {/* Corner accent on hover */}
        <div
          className={cn(
            'absolute bottom-0 right-0 w-16 h-16 overflow-hidden rounded-br-3xl transition-opacity duration-300',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          <div
            className="absolute bottom-0 right-0 w-full h-0.5 transition-all duration-500"
            style={{
              background: isCompleted
                ? 'linear-gradient(90deg, transparent, #22c55e)'
                : `linear-gradient(90deg, transparent, ${secondaryColor})`,
              transform: isHovered ? 'translateX(0)' : 'translateX(100%)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-0.5 h-full transition-all duration-500"
            style={{
              background: isCompleted
                ? 'linear-gradient(180deg, transparent, #22c55e)'
                : `linear-gradient(180deg, transparent, ${secondaryColor})`,
              transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            }}
          />
        </div>

        <style>{`
          @keyframes gradient-rotate {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes shimmer-premium {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          .animate-gradient-rotate {
            animation: gradient-rotate 3s ease infinite;
          }
          .animate-shimmer-premium {
            animation: shimmer-premium 1.5s ease-out;
          }
        `}</style>
      </div>
    </Link>
  );
}
