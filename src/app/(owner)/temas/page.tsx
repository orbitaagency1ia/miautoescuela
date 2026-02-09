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
      gradient: 'from-blue-500 to-blue-600',
      bgGlow: 'bg-blue-500/10',
    },
    {
      title: 'Clases',
      value: totalLessons,
      description: `${publishedLessons} publicadas`,
      icon: Video,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      title: 'Contenido',
      value: totalModules > 0 ? `${Math.round((publishedModules / totalModules) * 100)}%` : '0%',
      description: 'Completitud',
      icon: Layers,
      gradient: 'from-violet-500 to-violet-600',
      bgGlow: 'bg-violet-500/10',
    },
  ];

  const tips = [
    { icon: Target, text: 'Organiza tus temas en orden lógico para facilitar el aprendizaje' },
    { icon: Zap, text: 'Mantén los videos cortos (5-15 min) para mejor retención' },
    { icon: Award, text: 'Publica contenido regularmente para mantener el engagement' },
  ];

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 md:p-10 border border-blue-100">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Gestión de Contenido</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Temas y Clases
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Organiza y gestiona todo el contenido educativo de tu autoescuela
            </p>
          </div>
          <Link href="/temas/crear">
            <Button
              size="lg"
              className="rounded-full hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-200 hover:scale-105"
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 mb-2">{stat.title}</p>
                  <p className="text-4xl font-bold tracking-tight mb-1 text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.description}</p>
                </div>
                <div className={cn('p-3 rounded-2xl transition-all duration-200 group-hover:scale-110 group-hover:rotate-3', stat.bgGlow)}>
                  <Icon className={cn('h-6 w-6 bg-gradient-to-br bg-clip-text text-transparent', stat.gradient)} />
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
              className="p-6 rounded-3xl mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
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
                className="rounded-full hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-200 hover:scale-105"
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
          {modules.map((module: any, index: number) => (
            <div
              key={module.id}
              className="group overflow-hidden rounded-2xl bg-white border-2 border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      }}
                    >
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-slate-900">{module.title}</h3>
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold border',
                            module.is_published
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
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
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>{module.lessons?.length || 0} {module.lessons?.length === 1 ? 'clase' : 'clases'}</span>
                        {module.description && (
                          <>
                            <span>•</span>
                            <span className="inline text-slate-500">{module.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/temas/${module.id}`}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {module.lessons && module.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {module.lessons.slice(0, 3).map((lesson: any, lessonIndex: number) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            }}
                          >
                            <Video className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-slate-500">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium border',
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
                      <p className="text-center text-sm text-slate-500 py-2">
                        Y {module.lessons.length - 3} clases más...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay clases en este tema</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
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
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200"
              >
                <div className="p-2 rounded-lg bg-amber-500/10">
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
