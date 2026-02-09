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
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  const router = useRouter();
  const [modules, setModules] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
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
  const userPoints = completedLessons * 10;

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
    <main className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-6xl mx-auto px-8 py-8">
          {/* === HEADER WELCOME === */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Panel del Alumno</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl">
              Continúa con tu formación de conductor. Cada clase te acerca más a tu objetivo.
            </p>
          </div>

          {/* === STAT CARDS APPLE STYLE === */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{modules?.length || 0}</p>
              <p className="text-xs text-gray-500">Temas</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{completedLessons}</p>
              <p className="text-xs text-gray-500">Completadas</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{progressPercentage}%</p>
              <p className="text-xs text-gray-500">Progreso</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{userPoints}</p>
              <p className="text-xs text-gray-500">Puntos</p>
            </div>
          </div>

          {/* === CONTINUE LEARNING CARD APPLE STYLE === */}
          {nextLesson && nextModule ? (
            <Link href={`/cursos/${nextModule.id}/${nextLesson.id}`} className="block">
              <div className="bg-white rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer mb-8">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Play className="h-8 w-8 text-white fill-white ml-1" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-2">
                        <Zap className="h-4 w-4" />
                        Continúa Aprendiendo
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{nextModule.title}</p>
                      <h3 className="text-xl font-bold text-gray-900">{nextLesson.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          ~15 min
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Target className="h-4 w-4" />
                          +10 puntos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Award className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">¡Felicidades! 🎉</h3>
                  <p className="opacity-90">Has completado todo el contenido disponible</p>
                </div>
                <Link href="/cursos">
                  <Button className="bg-white text-green-600 hover:bg-white/90 rounded-xl px-6 py-3 font-semibold">
                    Repasar
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* === HEADER DE TEMAS APPLE STYLE === */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Todos los Temas</h2>
            <Link href="/cursos">
              <Button className="text-blue-600 hover:bg-blue-50 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 group">
                Ver todo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* === GRID DE TARJETAS DE TEMAS APPLE STYLE === */}
          {!modules || modules.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="inline-flex p-6 rounded-3xl bg-blue-50 mb-6">
                <BookOpen className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Sin contenido</h3>
              <p className="text-gray-500">No hay contenido disponible todavía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((module: any, index: number) => {
                const moduleLessons = module.lessons || [];
                const moduleCompleted = moduleLessons.filter(
                  (l: any) => completedLessonIds.has(l.id)
                ).length;
                const moduleProgress = moduleLessons.length > 0
                  ? Math.round((moduleCompleted / moduleLessons.length) * 100)
                  : 0;
                const isLocked = index > currentModuleIndex && moduleProgress === 0;
                const isCompleted = moduleProgress === 100;

                return (
                  <Link key={module.id} href={isLocked ? '#' : `/cursos/${module.id}`}>
                    <div
                      className={cn(
                        'bg-white rounded-2xl p-6 transition-all duration-200 relative',
                        // Sin bordes, solo sombra suave
                        'shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
                        !isLocked && 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 cursor-pointer',
                        isLocked && 'opacity-50 cursor-default'
                      )}
                    >
                      {/* Header con icono */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Icono circular */}
                          <div
                            className={cn(
                              'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
                              isLocked
                                ? 'bg-gray-100'
                                : isCompleted
                                  ? 'bg-green-50'
                                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            )}
                          >
                            {isLocked ? (
                              <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" strokeWidth={2} />
                            ) : (
                              <BookOpen className="h-6 w-6 text-white" />
                            )}
                          </div>

                          <h3 className={cn(
                            'text-base font-semibold leading-tight mb-2',
                            isLocked ? 'text-gray-500' : 'text-gray-900'
                          )}>
                            {module.title}
                          </h3>

                          {module.description && (
                            <p className={cn(
                              'text-sm line-clamp-2',
                              isLocked ? 'text-gray-400' : 'text-gray-500'
                            )}>
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progreso o estado bloqueado */}
                      {isLocked ? (
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-400 flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5" />
                            Completa el tema anterior
                          </p>
                        </div>
                      ) : (
                        <div className="pt-4 space-y-3">
                          {/* Mini barra de progreso */}
                          <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${moduleProgress}%`,
                                background: isCompleted
                                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                                  : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {moduleCompleted} de {moduleLessons.length} clases
                            </span>
                            {isCompleted && (
                              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
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

          {/* === FOOTER SUTIL === */}
          <footer className="mt-auto py-10 text-center">
            <p className="text-[12px] text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors duration-200">
              © 2025 miAutoescuela · Creado por <span className="hover:text-[#9CA3AF] transition-colors cursor-pointer">OrbitaAgency</span>
            </p>
          </footer>
      </div>
    </main>
  );
}
