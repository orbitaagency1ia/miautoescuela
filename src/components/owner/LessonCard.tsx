'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Play,
  Clock,
  Edit,
  Trash2,
  GripVertical,
  MoreVertical,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmActionDialog } from '@/components/admin/ConfirmActionDialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    video_path: string | null;
    video_duration_seconds: number | null;
    thumbnail_url: string | null;
    order_index: number;
    is_published: boolean;
    created_at: string;
  };
  primaryColor: string;
  secondaryColor: string;
  onEdit?: (lesson: any) => void;
  onDelete?: (lessonId: string) => Promise<{ success?: boolean; error?: string }>;
  onTogglePublish?: (lessonId: string, currentStatus: boolean) => Promise<{ success?: boolean; error?: string }>;
  onPreview?: (lesson: any) => void;
  isDragging?: boolean;
}

export function LessonCard({
  lesson,
  primaryColor,
  secondaryColor,
  onEdit,
  onDelete,
  onTogglePublish,
  onPreview,
  isDragging = false,
}: LessonCardProps) {
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

  const handleCardClick = () => {
    if (onPreview) {
      onPreview(lesson);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: 'Eliminar Clase',
      description: `¿Estás seguro de que quieres eliminar "${lesson.title}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        if (onDelete) {
          return await onDelete(lesson.id);
        }
        return {};
      },
    });
  };

  const handleTogglePublish = () => {
    const action = lesson.is_published ? 'ocultar' : 'publicar';
    setConfirmDialog({
      open: true,
      title: lesson.is_published ? 'Ocultar Clase' : 'Publicar Clase',
      description: `¿Estás seguro de que quieres ${action} "${lesson.title}"?`,
      type: 'warning',
      onConfirm: async () => {
        if (onTogglePublish) {
          return await onTogglePublish(lesson.id, lesson.is_published);
        }
        return {};
      },
    });
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          'group relative overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-slate-200',
          isDragging ? 'opacity-50 scale-95' : '',
          lesson.is_published ? '' : 'opacity-70'
        )}
      >
        {/* Hover gradient background */}
        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-slate-50/0 to-blue-50/0 group-hover:from-slate-50/50 group-hover:to-blue-50/50 transition-all duration-300 pointer-events-none" />

        <div className="relative flex items-center gap-5 p-6">
          {/* Drag Handle */}
          <div
            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors"
            onClick={(e) => e.stopPropagation()}
            onDragStart={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Thumbnail / Video Icon */}
          <div
            className={cn(
              'relative flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden shadow-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300',
              lesson.is_published ? '' : 'grayscale'
            )}
            style={{
              background: lesson.is_published
                ? `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)`
                : `linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)`,
            }}
          >
            {lesson.thumbnail_url ? (
              <img
                src={lesson.thumbnail_url}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn(
                    'text-lg font-semibold text-slate-900 truncate',
                    !lesson.is_published && 'text-slate-500'
                  )}>
                    {lesson.title}
                  </h3>
                  {!lesson.is_published && (
                    <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                      Borrador
                    </Badge>
                  )}
                </div>
                {lesson.description && (
                  <p className="text-sm text-slate-500 line-clamp-1">{lesson.description}</p>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(lesson); }}>
                    <Edit className="h-4 w-4 mr-2 text-slate-400" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTogglePublish(); }}>
                    {lesson.is_published ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2 text-slate-400" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2 text-slate-400" />
                        Publicar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    className="text-red-600 focus:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
              {lesson.video_duration_seconds && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(lesson.video_duration_seconds)}
                </span>
              )}
              {lesson.video_path && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Video
                </span>
              )}
              {!lesson.video_path && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Sin video
                </span>
              )}
              {lesson.order_index !== undefined && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  <span className="font-semibold">#{lesson.order_index + 1}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmActionDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onSuccess={() => {
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />
    </>
  );
}
