'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LessonCard } from '@/components/owner/LessonCard';
import { VideoUploadDialog } from '@/components/owner/VideoUploadDialog';
import { LessonPreviewDialog } from '@/components/owner/LessonPreviewDialog';
import { ConfirmActionDialog } from '@/components/admin/ConfirmActionDialog';
import {
  ArrowLeft,
  Video,
  Plus,
  FolderOpen,
  Sparkles,
  PlayCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editLesson, setEditLesson] = useState<any>(null);
  const [previewLesson, setPreviewLesson] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'warning' | 'danger' | 'info' | 'success';
    onConfirm: () => Promise<{ success?: boolean; error?: string }>;
  }>({
    open: false,
    title: '',
    description: '',
    type: 'warning',
    onConfirm: async () => ({}),
  });

  useEffect(() => {
    loadModuleData();
  }, [moduleId]);

  const loadModuleData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/iniciar-sesion');
        return;
      }

      // Get school membership
      const { data: membership } = await (supabase
        .from('school_members')
        .select('school_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single() as any);

      if (!membership) {
        router.push('/inicio');
        return;
      }

      // Get school details
      const { data: schoolData } = await supabase
        .from('schools')
        .select('id, name, primary_color, secondary_color')
        .eq('id', membership.school_id)
        .single();

      setSchool(schoolData);

      // Get module
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (!moduleData) {
        router.push('/temas');
        return;
      }

      setModule(moduleData);

      // Get lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Error loading module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadModuleData();
  };

  const handleEditLesson = (lesson: any) => {
    setEditLesson(lesson);
    setUploadDialogOpen(true);
  };

  const handlePreviewLesson = (lesson: any) => {
    setPreviewLesson(lesson);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      handleUploadSuccess();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleTogglePublishLesson = async (lessonId: string, currentStatus: boolean) => {
    try {
      // @ts-ignore - TypeScript inference issue with nested function
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: !currentStatus })
        .eq('id', lessonId);

      if (error) throw error;

      handleUploadSuccess();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleTogglePublishModule = () => {
    setConfirmDialog({
      open: true,
      title: module.is_published ? 'Ocultar Tema' : 'Publicar Tema',
      description: `¿Estás seguro de que quieres ${module.is_published ? 'ocultar' : 'publicar'} este tema? ${module.is_published ? 'Los alumnos no podrán verlo' : 'Los alumnos podrán ver todas las clases publicadas'}.`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('modules')
            .update({ is_published: !module.is_published })
            .eq('id', moduleId);

          if (error) throw error;

          loadModuleData();
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  };

  const handleDeleteModule = () => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Tema',
      description: `¿Estás seguro de que quieres eliminar "${module?.title}"? Esta acción eliminará también todas las clases de este tema y no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          // First, delete all lessons
          const { error: lessonsError } = await supabase
            .from('lessons')
            .delete()
            .eq('module_id', moduleId);

          if (lessonsError) throw lessonsError;

          // Then delete the module
          const { error: moduleError } = await supabase
            .from('modules')
            .delete()
            .eq('id', moduleId);

          if (moduleError) throw moduleError;

          router.push('/temas');
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!module || !school) {
    return null;
  }

  const primaryColor = school.primary_color || '#3B82F6';
  const secondaryColor = school.secondary_color || '#1E40AF';

  const stats = [
    {
      label: 'Clases',
      value: lessons.length,
      icon: Video,
      color: 'emerald',
    },
    {
      label: 'Publicadas',
      value: lessons.filter(l => l.is_published).length,
      icon: CheckCircle2,
      color: 'blue',
    },
    {
      label: 'Borradores',
      value: lessons.filter(l => !l.is_published).length,
      icon: AlertCircle,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/temas">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{module.title}</h1>
            <Badge
              variant="outline"
              className={cn(
                'ml-2',
                module.is_published
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
              )}
            >
              {module.is_published ? 'Publicado' : 'Borrador'}
            </Badge>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Tema</span>
            </div>
          </div>
          {module.description && (
            <p className="text-slate-500 mt-1">{module.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePublishModule}
            className="rounded-full"
          >
            {module.is_published ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publicar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteModule}
            className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 border-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2.5 rounded-xl',
                    stat.color === 'emerald' && 'bg-emerald-100',
                    stat.color === 'blue' && 'bg-blue-100',
                    stat.color === 'amber' && 'bg-amber-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      stat.color === 'emerald' && 'text-emerald-600',
                      stat.color === 'blue' && 'text-blue-600',
                      stat.color === 'amber' && 'text-amber-600'
                    )}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lessons Section */}
      <div className="bg-white rounded-2xl border-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
        <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Clases del Tema</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {lessons.length} {lessons.length === 1 ? 'clase' : 'clases'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditLesson(null);
                setUploadDialogOpen(true);
              }}
              className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Clase
            </Button>
          </div>
        </div>
        <div className="p-6">
          {lessons.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="inline-flex p-6 rounded-3xl mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
                }}
              >
                <PlayCircle className="h-16 w-16" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No hay clases en este tema
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Empieza añadiendo tu primera clase con video para que los alumnos puedan empezar a aprender
              </p>
              <Button
                onClick={() => {
                  setEditLesson(null);
                  setUploadDialogOpen(true);
                }}
                size="lg"
                className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Añadir Primera Clase
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  onEdit={handleEditLesson}
                  onDelete={handleDeleteLesson}
                  onTogglePublish={handleTogglePublishLesson}
                  onPreview={handlePreviewLesson}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Upload Dialog */}
      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            setEditLesson(null);
          }
        }}
        moduleId={moduleId}
        onSuccess={handleUploadSuccess}
        editLesson={editLesson}
      />

      {/* Confirmation Dialog */}
      <ConfirmActionDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onSuccess={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />

      {/* Lesson Preview Dialog */}
      {previewLesson && (
        <LessonPreviewDialog
          open={!!previewLesson}
          onOpenChange={(open) => !open && setPreviewLesson(null)}
          lesson={previewLesson}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
    </div>
  );
}
