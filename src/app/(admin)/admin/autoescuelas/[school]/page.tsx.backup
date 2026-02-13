import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Video, TrendingUp, Activity, Search, Building2, Key, Globe, Mail, Clock, Shield, Link as LinkIcon, Database, Settings, Calendar, UserCheck, Sparkles } from 'lucide-react';
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

  const primaryColor = school.primary_color || '#3B82F6';
  const secondaryColor = school.secondary_color || '#1E40AF';

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
      // Group by user_id
      lessonProgress.forEach((lp: any) => {
        const existing = lessonProgressMap.get(lp.user_id) || [];
        lessonProgressMap.set(lp.user_id, [
          ...existing,
          { lessonId: lp.lessonId, completedAt: lp.completedAt }
        ]);
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
      .sort((a: any, b: any) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0]?.completedAt;

    return {
      ...student,
      lessonsCompleted,
      uniqueLessonsCompleted: uniqueLessons,
      lastActivity,
    };
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
    <SchoolDetailProvider
      schoolId={schoolId}
      school={school}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {school.name}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Autoescuela</span>
              </div>
            </div>
            <p className="text-slate-500">
              Vista detallada de alumnos y actividad
            </p>
          </div>
          <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: `${primaryColor}15` }}>
            <Building2 className="h-5 w-5" style={{ color: primaryColor }} />
          </div>
        </div>

      {/* School Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Estudiantes', value: totalStudents, sublabel: `${activeStudents} activos`, icon: Users, color: 'slate' },
          { label: 'Nuevos (mes)', value: newThisMonth, sublabel: `+${newThisWeek} esta semana`, icon: TrendingUp, color: 'emerald', textColor: 'emerald-500' },
          { label: 'Clases Vistas', value: totalLessonsCompleted, sublabel: `${activeThisWeek} activos esta semana`, icon: Video, color: 'violet', textColor: 'violet-500' },
          { label: 'Tasa Activación', value: `${activationRate}%`, sublabel: 'de estudiantes activos', icon: Activity, color: 'slate' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${100 + idx * 75}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className={cn('text-xs', stat.textColor ? stat.textColor : 'text-slate-400')}>{stat.sublabel}</p>
                </div>
                <div className={cn(
                  'p-3 rounded-xl',
                  stat.color === 'emerald' ? 'bg-emerald-50' : stat.color === 'violet' ? 'bg-violet-50' : 'bg-slate-100'
                )}>
                  <Icon className={cn(
                    'h-6 w-6',
                    stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'violet' ? 'text-violet-600' : 'text-slate-400'
                  )} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <SchoolActionsCard />
      </div>

      {/* School Configuration & Authentication */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración General */}
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-200 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900">Configuración de la Autoescuela</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">Información de configuración y acceso</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Nombre</span>
                </div>
                <span className="font-medium text-slate-900">{school.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Slug</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">{school.slug}</code>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    {school.slug}.miautoescuela.com
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Email Contacto</span>
                </div>
                <span className="font-medium text-slate-900">{school.contact_email || '-'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Registrada</span>
                </div>
                <span className="text-sm text-slate-900">
                  {format(new Date(school.created_at), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Suscripción</span>
                </div>
                <Badge
                  className={cn(
                    school.subscription_status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : school.subscription_status === 'trialing'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                  )}
                >
                  {school.subscription_status === 'active' ? 'Activa' : school.subscription_status === 'trialing' ? 'Prueba' : school.subscription_status}
                </Badge>
              </div>
              {school.trial_ends_at && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Fin Prueba</span>
                  </div>
                  <span className="text-sm text-slate-900">
                    {format(new Date(school.trial_ends_at), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Autenticación y Acceso */}
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-200 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900">Autenticación y Acceso</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">Configuración de login y credenciales</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Total Usuarios</span>
                </div>
                <span className="font-medium text-slate-900">{members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Invitaciones Pendientes</span>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  {invites?.length || 0} pendientes
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Métodos de Login</span>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Email/Password
                  </Badge>
                  <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">
                    Google OAuth
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">URL de Login</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded max-w-[200px] truncate">
                    /iniciar-sesion
                  </code>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">School ID</span>
                </div>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded">{schoolId}</code>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Roles Activos</span>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Owner</Badge>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Admin</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Student</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invitaciones Pendientes */}
      {invites && invites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-200 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-900">Invitaciones Pendientes</h3>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {invites.length} {invites.length === 1 ? 'invitación pendiente' : 'invitaciones pendientes'} de envío
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {invites.map((invite: any) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 animate-fade-in"
                  style={{ animationDelay: `${750 + (Math.min(invites.indexOf(invite) * 50, 300))}ms` }}
                >
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Mail className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{invite.email}</p>
                    <p className="text-xs text-slate-500">
                      Enviada: {invite.created_at && format(new Date(invite.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {invite.role}
                  </Badge>
                  <Badge className={cn(
                    'border',
                    invite.expires_at && new Date(invite.expires_at) < new Date()
                      ? 'bg-red-500/10 text-red-600 border-red-500/20'
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                  )}>
                    {invite.expires_at && new Date(invite.expires_at) < new Date() ? 'Expirada' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-200 animate-fade-in" style={{ animationDelay: '800ms' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Buscar por nombre o email..."
                className="w-full pl-10 pr-4 py-2 rounded-full border-2"
                name="search"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/autoescuelas/${schoolId}`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                !statusFilter
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              Todos
            </Link>
            <Link
              href={`/admin/autoescuelas/${schoolId}?filter=active`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                statusFilter === 'active'
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              Activos
            </Link>
            <Link
              href={`/admin/autoescuelas/${schoolId}?filter=suspended`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                statusFilter === 'suspended'
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              Inactivos
            </Link>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <StudentsTable students={filteredStudents} />

      {/* Owners/Admins Section */}
      <AdminsSection owners={owners} />
      </div>
    </SchoolDetailProvider>
  );
}
