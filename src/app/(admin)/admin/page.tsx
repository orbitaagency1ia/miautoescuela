import { createClient } from '@/lib/supabase/server';
import { Building2, Users, CreditCard, TrendingUp, Activity, Globe, Zap, Settings, Shield, Video, BookOpen, Calendar, Clock, ArrowRight, Eye, Filter, Search, MoreHorizontal, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, subDays, subHours, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ school?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const schoolFilter = params.school;
  const activeTab = params.tab || 'overview';

  // Get global stats
  const [
    { count: schoolsCount },
    { count: totalMembersCount },
    { data: schools },
    { data: recentActivity },
  ] = await Promise.all([
    (supabase.from('schools') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('school_members') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('schools') as any).select('id, name, slug, logo_url, primary_color, created_at, subscription_status, trial_ends_at').order('created_at', { ascending: false }).limit(20),
    // Get recent signups from school_members
    (supabase
      .from('school_members')
      .select(`
        created_at,
        schools (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10) as any),
  ]);

  // Get detailed stats for each school
  const schoolsWithStats = await Promise.all(
    (schools || []).map(async (school: any) => {
      // Get members count by role
      const { data: members } = await (supabase
        .from('school_members')
        .select('role, status, joined_at, created_at')
        .eq('school_id', school.id) as any);

      const studentCount = members?.filter((m: any) => m.role === 'student').length || 0;
      const activeStudentCount = members?.filter((m: any) => m.role === 'student' && m.status === 'active').length || 0;

      // New students this week
      const weekAgo = subDays(new Date(), 7);
      const newStudentsThisWeek = members?.filter((m: any) =>
        m.role === 'student' && m.joined_at && new Date(m.joined_at) >= weekAgo
      ).length || 0;

      // Get modules and lessons count
      const [{ count: modulesCount }, { count: lessonsCount }] = await Promise.all([
        (supabase.from('modules') as any).select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        (supabase.from('lessons') as any).select('id', { count: 'exact', head: true }).eq('school_id', school.id),
      ]);

      // Get lesson progress (completed lessons)
      const { data: lessonProgress } = await (supabase
        .from('lesson_progress')
        .select('user_id, completed_at')
        .eq('school_id', school.id) as any);

      // Active students this week (completed a lesson)
      const activeStudentsThisWeek = new Set(
        lessonProgress?.filter((lp: any) =>
          lp.completed_at && new Date(lp.completed_at) >= weekAgo
        ).map((lp: any) => lp.user_id) || []
      ).size;

      // Total lessons completed
      const totalLessonsCompleted = lessonProgress?.length || 0;

      return {
        ...school,
        stats: {
          studentCount,
          activeStudentCount,
          newStudentsThisWeek,
          activeStudentsThisWeek,
          modulesCount: modulesCount || 0,
          lessonsCount: lessonsCount || 0,
          totalLessonsCompleted,
        },
      };
    })
  );

  // Calculate global stats
  const totalStudents = schoolsWithStats.reduce((sum, school) => sum + school.stats.studentCount, 0);
  const activeStudents = schoolsWithStats.reduce((sum, school) => sum + school.stats.activeStudentCount, 0);
  const totalModules = schoolsWithStats.reduce((sum, school) => sum + school.stats.modulesCount, 0);
  const totalLessons = schoolsWithStats.reduce((sum, school) => sum + school.stats.lessonsCount, 0);
  const totalLessonsCompleted = schoolsWithStats.reduce((sum, school) => sum + school.stats.totalLessonsCompleted, 0);
  const totalActiveThisWeek = schoolsWithStats.reduce((sum, school) => sum + school.stats.activeStudentsThisWeek, 0);

  // Growth calculations (mock for now, would need historical data)
  const schoolsGrowth = 12;
  const usersGrowth = 8;

  // Get subscription stats
  const activeSubscriptions = schools?.filter((s: any) => s.subscription_status === 'active')?.length || 0;
  const trialSchools = schools?.filter((s: any) => s.subscription_status === 'trialing')?.length || 0;

  const globalStats = [
    {
      title: 'Autoescuelas',
      value: schoolsCount || 0,
      growth: schoolsGrowth,
      description: 'Total registradas',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Estudiantes',
      value: totalStudents,
      growth: usersGrowth,
      description: `${activeStudents} activos`,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Clases Vistas',
      value: totalLessonsCompleted,
      growth: 23,
      description: `${totalActiveThisWeek} activos esta semana`,
      icon: Video,
      color: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-500/10',
    },
    {
      title: 'Ingresos',
      value: `€${(activeSubscriptions * 29).toFixed(0)}`,
      growth: 15,
      description: `${activeSubscriptions} suscripciones`,
      icon: CreditCard,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
    },
  ];

  // Filter schools if selected
  const filteredSchools = schoolFilter
    ? schoolsWithStats.filter((s: any) => s.id === schoolFilter)
    : schoolsWithStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Panel de Administración
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Admin</span>
            </div>
          </div>
          <p className="text-slate-500 mt-2">
            Monitorea todas las autoescuelas y actividad en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {globalStats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.growth >= 0;
          return (
            <div key={index} className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
                </div>
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <Icon className={cn('h-6 w-6 bg-gradient-to-br bg-clip-text text-transparent', stat.color)} />
                </div>
                {stat.growth !== 0 && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    isPositive ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                    {Math.abs(stat.growth)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Autoescuelas</h3>
              <p className="text-sm text-slate-500">
                {filteredSchools.length} {filteredSchools.length === 1 ? 'autoescuela' : 'autoescuelas'} registradas
                {schoolFilter && ` (filtrado)`}
              </p>
            </div>
            <Link href="/admin/autoescuelas">
              <Button variant="outline" size="sm" className="rounded-full">
                <Building2 className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left p-4 font-semibold text-slate-700">Autoescuela</th>
                <th className="text-center p-4 font-semibold text-slate-700">Estudiantes</th>
                <th className="text-center p-4 font-semibold text-slate-700">Activos</th>
                <th className="text-center p-4 font-semibold text-slate-700">Temas</th>
                <th className="text-center p-4 font-semibold text-slate-700">Clases</th>
                <th className="text-center p-4 font-semibold text-slate-700">Vistas</th>
                <th className="text-center p-4 font-semibold text-slate-700">Actividad</th>
                <th className="text-center p-4 font-semibold text-slate-700">Estado</th>
                <th className="text-center p-4 font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school: any, index) => (
                <tr
                  key={school.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {school.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={school.logo_url}
                          alt={school.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg, ${school.primary_color || '#3B82F6'} 0%, ${school.secondary_color || '#1E40AF'} 100%)`,
                          }}
                        >
                          {school.name?.slice(0, 2).toUpperCase() || 'AU'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{school.name}</p>
                        <p className="text-xs text-slate-500">{format(new Date(school.created_at), 'dd MMM yyyy', { locale: es })}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-slate-900">{school.stats.studentCount}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-emerald-600">{school.stats.activeStudentCount}</span>
                  </td>
                  <td className="p-4 text-center text-slate-600">{school.stats.modulesCount}</td>
                  <td className="p-4 text-center text-slate-600">{school.stats.lessonsCount}</td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-violet-600">{school.stats.totalLessonsCompleted}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm text-slate-600">{school.stats.activeStudentsThisWeek}</span>
                      <span className="text-xs text-slate-400">esta semana</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge
                      variant={school.subscription_status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        school.subscription_status === 'active'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      )}
                    >
                      {school.subscription_status === 'active' ? 'Activo' : school.subscription_status === 'trialing' ? 'Prueba' : school.subscription_status}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/autoescuelas/${school.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100">
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100">
                        <Settings className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="border-b pb-4 mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Users className="h-5 w-5 text-emerald-500" />
              Estudiantes
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total</span>
              <span className="font-bold text-slate-900">{totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Activos</span>
              <span className="font-bold text-emerald-600">{activeStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Tasa Activación</span>
              <span className="font-bold text-slate-900">
                {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="border-b pb-4 mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Video className="h-5 w-5 text-violet-500" />
              Contenido
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Temas Totales</span>
              <span className="font-bold text-slate-900">{totalModules}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Clases Totales</span>
              <span className="font-bold text-slate-900">{totalLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Clases Vistas</span>
              <span className="font-bold text-violet-600">{totalLessonsCompleted}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="border-b pb-4 mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Suscripciones
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Activas</span>
              <span className="font-bold text-emerald-600">{activeSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">En Prueba</span>
              <span className="font-bold text-amber-600">{trialSchools}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Ingresos (MRR)</span>
              <span className="font-bold text-slate-900">€{activeSubscriptions > 0 ? (activeSubscriptions * 29).toFixed(0) : '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Clock className="h-5 w-5 text-slate-700" />
            Actividad Reciente
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {(activity.schools?.name || 'NA').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.schools?.name || 'Autoescuela'}</p>
                    <p className="text-xs text-slate-500">
                      {activity.created_at && format(new Date(activity.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Nuevo Registro
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
