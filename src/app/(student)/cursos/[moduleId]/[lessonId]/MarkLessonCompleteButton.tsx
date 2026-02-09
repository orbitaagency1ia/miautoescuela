'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Loader2, Star, Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';
import { markLessonCompleteAction } from '@/actions/content';
import { cn } from '@/lib/utils';

interface MarkLessonCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export function MarkLessonCompleteButton({
  lessonId,
  isCompleted,
  primaryColor = '#3B82F6',
  secondaryColor = '#1E40AF'
}: MarkLessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);

  function handleClick() {
    startTransition(async () => {
      try {
        await markLessonCompleteAction(lessonId);
        if (!completed) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        }
        setCompleted(!completed);
      } catch (error) {
        console.error('Error marking lesson complete:', error);
      }
    });
  }

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={isPending}
        size="lg"
        className={cn(
          'min-w-[200px] rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden',
          completed
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0'
            : 'text-white border-0'
        )}
        style={!completed ? {
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        } : {}}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Procesando...
          </>
        ) : completed ? (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Completada
            <span className="ml-2 text-white/80">+10 pts</span>
          </>
        ) : (
          <>
            <Circle className="h-5 w-5 mr-2" />
            Marcar como vista
          </>
        )}
      </Button>

      {/* Celebration particles */}
      {showCelebration && (
        <>
          <div className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute -bottom-2 left-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: '0.4s' }} />
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .group:hover .animate-shimmer {
          animation: shimmer 1.5s ease-out;
        }
      `}</style>
    </div>
  );
}
