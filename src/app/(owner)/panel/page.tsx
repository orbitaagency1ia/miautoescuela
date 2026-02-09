import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users, BookOpen, Palette, Settings, Sparkles, TrendingUp, Award, Clock, ArrowRight, Activity, Calendar, Video } from 'lucide-react';
import Link from 'next/link';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function OwnerDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get user's school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle() as any);

  if (!membership) {
    redirect('/setup');
  }

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    redirect('/inicio');
  }

  // Get school details
  const { data: school } = await (supabase
    .from('schools')
    .select('*')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  if (!school) {
    redirect('/setup');
  }

  const schoolName = school.name || 'Tu Autoescuela';
  const primaryColor = school.primary_color || '#3B82F6';
  const secondaryColor = school.secondary_color || school.primary_color || '#1E40AF';
  const schoolId = school.id;

  // Get comprehensive stats
  let studentsCount = 0;
  let activeStudentsCount = 0;
  let newStudentsThisWeek = 0;
  let newStudentsThisMonth = 0;
  let modulesCount = 0;
  let lessonsCount = 0;
  let totalLessonsCompleted = 0;
  let activeStudentsThisWeek = 0;

  try {
    // Get all students with details
    const { data: students } = await (supabase
      .from('school_members')
      .select('user_id, status, joined_at')
      .eq('school_id', schoolId)
      .eq('role', 'student') as any);

    studentsCount = students?.length || 0;

    // Calculate student stats
    if (students) {
      const now = new Date();
      const weekAgo = subDays(now, 7);
      const monthAgo = subMonths(now, 1);

      activeStudentsCount = students.filter((s: any) => s.status === 'active').length || 0;
      newStudentsThisWeek = students.filter((s: any) =>
        s.joined_at && new Date(s.joined_at) >= weekAgo
      ).length || 0;
      newStudentsThisMonth = students.filter((s: any) =>
        s.joined_at && new Date(s.joined_at) >= monthAgo
      ).length || 0;
    }

    // Get content stats
    const [modulesResult, lessonsResult] = await Promise.all([
      supabase.from('modules').select('id', { count: 'exact', head: true }).eq('school_id', schoolId) as any,
      supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('school_id', schoolId) as any,
    ]);

    modulesCount = modulesResult?.count || 0;
    lessonsCount = lessonsResult?.count || 0;

    // Get lesson progress for active students
    if (students && students.length > 0) {
      const userIds = students.map((s: any) => s.user_id);
      const { data: lessonProgress } = await (supabase
        .from('lesson_progress')
        .select('user_id, completed_at')
        .in('user_id', userIds) as any);

      if (lessonProgress) {
        totalLessonsCompleted = lessonProgress.length || 0;

        // Calculate active students this week (students who completed a lesson)
        const weekAgo = subDays(new Date(), 7);
        activeStudentsThisWeek = new Set(
          lessonProgress
            .filter((lp: any) => lp.completed_at && new Date(lp.completed_at) >= weekAgo)
            .map((lp: any) => lp.user_id)
        ).size;
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }

  // Calculate derived stats
  const activationRate = studentsCount > 0 ? Math.round((activeStudentsCount / studentsCount) * 100) : 0;
  const avgLessonsPerStudent = activeStudentsCount > 0 ? Math.round((totalLessonsCompleted / activeStudentsCount) * 10) / 10 : 0;

  const quickActions = [
    {
      title: 'Ver Alumnos',
      description: `${studentsCount} ${studentsCount === 1 ? 'alumno' : 'alumnos'} registrado${studentsCount === 1 ? '' : 's'}`,
      href: '/alumnos',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Gestionar Temas',
      description: `${modulesCount} ${modulesCount === 1 ? 'tema' : 'temas'} creados`,
      href: '/temas',
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      title: 'Invitar Alumno',
      description: 'Añade nuevos alumnos',
      href: '/alumnos/invitar',
      icon: Users,
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      title: 'Configuración',
      description: 'Personaliza tu escuela',
      href: '/configuracion?tab=branding',
      icon: Palette,
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 md:p-10">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Bienvenido a {schoolName}
              </h1>
              <p className="text-slate-600 mt-1">Panel de control de tu autoescuela</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              {newStudentsThisWeek > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  +{newStudentsThisWeek} esta semana
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900">{studentsCount}</p>
            <p className="text-sm text-slate-500">Total Alumnos</p>
            <p className="text-xs text-slate-400 mt-1">{activeStudentsCount} activos ({activationRate}%)</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              {activeStudentsThisWeek > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  {activeStudentsThisWeek} activos
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900">{activeStudentsThisWeek}</p>
            <p className="text-sm text-slate-500">Activos Esta Semana</p>
            <p className="text-xs text-slate-400 mt-1">Alumnos con actividad</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Video className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalLessonsCompleted}</p>
            <p className="text-sm text-slate-500">Clases Completadas</p>
            <p className="text-xs text-slate-400 mt-1">{avgLessonsPerStudent} por alumno</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{modulesCount}</p>
            <p className="text-sm text-slate-500">Temas Creados</p>
            <p className="text-xs text-slate-400 mt-1">{lessonsCount} clases</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-900">Acciones Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Resumen de Actividad</h3>
            <p className="text-sm text-slate-600">
              {newStudentsThisMonth > 0
                ? `${newStudentsThisMonth} nuevo${newStudentsThisMonth === 1 ? ' alumno' : ' alumnos'} este mes`
                : 'Sin actividad reciente'
              } • {totalLessonsCompleted} clases completadas en total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
