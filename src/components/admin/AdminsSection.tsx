'use client';

import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSchoolDetail } from './SchoolDetailContext';

interface AdminsSectionProps {
  owners: any[];
}

export function AdminsSection({ owners }: AdminsSectionProps) {
  const { openAdminDialog, openRemoveStudentDialog, primaryColor, secondaryColor } = useSchoolDetail();

  if (!owners || owners.length === 0) return null;

  return (
    <div className="relative bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden border-2 border-slate-100">
      <div className="px-8 py-6 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Administradores</h2>
            <p className="text-sm text-slate-500">
              {owners.length} {owners.length === 1 ? 'administrador' : 'administradores'}
            </p>
          </div>
          <Button onClick={openAdminDialog} variant="outline" size="default">
            <UserPlus className="h-4 w-4" />
            Añadir Admin
          </Button>
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {owners.map((owner: any) => (
          <div key={owner.user_id} className="px-8 py-5 flex items-center gap-4 hover:bg-blue-50/50 transition-colors">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {owner.profiles?.full_name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">{owner.profiles?.full_name || 'Sin nombre'}</p>
              <p className="text-sm text-slate-500">{owner.profiles?.email || '-'}</p>
            </div>
            <Badge variant={owner.role === 'owner' ? 'primary' : 'info'}>
              {owner.role === 'owner' ? 'Propietario' : 'Admin'}
            </Badge>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Edit className="w-4 h-4 text-slate-400" />
              </Button>
              <Button
                onClick={() => openRemoveStudentDialog(owner)}
                variant="ghost"
                size="icon"
                className="hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
