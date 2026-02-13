import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { SchoolThemeProvider } from '@/components/providers/SchoolThemeProvider';
import { checkSchoolAccess } from '@/lib/middleware/subscription';

export default async function StudentLayout({
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
    .maybeSingle();

  if (!membership) {
    redirect('/elegir-destino');
  }

  // 🔒 NUEVA PROTECCIÓN: Verificar que la escuela esté activa
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0 7a3 3 0 013 3c0 5.5 5.5 5.5 5.5 0 0130 7a3 3 0 013-3c0 5.5-5.5 5.5-5.5 5.5 0 013-7a3 3 0 01-3z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {schoolAccess.reason === 'Trial period has ended'
                  ? '⏰ Tu periodo de prueba ha finalizado'
                  : schoolAccess.reason === 'Payment is overdue'
                  ? '💳 El pago de tu suscripción está pendiente'
                  : '⚠️ La suscripción de tu escuela no está activa'}
              </h1>

              <div className="space-y-4">
                <p className="text-gray-700">
                  {schoolAccess.school && (
                    <><strong>Escuela:</strong> {schoolAccess.school.name}</>
                  )}
                </p>

                {schoolAccess.school && (
                  <p className="text-gray-700">
                    <strong>Estado:</strong> <span className="uppercase">{schoolAccess.school.subscription_status}</span>
                  </p>
                )}

                {schoolAccess.reason === 'Trial period has ended' && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      Tu escuela tuvo un periodo de prueba de 14 días. Para continuar usando mIAutoescuela,
                      necesitas suscribirte a un plan de pago.
                    </p>
                  </div>
                )}

                {schoolAccess.reason === 'Payment is overdue' && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      El pago de tu suscripción está pendiente. Por favor actualiza tu método de pago
                      o contacta a soporte para reactivar tu acceso.
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    ¿Necesitas ayuda? Contacta a nuestro equipo de soporte:
                  </p>
                  <a
                    href="mailto:soporte@miautoescuela.com"
                    className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    📧 soporte@miautoescuela.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SchoolThemeProvider>
    );
  }

  // Get school colors for theming
  const { data: school } = await supabase
    .from('schools')
    .select('primary_color, secondary_color')
    .eq('id', membership.school_id)
    .maybeSingle();

  const schoolColors = {
    primary: school?.primary_color || '#3b82f6',
    secondary: school?.secondary_color || '#1e40af',
  };

  return (
    <SchoolThemeProvider colors={schoolColors}>
      <div className="flex h-screen">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-screen p-6 md:p-8" style={{
            background: `linear-gradient(180deg, ${schoolColors.primary}08 0%, ${schoolColors.secondary}03 20%, white 50%)`,
          }}>
            {children}
          </div>
        </main>
      </div>
    </SchoolThemeProvider>
  );
}
