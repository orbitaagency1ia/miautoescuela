'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Edit, Trash2 } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'past_due':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'canceled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'trialing':
        return 'Prueba';
      case 'past_due':
        return 'Pago Pendiente';
      case 'canceled':
        return 'Cancelada';
      case 'incomplete':
        return 'Incompleta';
      default:
        return status;
    }
  };

  if (schools.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="text-center py-12">
          <div className="p-4 rounded-2xl inline-flex mb-4 bg-gray-100">
            <Building2 className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No hay autoescuelas registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Listado de Autoescuelas</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {schools.length} {schools.length === 1 ? 'autoescuela registrada' : 'autoescuelas registradas'}
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-3 px-4 text-left font-semibold text-gray-700 text-sm">Nombre</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 text-sm">Alumnos</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 text-sm">Contacto</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 text-sm">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 text-sm">Creada</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-700 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{school.name}</div>
                  <div className="text-sm text-gray-500">/{school.slug}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-blue-50">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{school.activeStudentCount}</div>
                      <div className="text-xs text-gray-500">de {school.studentCount} total</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-gray-700">{school.contact_email || '-'}</div>
                  <div className="text-sm text-gray-500">{school.phone || ''}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(school.subscription_status)
                  )}>
                    {getStatusLabel(school.subscription_status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {format(new Date(school.created_at), 'dd MMM yyyy', { locale: es })}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                      asChild
                    >
                      <Link href={`/admin/autoescuelas/${school.id}`}>
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                      onClick={() => handleDelete(school.id)}
                      disabled={deletingId === school.id}
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
  );
}
