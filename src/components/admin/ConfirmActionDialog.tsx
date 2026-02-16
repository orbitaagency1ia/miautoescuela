'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Trash2, Info, CheckCircle, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  onConfirm: () => Promise<{ success?: boolean; error?: string }>;
  onSuccess?: () => void;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  type = 'warning',
  onConfirm,
  onSuccess,
}: ConfirmActionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    const result = await onConfirm();

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const config = {
    warning: {
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-600',
      hint: 'Esta acción requerirá confirmación',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    danger: {
      icon: Trash2,
      gradient: 'from-red-500 to-rose-600',
      hint: 'Esta acción no se puede deshacer',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500 to-indigo-600',
      hint: 'Revisa la información antes de continuar',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    success: {
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-600',
      hint: 'Operación completada con éxito',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconBgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentConfig.gradient}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                  {description}
                </DialogDescription>
              </div>
            </div>
            <DialogClose onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>

        <div className="px-8 py-8 space-y-6">
          <div className={`border-2 ${currentConfig.borderColor} ${currentConfig.textColor} px-4 py-3 rounded-xl text-sm flex items-start gap-3 bg-white`}>
            <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${currentConfig.iconColor}`} />
            <div>
              <p className="font-medium mb-1">Información importante</p>
              <p className="text-slate-600">{currentConfig.hint}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-red-200 bg-red-50">
              <div className="p-1 rounded-lg bg-red-100 shrink-0">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  Error al procesar
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            variant={type === 'danger' ? 'destructive' : 'default'}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Procesando...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
