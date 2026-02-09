'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, Clock, BookOpen, Video, User, Award, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  primaryColor?: string;
  secondaryColor?: string;
}

export function StudentDetailDialog({ open, onOpenChange, student, primaryColor, secondaryColor }: StudentDetailDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor || '#3B82F6'} 0%, ${secondaryColor || '#1E40AF'} 100%)`,
              }}
            >
              {student.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{student.profiles?.full_name || 'Sin nombre'}</DialogTitle>
              <DialogDescription className="text-base">
                ID: {student.user_id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Información de Contacto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">{student.profiles?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Phone className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Teléfono</p>
                  <p className="text-sm font-medium text-slate-900">{student.profiles?.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas Importantes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Registro</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.profiles?.created_at
                      ? format(new Date(student.profiles.created_at), 'dd MMM yyyy', { locale: es })
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <Award className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Se unió</p>
                  <p className="text-sm font-medium text-slate-900">
                    {student.joined_at
                      ? format(new Date(student.joined_at), 'dd MMM yyyy', { locale: es })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Progreso de Aprendizaje
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-center">
                <Video className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{student.lessonsCompleted || 0}</p>
                <p className="text-xs text-blue-600">Clases Completadas</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 text-center">
                <BookOpen className="h-5 w-5 text-violet-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-violet-900">{student.uniqueLessonsCompleted || 0}</p>
                <p className="text-xs text-violet-600">Temas Vistos</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 text-center">
                <Activity className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900">
                  {student.lastActivity
                    ? format(new Date(student.lastActivity), 'dd MMM', { locale: es })
                    : 'N/D'}
                </p>
                <p className="text-xs text-emerald-600">Última Actividad</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
            <span className="text-sm font-medium text-slate-600">Estado Actual</span>
            <Badge
              className={cn(
                student.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
              )}
            >
              {student.status === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
