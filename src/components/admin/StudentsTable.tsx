'use client';

import { Eye, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSchoolDetail } from './SchoolDetailContext';

interface StudentsTableProps {
  students: any[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  const { openStudentDetail, openToggleStudentDialog, openRemoveStudentDialog, primaryColor, secondaryColor } = useSchoolDetail();

  return (
    <div className="shadow-premium border-2 bg-white rounded-2xl overflow-hidden">
      <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Estudiantes</h3>
            <p className="text-sm text-slate-500">
              {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
            </p>
          </div>
        </div>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left p-4 font-semibold text-slate-700">Estudiante</th>
                <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                <th className="text-left p-4 font-semibold text-slate-700">User ID</th>
                <th className="text-center p-4 font-semibold text-slate-700">Registro</th>
                <th className="text-center p-4 font-semibold text-slate-700">Clases</th>
                <th className="text-center p-4 font-semibold text-slate-700">Progreso</th>
                <th className="text-center p-4 font-semibold text-slate-700">Última Actividad</th>
                <th className="text-center p-4 font-semibold text-slate-700">Estado</th>
                <th className="text-center p-4 font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => (
                <tr
                  key={student.user_id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }}
                      >
                        {student.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{student.profiles?.full_name || 'Sin nombre'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{student.profiles?.email || '-'}</td>
                  <td className="p-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 max-w-[120px] block truncate">
                      {student.user_id}
                    </code>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm text-slate-600">
                        {student.profiles?.created_at ? format(new Date(student.profiles.created_at), 'dd MMM', { locale: es }) : '-'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {student.joined_at ? format(new Date(student.joined_at), 'dd MMM', { locale: es }) : ''}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-slate-900">{student.lessonsCompleted || 0}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-violet-600">{student.uniqueLessonsCompleted || 0} temas</span>
                  </td>
                  <td className="p-4 text-center">
                    {student.lastActivity ? (
                      <span className="text-sm text-slate-500">
                        {format(new Date(student.lastActivity), 'dd MMM', { locale: es })}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Sin actividad</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <Badge
                      variant={student.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        student.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                      )}
                    >
                      {student.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        onClick={() => openStudentDetail(student)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        onClick={() => openToggleStudentDialog(student)}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg hover:bg-slate-100",
                          student.status === 'active' ? "hover:bg-amber-50" : "hover:bg-emerald-50"
                        )}
                        title={student.status === 'active' ? 'Suspender' : 'Activar'}
                      >
                        {student.status === 'active' ? (
                          <Pause className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Play className="h-4 w-4 text-emerald-500" />
                        )}
                      </Button>
                      <Button
                        onClick={() => openRemoveStudentDialog(student)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
