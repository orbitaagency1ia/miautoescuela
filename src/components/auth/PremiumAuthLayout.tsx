'use client';

import { ReactNode } from 'react';
import { Car, Shield, Zap, Award, Sparkles, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FormState {
  error: string | null;
  success: string | null;
}

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  type?: 'login' | 'register';
  formState?: FormState;
}

export function PremiumAuthLayout({ children, title, description, type = 'login', formState }: AuthLayoutProps) {
  const features = [
    { icon: BookOpen, text: 'Contenido Premium', desc: 'Clases en video HD' },
    { icon: Award, text: 'Certificación', desc: 'Preparación oficial' },
    { icon: Users, text: 'Comunidad', desc: 'Foro de alumnos' },
    { icon: Zap, text: 'Gamificación', desc: 'Sistema de puntos' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/25">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                mIAutoescuela
              </h1>
              <p className="text-slate-500">Plataforma LMS Premium</p>
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {type === 'login' ? 'Bienvenido de nuevo' : 'Únete a nosotros'}
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              {type === 'login' ? 'Inicia Sesión' : 'Crea tu Cuenta'}
            </h2>
            <p className="text-lg text-slate-600 max-w-lg">
              {type === 'login'
                ? 'Accede a tu plataforma de aprendizaje y continúa tu camino hacia obtener el carnet de conducir.'
                : 'Comienza tu viaje hacia obtener el carnet de conducir con la plataforma más avanzada.'}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 animate-fade-in"
                  style={{ animationDelay: `${200 + index * 75}ms` }}
                >
                  <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 transition-all duration-300 pointer-events-none" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm mb-1">{feature.text}</p>
                    <p className="text-xs text-slate-500">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Form */}
        <div>
          <div className="p-8 rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] border-2 border-slate-100 animate-scale-in">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  mIAutoescuela
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">
                {title}
              </h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>

            {/* Error Display */}
            {formState?.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
                <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-red-900 mb-1">Error de autenticación</p>
                  <p className="text-sm text-red-700">{formState.error}</p>
                </div>
              </div>
            )}

            {/* Success Display */}
            {formState?.success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-emerald-900 mb-1">¡Éxito!</p>
                  <p className="text-sm text-emerald-700">{formState.success}</p>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="relative z-10">{children}</div>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm">
              {type === 'login' ? (
                <>
                  <span className="text-slate-500">¿No tienes cuenta?</span>{' '}
                  <Link
                    href="/registro"
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Regístrate gratis
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-slate-500">¿Ya tienes cuenta?</span>{' '}
                  <Link
                    href="/iniciar-sesion"
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Inicia Sesión
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-center mb-4 text-slate-400">
                Plataforma de formación líder
              </p>
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ opacity: 0.4 + (i * 0.15) }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
