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
    <div className="relative bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden border-2 border-slate-100">
      <div className="px-8 py-6 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Estudiantes</h2>
        <p className="text-sm text-slate-500">
          {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-3 px-4 text-left font-bold text-slate-700 text-xs uppercase tracking-wider">Estudiante</th>
              <th className="py-3 px-4 text-left font-bold text-slate-700 text-xs uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-center font-bold text-slate-700 text-xs uppercase tracking-wider">Registro</th>
              <th className="py-3 px-4 text-center font-bold text-slate-700 text-xs uppercase tracking-wider">Clases</th>
              <th className="py-3 px-4 text-center font-bold text-slate-700 text-xs uppercase tracking-wider">Progreso</th>
              <th className="py-3 px-4 text-center font-bold text-slate-700 text-xs uppercase tracking-wider">Última Actividad</th>
              <th className="py-3 px-4 text-center font-bold text-slate-700 text-xs uppercase tracking-wider">Estado</th>
              <th className="py-3 px-4 text-center font-bold text-slate-700 text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student: any) => (
              <tr
                key={student.user_id}
                className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      }}
                    >
                      {student.profiles?.full_name?.slice(0, 2).toUpperCase() || 'NA'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{student.profiles?.full_name || 'Sin nombre'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-600">{student.profiles?.email || '-'}</td>
                <td className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-slate-600">
                      {student.profiles?.created_at ? format(new Date(student.profiles.created_at), 'dd MMM', { locale: es }) : '-'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {student.joined_at ? format(new Date(student.joined_at), 'dd MMM', { locale: es }) : ''}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-lg font-bold text-slate-900">{student.lessonsCompleted || 0}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-lg font-bold text-violet-600">{student.uniqueLessonsCompleted || 0} temas</span>
                </td>
                <td className="py-4 px-4 text-center">
                  {student.lastActivity ? (
                    <span className="text-sm text-slate-500">
                      {format(new Date(student.lastActivity), 'dd MMM', { locale: es })}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Sin actividad</span>
                  )}
                </td>
                <td className="py-4 px-4 text-center">
                  <Badge
                    variant={student.status === 'active' ? 'success' : 'default'}
                  >
                    {student.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => openStudentDetail(student)}
                      variant="ghost"
                      size="icon"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      onClick={() => openToggleStudentDialog(student)}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        student.status === 'active' ? "hover:bg-amber-50" : "hover:bg-emerald-50"
                      )}
                    >
                      {student.status === 'active' ? (
                        <Pause className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Play className="w-4 h-4 text-emerald-500" />
                      )}
                    </Button>
                    <Button
                      onClick={() => openRemoveStudentDialog(student)}
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
