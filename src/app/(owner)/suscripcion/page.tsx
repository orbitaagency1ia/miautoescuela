import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle, CheckCircle2, Crown, Sparkles, Zap, CreditCard, TrendingUp, Shield, Users, BookOpen, Trophy, MessageSquare, ChevronRight } from 'lucide-react';
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
  const secondaryColor = school?.secondary_color || '#1E40AF';
  const isActive = school?.subscription_status === 'active' || school?.subscription_status === 'trialing';

  const daysLeft = school?.trial_ends_at
    ? Math.ceil((new Date(school.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200">
              <Crown className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-slate-700">Suscripción</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Plan Profesional
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Gestiona la suscripción de tu autoescuela. Accede a todas las funciones sin límites.
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      {!isActive ? (
        <div className="bg-white relative overflow-hidden rounded-[20px] border-2 border-red-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.15)] transition-all duration-300 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50" />
          <div className="relative border-b border-red-200 p-6 rounded-t-[20px] bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700">Suscripción Inactiva</h3>
                <p className="text-sm text-red-600">
                  Tu suscripción no está activa. Actívala para continuar usando todas las funciones de la plataforma.
                </p>
              </div>
            </div>
          </div>
          <div className="relative p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-slate-900">Activa tu suscripción ahora</h3>
                <p className="text-slate-600 mb-6">
                  Obtén acceso ilimitado a todas las funciones: alumnos ilimitados, contenido multimedia, gamificación y más.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    'Alumnos ilimitados',
                    'Soporte prioritario',
                    'Actualizaciones constantes',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <SubscribeButton size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base px-8 py-6" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Status Cards Grid */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Current Status */}
            <div
              className="bg-white relative overflow-hidden rounded-[20px] border-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 group animate-fade-in select-none"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${primaryColor}05 0%, ${secondaryColor}05 100%)` }}
              />
              <div className="relative border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-t-[20px]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Estado de Suscripción</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Tu plan está activo y funcionando
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative p-5 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <span className="text-sm text-slate-600">Estado</span>
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2",
                      school?.subscription_status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-blue-500/10 text-blue-600'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {school?.subscription_status === 'active' ? 'Activa' : 'Prueba'}
                  </span>
                </div>

                {school?.subscription_status === 'trialing' && daysLeft >= 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-slate-900">Período de Prueba</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">
                        {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (daysLeft / 14) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <span className="text-sm text-slate-600">Plan</span>
                  <span className="text-sm font-semibold text-slate-900">Plan Profesional</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                  <span className="text-sm text-slate-600">Alumnos</span>
                  <span className="text-sm font-semibold text-slate-900">Ilimitados</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-[20px] border-2 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 group animate-fade-in select-none border-slate-100 hover:border-blue-200" style={{ animationDelay: '100ms' }}>
              <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Características del Plan
                </h3>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Users, text: 'Alumnos ilimitados', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: BookOpen, text: 'Contenido multimedia ilimitado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { icon: Trophy, text: 'Sistema de gamificación', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { icon: MessageSquare, text: 'Foro integrado', color: 'text-violet-600', bg: 'bg-violet-50' },
                  { icon: TrendingUp, text: 'Estadísticas avanzadas', color: 'text-rose-600', bg: 'bg-rose-50' },
                  { icon: Shield, text: 'Soporte prioritario', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group/item"
                      style={{ animationDelay: `${150 + index * 50}ms` }}
                    >
                      <div
                        className={`p-2 rounded-lg transition-all duration-200 group-hover/item:scale-110 ${feature.bg}`}
                      >
                        <Icon className={`h-4 w-4 ${feature.color}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature.text}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover/item:text-blue-500 group-hover/item:translate-x-0.5 transition-all duration-200 ml-auto" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Manage Subscription */}
          <div
            className="bg-white relative overflow-hidden rounded-[20px] border-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 group animate-fade-in select-none"
            style={{ borderColor: `${primaryColor}30`, animationDelay: '200ms' }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(135deg, ${primaryColor}05 0%, ${secondaryColor}05 100%)` }}
            />
            <div className="relative border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-t-[20px]">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Gestión de Pago
              </h3>
            </div>
            <div className="relative p-5">
              <div className="space-y-4">
                {school?.stripe_customer_id && (
                  <div className="p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                    <p className="text-sm text-slate-600 mb-4">
                      Gestiona tu método de pago, ver facturas y historial de cobros.
                    </p>
                    <PortalButton className="w-full rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" />
                  </div>
                )}

                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-slate-900">¿Necesitas ayuda?</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta sobre tu suscripción.
                  </p>
                  <Button variant="outline" className="rounded-full border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200">
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Billing History */}
      <div className="bg-white rounded-[20px] border-2 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300 group animate-fade-in select-none border-slate-100 hover:border-blue-200" style={{ animationDelay: '300ms' }}>
        <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex items-center justify-center">
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
          <div className="text-center py-6">
            <PortalButton className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" />
          </div>
        ) : (
          <div className="text-center py-8">
            <div
              className="inline-flex p-6 rounded-[20px] mb-4"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <CreditCard className="h-12 w-12 opacity-50" style={{ color: primaryColor }} />
            </div>
            <p className="text-slate-600 mb-6">
              Activa tu suscripción para ver el historial de facturas
            </p>
            <SubscribeButton
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            />
          </div>
        )}
      </div>
    </div>
  );
}
