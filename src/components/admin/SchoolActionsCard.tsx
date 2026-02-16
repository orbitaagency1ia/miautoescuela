'use client';

import { useState } from 'react';
import { Edit, UserPlus, Settings, Pause, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSchoolDetail } from './SchoolDetailContext';
import { toast } from '@/components/ui/toaster';

export function SchoolActionsCard() {
  const { openEditDialog, openInviteDialog, openToggleSchoolDialog, school, primaryColor, secondaryColor } = useSchoolDetail();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const openSubscriptionDialog = async () => {
    setLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school_id: school.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al conectar con el servicio de suscripción',
        variant: 'destructive',
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6 border-2 border-slate-100">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={openEditDialog}
          className="flex-1"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Edit className="h-4 w-4" />
          Editar Autoescuela
        </Button>
        <Button onClick={openInviteDialog} variant="outline">
          <UserPlus className="h-4 w-4" />
          Invitar Alumno
        </Button>
        <Button
          onClick={openSubscriptionDialog}
          variant="outline"
          disabled={loadingPortal}
        >
          {loadingPortal ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Suscripción
            </>
          )}
        </Button>
        <Button
          onClick={openToggleSchoolDialog}
          variant={school.subscription_status === 'active' ? "outline" : "default"}
          className={cn(
            school.subscription_status === 'active'
              ? "border-2 border-amber-500 text-amber-600 hover:bg-amber-50"
              : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          )}
        >
          {school.subscription_status === 'active' ? (
            <>
              <Pause className="h-4 w-4" />
              Suspender
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Activar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
