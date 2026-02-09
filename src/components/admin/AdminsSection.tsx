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
    <div className="shadow-premium border-2 bg-white rounded-2xl overflow-hidden">
      <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Administradores de la Autoescuela</h3>
            <p className="text-sm text-slate-500">
              {owners.length} {owners.length === 1 ? 'administrador' : 'administradores'}
            </p>
          </div>
          <Button onClick={openAdminDialog} variant="outline" size="sm" className="rounded-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Añadir Admin
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {owners.map((owner: any) => (
            <div
              key={owner.user_id}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-50"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                {owner.profiles?.full_name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{owner.profiles?.full_name || 'Sin nombre'}</p>
                <p className="text-sm text-slate-500">{owner.profiles?.email || '-'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {owner.user_id}
                  </code>
                  <span className="text-xs text-slate-400">Rol: {owner.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  {owner.role === 'owner' ? 'Propietario' : 'Admin'}
                </Badge>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                  <Edit className="h-4 w-4 text-slate-400" />
                </Button>
                <Button
                  onClick={() => openRemoveStudentDialog(owner)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
