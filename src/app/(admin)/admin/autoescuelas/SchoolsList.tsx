'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/components/ui/toaster';

interface School {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  phone: string | null;
  subscription_status: string;
  created_at: string;
  studentCount: number;
  activeStudentCount: number;
}

interface SchoolsListProps {
  schools: School[];
}

export function SchoolsList({ schools }: SchoolsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (schoolId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta autoescuela? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(schoolId);
    const response = await fetch(`/api/admin/schools/${schoolId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      router.refresh();
      toast({
        title: 'Autoescuela eliminada',
        description: 'La autoescuela se ha eliminado correctamente',
        variant: 'success',
      });
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la autoescuela',
        variant: 'destructive',
      });
      setDeletingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Activa',
          gradient: 'from-emerald-500 to-green-500',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          iconBg: 'bg-emerald-100',
        };
      case 'trialing':
        return {
          label: 'Prueba',
          gradient: 'from-blue-500 to-indigo-500',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
        };
      case 'past_due':
        return {
          label: 'Pago Pendiente',
          gradient: 'from-amber-500 to-orange-500',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100',
        };
      case 'canceled':
        return {
          label: 'Cancelada',
          gradient: 'from-red-500 to-rose-500',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
        };
      default:
        return {
          label: status,
          gradient: 'from-slate-500 to-gray-500',
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          iconBg: 'bg-slate-100',
        };
    }
  };

  if (schools.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="text-center py-16 px-6">
          <div className="p-4 rounded-3xl inline-flex mb-6 bg-gradient-to-br from-slate-100 to-slate-200">
            <Building2 className="h-12 w-12 text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg font-medium mb-2">No hay autoescuelas registradas</p>
          <p className="text-slate-400 text-sm">Comienza creando una nueva autoescuela</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Listado de Autoescuelas</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {schools.length} {schools.length === 1 ? 'autoescuela registrada' : 'autoescuelas registradas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-4 px-5 text-left font-bold text-slate-700 text-sm">Nombre</th>
              <th className="py-4 px-5 text-center font-bold text-slate-700 text-sm">Alumnos</th>
              <th className="py-4 px-5 text-left font-bold text-slate-700 text-sm">Contacto</th>
              <th className="py-4 px-5 text-center font-bold text-slate-700 text-sm">Estado</th>
              <th className="py-4 px-5 text-center font-bold text-slate-700 text-sm">Creada</th>
              <th className="py-4 px-5 text-right font-bold text-slate-700 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => {
              const statusConfig = getStatusConfig(school.subscription_status);
              return (
                <tr key={school.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <Link href={`/admin/autoescuelas/${school.id}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{school.name}</div>
                          <div className="text-xs text-slate-500">/{school.slug}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`p-1.5 rounded-lg ${statusConfig.iconBg}`}>
                        <Users className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{school.activeStudentCount}</div>
                        <div className="text-xs text-slate-500">de {school.studentCount} total</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="text-slate-700 text-sm">{school.contact_email || '-'}</div>
                    <div className="text-xs text-slate-500">{school.phone || ''}</div>
                  </td>
                  <td className="py-4 px-5">
                    <div className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2',
                      statusConfig.bg,
                      statusConfig.text,
                      statusConfig.border
                    )}>
                      {statusConfig.label}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-center text-sm text-slate-600 font-medium">
                    {format(new Date(school.created_at), 'dd MMM yyyy', { locale: es })}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 transition-colors"
                        asChild
                      >
                        <Link href={`/admin/autoescuelas/${school.id}`}>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 transition-colors"
                        asChild
                      >
                        <Link href={`/admin/autoescuelas/${school.id}`}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-xl hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(school.id)}
                        disabled={deletingId === school.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
