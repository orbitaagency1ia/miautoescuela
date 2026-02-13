'use client';

import { Edit, UserPlus, Settings, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSchoolDetail } from './SchoolDetailContext';
import { toast } from '@/components/ui/toaster';

export function SchoolActionsCard() {
  const { openEditDialog, openInviteDialog, openToggleSchoolDialog, school, primaryColor, secondaryColor } = useSchoolDetail();

  const openSubscriptionDialog = () => {
    toast({
      title: 'Próximamente',
      description: 'Gestión de suscripción estará disponible pronto.',
      variant: 'default',
    });
  };

  return (
    <div className="shadow-premium border-2 bg-white rounded-2xl">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={openEditDialog}
            className="flex-1 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Autoescuela
          </Button>
          <Button onClick={openInviteDialog} variant="outline" className="flex-1 rounded-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Alumno
          </Button>
          <Button onClick={openSubscriptionDialog} variant="outline" className="flex-1 rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Suscripción
          </Button>
          <Button
            onClick={openToggleSchoolDialog}
            variant={school.subscription_status === 'active' ? "outline" : "default"}
            className={cn(
              "rounded-full",
              school.subscription_status === 'active' ? "border-amber-500 text-amber-600 hover:bg-amber-50" : "bg-amber-500 hover:bg-amber-600"
            )}
          >
            {school.subscription_status === 'active' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Suspender
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
