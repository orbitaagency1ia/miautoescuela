import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Plus,
  Video,
  FolderOpen,
  Layers,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Target,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function ModulesPage() {
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

  if (!school) {
    redirect('/setup');
  }

  const primaryColor = school.primary_color || '#3B82F6';
  const secondaryColor = school.secondary_color || '#1E40AF';
  const schoolId = school.id;

  // Get modules with lessons
  const { data: modules } = await (supabase
    .from('modules')
    .select(`
      id,
      title,
      description,
      order_index,
      is_published,
      lessons (
        id,
        title,
        description,
        order_index,
        is_published
      )
    `)
    .eq('school_id', schoolId)
    .order('order_index', { ascending: true }) as any);

  // Calculate stats
  const totalModules = modules?.length || 0;
  const publishedModules = modules?.filter((m: any) => m.is_published).length || 0;
  const totalLessons = modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const publishedLessons = modules?.reduce(
    (acc: number, m: any) => acc + (m.lessons?.filter((l: any) => l.is_published).length || 0),
    0
  ) || 0;

  const stats = [
    {
      title: 'Temas',
      value: totalModules,
      description: `${publishedModules} publicados`,
      icon: FolderOpen,
      bgClass: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Clases',
      value: totalLessons,
      description: `${publishedLessons} publicadas`,
      icon: Video,
      bgClass: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Contenido',
      value: totalModules > 0 ? `${Math.round((publishedModules / totalModules) * 100)}%` : '0%',
      description: 'Completitud',
      icon: Layers,
      bgClass: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ];

  const tips = [
    { icon: Target, text: 'Organiza tus temas en orden lógico para facilitar el aprendizaje' },
    { icon: Zap, text: 'Mantén los videos cortos (5-15 min) para mejor retención' },
    { icon: Award, text: 'Publica contenido regularmente para mantener el engagement' },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8 border border-blue-100">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Gestión de Contenido</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Temas y Clases
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Organiza y gestiona todo el contenido educativo de tu autoescuela
            </p>
          </div>
          <Link href="/temas/crear">
            <Button
              size="lg"
              className="rounded-full hover:shadow-[0_8px_24px_rgba(59,130,246,0.25)] transition-all duration-300 hover:scale-105 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Tema
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-200/50 animate-fade-in select-none"
              style={{ animationDelay: `${100 + stats.indexOf(stat) * 75}ms` }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 transition-all duration-300 pointer-events-none" />
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight mb-1 text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.description}</p>
                </div>
                <div className={cn(
                  'p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                  stat.bgClass
                )}>
                  <Icon className={cn('h-6 w-6', stat.iconColor)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      {!modules || modules.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="p-6 rounded-3xl mb-6 shadow-[0_8px_24px_rgba(59,130,246,0.15)]"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
              }}
            >
              <BookOpen className="h-16 w-16" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900">No hay temas creados</h3>
            <p className="text-slate-500 mb-6 text-center max-w-md">
              Crea tu primer tema para empezar a organizar el contenido educativo de tu autoescuela
            </p>
            <Link href="/temas/crear">
              <Button
                size="lg"
                className="rounded-full hover:shadow-[0_8px_24px_rgba(59,130,246,0.25)] transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Crear Primer Tema
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module: any, index: number) => {
            const animationDelay = Math.min(300 + index * 75, 700);
            return (
              <Link
                key={module.id}
                href={`/temas/${module.id}`}
                className="block group"
              >
                <div
                  className="overflow-hidden rounded-2xl bg-white border-2 border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.2)] hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 animate-fade-in select-none cursor-pointer"
                  style={{ animationDelay: `${animationDelay}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/30 transition-all duration-300 pointer-events-none" />

                  <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-5 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          }}
                        >
                          <FolderOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
                                module.is_published
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                              )}
                            >
                              {module.is_published ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Publicado
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Borrador
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="font-medium">{module.lessons?.length || 0} {module.lessons?.length === 1 ? 'clase' : 'clases'}</span>
                            {module.description && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="inline text-slate-500">{module.description}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 relative">
                    {module.lessons && module.lessons.length > 0 ? (
                      <div className="space-y-2">
                        {module.lessons.slice(0, 3).map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 transition-all duration-200 group-hover:border-slate-300"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className="p-2 rounded-lg transition-all duration-200"
                                style={{
                                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                                }}
                              >
                                <Video className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-xs text-slate-500">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium border',
                                lesson.is_published
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                              )}
                            >
                              {lesson.is_published ? 'Publicado' : 'Borrador'}
                            </span>
                          </div>
                        ))}
                        {module.lessons.length > 3 && (
                          <p className="text-center text-sm text-slate-500 py-2 flex items-center justify-center gap-2">
                            Y {module.lessons.length - 3} clases más
                            <ChevronRight className="h-4 w-4" />
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        <Video className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay clases en este tema</p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 animate-fade-in" style={{ animationDelay: '800ms' }}>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Consejos para tu Contenido
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
