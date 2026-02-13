'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markLessonCompleteAction } from '@/actions/content';
import { cn } from '@/lib/utils';

interface NextLessonButtonProps {
  moduleId: string;
  nextLessonId: string;
  nextLessonTitle: string;
  currentLessonId: string;
  isCompleted: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export function NextLessonButton({
  moduleId,
  nextLessonId,
  nextLessonTitle,
  currentLessonId,
  isCompleted,
  primaryColor = '#3B82F6',
  secondaryColor = '#1E40AF',
}: NextLessonButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigating, setNavigating] = useState(false);

  function handleClick() {
    setNavigating(true);
    startTransition(async () => {
      try {
        // If not completed, mark as complete first
        if (!isCompleted) {
          await markLessonCompleteAction(currentLessonId);
        }
        // Then navigate
        router.push(`/cursos/${moduleId}/${nextLessonId}`);
      } catch (error) {
        setNavigating(false);
      }
    });
  }

  const buttonColor = isCompleted
    ? 'from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
    : 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700';

  return (
    <button
      onClick={handleClick}
      disabled={isPending || navigating}
      className="w-full text-left"
    >
      <Card className={cn(
        'group transition-all duration-300 cursor-pointer border-2 hover:scale-[1.02] rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1',
        isCompleted
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50 hover:border-emerald-300'
          : 'border-slate-100 bg-white hover:border-blue-200',
        (isPending || navigating) && 'opacity-70'
      )}>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 text-right">
              <p className={cn(
                'text-xs mb-1 font-bold flex items-center justify-end gap-2',
                isCompleted ? 'text-emerald-600' : 'text-slate-500'
              )}>
                {isPending || navigating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Procesando...
                  </>
                ) : isCompleted ? (
                  <>Completada · Siguiente →</>
                ) : (
                  <>Completar y Siguiente →</>
                )}
              </p>
              <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {nextLessonTitle}
              </p>
            </div>
            <div
              className={cn(
                'p-3 rounded-2xl shadow-md transition-all duration-300 group-hover:scale-110',
                isCompleted
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-indigo-100'
              )}
              style={!isCompleted ? {
                background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)`,
              } : {}}
            >
              {isPending || navigating ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <ChevronRight className={cn(
                  'h-6 w-6 transition-colors',
                  isCompleted ? 'text-white' : 'text-slate-700 group-hover:text-blue-600'
                )} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
