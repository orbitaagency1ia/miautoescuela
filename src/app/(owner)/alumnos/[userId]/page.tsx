import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Calendar, BookOpen, CheckCircle, Clock, Trophy, Award, Target, Flame, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get current user's school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle() as any);

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    redirect('/inicio');
  }

  const schoolId = membership.school_id;
  const { userId } = await params;

  // Get school details for branding
  const { data: school } = await (supabase
    .from('schools')
    .select('id, name, primary_color, secondary_color')
    .eq('id', schoolId)
    .maybeSingle() as any);

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Get student membership
  const { data: studentMembership } = await (supabase
    .from('school_members')
    .select('user_id, status, joined_at, profiles(*)')
    .eq('school_id', schoolId)
    .eq('user_id', userId)
    .eq('role', 'student')
    .maybeSingle() as any);

  if (!studentMembership) {
    redirect('/alumnos');
  }

  const student = studentMembership.profiles;
  const studentName = student?.full_name || 'Sin nombre';
  const studentPoints = student?.activity_points || 0;

  // Get ALL modules and lessons for this school
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
        description,
        order_index,
        is_published
      )
    `)
    .eq('school_id', schoolId)
    .eq('is_published', true)
    .order('order_index', { ascending: true }) as any);

  // Get student's completed lessons
  const { data: completedLessons } = await (supabase
    .from('lesson_progress')
    .select('lesson_id, completed_at')
    .eq('user_id', userId) as any);

  const completedLessonIds = new Set(completedLessons?.map((p: any) => p.lesson_id) || []);

  // Calculate stats correctly
  const allLessons = modules?.flatMap((m: any) => m.lessons?.filter((l: any) => l.is_published) || []) || [];
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Group completed lessons by module
  const modulesWithProgress = modules?.map((module: any) => {
    const moduleLessons = module.lessons?.filter((l: any) => l.is_published) || [];
    const moduleCompletedCount = moduleLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
    const moduleProgress = moduleLessons.length > 0 ? Math.round((moduleCompletedCount / moduleLessons.length) * 100) : 0;

    return {
      ...module,
      totalLessons: moduleLessons.length,
      completedLessons: moduleCompletedCount,
      progressPercentage: moduleProgress,
      lessons: moduleLessons.map((lesson: any) => ({
        ...lesson,
        isCompleted: completedLessonIds.has(lesson.id),
      })),
    };
  }) || [];

  // Get recent activity (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentCompleted = completedLessons?.filter((p: any) =>
    p.completed_at && new Date(p.completed_at) >= sevenDaysAgo
  ).length || 0;

  return (
    <div className="space-y-5">
      {/* Back Button */}
      <Link href="/alumnos">
        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Alumnos
        </Button>
      </Link>

      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          {/* Student Avatar and Info */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}>
              {studentName?.slice(0, 2).toUpperCase() || 'NA'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{studentName}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Registro: {studentMembership.joined_at
                    ? format(new Date(studentMembership.joined_at), 'dd MMM yyyy', { locale: es })
                    : '-'}</span>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                  studentMembership.status === 'active'
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    studentMembership.status === 'active' ? "bg-emerald-500" : "bg-slate-500"
                  )} />
                  {studentMembership.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Progreso</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{progressPercentage}<span className="text-2xl text-slate-400">%</span></p>
                <p className="text-sm text-slate-500 mt-1">{completedCount} de {totalLessons} clases</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '75ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Completadas</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{completedCount}</p>
                <p className="text-sm text-slate-500 mt-1">Clases finalizadas</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Puntos</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{studentPoints}</p>
                <p className="text-sm text-slate-500 mt-1">Puntos de actividad</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '225ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Últimos 7 días</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{recentCompleted}</p>
                <p className="text-sm text-slate-500 mt-1">Clases completadas</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules and Lessons */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-md flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Contenido y Progreso</h3>
                <p className="text-sm text-slate-500">
                  {modulesWithProgress.length} módulos · {totalLessons} clases disponibles
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!modulesWithProgress || modulesWithProgress.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 rounded-3xl inline-flex mb-6 bg-gradient-to-br from-slate-100 to-slate-200">
                <BookOpen className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Sin contenido</h3>
              <p className="text-slate-500">
                Tu autoescuela aún no ha añadido cursos
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {modulesWithProgress.map((module: any, moduleIndex: number) => (
                <div key={module.id} className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                  {/* Module Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md text-white font-bold text-sm">
                        {moduleIndex + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{module.title}</h4>
                        <p className="text-sm text-slate-500">
                          {module.completedLessons} de {module.totalLessons} clases completadas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{module.progressPercentage}%</div>
                      <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-500"
                          style={{ width: `${module.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div className="p-4 bg-white">
                    <div className="space-y-2">
                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                        <div
                          key={lesson.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                            lesson.isCompleted
                              ? "bg-emerald-50 border-2 border-emerald-200"
                              : "bg-slate-50 border-2 border-slate-100"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold",
                            lesson.isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-300 text-slate-600"
                          )}>
                            {lessonIndex + 1}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "font-semibold text-sm",
                              lesson.isCompleted ? "text-emerald-900" : "text-slate-900"
                            )}>
                              {lesson.title}
                            </p>
                          </div>
                          {lesson.isCompleted ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                              <CheckCircle className="h-4 w-4" />
                              <span>Completada</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>Pendiente</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message if progress > 0 */}
      {progressPercentage > 0 && (
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8 border border-amber-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.12)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 hover:from-amber-50/50 hover:to-orange-50/50 transition-all duration-300 pointer-events-none" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <div className="absolute top-12 right-16 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-8 right-12 w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1.5">
                  ¡Buen trabajo!
                </h3>
                <p className="text-slate-600">
                  {studentName} ha completado el <span className="font-semibold text-amber-600">{progressPercentage}%</span> del contenido disponible.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
              <Flame className="h-7 w-7" />
              <span className="text-xl font-bold">{studentPoints} puntos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
