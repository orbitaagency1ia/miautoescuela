import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, Lock, Clock, BookOpen, ChevronLeft, Trophy, Flame, Target, Home, List } from 'lucide-react';
import Link from 'next/link';
import { AppleLessonCard } from '@/components/student/AppleLessonCard';

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  const { moduleId } = await params;

  // Get school branding
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  const { data: school } = membership?.school_id ? await (supabase
    .from('schools')
    .select('primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any) : null;

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Get module with lessons
  const { data: module } = await (supabase
    .from('modules')
    .select(`
      id,
      title,
      description,
      order_index,
      lessons (
        id,
        title,
        description,
        order_index,
        video_path
      )
    `)
    .eq('id', moduleId)
    .eq('is_published', true)
    .single() as any);

  if (!module) {
    redirect('/cursos');
  }

  // Get progress
  const { data: progress } = await (supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id) as any);

  const completedLessonIds = new Set(progress?.map((p: any) => p.lesson_id) || []);

  // Sort lessons by order
  const lessons = module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || [];

  // Calculate progress
  const completedCount = lessons.filter((l: any) => completedLessonIds.has(l.id)).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Find first incomplete lesson
  const firstIncompleteIndex = lessons.findIndex((l: any) => !completedLessonIds.has(l.id));

  // Apple-style stat cards data
  const statCards = [
    {
      title: 'Clases',
      value: lessons.length,
      icon: BookOpen,
      bgClass: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Completadas',
      value: completedCount,
      icon: CheckCircle,
      bgClass: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Puntos',
      value: completedCount * 10,
      icon: Trophy,
      bgClass: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Pendientes',
      value: lessons.length - completedCount,
      icon: Clock,
      bgClass: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-5">
      {/* === HEADER PREMIUM === */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 border border-blue-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative">
          {/* Breadcrumb minimalista */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/inicio">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl hover:bg-white/80 text-slate-600 hover:text-slate-900 font-medium text-sm h-8 px-3 transition-all"
              >
                <Home className="h-4 w-4 mr-1.5" />
                Inicio
              </Button>
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/cursos">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl hover:bg-white/80 text-slate-600 hover:text-slate-900 font-medium text-sm h-8 px-3 transition-all"
              >
                <List className="h-4 w-4 mr-1.5" />
                Cursos
              </Button>
            </Link>
          </div>

          {/* Header con título y badge de progreso */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3">
                {module.title}
              </h1>
              {module.description && (
                <p className="text-base text-slate-600 max-w-2xl">
                  {module.description}
                </p>
              )}
            </div>

            {/* Badge de progreso estilo premium */}
            <div className="flex-shrink-0">
              <div className="bg-white rounded-[20px] shadow-lg px-6 py-4 flex items-center gap-4 border border-blue-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Progreso</p>
                  <p className="text-3xl font-bold text-blue-600">{progressPercentage}%</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6 h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* === CONTENIDO PRINCIPAL === */}
      {/* === STAT CARDS PREMIUM === */}
      <div className="grid gap-5 sm:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-slate-100"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bgClass} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900 leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* === HEADER DE CLASES === */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Clases del Tema</h2>
        <p className="text-sm text-slate-500">{lessons.length} {lessons.length === 1 ? 'clase' : 'clases'}</p>
      </div>
      {/* === LISTA DE CLASES PREMIUM === */}
      <div className="space-y-3">
        {!lessons || lessons.length === 0 ? (
          <div className="bg-white rounded-[20px] p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
            <div className="inline-flex p-4 rounded-2xl bg-blue-50 mb-4">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Sin clases disponibles
            </h3>
            <p className="text-slate-500">
              Este tema aún no tiene contenido
            </p>
          </div>
        ) : (
          lessons.map((lesson: any, index: number) => {
            const isCompleted = completedLessonIds.has(lesson.id);
            const isLocked = index > firstIncompleteIndex && !isCompleted;
            const isCurrent = index === firstIncompleteIndex && !isCompleted;

            return (
              <AppleLessonCard
                key={lesson.id}
                lessonId={lesson.id}
                moduleId={moduleId}
                title={lesson.title}
                description={lesson.description}
                videoPath={lesson.video_path}
                orderIndex={index + 1}
                isCompleted={isCompleted}
                isLocked={isLocked}
                isCurrent={isCurrent}
                cardIndex={index}
              />
            );
          })
        )}
      </div>

      {/* === MODULE COMPLETE REWARD PREMIUM === */}
      {progressPercentage === 100 && lessons.length > 0 && (
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-grid-white/[0.1] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">¡Tema Completado! 🎉</h3>
                <p className="opacity-90">
                  Has ganado {lessons.length * 10} puntos. ¡Excelente trabajo!
                </p>
              </div>
            </div>
            <Link href="/cursos">
              <Button className="bg-white text-amber-600 hover:bg-white/90 border-0 shadow-lg px-8 rounded-xl h-12 font-semibold">
                Ver más temas
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
