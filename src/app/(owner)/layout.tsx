import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OwnerSidebar } from '@/components/layout/OwnerSidebar';
import { SchoolThemeProvider } from '@/components/providers/SchoolThemeProvider';
import { checkSchoolAccess } from '@/lib/middleware/subscription';

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  // Get user's school membership
  const { data: membership } = await supabase
    .from('school_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle() as any;

  if (!membership) {
    redirect('/setup');
  }

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    redirect('/inicio');
  }

  // 🔒 NUEVA PROTECCIÓN: Verificar que la escuela esté activa o en trial
  const schoolAccess = await checkSchoolAccess(membership.school_id);

  if (!schoolAccess.allowed) {
    // Si no tiene acceso, mostrar página de suscripción expirada
    return (
      <SchoolThemeProvider colors={{ primary: '#3B82F6', secondary: '#1E40AF' }}>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
          <div className="max-w-md w-full mx-4 p-8">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 6m-6 0v6m6-0v6" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {schoolAccess.reason === 'Trial period has ended'
                  ? '⏰ Tu periodo de prueba ha finalizado'
                  : schoolAccess.reason === 'Payment is overdue'
                  ? '💳 El pago de tu suscripción está pendiente'
                  : schoolAccess.reason === 'Subscription has been canceled'
                  ? '🚫 La suscripción ha sido cancelada'
                  : '⚠️ La suscripción no está activa'}
              </h1>

              {schoolAccess.school && (
                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Escuela:</strong> {schoolAccess.school.name}
                  </p>
                  <p className="text-sm text-amber-700">
                    Estado: <strong className="uppercase">{schoolAccess.school.subscription_status}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {schoolAccess.reason === 'Trial period has ended' && (
                  <p className="text-gray-700">
                    Tu periodo de prueba de 14 días ha finalizado. Para continuar usando mIAutoescuela,
                    por favor suscribete a un plan de pago.
                  </p>
                )}

                {schoolAccess.reason === 'Payment is overdue' && (
                  <p className="text-gray-700">
                    El pago de tu suscripción está pendiente. Por favor actualiza tu método de pago
                    o contacta a soporte para reactivar tu acceso.
                  </p>
                )}

                {schoolAccess.reason === 'Subscription has been canceled' && (
                  <p className="text-gray-700">
                    La suscripción ha sido cancelada. Si deseas reactivar tu cuenta,
                    por favor contacta a soporte.
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">¿Necesitas ayuda?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Contacta a nuestro equipo de soporte para cualquier pregunta o problema técnico.
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:soporte@miautoescuela.com"
                    className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    📧 soporte@miautoescuela.com
                  </a>
                  <a
                    href="/"
                    className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors mt-3"
                  >
                    ← Volver al inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SchoolThemeProvider>
    );
  }

  // Get school data with colors
  const { data: school } = await supabase
    .from('schools')
    .select('name, primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle() as any;

  const schoolName = school?.name || 'mIAutoescuela';
  const primaryColor = school?.primary_color || '#3B82F6';
  const secondaryColor = school?.secondary_color || '#1E40AF';

  return (
    <SchoolThemeProvider colors={{ primary: primaryColor, secondary: secondaryColor }}>
      <div className="flex h-screen" style={{ background: `linear-gradient(180deg, ${primaryColor}03 0%, white 30%)` }}>
        <OwnerSidebar schoolName={schoolName} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SchoolThemeProvider>
  );
}
