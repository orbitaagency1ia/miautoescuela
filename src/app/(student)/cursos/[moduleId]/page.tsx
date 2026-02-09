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
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* === HEADER APPLE STYLE === */}
      <div className="bg-white border-b border-gray-100/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb minimalista */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/inicio">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700 font-medium text-sm h-8 px-3"
              >
                <Home className="h-4 w-4 mr-1.5" />
                Inicio
              </Button>
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/cursos">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700 font-medium text-sm h-8 px-3"
              >
                <List className="h-4 w-4 mr-1.5" />
                Cursos
              </Button>
            </Link>
          </div>

          {/* Header con título y badge de progreso */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2">
                {module.title}
              </h1>
              {module.description && (
                <p className="text-[15px] text-gray-500">
                  {module.description}
                </p>
              )}
            </div>

            {/* Badge de progreso estilo Apple */}
            <div className="flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-6 py-4 flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Progreso</p>
                  <p className="text-3xl font-bold text-blue-600">{progressPercentage}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* === CONTENIDO PRINCIPAL === */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* === STAT CARDS APPLE STYLE === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bgClass} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-[28px] font-bold text-gray-900 leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-[13px] text-gray-500 font-normal">
                  {stat.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* === LISTA DE CLASES APPLE STYLE === */}
        <div className="space-y-3">
          {!lessons || lessons.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="inline-flex p-4 rounded-2xl bg-blue-50 mb-4">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sin clases disponibles
              </h3>
              <p className="text-gray-500">
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
                />
              );
            })
          )}
        </div>

        {/* === MODULE COMPLETE REWARD === */}
        {progressPercentage === 100 && lessons.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
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
    </div>
  );
}
