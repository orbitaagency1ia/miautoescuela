import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle, CheckCircle2, Crown, Sparkles, Zap, CreditCard, TrendingUp, Shield, Users, BookOpen, Trophy, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscribeButton } from '@/components/stripe/SubscribeButton';
import { PortalButton } from '@/components/stripe/PortalButton';
import { cn } from '@/lib/utils';

export default async function SubscriptionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get user's school membership
  const { data: membership } = await (supabase
    .from('school_members')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('role', 'owner')
    .maybeSingle() as any);

  if (!membership) {
    redirect('/setup');
  }

  // Get school details
  const { data: school } = await (supabase
    .from('schools')
    .select('id, name, primary_color, secondary_color, subscription_status, trial_ends_at, stripe_customer_id')
    .eq('id', membership.school_id)
    .single() as any);

  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondaryColor || '#1E40AF';
  const isActive = school?.subscription_status === 'active' || school?.subscription_status === 'trialing';

  const daysLeft = school?.trial_ends_at
    ? Math.ceil((new Date(school.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-8 md:p-10 border border-primary/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/20">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Suscripción</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Plan Profesional
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Gestiona la suscripción de tu autoescuela. Accede a todas las funciones sin límites.
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      {!isActive ? (
        <div className="bg-white relative overflow-hidden rounded-2xl border-2 border-destructive/30 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10" />
          <div className="relative border-b border-destructive/20 p-6 rounded-t-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-destructive">Suscripción Inactiva</h3>
                <p className="text-sm text-destructive/80">
                  Tu suscripción no está activa. Actívala para continuar usando todas las funciones de la plataforma.
                </p>
              </div>
            </div>
          </div>
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Activa tu suscripción ahora</h3>
                <p className="text-muted-foreground mb-6">
                  Obtén acceso ilimitado a todas las funciones: alumnos ilimitados, contenido multimedia, gamificación y más.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Alumnos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Soporte prioritario</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Actualizaciones constantes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <SubscribeButton size="lg" className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105 text-base px-8" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Status Card */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Current Status */}
            <div
              className="bg-white relative overflow-hidden rounded-2xl border-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${primaryColor}03 0%, ${secondaryColor}03 100%)` }}
              />
              <div className="relative border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Estado de Suscripción</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Tu plan está activo y funcionando
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2",
                      school?.subscription_status === 'active'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-blue-500/10 text-blue-600'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {school?.subscription_status === 'active' ? 'Activa' : 'Prueba'}
                  </span>
                </div>

                {school?.subscription_status === 'trialing' && daysLeft >= 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-100 dark:border-blue-900">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Período de Prueba</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                      </span>
                    </div>
                    <div className="w-full bg-white dark:bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (daysLeft / 14) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-semibold">Plan Profesional</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                  <span className="text-sm text-muted-foreground">Alumnos</span>
                  <span className="text-sm font-semibold">Ilimitados</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border-2 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
              <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Zap className="h-5 w-5 text-primary" />
                  Características del Plan
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Users, text: 'Alumnos ilimitados' },
                  { icon: BookOpen, text: 'Contenido multimedia ilimitado' },
                  { icon: Trophy, text: 'Sistema de gamificación' },
                  { icon: MessageSquare, text: 'Foro integrado' },
                  { icon: TrendingUp, text: 'Estadísticas avanzadas' },
                  { icon: Shield, text: 'Soporte prioritario' },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className="p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Manage Subscription */}
          <div
            className="bg-white relative overflow-hidden rounded-2xl border-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200"
            style={{ borderColor: `${primaryColor}30` }}
          >
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${primaryColor}03 0%, ${secondaryColor}03 100%)` }}
            />
            <div className="relative border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-t-2xl">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <CreditCard className="h-5 w-5 text-primary" />
                Gestión de Pago
              </h3>
            </div>
            <div className="relative p-6">
              <div className="space-y-4">
                {school?.stripe_customer_id && (
                  <div className="p-4 rounded-xl border border-border/50">
                    <p className="text-sm text-muted-foreground mb-4">
                      Gestiona tu método de pago, ver facturas y historial de cobros.
                    </p>
                    <PortalButton className="w-full rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105" />
                  </div>
                )}

                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <span className="font-semibold">¿Necesitas ayuda?</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta sobre tu suscripción.
                  </p>
                  <Button variant="outline" className="rounded-full border-primary/50 hover:bg-primary/5 transition-all duration-200">
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Billing History */}
      <div className="bg-white rounded-2xl border-2 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
        <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Historial de Facturas</h3>
              <p className="text-sm text-slate-500 mt-1">
                {school?.stripe_customer_id
                  ? 'Gestiona tus facturas y recibos desde el portal de Stripe'
                  : 'Necesitas tener una suscripción activa para ver las facturas'
                }
              </p>
            </div>
          </div>
        </div>
        {school?.stripe_customer_id ? (
          <div className="text-center py-8">
            <PortalButton className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105" />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex p-6 rounded-3xl mb-4" style={{ backgroundColor: `${primaryColor}10` }}>
              <CreditCard className="h-12 w-12 opacity-50" style={{ color: primaryColor }} />
            </div>
            <p className="text-muted-foreground mb-6">
              Activa tu suscripción para ver el historial de facturas
            </p>
            <SubscribeButton
              size="lg"
              className="rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-105"
            />
          </div>
        )}
      </div>
    </div>
  );
}
