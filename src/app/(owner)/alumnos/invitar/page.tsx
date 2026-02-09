'use client';

import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Send, Sparkles, Users, CheckCircle2, Info, Loader2 } from 'lucide-react';
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
      const secondaryColor = school?.secondary_color || '#1E40AF';

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
    <div className="space-y-8 animate-fade-in">
      {/* Back Button */}
      <div>
        <Link href="/alumnos">
          <Button variant="ghost" size="sm" className="rounded-full mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Alumnos
          </Button>
        </Link>
      </div>

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-8 md:p-10 border border-primary/20 text-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div
            className="p-6 rounded-3xl inline-flex mb-6 shadow-lg transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #3B82F6 0%, #4F46E5 50%, #7C3AED 100%)`,
            }}
          >
            <Mail className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Invitar Alumno
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Envía una invitación a un nuevo alumno para que se una a tu autoescuela
          </p>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={cn(
            "bg-white rounded-2xl p-6 border-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 animate-slide-down",
            result.success
              ? "border-green-500/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
              : "border-destructive/30 bg-gradient-to-r from-destructive/50 to-destructive/100"
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "p-3 rounded-2xl flex-shrink-0",
                result.success
                  ? "bg-green-500/20"
                  : "bg-destructive/20"
              )}
            >
              {result.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Info className="h-6 w-6 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={cn(
                  "font-semibold mb-1",
                  result.success ? "text-green-700 dark:text-green-400" : "text-destructive"
                )}
              >
                {result.success ? '¡Invitación Enviada!' : 'Error'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {result.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-white rounded-2xl border-2 p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 max-w-2xl mx-auto">
        <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-t-2xl -mx-8 -mt-8 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, #3B82F6 0%, #4F46E5 50%, #7C3AED 100%)`,
              }}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Invitación por Correo</h3>
              <p className="text-sm text-slate-500 mt-1">
                El alumno recibirá un correo con un enlace seguro para registrarse
              </p>
            </div>
          </div>
        </div>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-medium">
              Correo Electrónico del Alumno
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="alumno@ejemplo.com"
                required
                className="pl-12 h-12 rounded-xl border-2 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              El alumno usará este correo para registrarse
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="message" className="text-base font-medium">
              Mensaje Personalizado (Opcional)
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Hola, te invito a unirte a nuestra autoescuela. Podrás acceder a todo el contenido de formación."
              rows={5}
              className="resize-none rounded-xl border-2 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isLoading}
            />
          </div>

          {/* Info Card */}
          <div className="p-5 rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/20 flex-shrink-0">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Información</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• El enlace de invitación caduca en 7 días</li>
                  <li>• El alumno deberá crear su cuenta con el correo</li>
                  <li>• Será añadido automáticamente a tu autoescuela</li>
                  <li>• Recibirá un email de bienvenida</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105 text-base py-6"
            style={{
              background: `linear-gradient(135deg, #3B82F6 0%, #4F46E5 50%, #7C3AED 100%)`,
            }}
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

      {/* Tips Card */}
      <div className="bg-white rounded-2xl border-2 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200 max-w-2xl mx-auto">
        <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-primary" />
            Consejos
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Puedes invitar a múltiples alumnos enviando invitaciones individuales
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Mail className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Asegúrate de que el correo electrónico del alumno sea correcto para recibir la invitación
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Una vez registrado, el alumno tendrá acceso inmediato a todo el contenido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
