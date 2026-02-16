import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Video, TrendingUp, Activity, Search, Building2, Key, Globe, Mail, Clock, Shield, Link as LinkIcon, UserCheck, Sparkles, Settings, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SchoolDetailProvider } from '@/components/admin/SchoolDetailContext';
import { SchoolActionsCard } from '@/components/admin/SchoolActionsCard';
import { StudentsTable } from '@/components/admin/StudentsTable';
import { AdminsSection } from '@/components/admin/AdminsSection';

export default async function AdminSchoolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ school: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const { school: schoolId } = await params;
  const searchParamsData = await searchParams;
  const statusFilter = searchParamsData.filter;

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get school details
  const { data: school } = await (supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .maybeSingle() as any);

  if (!school) {
    redirect('/admin/autoescuelas');
  }

  const primaryColor = school.primary_color || '#007AFF';
  const secondaryColor = school.secondary_color || '#0051D5';

  // Get all members with profile data
  const { data: members } = await (supabase
    .from('school_members')
    .select(`
      user_id,
      role,
      status,
      joined_at,
      created_at,
      profiles (
        id,
        full_name,
        email,
        phone,
        created_at
      )
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false }) as any);

  // Get pending invites
  const { data: invites } = await (supabase
    .from('invites')
    .select('*')
    .eq('school_id', schoolId)
    .eq('accepted', false) as any);

  // Separate owners and students
  const owners = members?.filter((m: any) => m.role === 'owner' || m.role === 'admin') || [];
  const students = members?.filter((m: any) => m.role === 'student') || [];

  // Get lesson progress for students
  const studentIds = students.map((s: any) => s.user_id);
  let lessonProgressMap = new Map<string, any[]>();

  if (studentIds.length > 0) {
    const { data: lessonProgress } = await (supabase
      .from('lesson_progress')
      .select('user_id, lesson_id, completed_at')
      .eq('school_id', schoolId)
      .in('user_id', studentIds) as any);

    if (lessonProgress) {
      lessonProgress.forEach((lp: any) => {
        const existing = lessonProgressMap.get(lp.user_id) || [];
        lessonProgressMap.set(lp.user_id, [...existing, { lessonId: lp.lesson_id, completedAt: lp.completedAt }]);
      });
    }
  }

  // Enrich students with progress data
  const studentsWithProgress = students.map((student: any) => {
    const progress = lessonProgressMap.get(student.user_id) || [];
    const lessonsCompleted = progress.length;
    const uniqueLessons = new Set(progress.map((p: any) => p.lessonId)).size;
    const lastActivity = progress
      .filter((p: any) => p.completedAt)
      .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]?.completedAt;

    return { ...student, lessonsCompleted, uniqueLessonsCompleted: uniqueLessons, lastActivity };
  });

  // Apply status filter
  let filteredStudents = studentsWithProgress;
  if (statusFilter) {
    filteredStudents = filteredStudents.filter((s: any) => s.status === statusFilter);
  }

  // Calculate stats
  const totalStudents = students.length;
  const activeStudents = students.filter((s: any) => s.status === 'active').length;
  const newThisWeek = students.filter((s: any) => {
    const weekAgo = subDays(new Date(), 7);
    return s.created_at && new Date(s.created_at) >= weekAgo;
  }).length;
  const newThisMonth = students.filter((s: any) => {
    const monthAgo = subMonths(new Date(), 1);
    return s.created_at && new Date(s.created_at) >= monthAgo;
  }).length;

  const totalLessonsCompleted = studentsWithProgress.reduce((sum: number, s: any) => sum + s.lessonsCompleted, 0);
  const activeThisWeek = studentsWithProgress.filter((s: any) => {
    const weekAgo = subDays(new Date(), 7);
    return s.lastActivity && new Date(s.lastActivity) >= weekAgo;
  }).length;

  const activationRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  return (
    <SchoolDetailProvider schoolId={schoolId} school={school} primaryColor={primaryColor} secondaryColor={secondaryColor}>
      <div className="space-y-8 max-w-[1400px] mx-auto">
        {/* Apple-style Header */}
        <div className="flex items-center gap-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">{school.name}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Autoescuela</span>
              </div>
            </div>
            <p className="text-slate-500">Vista detallada de alumnos y actividad</p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Apple-style Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Estudiantes', value: totalStudents, sublabel: `${activeStudents} activos`, icon: Users, style: { bg: '#EFF6FF', text: '#2563EB' } },
            { label: 'Nuevos (mes)', value: newThisMonth, sublabel: `+${newThisWeek} esta semana`, icon: TrendingUp, style: { bg: '#ECFDF5', text: '#059669' } },
            { label: 'Clases Vistas', value: totalLessonsCompleted, sublabel: `${activeThisWeek} activos esta semana`, icon: Video, style: { bg: '#F5F3FF', text: '#7C3AED' } },
            { label: 'Tasa Activación', value: `${activationRate}%`, sublabel: 'de estudiantes activos', icon: Activity, style: { bg: '#FFFBEB', text: '#D97706' } },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="relative bg-white rounded-2xl shadow-lg p-8 w-full border border-slate-900 hover:border-slate-700 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.style.bg }}>
                    <Icon className="w-6 h-6" style={{ color: stat.style.text }} />
                  </div>
                </div>
                <div className="text-4xl font-semibold text-slate-900 mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.sublabel}</div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div>
          <SchoolActionsCard />
        </div>

        {/* School Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuración */}
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden w-full border border-slate-900">
            <div className="px-8 py-6 border-b border-slate-900">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-slate-700" />
                <h2 className="text-xl font-semibold text-slate-900">Configuración</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">Información de la autoescuela</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Nombre</span>
                </div>
                <span className="font-medium text-slate-900">{school.name}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Slug</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg">{school.slug}</code>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200 rounded-full">{school.slug}.miautoescuela.com</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Email</span>
                </div>
                <span className="font-medium text-slate-900">{school.contact_email || '-'}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Registrada</span>
                </div>
                <span className="text-sm text-slate-900">{format(new Date(school.created_at), 'dd MMM yyyy', { locale: es })}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Suscripción</span>
                </div>
                <Badge className={cn('rounded-full', school.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200')}>
                  {school.subscription_status === 'active' ? 'Activa' : school.subscription_status === 'trialing' ? 'Prueba' : school.subscription_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Autenticación */}
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden w-full border border-slate-900">
            <div className="px-8 py-6 border-b border-slate-900">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-slate-700" />
                <h2 className="text-xl font-semibold text-slate-900">Autenticación</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">Configuración de acceso</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Total Usuarios</span>
                </div>
                <span className="font-medium text-slate-900">{members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Invitaciones Pendientes</span>
                </div>
                <Badge className="bg-amber-50 text-amber-600 border-amber-200 rounded-full">{invites?.length || 0} pendientes</Badge>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Métodos de Login</span>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200 rounded-full">Email</Badge>
                  <Badge className="bg-slate-50 text-slate-600 border-slate-200 rounded-full">Google</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">URL de Login</span>
                </div>
                <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg">/iniciar-sesion</code>
              </div>
            </div>
          </div>
        </div>

        {/* Invitaciones Pendientes */}
        {invites && invites.length > 0 && (
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden w-full border border-slate-900">
            <div className="px-8 py-6 border-b border-slate-900">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-semibold text-slate-900">Invitaciones Pendientes</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">{invites.length} {invites.length === 1 ? 'invitación' : 'invitaciones'} pendientes</p>
            </div>
            <div className="divide-y divide-slate-200">
              {invites.map((invite: any) => (
                <div key={invite.id} className="px-8 py-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{invite.email}</p>
                    <p className="text-sm text-slate-500">{format(new Date(invite.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}</p>
                  </div>
                  <Badge className="bg-amber-50 text-amber-600 border-amber-200 rounded-full">{invite.role}</Badge>
                  <Badge className={cn('rounded-full', invite.expires_at && new Date(invite.expires_at) < new Date() ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200')}>
                    {invite.expires_at && new Date(invite.expires_at) < new Date() ? 'Expirada' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full border border-slate-900">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Buscar por nombre o email..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  name="search"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/autoescuelas/${schoolId}`} className={cn('px-5 py-3 rounded-xl text-sm font-medium transition-all', !statusFilter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>
                Todos
              </Link>
              <Link href={`/admin/autoescuelas/${schoolId}?filter=active`} className={cn('px-5 py-3 rounded-xl text-sm font-medium transition-all', statusFilter === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>
                Activos
              </Link>
              <Link href={`/admin/autoescuelas/${schoolId}?filter=suspended`} className={cn('px-5 py-3 rounded-xl text-sm font-medium transition-all', statusFilter === 'suspended' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>
                Inactivos
              </Link>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <StudentsTable students={filteredStudents} />

        {/* Owners Section */}
        <AdminsSection owners={owners} />
      </div>
    </SchoolDetailProvider>
  );
}
