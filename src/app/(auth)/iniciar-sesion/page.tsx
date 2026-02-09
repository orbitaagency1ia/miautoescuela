'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useActionState } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginAction } from '@/actions/auth';
import { PremiumAuthLayout } from '@/components/auth/PremiumAuthLayout';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
    success: null,
  });

  useEffect(() => {
    // If login was successful, redirect will happen in the action
    // This is a fallback for edge cases
    if (state.success && !state.error) {
      // Action handles redirect
    }
  }, [state]);

  return (
    <PremiumAuthLayout
      title="Iniciar Sesión"
      description="Introduce tus credenciales para acceder a tu cuenta"
      type="login"
      formState={state}
    >
      <form action={formAction} className="space-y-5">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
            <Link
              href="/recuperar-contraseña"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: '#2563EB' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="•••••••••"
            required
            autoComplete="current-password"
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
          {isPending ? 'Iniciando sesión...' : 'Entrar'}
        </Button>
      </form>
    </PremiumAuthLayout>
  );
}
