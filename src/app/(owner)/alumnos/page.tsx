import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Plus, Search, Filter, TrendingUp, Calendar, Activity, Award, BookOpen, Sparkles, ArrowRight, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { InviteCodeGenerator } from './invite-code-generator';
import { JoinCodesManager } from '@/components/owner/JoinCodesManager';
import { StudentsPageClient } from './StudentsPageClient';

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

  const { data: school } = await (supabase
    .from('schools')
    .select('id, name, primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any);

  const schoolId = membership.school_id;
  const schoolName = school?.name || 'Tu Autoescuela';
  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  const { data: students } = await (supabase
    .from('school_members')
    .select('user_id, status, joined_at, profiles(full_name, phone, activity_points)')
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .order('joined_at', { ascending: false }) as any);

  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter((s: any) => s.status === 'active').length || 0;
  const newStudentsThisWeek = students?.filter((s: any) => {
    if (!s.joined_at) return false;
    const joinedDate = new Date(s.joined_at);
    const weekAgo = subDays(new Date(), 7);
    return joinedDate >= weekAgo;
  }).length || 0;

  const params = await searchParams;
  const searchQuery = params.search?.toLowerCase();
  const statusFilter = params.filter;

  let filteredStudents = students;

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
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 border border-slate-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Alumnos de {schoolName}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600"></Sparkles>
                <span className="text-xs font-medium text-amber-700">Gestión</span>
              </div>
            </div>
            <p className="text-slate-600">
              Gestiona y monitorea el progreso de tus alumnos
            </p>
          </div>
        </div>
      </div>

      <StudentsPageClient primaryColor={primaryColor} secondaryColor={secondaryColor}>
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="w-full h-auto p-1 bg-slate-100 rounded-2xl">
            <TabsTrigger value="students" className="rounded-xl data-[state=active]:bg-white">
              <Users className="mr-2 h-4 w-4" />
              Alumnos
            </TabsTrigger>
            <TabsTrigger value="codes" className="rounded-xl data-[state=active]:bg-white">
              <Code className="mr-2 h-4 w-4" />
              Códigos de Acceso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-700 mb-2">Total Alumnos</p>
                    <p className="text-5xl font-bold text-slate-900 leading-none">{totalStudents}</p>
                    <p className="text-sm text-slate-500 mt-1">Registrados</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center">
                    <Users className="h-6 w-6 text-white"></Users>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-700 mb-2">Activos</p>
                    <p className="text-5xl font-bold text-slate-900 leading-none">{activeStudents}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="h-4 w-4 text-emerald-500"></TrendingUp>
                      <p className="text-sm font-semibold text-emerald-600">
                        {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white"></Activity>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-700 mb-2">Nuevos</p>
                    <p className="text-5xl font-bold text-slate-900 leading-none">{newStudentsThisWeek}</p>
                    <p className="text-sm text-slate-500 mt-1">Esta semana</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white"></Calendar>
                  </div>
              </div>

              <div className="group relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-700 mb-2">Promedio Progreso</p>
                    <p className="text-5xl font-bold text-slate-900 leading-none">--%</p>
                    <p className="text-sm text-slate-500 mt-1">Completitud media</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white"></BookOpen>
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border-2 border-slate-100 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input placeholder="Buscar alumno por nombre..." name="search" defaultValue={searchQuery} />
                </div>
                <div className="flex gap-2">
                  <Link href="/alumnos">
                    <Button variant={statusFilter === undefined ? "default" : "outline"} className="rounded-full">Todos</Button>
                  </Link>
                  <Link href="/alumnos?filter=active">
                    <Button variant={statusFilter === 'active' ? "default" : "outline"} className="rounded-full">Activos</Button>
                  </Link>
                  <Link href="/alumnos?filter=suspended">
                    <Button variant={statusFilter === 'suspended' ? "default" : "outline"} className="rounded-full">Inactivos</Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="border-b p-6">
                <h3 className="text-lg font-semibold text-slate-900">Listado de Alumnos</h3>
                <p className="text-sm text-slate-500">{filteredStudents.length} alumnos</p>
              </div>
              <div className="p-0">
                {!filteredStudents || filteredStudents.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-16 w-16 text-slate-400 mx-auto mb-6"></Users>
                    <h3 className="text-xl font-semibold mb-2">No hay alumnos registrados</h3>
                    <p className="text-slate-500 mb-6">Invita tu primer alumno para empezar a usar la plataforma</p>
                    <Link href="/alumnos/invitar">
                      <Button>Invitar Primer Alumno</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredStudents.map((student: any) => (
                      <Link key={student.user_id} href={`/alumnos/${student.user_id}`} className="block">
                        <div className="flex items-center gap-4 p-6 hover:bg-slate-50 border border-transparent hover:border-slate-200">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
                              {student.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg">{student.profiles?.full_name || 'Sin nombre'}</p>
                              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                                <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 inline-block', student.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500')}></span>
                                {student.status === 'active' ? 'Activo' : 'Inactivo'}
                              </span>
                              </span>
                            </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4"></Calendar>
                                <span>Registro: {student.joined_at ? format(new Date(student.joined_at), 'dd MMM yyyy', { locale: es }) : '-'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4"></BookOpen>
                                <span>0 clases</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300"></ArrowRight>
                      </div>
                    </Link>
                  ))}
                </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="codes" className="mt-6">
            <JoinCodesManager primaryColor={primaryColor} secondaryColor={secondaryColor} />
          </TabsContent>
        </Tabs>
      </StudentsPageClient>
    </div>
  );
}
