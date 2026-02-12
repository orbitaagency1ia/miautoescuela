'use client';

import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Send, Sparkles, Users, CheckCircle2, Info, Loader2, Clock, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function InviteStudentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setResult(null);

    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/iniciar-sesion');
        return;
      }

      // Get user's school membership
      const { data: membership } = await supabase
        .from('school_members')
        .select('school_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('role', 'owner')
        .maybeSingle() as any;

      if (!membership) {
        router.push('/setup');
        return;
      }

      // Get school for branding
      const { data: school } = await supabase
        .from('schools')
        .select('primary_color, secondary_color, name')
        .eq('id', membership.school_id)
        .single() as any;

      const primaryColor = school?.primary_color || '#3B82F6';
      const secondaryColor = school?.secondaryColor || '#1E40AF';

      // Call the invite action
      const response = await fetch('/api/invites/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Invitación enviada correctamente a ${email}. El alumno recibirá un correo con instrucciones.`,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Error al enviar la invitación',
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error al enviar la invitación',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Link href="/alumnos">
        <Button variant="ghost" size="sm" className="rounded-full hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Alumnos
        </Button>
      </Link>

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 md:p-10 border border-blue-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Invitar Alumno
                </h1>
                <p className="text-base text-slate-600 mt-1">
                  Envía una invitación a un nuevo alumno para que se una a tu autoescuela
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Proceso Simple</p>
                <p className="text-sm text-slate-500">El alumno recibirá un enlace seguro por correo</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">Acceso Inmediato</p>
                <p className="text-sm text-slate-500">Una vez registrado tendrá acceso al contenido</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.15)] hover:-translate-y-1 transition-all duration-300 animate-fade-in select-none" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-700 mb-2">7 Días</p>
                <p className="text-sm text-slate-500">Vigencia del enlace de invitación</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={cn(
            "rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 animate-fade-in",
            result.success
              ? "bg-white border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
              : "bg-white border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50"
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                result.success
                  ? "bg-green-100"
                  : "bg-red-100"
              )}
            >
              {result.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Info className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={cn(
                  "text-lg font-bold mb-1",
                  result.success ? "text-green-700" : "text-red-700"
                )}
              >
                {result.success ? '¡Invitación Enviada!' : 'Error'}
              </h3>
              <p className="text-sm text-slate-600">
                {result.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 max-w-2xl mx-auto overflow-hidden">
        <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Invitación por Correo</h3>
              <p className="text-sm text-slate-500">
                El alumno recibirá un correo con un enlace seguro para registrarse
              </p>
            </div>
          </div>
        </div>
        <form action={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-semibold text-slate-700">
              Correo Electrónico del Alumno *
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="alumno@ejemplo.com"
                required
                className="pl-12 h-12 rounded-xl border-2 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="message" className="text-base font-semibold text-slate-700">
              Mensaje Personalizado (Opcional)
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Hola, te invito a unirte a nuestra autoescuela. Podrás acceder a todo el contenido de formación."
              rows={5}
              className="resize-none rounded-xl border-2 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando invitación...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Enviar Invitación
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 max-w-2xl mx-auto overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="border-b bg-gradient-to-r from-purple-50 to-pink-50 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Consejos</h3>
              <p className="text-sm text-slate-500">
                Información útil sobre las invitaciones
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">
              Puedes invitar a múltiples alumnos enviando invitaciones individuales
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-600">
              Asegúrate de que el correo electrónico del alumno sea correcto para recibir la invitación
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-violet-600" />
            </div>
            <p className="text-sm text-slate-600">
              Una vez registrado, el alumno tendrá acceso inmediato a todo el contenido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
