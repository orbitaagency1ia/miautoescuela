'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, UserPlus, CheckCircle2, Info } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');

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
      setSuccessMessage(result.message || 'Invitación enviada correctamente');
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        setEmail('');
        setError('');
        setSuccess(false);
        setSuccessMessage('');
      }, 2000);
    }

    setLoading(false);
  };

  const config = {
    student: {
      title: 'Invitar Alumno',
      description: 'Añade un nuevo alumno a tu autoescuela',
      icon: UserPlus,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500',
      buttonText: 'Invitar Alumno',
      info: 'El alumno recibirá un email con las instrucciones para acceder',
    },
    admin: {
      title: 'Añadir Administrador',
      description: 'Da acceso de administración a un usuario',
      icon: '👤',
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-500',
      buttonText: 'Añadir Admin',
      info: 'El administrador tendrá acceso completo a esta autoescuela',
    },
    owner: {
      title: 'Añadir Propietario',
      description: 'Asigna un propietario a la autoescuela',
      icon: '👑',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500',
      buttonText: 'Añadir Propietario',
      info: 'El propietario tendrá control total de la autoescuela',
    },
  };

  const currentConfig = config[role];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Header Premium */}
        <div className={`bg-gradient-to-br ${currentConfig.gradient} px-6 py-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-sm`}>
              {typeof currentConfig.icon === 'string' ? (
                <span className="text-2xl">{currentConfig.icon}</span>
              ) : (
                <currentConfig.icon className="h-6 w-6" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold text-white">
                {currentConfig.title}
              </DialogTitle>
              <DialogDescription className="text-white/80 mt-1">
                {currentConfig.description}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-6 rounded-xl text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-emerald-500">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">¡Invitación enviada!</p>
                    <p className="text-sm mt-1">{successMessage || 'El usuario recibirá un email con las instrucciones'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email del usuario <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-11 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Información importante:</p>
                    <p className="text-blue-600">{currentConfig.info}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer con Glassmorphism */}
          <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-slate-200">
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || success}
                className="rounded-full px-6 h-11"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
                className={`rounded-full px-6 h-11 bg-gradient-to-r ${currentConfig.gradient} hover:opacity-90 shadow-md text-white`}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? 'Enviando...' : success ? '¡Enviado!' : currentConfig.buttonText}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
