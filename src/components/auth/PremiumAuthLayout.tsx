'use client';

import { ReactNode } from 'react';
import { Car, Shield, Zap, Award } from 'lucide-react';
import Link from 'next/link';

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
    { icon: Shield, text: '100% Seguro' },
    { icon: Zap, text: 'Uso Rápido' },
    { icon: Award, text: 'Certificado' },
  ];

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        backgroundColor: '#F8F9FA',
      }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div
              className="p-4 rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              }}
            >
              <Car className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1
                className="text-4xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                mIAutoescuela
              </h1>
              <p style={{ color: '#6B7280' }}>Plataforma LMS Premium</p>
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
            >
              <span className="text-sm font-medium">
                {type === 'login' ? 'Bienvenido de nuevo' : 'Únete a nosotros'}
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold" style={{ color: '#111827' }}>
              {type === 'login' ? 'Inicia Sesión' : 'Crea tu Cuenta'}
            </h2>
            <p className="text-xl" style={{ color: '#1A1A1A' }}>
              {type === 'login'
                ? 'Accede a tu plataforma de aprendizaje y continúa tu camino hacia obtener el carnet de conducir.'
                : 'Comienza tu viaje hacia obtener el carnet de conducir con la plataforma más avanzada.'}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl border-2"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium" style={{ color: '#1F2937' }}>
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Form */}
        <div>
          <div
            className="p-8 rounded-3xl border-2 shadow-xl"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
            }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-xl shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  }}
                >
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold" style={{ color: '#111827' }}>
                  mIAutoescuela
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <h3 className="text-2xl lg:text-3xl font-bold" style={{ color: '#111827' }}>
                {title}
              </h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>{description}</p>
            </div>

            {/* Error Display */}
            {formState?.error && (
              <div
                className="mb-6 p-4 rounded-xl border-2 flex items-start gap-3"
                style={{
                  backgroundColor: '#FEE2E2',
                  borderColor: '#FECACA',
                  color: '#991B1B',
                }}
              >
                <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">Error de autenticación</p>
                  <p className="text-sm">{formState.error}</p>
                </div>
              </div>
            )}

            {/* Success Display */}
            {formState?.success && (
              <div
                className="mb-6 p-4 rounded-xl border-2 flex items-start gap-3"
                style={{
                  backgroundColor: '#D1FAE5',
                  borderColor: '#A7F3D0',
                  color: '#065F46',
                }}
              >
                <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">¡Éxito!</p>
                  <p className="text-sm">{formState.success}</p>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="relative z-10">{children}</div>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm">
              {type === 'login' ? (
                <>
                  <span style={{ color: '#6B7280' }}>¿No tienes cuenta?</span>{' '}
                  <Link
                    href="/registro"
                    className="font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: '#2563EB' }}
                  >
                    Regístrate gratis
                  </Link>
                </>
              ) : (
                <>
                  <span style={{ color: '#6B7280' }}>¿Ya tienes cuenta?</span>{' '}
                  <Link
                    href="/iniciar-sesion"
                    className="font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: '#2563EB' }}
                  >
                    Inicia Sesión
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div
              className="mt-8 pt-6 border-t"
              style={{ borderColor: '#E5E7EB' }}
            >
              <p className="text-xs text-center mb-4" style={{ color: '#9CA3AF' }}>
                Más de 5,000 alumnos ya confían en nosotros
              </p>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i % 2 === 0 ? '#2563EB' : '#93C5FD',
                      opacity: 0.6,
                    }}
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
