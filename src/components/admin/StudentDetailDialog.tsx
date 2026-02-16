'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, Clock, BookOpen, Video, User, Award, Activity, Info, Shield, MapPin } from 'lucide-react';
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

  const defaultGradient = primaryColor && secondaryColor
    ? `bg-gradient-to-br from-[${primaryColor}] to-[${secondaryColor}]`
    : 'from-blue-500 to-indigo-600';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600"
                style={{
                  background: primaryColor && secondaryColor
                    ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                    : undefined,
                }}
              >
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{student.profiles?.full_name || 'Sin nombre'}</DialogTitle>
                <DialogDescription>
                  ID: {student.user_id}
                </DialogDescription>
              </div>
            </div>
            <DialogClose onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-5">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              Información de Contacto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Mail className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{student.profiles?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Phone className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Teléfono</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{student.profiles?.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <Calendar className="h-4 w-4 text-slate-600" />
              </div>
              Fechas Importantes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Clock className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Registro</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {student.profiles?.created_at
                      ? format(new Date(student.profiles.created_at), 'dd MMM yyyy', { locale: es })
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Award className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Se unió</p>
                  <p className="text-sm font-semibold text-slate-900">
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
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <BookOpen className="h-4 w-4 text-slate-600" />
              </div>
              Progreso de Aprendizaje
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border-2 border-slate-200 bg-white text-center">
                <div className="p-2 rounded-lg bg-slate-100 w-fit mx-auto mb-2">
                  <Video className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{student.lessonsCompleted || 0}</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Clases Completadas</p>
              </div>
              <div className="p-4 rounded-xl border-2 border-slate-200 bg-white text-center">
                <div className="p-2 rounded-lg bg-slate-100 w-fit mx-auto mb-2">
                  <BookOpen className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{student.uniqueLessonsCompleted || 0}</p>
                <p className="text-xs text-slate-600 font-medium mt-1">Temas Vistos</p>
              </div>
              <div className="p-4 rounded-xl border-2 border-slate-200 bg-white text-center">
                <div className="p-2 rounded-lg bg-slate-100 w-fit mx-auto mb-2">
                  <Activity className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {student.lastActivity
                    ? format(new Date(student.lastActivity), 'dd MMM', { locale: es })
                    : 'N/D'}
                </p>
                <p className="text-xs text-slate-600 font-medium mt-1">Última Actividad</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Shield className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Estado Actual</span>
            </div>
            <Badge
              variant={student.status === 'active' ? 'success' : 'default'}
            >
              {student.status === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
