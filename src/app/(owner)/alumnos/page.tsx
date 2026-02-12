import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Plus, Search, Filter, TrendingUp, Calendar, Clock, Activity, Award, BookOpen, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
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
    .select('id, name, primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  const schoolId = membership.school_id;
  const schoolName = school?.name || 'Tu Autoescuela';
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
        phone,
        activity_points
      )
    `)
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .order('joined_at', { ascending: false }) as any);

  // Get ALL modules and lessons for this school to calculate accurate progress
  const { data: modules } = await (supabase
    .from('modules')
    .select(`
      id,
      lessons (
        id,
        is_published
      )
    `)
    .eq('school_id', schoolId)
    .eq('is_published', true) as any);

  // Calculate total available lessons
  const allLessons = modules?.flatMap((m: any) => m.lessons?.filter((l: any) => l.is_published) || []) || [];
  const totalAvailableLessons = allLessons.length;

  // Get lesson progress for all students
  const userIds = students?.map((s: any) => s.user_id) || [];

  // Get lesson progress for all students
  const { data: lessonProgress } = userIds.length > 0 ? await (supabase
    .from('lesson_progress')
    .select('user_id, lesson_id, completed_at')
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

  // Calculate completion rates per student with accurate percentages
  const studentProgress = new Map<string, { completed: number; percentage: number }>();
  lessonProgress?.forEach((progress: any) => {
    const current = studentProgress.get(progress.user_id)?.completed || 0;
    studentProgress.set(progress.user_id, { completed: current + 1, percentage: 0 });
  });

  // Calculate percentages after counting all completed lessons
  studentProgress.forEach((data, userId) => {
    const percentage = totalAvailableLessons > 0
      ? Math.round((data.completed / totalAvailableLessons) * 100)
      : 0;
    studentProgress.set(userId, { ...data, percentage });
  });

  // Add progress data to students
  const studentsWithProgress = students?.map((s: any) => {
    const progress = studentProgress.get(s.user_id) || { completed: 0, percentage: 0 };
    return {
      ...s,
      lessonsCompleted: progress.completed,
      progressPercentage: progress.percentage,
      totalAvailableLessons,
    };
  }) || [];

  // Calculate average completion
  const totalCompleted = Array.from(studentProgress.values()).reduce((a, b) => a + b.completed, 0);
  const avgCompletion = totalStudents > 0 ? Math.round((totalCompleted / (totalStudents * totalAvailableLessons || 1)) * 100) : 0;

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
      s.profiles?.full_name?.toLowerCase().includes(searchQuery)
    );
  }

  if (statusFilter) {
    filteredStudents = filteredStudents.filter((s: any) => s.status === statusFilter);
  }

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 border border-slate-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Alumnos de {schoolName}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Gestión</span>
              </div>
            </div>
            <p className="text-slate-600">
              Gestiona y monitorea el progreso de tus alumnos
            </p>
          </div>
          <Link href="/alumnos/invitar">
            <Button
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Plus className="mr-2 h-5 w-5" />
              Invitar Alumno
            </Button>
          </Link>
        </div>
      </div>

      {/* Invite Code Generator */}
      <InviteCodeGenerator primaryColor={primaryColor} secondaryColor={secondaryColor} />

      {/* Stats Grid - Premium */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Total Alumnos</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{totalStudents}</p>
                <p className="text-sm text-slate-500 mt-1">Registrados</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '75ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Activos</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{activeStudents}</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-600">
                    {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Nuevos</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{newStudentsThisWeek}</p>
                <p className="text-sm text-slate-500 mt-1">Esta semana</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '225ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Promedio Progreso</p>
                <p className="text-5xl font-bold text-slate-900 leading-none">{avgCompletion}<span className="text-2xl text-slate-400">%</span></p>
                <p className="text-sm text-slate-500 mt-1">Completitud media</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[20px] border-2 border-slate-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 transition-colors duration-200 group-focus-within:text-blue-500">
                <Search className="h-5 w-5 text-slate-400" strokeWidth={2} />
              </div>
              <Input
                placeholder="Buscar alumno por nombre..."
                className="pl-12 pr-4 rounded-2xl border-2 h-12 bg-slate-50/50 focus:bg-white transition-colors duration-200 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                name="search"
                defaultValue={searchQuery}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Link href="/alumnos" className="block">
              <Button
                variant={statusFilter === undefined ? "default" : "outline"}
                className="rounded-2xl h-12 px-6 font-semibold transition-all duration-200 hover:scale-105"
                style={!statusFilter ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  border: 'none',
                  color: 'white'
                } : {}}
              >
                Todos
              </Button>
            </Link>
            <Link href="/alumnos?filter=active" className="block">
              <Button
                variant={statusFilter === 'active' ? "default" : "outline"}
                className="rounded-2xl h-12 px-6 font-semibold transition-all duration-200 hover:scale-105"
                style={statusFilter === 'active' ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  border: 'none',
                  color: 'white'
                } : {}}
              >
                Activos
              </Button>
            </Link>
            <Link href="/alumnos?filter=suspended" className="block">
              <Button
                variant={statusFilter === 'suspended' ? "default" : "outline"}
                className="rounded-2xl h-12 px-6 font-semibold transition-all duration-200 hover:scale-105"
                style={statusFilter === 'suspended' ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  border: 'none',
                  color: 'white'
                } : {}}
              >
                Inactivos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
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
              <p className="text-slate-500 mb-6">
                {searchQuery || statusFilter
                  ? 'Prueba con otros filtros o busca otro término'
                  : 'Invita tu primer alumno para empezar a usar la plataforma'
                  }
              </p>
              {!searchQuery && !statusFilter && (
                <Link href="/alumnos/invitar">
                  <Button
                    className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
            <div className="divide-y divide-slate-100">
              {filteredStudents.map((student: any, index: number) => (
                <Link
                  key={student.user_id}
                  href={`/alumnos/${student.user_id}`}
                  className="block"
                >
                  <div
                    className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-all duration-300 group cursor-pointer animate-fade-in border border-transparent hover:border-slate-200"
                    style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
                  >
                    <Avatar className="h-14 w-14 ring-2 ring-slate-200 group-hover:ring-primary/20 transition-all">
                      <AvatarFallback
                        className="text-sm font-semibold transition-all duration-200 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }}
                      >
                        {student.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg truncate text-slate-900 group-hover:text-blue-600 transition-colors">{student.profiles?.full_name || 'Sin nombre'}</p>
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                            student.status === 'active'
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                            student.status === 'active' ? "bg-emerald-500" : "bg-slate-500"
                          )} />
                          {student.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Registro: {student.joined_at
                              ? format(new Date(student.joined_at), 'dd MMM yyyy', { locale: es })
                              : '-'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          <span>{student.lessonsCompleted} de {student.totalAvailableLessons || 0} clases</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="hidden sm:flex items-center gap-4 pr-4">
                      {student.totalAvailableLessons > 0 && (
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 rounded-xl bg-amber-100">
                              <Award className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">{student.progressPercentage}%</span>
                          </div>
                          <p className="text-xs text-slate-500">{student.lessonsCompleted} completadas</p>
                        </div>
                      )}
                      <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
