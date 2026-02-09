'use client';

import { useActionState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerAction } from '@/actions/auth';
import { PremiumAuthLayout } from '@/components/auth/PremiumAuthLayout';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, {
    error: null,
    success: null,
  });

  return (
    <PremiumAuthLayout
      title="Crear Cuenta"
      description="Regístrate y comienza tu formación de conductor"
      type="register"
      formState={state}
    >
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">Nombre Completo</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Juan Pérez"
            required
            autoComplete="name"
            className="h-12 rounded-xl border-2"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            autoComplete="email"
            className="h-12 rounded-xl border-2"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Teléfono (Opcional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+34 600 000 000"
            autoComplete="tel"
            className="h-12 rounded-xl border-2"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 rounded-xl border-2"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 rounded-xl border-2"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>

        <Button
          type="submit"
          size="lg"
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

      <div className="mt-6 text-center text-sm">
        <span style={{ color: '#6B7280' }}>¿Ya tienes cuenta?</span>{' '}
        <Link
          href="/iniciar-sesion"
          className="font-semibold transition-colors duration-200"
          style={{ color: '#2563EB' }}
        >
          Inicia Sesión
        </Link>
      </div>

      {/* Benefits */}
      <div
        className="mt-8 pt-6 space-y-3"
        style={{ borderTop: '1px solid #E5E7EB' }}
      >
        <p className="text-xs font-semibold text-center" style={{ color: '#6B7280' }}>
          Al registrarte obtienes:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#10B981' }}
            />
            <span style={{ color: '#1A1A1A' }}>Acceso instantáneo</span>
          </div>
          <div
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#10B981' }}
            />
            <span style={{ color: '#1A1A1A' }}>Contenido premium</span>
          </div>
          <div
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#10B981' }}
            />
            <span style={{ color: '#1A1A1A' }}>Sistema de puntos</span>
          </div>
          <div
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#10B981' }}
            />
            <span style={{ color: '#1A1A1A' }}>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </PremiumAuthLayout>
  );
}
