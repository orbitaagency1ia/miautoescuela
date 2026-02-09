'use client';

import { useActionState, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, User, Lock, AlertCircle } from 'lucide-react';
import { registerViaInviteAction } from '@/actions/auth';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InviteAcceptPage({ params }: InvitePageProps) {
  const [state, formAction, isPending] = useActionState(registerViaInviteAction, {
    error: null,
    success: null,
  });

  // Use React's use hook to unwrap the params Promise
  const { token } = use(params);

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        backgroundColor: '#F8F9FA',
      }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card
        className="w-full max-w-md"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
        }}
      >
        <CardHeader className="text-center">
          <div
            className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#DBEAFE' }}
          >
            <Mail className="h-6 w-6" style={{ color: '#1E40AF' }} />
          </div>
          <CardTitle style={{ color: '#111827' }}>¡Estás invitado!</CardTitle>
          <CardDescription style={{ color: '#6B7280' }}>
            Completa tu registro para unirte a la autoescuela
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.error && (
            <div
              className="mb-4 p-4 rounded-xl border-2 flex items-start gap-3"
              style={{
                backgroundColor: '#FEE2E2',
                borderColor: '#FECACA',
                color: '#991B1B',
              }}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Error</p>
                <p className="text-sm">{state.error}</p>
              </div>
            </div>
          )}

          {state.success && (
            <div
              className="mb-4 p-4 rounded-xl border-2 flex items-start gap-3"
              style={{
                backgroundColor: '#D1FAE5',
                borderColor: '#A7F3D0',
                color: '#065F46',
              }}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">¡Éxito!</p>
                <p className="text-sm">{state.success}</p>
              </div>
            </div>
          )}

          <InviteForm token={token} formAction={formAction} isPending={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}

interface InviteFormProps {
  token: string;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}

function InviteForm({ token, formAction, isPending }: InviteFormProps) {
  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden token field */}
      <input type="hidden" name="token" value={token} />

      <div
        className="p-3 rounded-lg"
        style={{ backgroundColor: '#F3F4F6' }}
      >
        <p className="text-sm" style={{ color: '#1A1A1A' }}>
          Crea tu contraseña para comenzar con tu formación
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">Nombre Completo *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
          <Input
            id="fullName"
            name="fullName"
            placeholder="Juan Pérez García"
            className="pl-10 h-12 rounded-xl border-2"
            style={{ borderColor: '#E5E7EB' }}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">Teléfono (Opcional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+34 600 000 000"
          className="h-12 rounded-xl border-2"
          style={{ borderColor: '#E5E7EB' }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Contraseña *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            className="pl-10 h-12 rounded-xl border-2"
            style={{ borderColor: '#E5E7EB' }}
            required
            minLength={8}
          />
        </div>
        <p className="text-xs" style={{ color: '#6B7280' }}>
          La contraseña debe tener al menos 8 caracteres
        </p>
      </div>

      <div className="flex items-start gap-2 text-xs" style={{ color: '#6B7280' }}>
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Al registrarte, aceptas unirte a la autoescuela y acceder a los contenidos
          de formación disponibles.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: '#FFFFFF',
        }}
      >
        {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>
    </form>
  );
}
