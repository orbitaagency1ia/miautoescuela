import { createClient } from '@/lib/supabase/server';
import { CreditCard, Sparkles, Building2, Users, CheckCircle, Clock, XCircle, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const { data: schools } = await (supabase
    .from('schools')
    .select('*') as any)
    .order('created_at', { ascending: false });

  // Calculate stats
  const activeCount = schools?.filter((s: any) => s.subscription_status === 'active').length || 0;
  const trialingCount = schools?.filter((s: any) => s.subscription_status === 'trialing').length || 0;
  const totalSchools = schools?.length || 0;

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-6 md:p-8 border border-emerald-200/50">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-emerald-700 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>Administración</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Suscripciones
          </h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Gestiona las suscripciones de todas las autoescuelas
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-3">
        {/* Total Schools */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-emerald-200/50 animate-fade-in select-none" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Autoescuelas</p>
              <p className="text-3xl font-bold text-gray-900">{totalSchools}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-emerald-200/50 animate-fade-in select-none" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Suscripciones Activas</p>
              <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Trial Periods */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-emerald-200/50 animate-fade-in select-none" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/50 transition-all duration-300 pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">En Prueba</p>
              <p className="text-3xl font-bold text-gray-900">{trialingCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Suscripciones Activas</h2>
                <p className="text-sm text-gray-600">Listado de suscripciones y su estado actual</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {totalSchools} autoescuelas
            </div>
          </div>
        </div>

        <div className="p-6">
          {schools && schools.length > 0 ? (
            <div className="space-y-3">
              {schools.map((school: any, index: number) => (
                <Link
                  key={school.id}
                  href={`/admin/autoescuelas/${school.id}`}
                  className="block"
                >
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in group cursor-pointer select-none"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/50 transition-all duration-300 pointer-events-none" />

                    {/* School Icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        {school.name?.slice(0, 2).toUpperCase() || 'AU'}
                      </div>
                    </div>

                    {/* School Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                        {school.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {school.id.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        school.subscription_status === 'active'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : school.subscription_status === 'trialing'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {school.subscription_status === 'active' && <CheckCircle className="h-3.5 w-3.5" />}
                        {school.subscription_status === 'trialing' && <Clock className="h-3.5 w-3.5" />}
                        {school.subscription_status === 'active'
                          ? 'Activa'
                          : school.subscription_status === 'trialing'
                          ? 'Prueba'
                          : school.subscription_status}
                      </span>
                    </div>

                    {/* Trial End Date */}
                    {school.trial_ends_at && (
                      <div className="flex-shrink-0 text-right min-w-[100px]">
                        <p className="text-sm text-gray-600">
                          {new Date(school.trial_ends_at).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-xs text-gray-400">Fin prueba</p>
                      </div>
                    )}

                    {/* Stripe Status */}
                    <div className="flex-shrink-0 text-right min-w-[120px]">
                      <div className="flex items-center gap-2">
                        {school.stripe_customer_id ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Conectado
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">
                            <XCircle className="h-3.5 w-3.5" />
                            No configurado
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-6 rounded-3xl mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
                <CreditCard className="h-16 w-16 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin datos</h3>
              <p className="text-gray-500">
                No hay suscripciones registradas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
