import { createClient } from '@/lib/supabase/server';
import { Building2, Users, CreditCard, TrendingUp, Activity, Shield, Video, ArrowRight, Eye, Settings, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';
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

  // Get data
  const [
    { count: schoolsCount },
    { data: schools },
    { data: recentActivity },
  ] = await Promise.all([
    (supabase.from('schools') as any).select('*', { count: 'exact', head: true }),
    (supabase.from('schools') as any).select('id, name, slug, logo_url, primary_color, secondary_color, created_at, subscription_status').order('created_at', { ascending: false }).limit(10),
    (supabase
      .from('school_members')
      .select('created_at, schools (name, slug)')
      .order('created_at', { ascending: false })
      .limit(8) as any),
  ]);

  // Get detailed stats
  const schoolsWithStats = await Promise.all(
    (schools || []).map(async (school: any) => {
      const { data: members } = await (supabase
        .from('school_members')
        .select('role, status, joined_at')
        .eq('school_id', school.id) as any);

      const studentCount = members?.filter((m: any) => m.role === 'student').length || 0;
      const activeStudentCount = members?.filter((m: any) => m.role === 'student' && m.status === 'active').length || 0;

      const weekAgo = subDays(new Date(), 7);

      const [{ count: modulesCount }, { count: lessonsCount }, { data: lessonProgress }] = await Promise.all([
        (supabase.from('modules') as any).select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        (supabase.from('lessons') as any).select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        (supabase.from('lesson_progress') as any).select('user_id, completed_at').eq('school_id', school.id),
      ]);

      const activeStudentsThisWeek = new Set(
        lessonProgress?.filter((lp: any) => lp.completed_at && new Date(lp.completed_at) >= weekAgo).map((lp: any) => lp.user_id) || []
      ).size;
      const totalLessonsCompleted = lessonProgress?.length || 0;

      return {
        ...school,
        stats: { studentCount, activeStudentCount, activeStudentsThisWeek, modulesCount: modulesCount || 0, lessonsCount: lessonsCount || 0, totalLessonsCompleted },
      };
    })
  );

  const totalStudents = schoolsWithStats.reduce((sum, s) => sum + s.stats.studentCount, 0);
  const activeStudents = schoolsWithStats.reduce((sum, s) => sum + s.stats.activeStudentCount, 0);
  const totalModules = schoolsWithStats.reduce((sum, s) => sum + s.stats.modulesCount, 0);
  const totalLessons = schoolsWithStats.reduce((sum, s) => sum + s.stats.lessonsCount, 0);
  const totalLessonsCompleted = schoolsWithStats.reduce((sum, s) => sum + s.stats.totalLessonsCompleted, 0);
  const totalActiveThisWeek = schoolsWithStats.reduce((sum, s) => sum + s.stats.activeStudentsThisWeek, 0);

  const activeSubscriptions = schools?.filter((s: any) => s.subscription_status === 'active')?.length || 0;
  const trialSchools = schools?.filter((s: any) => s.subscription_status === 'trialing')?.length || 0;

  const filteredSchools = schoolFilter ? schoolsWithStats.filter((s: any) => s.id === schoolFilter) : schoolsWithStats;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Apple-style Header */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg shadow-blue-500/25">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-semibold text-slate-900 tracking-tight mb-3">
          Panel de Administración
        </h1>
        <p className="text-xl text-slate-500 font-normal max-w-2xl mx-auto">
          Monitorea todas las autoescuelas y actividad en tiempo real
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-slate-500">Sistema Online</span>
        </div>
      </div>

      {/* Apple-style Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Autoescuelas', value: schoolsCount || 0, change: '+12%', icon: Building2, style: { bg: '#EFF6FF', text: '#2563EB' } },
          { title: 'Estudiantes', value: totalStudents, change: '+8%', icon: Users, style: { bg: '#ECFDF5', text: '#059669' } },
          { title: 'Clases Vistas', value: totalLessonsCompleted, change: '+23%', icon: Video, style: { bg: '#F5F3FF', text: '#7C3AED' } },
          { title: 'Ingresos', value: `€${(activeSubscriptions * 29).toFixed(0)}`, change: '+15%', icon: CreditCard, style: { bg: '#FFFBEB', text: '#D97706' } },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.style.bg }}>
                  <Icon className="w-6 h-6" style={{ color: stat.style.text }} />
                </div>
                <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
              </div>
              <div className="text-4xl font-semibold text-slate-900 mb-1 tracking-tight">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Schools Table - Apple Style */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Autoescuelas</h2>
              <p className="text-sm text-slate-500 mt-1">
                {filteredSchools.length} {filteredSchools.length === 1 ? 'autoescuela' : 'autoescuelas'} registradas
              </p>
            </div>
            <Link href="/admin/autoescuelas">
              <Button variant="outline" size="sm" className="rounded-full">
                Ver Todas
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Autoescuela</th>
                <th className="text-center px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Estudiantes</th>
                <th className="text-center px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Activos</th>
                <th className="text-center px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Temas</th>
                <th className="text-center px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Clases</th>
                <th className="text-center px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Vistas</th>
                <th className="text-center px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-8 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school: any) => (
                <tr key={school.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <Link href={`/admin/autoescuelas/${school.id}`} className="flex items-center gap-4">
                      {school.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={school.logo_url} alt={school.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
                          style={{ background: `linear-gradient(135deg, ${school.primary_color || '#007AFF'} 0%, ${school.secondary_color || '#0051D5'} 100%)` }}
                        >
                          {school.name?.slice(0, 2).toUpperCase() || 'AU'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{school.name}</p>
                        <p className="text-sm text-slate-500">/{school.slug}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-lg font-semibold text-slate-900">{school.stats.studentCount}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-lg font-semibold text-emerald-600">{school.stats.activeStudentCount}</span>
                  </td>
                  <td className="px-8 py-5 text-center text-slate-600">{school.stats.modulesCount}</td>
                  <td className="px-8 py-5 text-center text-slate-600">{school.stats.lessonsCount}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-lg font-semibold text-violet-600">{school.stats.totalLessonsCompleted}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full',
                        school.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      {school.subscription_status === 'active' ? 'Activa' : school.subscription_status === 'trialing' ? 'Prueba' : school.subscription_status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/autoescuelas/${school.id}`}>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Estudiantes', icon: Users, iconStyle: { bg: '#ECFDF5', text: '#059669' }, highlightStyle: { bg: '#ECFDF5', text: '#059669' }, items: [
            { label: 'Total', value: totalStudents },
            { label: 'Activos', value: activeStudents, highlight: true },
            { label: 'Tasa', value: `${totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%` },
          ]},
          { title: 'Contenido', icon: Video, iconStyle: { bg: '#F5F3FF', text: '#7C3AED' }, highlightStyle: { bg: '#F5F3FF', text: '#7C3AED' }, items: [
            { label: 'Temas', value: totalModules },
            { label: 'Clases', value: totalLessons },
            { label: 'Vistas', value: totalLessonsCompleted, highlight: true },
          ]},
          { title: 'Suscripciones', icon: CreditCard, iconStyle: { bg: '#FFFBEB', text: '#D97706' }, highlightStyle: { bg: '#FFFBEB', text: '#D97706' }, items: [
            { label: 'Activas', value: activeSubscriptions, highlight: true },
            { label: 'Prueba', value: trialSchools },
            { label: 'MRR', value: `€${(activeSubscriptions * 29).toFixed(0)}` },
          ]},
        ].map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: section.iconStyle.bg }}>
                  <Icon className="w-5 h-5" style={{ color: section.iconStyle.text }} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.items.map((item, j) => (
                  <div key={j} className={cn('flex items-center justify-between p-4 rounded-xl', item.highlight ? '' : 'bg-slate-50')} style={item.highlight ? { backgroundColor: section.highlightStyle.bg } : {}}>
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className={cn('text-lg font-semibold', item.highlight ? '' : 'text-slate-900')} style={item.highlight ? { color: section.highlightStyle.text } : {}}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-2xl font-semibold text-slate-900">Actividad Reciente</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity: any, i: number) => (
              <div key={i} className="px-8 py-5 hover:bg-slate-50/50 transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                  {(activity.schools?.name || 'NA').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.schools?.name || 'Autoescuela'}</p>
                  <p className="text-sm text-slate-500">
                    {activity.created_at && format(new Date(activity.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </p>
                </div>
                <Badge className="bg-slate-100 text-slate-600 border-slate-200 rounded-full">Nuevo</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
