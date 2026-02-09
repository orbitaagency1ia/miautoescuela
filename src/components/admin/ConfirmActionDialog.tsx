'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

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
      iconBg: 'bg-amber-500',
      iconText: 'text-amber-500',
      headerBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      headerBorder: 'border-amber-200',
      buttonVariant: 'default' as const,
      buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-500',
      iconText: 'text-red-500',
      headerBg: 'bg-gradient-to-br from-red-50 to-rose-50',
      headerBorder: 'border-red-200',
      buttonVariant: 'destructive' as const,
      buttonClass: 'bg-red-600 hover:bg-red-700',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-500',
      iconText: 'text-blue-500',
      headerBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      headerBorder: 'border-blue-200',
      buttonVariant: 'default' as const,
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-500',
      iconText: 'text-emerald-500',
      headerBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      headerBorder: 'border-emerald-200',
      buttonVariant: 'default' as const,
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Header Premium */}
        <div className={`px-6 py-6 border-b ${currentConfig.headerBg} ${currentConfig.headerBorder}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${currentConfig.iconBg} shadow-lg`}>
              <Icon className={`h-6 w-6 ${currentConfig.iconText}`} />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {title}
              </DialogTitle>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          <DialogDescription className="text-base text-slate-600 leading-relaxed">
            {description}
          </DialogDescription>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer con Glassmorphism */}
        <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-slate-200">
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-full px-6 h-11"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`rounded-full px-6 h-11 ${currentConfig.buttonClass} shadow-md`}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Procesando...' : confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
