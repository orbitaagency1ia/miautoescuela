import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Play, TrendingUp, Sparkles, Trophy, Flame, Target, ChevronRight, Clock, Zap } from 'lucide-react';
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

  return (
    <div className="space-y-5">
      {/* Premium Header */}
      <div
        className="relative overflow-hidden rounded-[20px] p-8 border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-500 animate-fade-in text-white"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          borderColor: `${primaryColor}40`
        }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"
            style={{ background: `linear-gradient(135deg, ${primaryColor}60 0%, ${secondaryColor}60 100%)` }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"
            style={{ animationDelay: '1s', background: `linear-gradient(135deg, ${secondaryColor}60 0%, ${primaryColor}60 100%)` }}
          />
        </div>
        <div className="absolute inset-0 bg-grid-slate-50/[0.02] [mask-image:linear-gradient(0deg,rgba(0,0,0,0.6),rgba(0,0,0,0.3))]" />

        <div className="relative">
          <div className="flex items-center gap-5 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: `0 10px 40px ${primaryColor}40`
              }}
            >
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border text-sm font-semibold"
              style={{ borderColor: `${primaryColor}40`, color: `${primaryColor}a0` }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Centro de Formación</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Tus Cursos
          </h1>
          <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
            Accede a todo el contenido de formación disponible. Completa los temas, gana puntos y avanza en tu aprendizaje.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-5 grid-cols-3">
        {/* Total Modules */}
        <div
          className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border animate-fade-in select-none cursor-pointer"
          style={{
            animationDelay: '100ms',
            borderColor: `${primaryColor}20`
          }}
        >
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
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1 font-medium">Temas</p>
              <p className="text-5xl font-bold text-slate-900 leading-none">{totalModules}</p>
              <p className="text-sm text-slate-400 mt-2">Módulos disponibles</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)` }}
            >
              <BookOpen className="h-7 w-7" style={{ color: primaryColor }} />
            </div>
          </div>
        </div>

        {/* Total Lessons */}
        <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(34,197,94,0.08)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:border-green-100 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-green-50/0 to-emerald-50/0 group-hover:from-green-50/50 group-hover:to-emerald-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1 font-medium">Clases</p>
              <p className="text-5xl font-bold text-slate-900 leading-none">{totalLessons}</p>
              <p className="text-sm text-slate-400 mt-2">Videos totales</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Play className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(139,92,246,0.08)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 hover:border-purple-100 animate-fade-in select-none cursor-pointer" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-purple-50/0 to-violet-50/0 group-hover:from-purple-50/50 group-hover:to-violet-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1 font-medium">Progreso</p>
              <p className="text-5xl font-bold text-slate-900 leading-none">{overallProgress}<span className="text-2xl text-slate-400">%</span></p>
              <p className="text-sm text-slate-400 mt-2">Completitud general</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <TrendingUp className="h-7 w-7 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* All Topics Section */}
      <div
        className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] border overflow-hidden transition-all duration-500 animate-fade-in"
        style={{
          animationDelay: '300ms',
          borderColor: `${primaryColor}20`
        }}
      >
        {/* Header */}
        <div
          className="p-8 border-b"
          style={{
            background: `linear-gradient(to right, ${primaryColor}08 0%, ${secondaryColor}05 100%)`,
            borderColor: `${primaryColor}15`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Todos los Temas</h2>
                <p className="text-sm text-slate-500 mt-1">{totalModules} módulos disponibles</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6" style={{ color: primaryColor }} />
          </div>
        </div>

        <div className="p-8">
          {!modules || modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-3xl mb-8 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-lg">
                <BookOpen className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Sin contenido</h3>
              <p className="text-slate-500">
                Tu autoescuela aún no ha añadido cursos
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module: any, index: number) => {
                const animationDelay = Math.min(index * 75, 500);
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
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Motivational Footer */}
      {overallProgress > 0 && (
        <div className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8 border border-amber-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.12)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '400ms' }}>
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/50 group-hover:to-orange-50/50 transition-all duration-300 pointer-events-none" />

          {/* Animated sparkles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-12 right-16 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-8 right-12 w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1.5">
                  ¡Vas muy bien!
                </h3>
                <p className="text-slate-600">
                  Has completado el <span className="font-semibold text-amber-600">{overallProgress}%</span> del total. ¡Sigue así!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 transition-all cursor-pointer group/badge">
              <Flame className="h-7 w-7 group-hover/badge:scale-110 transition-transform" />
              <span className="text-xl font-bold">{completedLessons * 10} puntos</span>
              <ChevronRight className="h-6 w-6 opacity-0 group-hover/badge:opacity-100 group-hover/badge:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
