'use client';

import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Play,
  TrendingUp,
  Award,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Zap,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  const router = useRouter();
  const [modules, setModules] = useState<any[]>([]);
  const [filteredModules, setFilteredModules] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [activityPoints, setActivityPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Handle search
  const handleSearch = () => {
    if (!query.trim()) {
      setFilteredModules(modules);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = modules.map((module: any) => ({
      ...module,
      lessons: module.lessons?.filter((lesson: any) =>
        lesson.title?.toLowerCase().includes(searchLower) ||
        lesson.description?.toLowerCase().includes(searchLower)
      ) || []
    })).filter((module: any) => module.lessons?.length > 0);

    setFilteredModules(filtered);
  };

  // Update filtered modules when modules change
  useEffect(() => {
    setFilteredModules(modules);
  }, [modules]);

  // Update filtered modules when query changes
  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    } else {
      setFilteredModules(modules);
    }
  }, [query]);

  // Use filtered modules for display
  const displayModules = query.trim() ? filteredModules : modules;

  useEffect(() => {
    async function loadData() {
      try {
        // Check auth
        const supabaseResponse = await fetch('/api/auth/user');
        if (!supabaseResponse.ok) {
          router.push('/iniciar-sesion');
          return;
        }
        const userData = await supabaseResponse.json();

        // Get school and modules data
        const [schoolResponse, modulesResponse, progressResponse] = await Promise.all([
          fetch('/api/user/school'),
          fetch('/api/user/modules'),
          fetch('/api/user/progress'),
        ]);

        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          setSchool(schoolData);
        }

        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json();
          setModules(modulesData);
        }

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setCompletedLessonIds(new Set(progressData.completedLessonIds || []));
          setActivityPoints(progressData.activityPoints || 0);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 md:p-8">
          <div className="h-8 w-64 bg-white/40 rounded-xl animate-pulse" />
          <div className="h-10 w-96 bg-white/30 rounded-2xl mt-4 animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-5 grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse mb-4" />
              <div className="h-12 w-20 bg-gray-100 animate-pulse" />
              <div className="h-4 w-24 bg-gray-50 animate-pulse mt-2" />
            </div>
          ))}
        </div>

        {/* Continue Learning Skeleton */}
        <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex gap-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
            <div className="flex-1">
              <div className="h-6 w-48 bg-gray-100 animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalLessons = modules?.reduce(
    (sum: number, m: any) => sum + (m.lessons?.length || 0),
    0
  ) || 0;
  const completedLessons = completedLessonIds.size;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next lesson (first uncompleted)
  let nextModule: any = null;
  let nextLesson: any = null;
  let currentModuleIndex = 0;

  for (const module of modules || []) {
    for (const lesson of module.lessons || []) {
      if (!completedLessonIds.has(lesson.id)) {
        nextModule = module;
        nextLesson = lesson;
        break;
      }
    }
    if (nextLesson) break;
    currentModuleIndex++;
  }

  return (
    <div className="space-y-6">
      {/* === HEADER WELCOME PREMIUM === */}
      <div
        className="relative overflow-hidden rounded-[20px] p-8 border"
        style={{
          background: `linear-gradient(to bottom right, ${school?.primary_color || '#3b82f6'}08 0%, ${school?.secondary_color || '#1e40af'}05 50%, white 100%)`,
          borderColor: `${school?.primary_color || '#3b82f6'}20`
        }}
      >
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"
            style={{ background: `linear-gradient(135deg, ${school?.primary_color || '#3b82f6'}30 0%, ${school?.secondary_color || '#1e40af'}20 100%)` }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"
            style={{ animationDelay: '1s', background: `linear-gradient(135deg, ${school?.secondary_color || '#1e40af'}30 0%, ${school?.primary_color || '#3b82f6'}20 100%)` }}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${school?.primary_color || '#3b82f6'} 0%, ${school?.secondary_color || '#1e40af'} 100%)`,
                boxShadow: `0 10px 40px ${school?.primary_color || '#3b82f6'}40`
              }}
            >
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border text-sm font-semibold"
              style={{
                borderColor: `${school?.primary_color || '#3b82f6'}30`,
                color: school?.primary_color || '#3b82f6'
              }}
            >
              Panel del Alumno
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Bienvenido de nuevo
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Continúa con tu formación de conductor. Cada clase te acerca más a tu objetivo.
          </p>
        </div>
      </div>

      {/* === SEARCH BAR === */}
      <div className="px-6 mb-6">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 text-gray-400"
            strokeWidth={2}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Buscar lecciones por nombre o tema..."
            className="flex-1 pl-10 pr-10 py-2.5 bg-white border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 p-1.5 rounded-lg hover:bg-gray-100"
              type="button"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* === STAT CARDS PREMIUM === */}
      <div className="grid gap-5 grid-cols-4">
        <div
          className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none"
          style={{
            animationDelay: '100ms',
            borderColor: `${school?.primary_color || '#3b82f6'}20`
          }}
        >
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom right, ${school?.primary_color || '#3b82f6'}08 0%, ${school?.secondary_color || '#1e40af'}08 100%)`,
              opacity: 0
            }}
          />
          <div
            className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none group-hover:opacity-100"
            style={{
              background: `linear-gradient(to bottom right, ${school?.primary_color || '#3b82f6'}15 0%, ${school?.secondary_color || '#1e40af'}15 100%)`
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${school?.primary_color || '#3b82f6'} 0%, ${school?.secondary_color || '#1e40af'} 100%)`
                }}
              >
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-5xl font-bold text-slate-900 leading-none mb-2">{modules?.length || 0}</p>
            <p className="text-sm text-slate-500 font-medium">Temas</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-emerald-50/0 to-green-50/0 group-hover:from-emerald-50/50 group-hover:to-green-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-5xl font-bold text-slate-900 leading-none mb-2">{completedLessons}</p>
            <p className="text-sm text-slate-500 font-medium">Completadas</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-violet-50/0 to-purple-50/0 group-hover:from-violet-50/50 group-hover:to-purple-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-5xl font-bold text-slate-900 leading-none mb-2">{progressPercentage}%</p>
            <p className="text-sm text-slate-500 font-medium">Progreso</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '250ms' }}>
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-orange-50/0 to-amber-50/0 group-hover:from-orange-50/50 group-hover:to-amber-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-5xl font-bold text-slate-900 leading-none mb-2">{activityPoints}</p>
            <p className="text-sm text-slate-500 font-medium">Puntos</p>
          </div>
        </div>
      </div>

      {/* === CONTINUE LEARNING CARD PREMIUM === */}
      {nextLesson && nextModule ? (
        <Link href={`/cursos/${nextModule.id}/${nextLesson.id}`} className="block group">
          <div
            className="relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none cursor-pointer border-2"
            style={{
              animationDelay: '300ms',
              borderColor: `${school?.primary_color || '#3b82f6'}20`
            }}
          >
            <div
              className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom right, ${school?.primary_color || '#3b82f6'}08 0%, ${school?.secondary_color || '#1e40af'}08 100%)`,
                opacity: 0
              }}
            />
            <div
              className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none group-hover:opacity-100"
              style={{
                background: `linear-gradient(to bottom right, ${school?.primary_color || '#3b82f6'}15 0%, ${school?.secondary_color || '#1e40af'}15 100%)`
              }}
            />
            <div className="relative flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${school?.primary_color || '#3b82f6'} 0%, ${school?.secondary_color || '#1e40af'} 100%)`
                  }}
                >
                  <Play className="h-7 w-7 text-white fill-white ml-1" />
                </div>
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
                    style={{
                      background: `${school?.primary_color || '#3b82f6'}15`,
                      color: school?.primary_color || '#3b82f6'
                    }}
                  >
                    <Zap className="h-4 w-4" />
                    Continúa Aprendiendo
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{nextModule.title}</p>
                  <h3
                    className="text-lg font-bold text-slate-900 transition-colors"
                    style={{
                      '--hover-color': school?.primary_color || '#3b82f6'
                    } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.color = school?.primary_color || '#3b82f6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#0f172a'}
                  >
                    {nextLesson.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      ~15 min
                    </span>
                    <span
                      className="flex items-center gap-1.5 font-medium"
                      style={{ color: school?.primary_color || '#3b82f6' }}
                    >
                      <Target className="h-4 w-4" />
                      +10 puntos
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, ${school?.primary_color || '#3b82f6'} 0%, ${school?.secondary_color || '#1e40af'} 100%)`
                  }}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <ChevronRight
                  className="h-6 w-6 text-slate-300 group-hover:translate-x-1 transition-all duration-200"
                  style={{
                    transitionProperty: 'color, transform'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = school?.primary_color || '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                />
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white shadow-xl animate-fade-in">
          <div className="absolute inset-0 bg-grid-white/[0.1] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Award className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">¡Felicidades!</h3>
              <p className="opacity-90 text-lg">Has completado todo el contenido disponible</p>
            </div>
            <Link href="/cursos">
              <Button className="bg-white text-emerald-600 hover:bg-white/90 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                Repasar
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* === HEADER DE TEMAS PREMIUM === */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Todos los Temas</h2>
        <Link href="/cursos">
          <Button
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 group"
            style={{
              color: school?.primary_color || '#3b82f6'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${school?.primary_color || '#3b82f6'}10`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Ver todo
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* === GRID DE TARJETAS DE TEMAS PREMIUM === */}
      {!modules || modules.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 mb-6 shadow-lg">
            <BookOpen className="h-16 w-16 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-3">Sin contenido</h3>
          <p className="text-slate-500">No hay contenido disponible todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayModules.map((module: any, index: number) => {
            const moduleLessons = module.lessons || [];
            const moduleCompleted = moduleLessons.filter(
              (l: any) => completedLessonIds.has(l.id)
            ).length;
            const moduleProgress = moduleLessons.length > 0
              ? Math.round((moduleCompleted / moduleLessons.length) * 100)
              : 0;
            const isLocked = index > currentModuleIndex && moduleProgress === 0;
            const isCompleted = moduleProgress === 100;
            const animationDelay = Math.min(350 + index * 75, 700);

            return (
              <Link key={module.id} href={isLocked ? '#' : `/cursos/${module.id}`} className="block">
                <div
                  className={cn(
                    'bg-white rounded-[20px] p-6 transition-all duration-300 relative animate-fade-in group border-2',
                    // Sombras premium
                    'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
                    !isLocked && 'hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer select-none',
                    isLocked && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{
                    animationDelay: `${animationDelay}ms`,
                    borderColor: `${school?.primary_color || '#3b82f6'}15`
                  }}
                >
                  {/* Background gradient on hover */}
                  {!isLocked && (
                    <>
                      <div
                        className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none"
                        style={{
                          background: `linear-gradient(to bottom right, ${school?.primary_color || '#3b82f6'}08 0%, ${school?.secondary_color || '#1e40af'}08 100%)`,
                          opacity: 0
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-[20px] transition-all duration-300 pointer-events-none group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(to bottom right, ${school?.primary_color || '#3b82f6'}15 0%, ${school?.secondary_color || '#1e40af'}15 100%)`
                        }}
                      />
                    </>
                  )}

                  {/* Header con icono */}
                  <div className="flex items-start justify-between mb-4 relative">
                    <div className="flex-1">
                      {/* Icono circular */}
                      <div
                        className={cn(
                          'w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300',
                          isLocked
                            ? 'bg-slate-100'
                            : isCompleted
                              ? 'bg-emerald-50 group-hover:bg-emerald-100'
                              : 'group-hover:scale-110 shadow-md',
                          !isLocked && !isCompleted && 'rounded-2xl'
                        )}
                        style={
                          !isLocked && !isCompleted
                            ? {
                                background: `linear-gradient(135deg, ${school?.primary_color || '#3b82f6'} 0%, ${school?.secondary_color || '#1e40af'} 100%)`
                              }
                            : {}
                        }
                      >
                        {isLocked ? (
                          <Lock className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
                        ) : isCompleted ? (
                          <CheckCircle2 className="h-7 w-7 text-emerald-600" strokeWidth={2} />
                        ) : (
                          <BookOpen className="h-7 w-7 text-white" />
                        )}
                      </div>

                      <h3
                        className={cn(
                          'text-lg font-bold leading-tight mb-2 transition-colors',
                          isLocked ? 'text-slate-500' : 'text-slate-900'
                        )}
                        style={
                          !isLocked
                            ? {
                                '--hover-color': school?.primary_color || '#3b82f6'
                              } as React.CSSProperties
                            : {}
                        }
                        onMouseEnter={(e) => {
                          if (!isLocked) e.currentTarget.style.color = school?.primary_color || '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          if (!isLocked) e.currentTarget.style.color = '#0f172a';
                        }}
                      >
                        {module.title}
                      </h3>

                      {module.description && (
                        <p className={cn(
                          'text-sm line-clamp-2',
                          isLocked ? 'text-slate-400' : 'text-slate-500'
                        )}>
                          {module.description}
                        </p>
                      )}
                    </div>

                    {/* Chevron indicator */}
                    {!isLocked && (
                      <ChevronRight
                        className="h-5 w-5 text-slate-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 mt-1"
                        style={{ transitionProperty: 'color, transform' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = school?.primary_color || '#3b82f6'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                      />
                    )}
                  </div>

                  {/* Progreso o estado bloqueado */}
                  {isLocked ? (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5" />
                        Completa el tema anterior
                      </p>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-3">
                      {/* Mini barra de progreso */}
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isCompleted && 'animate-pulse'
                          )}
                          style={{
                            width: `${moduleProgress}%`,
                            background: isCompleted
                              ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                              : `linear-gradient(90deg, ${school?.primary_color || '#3B82F6'} 0%, ${school?.secondary_color || '#1E40AF'} 100%)`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {moduleCompleted} de {moduleLessons.length} clases
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completado
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
