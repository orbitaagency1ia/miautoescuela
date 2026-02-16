'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, UserPlus, CheckCircle2 } from 'lucide-react';
import { inviteStudent } from '@/lib/actions/school-actions';

interface InviteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  role?: 'student' | 'admin' | 'owner';
  onSuccess?: () => void;
}

export function InviteStudentDialog({ open, onOpenChange, schoolId, role = 'student', onSuccess }: InviteStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const config = {
    student: { title: 'Invitar Alumno', description: 'Añade un nuevo alumno a tu autoescuela', icon: UserPlus, gradient: 'from-blue-500 to-indigo-600' },
    admin: { title: 'Añadir Administrador', description: 'Da acceso de administración a un usuario', icon: UserPlus, gradient: 'from-violet-500 to-purple-600' },
    owner: { title: 'Añadir Propietario', description: 'Asigna un propietario a la autoescuela', icon: UserPlus, gradient: 'from-amber-500 to-orange-600' },
  };

  const currentConfig = config[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await inviteStudent(schoolId, email, role);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        setSuccess(false);
        setEmail('');
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentConfig.gradient} shadow-lg`}>
                <currentConfig.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle>{currentConfig.title}</DialogTitle>
                <DialogDescription>
                  {currentConfig.description}
                </DialogDescription>
              </div>
            </div>
            <DialogClose onClick={() => onOpenChange(false)} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700">
                <div className="p-1 rounded-lg bg-red-100 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Error al enviar invitación</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700">
                <div className="p-1 rounded-lg bg-emerald-100 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">¡Invitación enviada correctamente!</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label htmlFor="email">
                Email del usuario <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  withIcon
                />
              </div>
            </div>
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
              type="submit"
              disabled={loading || !email}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
