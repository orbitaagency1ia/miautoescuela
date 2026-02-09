'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import {
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  Code,
  GraduationCap,
  LogOut,
  Check,
  AlertCircle,
  Home,
  Crown,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ChooseDestinoClientProps {
  userName: string;
  hasSchool?: boolean;
  currentSchool?: {
    id: string;
    name: string;
    primary_color?: string;
    secondary_color?: string;
  } | null;
}

export function ChooseDestinoClient({ userName, hasSchool = false, currentSchool }: ChooseDestinoClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedOption, setSelectedOption] = useState<'create' | 'join' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const primaryColor = currentSchool?.primary_color || '#3B82F6';
  const secondaryColor = currentSchool?.secondary_color || '#1E40AF';

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      setError('Por favor ingresa un código de invitación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/schools/join-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al unirse a la autoescuela');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/inicio';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/iniciar-sesion');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setSignOutLoading(false);
    }
  };

  const handleGoToSchool = () => {
    if (currentSchool) {
      // Redirigir según el rol - usar el middleware para decidir
      window.location.href = '/inicio';
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md p-8 text-center animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Check className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Bienvenido!
          </h2>
          <p className="text-slate-600 mb-6">
            Te has unido a la autoescuela correctamente. Redirigiendo...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header Premium con botón cerrar sesión */}
        <div className="flex items-center justify-between mb-8">
          {/* Botón Volver mejorado */}
          <Link href="/iniciar-sesion">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>
          </Link>

          {/* Botón Cerrar Sesión */}
          <Button
            onClick={handleSignOut}
            disabled={signOutLoading}
            variant="ghost"
            size="lg"
            className="rounded-full hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold transition-all duration-200"
          >
            {signOutLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full mr-2" />
                Cerrando...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar Sesión
              </>
            )}
          </Button>
        </div>

        {/* Info Banner si ya tiene escuela */}
        {hasSchool && currentSchool && (
          <Card
            className="mb-8 border-2 shadow-lg"
            style={{
              borderColor: `${primaryColor}40`,
              background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}08 100%)`,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Ya eres miembro de
                    </h3>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">{currentSchool.name}</strong>
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGoToSchool}
                  className="rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir a mi Escuela
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm mb-6">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-700">
              ¡Hola, {userName.split(' ')[0]}!
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            ¿Qué deseas hacer?
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Comienza tu aprendizaje o crea tu propia autoescuela
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create School Option */}
          <Card
            className={cn(
              'relative overflow-hidden border-2 transition-all duration-300 cursor-pointer group',
              selectedOption === 'create'
                ? 'border-blue-500 ring-4 ring-blue-500/20'
                : 'border-transparent hover:border-slate-200 hover:shadow-xl hover:scale-[1.02]'
            )}
            onClick={() => {
              setSelectedOption('create');
              setError('');
              window.location.href = '/setup';
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="relative p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Crear Autoescuela
                  </h3>
                  <p className="text-sm text-slate-600">
                    Empieza tu propia autoescuela hoy
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Gestión completa de alumnos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Sube y organiza clases</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Sistema de gamificación</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>14 días de prueba gratis</span>
                </li>
              </ul>

              <Button className="w-full mt-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Join School Option */}
          <Card
            className={cn(
              'relative overflow-hidden border-2 transition-all duration-300',
              selectedOption === 'join'
                ? 'border-emerald-500 ring-4 ring-emerald-500/20'
                : 'border-transparent hover:border-slate-200 hover:shadow-xl hover:scale-[1.02]'
            )}
            onClick={() => {
              setSelectedOption('join');
              setError('');
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="relative p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Unirse a Autoescuela
                  </h3>
                  <p className="text-sm text-slate-600">
                    Ingresa con un código de invitación
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Acceso inmediato al contenido</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Aprende a tu ritmo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Foro y comunidad</span>
                </li>
              </ul>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-semibold text-slate-800">
                    Código de Invitación
                  </Label>
                  <Input
                    id="code"
                    placeholder="Ej: AUTOESC-123"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    className="h-12 rounded-xl border-2 border-slate-300 text-center uppercase tracking-widest font-mono text-slate-900 bg-slate-50 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-slate-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleJoinWithCode}
                  disabled={loading || !inviteCode.trim()}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Verificando...' : 'Unirse'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-2 shadow-premium" style={{
          borderColor: `${primaryColor}30`,
          background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}08 100%)`,
        }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl" style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}>
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  ¿Ya tienes un código?
                </h4>
                <p className="text-sm text-slate-700">
                  Ingresa el código que te proporcionó tu autoescuela para unirte y comenzar a aprender.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
