import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Play, TrendingUp, Sparkles, Trophy, Flame, Target } from 'lucide-react';
import { AppleModuleCard } from '@/components/student/AppleModuleCard';

export default async function CoursesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get school_id and school branding
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  const schoolId = membership?.school_id;

  // Get school branding
  const { data: school } = schoolId ? await (supabase
    .from('schools')
    .select('name, primary_color, secondary_color')
    .eq('id', schoolId)
    .maybeSingle() as any) : null;

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Get modules with lessons
  const { data: modules } = await (supabase
    .from('modules')
    .select(`
      id,
      title,
      description,
      order_index,
      lessons (
        id,
        title,
        order_index
      )
    `)
    .eq('school_id', schoolId)
    .eq('is_published', true)
    .order('order_index', { ascending: true }) as any);

  // Get progress
  const { data: progress } = await (supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id) as any);

  const completedLessonIds = new Set(progress?.map((p: any) => p.lesson_id) || []);

  // Calculate overall stats
  const totalModules = modules?.length || 0;
  const totalLessons = modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0;
  const completedLessons = completedLessonIds.size;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Apple-style stat cards data
  const statCards = [
    {
      title: 'Temas',
      value: totalModules,
      description: 'Módulos disponibles',
      icon: BookOpen,
      bgClass: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Clases',
      value: totalLessons,
      description: 'Videos totales',
      icon: Play,
      bgClass: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Progreso',
      value: overallProgress,
      suffix: '%',
      description: 'Completitud general',
      icon: TrendingUp,
      bgClass: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* === HEADER APPLE STYLE === */}
      <div className="bg-white border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>Centro de Formación</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Tus Cursos
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Accede a todo el contenido de formación disponible. Completa los temas, gana puntos y avanza en tu aprendizaje.
          </p>
        </div>
      </div>

      {/* === CONTENIDO PRINCIPAL === */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* === STAT CARDS APPLE STYLE === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgClass} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 leading-none mb-2">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="text-sm text-gray-500 font-normal">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* === HEADER DE TEMAS === */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Todos los Temas</h2>
        </div>

        {/* === LISTA DE TEMAS APPLE STYLE === */}
        {!modules || modules.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="inline-flex p-6 rounded-3xl bg-blue-50 mb-6">
              <BookOpen className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Sin contenido disponible
            </h3>
            <p className="text-gray-500 text-lg">
              Tu autoescuela aún no ha añadido cursos
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module: any, index: number) => {
              const lessons = module.lessons || [];
              const completedCount = lessons.filter(
                (l: any) => completedLessonIds.has(l.id)
              ).length;
              const progressPercentage = lessons.length > 0
                ? Math.round((completedCount / lessons.length) * 100)
                : 0;
              const isCompleted = progressPercentage === 100;

              return (
                <AppleModuleCard
                  key={module.id}
                  module={module}
                  completedCount={completedCount}
                  progressPercentage={progressPercentage}
                  isCompleted={isCompleted}
                  index={index}
                />
              );
            })}
          </div>
        )}

        {/* === MOTIVATIONAL FOOTER === */}
        {overallProgress > 0 && (
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    ¡Vas muy bien!
                  </h3>
                  <p className="text-gray-500">
                    Has completado el {overallProgress}% del total. ¡Sigue así!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                <Flame className="h-6 w-6" />
                <span className="text-lg font-bold">{completedLessons * 10} puntos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
