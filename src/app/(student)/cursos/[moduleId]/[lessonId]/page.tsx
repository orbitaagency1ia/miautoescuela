import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronLeft, ChevronRight, PlayCircle, Clock, BookOpen, Lock, Award, Zap, ArrowLeft, Home, List, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LessonsSidebar } from '@/components/student/LessonsSidebar';
import { PremiumMarkCompleteButton } from '@/components/student/PremiumMarkCompleteButton';

interface PageProps {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  const { moduleId, lessonId } = await params;

  // Get school branding
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  const { data: school } = membership?.school_id ? await (supabase
    .from('schools')
    .select('primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any) : null;

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  // Get lesson with module info
  const { data: lesson } = await (supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      video_path,
      order_index,
      modules (
        id,
        title
      )
    `)
    .eq('id', lessonId)
    .eq('module_id', moduleId)
    .eq('is_published', true)
    .single() as any);

  if (!lesson) {
    redirect('/cursos');
  }

  // Get all lessons in module for navigation
  const { data: moduleLessons } = await (supabase
    .from('lessons')
    .select('id, title, order_index, video_path, description')
    .eq('module_id', moduleId)
    .eq('is_published', true)
    .order('order_index', { ascending: true }) as any);

  // Get all completed lessons for this user
  const { data: completedLessons } = await (supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id) as any);

  const completedLessonIds = new Set(completedLessons?.map((p: any) => p.lesson_id) || []);

  const lessons = moduleLessons || [];
  const currentIndex = lessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const isCompleted = completedLessonIds.has(lessonId);

  // Calculate progress
  const progressPercentage = lessons.length > 0
    ? Math.round((completedLessonIds.size / lessons.length) * 100)
    : 0;

  // Get video URL if exists
  let videoUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  if (lesson.video_path) {
    const { data } = await (supabase
      .storage
      .from('lesson-videos')
      .createSignedUrl(lesson.video_path, 3600) as any);
    videoUrl = data?.signedUrl || null;

    // Generate thumbnail URL
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
      url.pathname = `/storage/v1/object/public/lesson-videos/${lesson.video_path}`;
      url.searchParams.set('width', '1280');
      url.searchParams.set('height', '720');
      thumbnailUrl = url.toString();
    } catch {
      thumbnailUrl = null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30">
      {/* === PREMIUM HEADER === */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Premium */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/inicio">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl hover:bg-gray-100 transition-all duration-200 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Inicio</span>
                </Button>
              </Link>
              <span className="text-gray-300">/</span>
              <Link href="/cursos">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl hover:bg-gray-100 transition-all duration-200 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <List className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Cursos</span>
                </Button>
              </Link>
              <span className="text-gray-300">/</span>
              <Link href={`/cursos/${moduleId}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl hover:bg-gray-100 transition-all duration-200 text-slate-600 hover:text-slate-900 font-semibold max-w-[150px] sm:max-w-none"
                >
                  <BookOpen className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{lesson.modules?.title}</span>
                </Button>
              </Link>
            </div>

            {/* Progress Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg">
                <Zap className="h-4 w-4" />
                <span>{completedLessonIds.size * 10} puntos</span>
              </div>
              {isCompleted && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500 text-white font-semibold shadow-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Completada</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* === COLUMNA PRINCIPAL (VIDEO) === */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button Prominente */}
            <Link href={`/cursos/${moduleId}`}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-slate-700 hover:text-slate-900 font-semibold shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Volver al tema
              </Button>
            </Link>

            {/* === VIDEO PLAYER CARD PREMIUM === */}
            <Card className="overflow-hidden shadow-2xl border-0 rounded-2xl">
              {videoUrl ? (
                <div className="relative bg-black">
                  {/* Video Container optimizado */}
                  <div className="aspect-video w-full relative">
                    {/* Premium Poster/Thumbnail */}
                    {thumbnailUrl && (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={thumbnailUrl}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      </div>
                    )}

                    <video
                      key={videoUrl}
                      controls
                      controlsList="nodownload"
                      className="w-full h-full relative z-10"
                      preload="metadata"
                      poster={thumbnailUrl || undefined}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-t-2xl">
                  <div className="text-center p-8">
                    <div
                      className="inline-flex p-6 rounded-3xl mb-4 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)` }}
                    >
                      <PlayCircle className="h-16 w-16" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Video no disponible
                    </h3>
                    <p className="text-slate-600">
                      Esta clase aún no tiene video
                    </p>
                  </div>
                </div>
              )}

              {/* Video Info Card */}
              <CardContent className="p-6 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  {/* Title and metadata */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {lesson.modules?.title}
                      </p>
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                        {lesson.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Clase {currentIndex + 1} de {lessons.length}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Completada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón de marcar completada */}
                  <PremiumMarkCompleteButton
                    lessonId={lessonId}
                    isCompleted={isCompleted}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    hasNextLesson={!!nextLesson}
                  />
                </div>
              </CardContent>
            </Card>

            {/* === DESCRIPCIÓN MEJORADA === */}
            {lesson.description && (
              <Card className="shadow-premium border-2 border-gray-100 rounded-xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Descripción de la clase
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-base">
                    {lesson.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* === NAVEGACIÓN PREMIUM === */}
            <div className="grid sm:grid-cols-2 gap-4">
              {prevLesson ? (
                <Link href={`/cursos/${moduleId}/${prevLesson.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-gray-200 hover:scale-[1.02] rounded-xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 group-hover:scale-110 shadow-sm"
                        >
                          <ChevronLeft className="h-6 w-6 text-slate-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1 font-semibold">Anterior</p>
                          <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{prevLesson.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link href={`/cursos/${moduleId}/${nextLesson.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-gray-200 hover:scale-[1.02] rounded-xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs text-slate-500 mb-1 font-semibold">Siguiente</p>
                          <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{nextLesson.title}</p>
                        </div>
                        <div
                          className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300 group-hover:scale-110 shadow-sm"
                        >
                          <ChevronRight className="h-6 w-6 text-slate-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Link href="/inicio">
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-emerald-200 hover:border-emerald-300 hover:scale-[1.02] rounded-xl bg-gradient-to-br from-emerald-50/50 to-green-50/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-emerald-600 mb-1 font-bold">Módulo completado</p>
                          <p className="font-bold text-slate-900">Volver al inicio</p>
                        </div>
                        <div
                          className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 group-hover:scale-110 transition-all duration-300 shadow-lg"
                        >
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>

          {/* === SIDEBAR CON MINIATURAS === */}
          <div className="lg:col-span-1">
            <LessonsSidebar
              lessons={lessons}
              moduleId={moduleId}
              currentLessonId={lessonId}
              completedLessonIds={completedLessonIds as Set<string>}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
