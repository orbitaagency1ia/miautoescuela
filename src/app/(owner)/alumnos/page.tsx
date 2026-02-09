import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Plus, Search, Filter, TrendingUp, Calendar, Clock, Activity, Award, BookOpen, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { InviteCodeGenerator } from './invite-code-generator';

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string }>;
}) {
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

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    redirect('/inicio');
  }

  // Get school details
  const { data: school } = await (supabase
    .from('schools')
    .select('id, primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  const schoolId = membership.school_id;
  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Get all students with complete data
  const { data: students } = await (supabase
    .from('school_members')
    .select(`
      user_id,
      status,
      joined_at,
      created_at,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .order('joined_at', { ascending: false }) as any);

  // Get additional stats: lessons completed, activity points
  const userIds = students?.map((s: any) => s.user_id) || [];

  // Get lesson progress for all students
  const { data: lessonProgress } = userIds.length > 0 ? await (supabase
    .from('lesson_progress')
    .select('user_id, completed_at')
    .in('user_id', userIds) as any) : { data: [] };

  // Calculate stats
  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter((s: any) => s.status === 'active').length || 0;
  const newStudentsThisWeek = students?.filter((s: any) => {
    if (!s.joined_at) return false;
    const joinedDate = new Date(s.joined_at);
    const weekAgo = subDays(new Date(), 7);
    return joinedDate >= weekAgo;
  }).length || 0;

  // Calculate completion rates
  const studentProgress = new Map();
  lessonProgress?.forEach((progress: any) => {
    const current = studentProgress.get(progress.user_id) || 0;
    studentProgress.set(progress.user_id, current + 1);
  });

  // Add progress data to students
  const studentsWithProgress = students?.map((s: any) => ({
    ...s,
    lessonsCompleted: studentProgress.get(s.user_id) || 0,
  })) || [];

  // Calculate average completion
  const totalCompleted = Array.from(studentProgress.values()).reduce((a, b) => a + b, 0);
  const avgCompletion = totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 10) / 10 : 0;

  // Calculate registration trends (last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const registrationsThisMonth = students?.filter((s: any) => {
    if (!s.joined_at) return false;
    return new Date(s.joined_at) >= thirtyDaysAgo;
  }).length || 0;

  // Apply filters and search
  const params = await searchParams;
  const searchQuery = params.search?.toLowerCase();
  const statusFilter = params.filter;

  let filteredStudents = studentsWithProgress;

  if (searchQuery) {
    filteredStudents = filteredStudents.filter((s: any) =>
      s.profiles?.full_name?.toLowerCase().includes(searchQuery) ||
      s.profiles?.email?.toLowerCase().includes(searchQuery)
    );
  }

  if (statusFilter) {
    filteredStudents = filteredStudents.filter((s: any) => s.status === statusFilter);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Dashboard de Alumnos
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Alumnos</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Gestiona y monitorea el progreso de tus alumnos
          </p>
        </div>
        <Link href="/alumnos/invitar">
          <Button
            size="lg"
            className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Invitar Alumno
          </Button>
        </Link>
      </div>

      {/* Invite Code Generator */}
      <InviteCodeGenerator primaryColor={primaryColor} secondaryColor={secondaryColor} />

      {/* Stats Grid - Premium */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Alumnos</p>
                <p className="text-3xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground mt-1">Registrados</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Activos</p>
                <p className="text-3xl font-bold">{activeStudents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <p className="text-xs text-emerald-500">
                    {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nuevos</p>
                <p className="text-3xl font-bold">{newStudentsThisWeek}</p>
                <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Promedio Clases</p>
                <p className="text-3xl font-bold">{avgCompletion}</p>
                <p className="text-xs text-muted-foreground mt-1">Por alumno</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border-2 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-10 rounded-full border-2"
                name="search"
                defaultValue={searchQuery}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/alumnos" className="block">
              <Button
                variant={statusFilter === undefined ? "default" : "outline"}
                className="rounded-full"
                style={!statusFilter ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  border: 'none'
                } : {}}
              >
                Todos
              </Button>
            </Link>
            <Link href="/alumnos?filter=active" className="block">
              <Button
                variant={statusFilter === 'active' ? "default" : "outline"}
                className="rounded-full"
                style={statusFilter === 'active' ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  border: 'none'
                } : {}}
              >
                Activos
              </Button>
            </Link>
            <Link href="/alumnos?filter=suspended" className="block">
              <Button
                variant={statusFilter === 'suspended' ? "default" : "outline"}
                className="rounded-full"
                style={statusFilter === 'suspended' ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  border: 'none'
                } : {}}
              >
                Inactivos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl border-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 overflow-hidden">
        <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Listado de Alumnos</h3>
              <p className="text-sm text-slate-500 mt-1">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'alumno' : 'alumnos'}
                {searchQuery && ` (filtrado por "${searchQuery}")`}
                {statusFilter && ` (estado: ${statusFilter === 'active' ? 'activos' : 'inactivos'})`}
              </p>
            </div>
          </div>
        </div>
        <div className="p-0">
          {!filteredStudents || filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 rounded-3xl inline-flex mb-6 bg-gradient-to-br from-slate-100 to-slate-200">
                <Users className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || statusFilter ? 'No se encontraron alumnos' : 'No hay alumnos registrados'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter
                  ? 'Prueba con otros filtros o busca otro término'
                  : 'Invita tu primer alumno para empezar a usar la plataforma'
                }
              </p>
              {!searchQuery && !statusFilter && (
                <Link href="/alumnos/invitar">
                  <Button
                    className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Invitar Primer Alumno
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredStudents.map((student: any, index: number) => (
                <div
                  key={student.user_id}
                  className={cn(
                    "flex items-center gap-4 p-6 hover:bg-primary/[0.02] transition-all duration-200 group",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                  <Avatar className="h-14 w-14 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                    <AvatarFallback
                      className="text-sm font-semibold transition-all duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor
                      }}
                    >
                      {student.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base truncate">{student.profiles?.full_name || 'Sin nombre'}</p>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                          student.status === 'active'
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-slate-500/10 text-slate-500"
                        )}
                      >
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                          student.status === 'active' ? "bg-emerald-500" : "bg-slate-500"
                        )} />
                        {student.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{student.profiles?.email || 'Sin email'}</span>
                      </div>
                      {student.profiles?.phone && (
                        <>
                          <span>•</span>
                          <span>{student.profiles.phone}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Registro: {student.joined_at
                            ? format(new Date(student.joined_at), 'dd MMM yyyy', { locale: es })
                            : '-'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{student.lessonsCompleted} {student.lessonsCompleted === 1 ? 'clase' : 'clases'} completadas</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="hidden sm:flex items-center gap-3 pr-4">
                    {student.lessonsCompleted > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Award className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm font-semibold">{student.lessonsCompleted}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Clases</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// Force recompilation
