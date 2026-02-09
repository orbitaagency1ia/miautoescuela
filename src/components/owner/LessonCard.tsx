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
          'group overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
          isDragging ? 'opacity-50 scale-95' : '',
          lesson.is_published ? 'border-l-4 border-blue-500' : 'border-l-4 border-transparent'
        )}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Drag Handle */}
          <div
            className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400"
            onClick={(e) => e.stopPropagation()}
            onDragStart={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Thumbnail / Video Icon */}
          <div
            className={cn(
              'relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden',
              'bg-gradient-to-br shadow-md',
              lesson.is_published
                ? 'from-blue-50 to-indigo-50'
                : 'from-gray-50 to-gray-100 opacity-60'
            )}
            style={{
              background: lesson.is_published
                ? `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`
                : undefined,
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
                <Video className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-semibold text-gray-900 truncate',
                  !lesson.is_published && 'text-gray-500'
                )}>
                  {lesson.title}
                </h3>
                {!lesson.is_published && (
                  <Badge variant="outline" className="text-xs">
                    Borrador
                  </Badge>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onPlay && lesson.video_path && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPlay?.(lesson); }}>
                      <Play className="h-4 w-4 mr-2 text-slate-400" />
                      Reproducir
                    </DropdownMenuItem>
                  )}
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
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {lesson.video_duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.video_duration_seconds)}
                </span>
              )}
              {lesson.video_path && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Video subido
                </span>
              )}
              {!lesson.video_path && (
                <span className="flex items-center gap-1 text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  Sin video
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
