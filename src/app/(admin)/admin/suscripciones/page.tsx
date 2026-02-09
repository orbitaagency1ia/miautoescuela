import { createClient } from '@/lib/supabase/server';
import { CreditCard, Sparkles } from 'lucide-react';

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const { data: schools } = await (supabase
    .from('schools')
    .select('*') as any)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Suscripciones</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Admin</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Gestiona las suscripciones de todas las autoescuelas
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
        <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-slate-900">Suscripciones Activas</h3>
          <p className="text-sm text-slate-500 mt-1">
            Listado de suscripciones y su estado actual
          </p>
        </div>
        <div className="p-6">
          {schools && schools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Autoescuela</th>
                    <th className="py-3 px-4 text-left font-medium">Estado</th>
                    <th className="py-3 px-4 text-left font-medium">Periodo de Prueba</th>
                    <th className="py-3 px-4 text-left font-medium">Cliente Stripe</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school: any) => (
                    <tr key={school.id} className="border-b">
                      <td className="py-3 px-4 font-medium">{school.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          school.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : school.subscription_status === 'trialing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {school.subscription_status === 'active'
                            ? 'Activa'
                            : school.subscription_status === 'trialing'
                            ? 'Prueba'
                            : school.subscription_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {school.trial_ends_at
                          ? new Date(school.trial_ends_at).toLocaleDateString('es-ES')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {school.stripe_customer_id || 'No configurado'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">No hay suscripciones registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
