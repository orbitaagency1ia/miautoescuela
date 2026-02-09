import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChooseDestinoClient } from './choose-destino-client';

export default async function ChooseDestinationPage({
  searchParams,
}: {
  searchParams: Promise<{ force?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/iniciar-sesion');
  }

  const params = await searchParams;
  const forceShow = params.force === 'true';

  // Verificar si ya tiene una escuela
  const { data: membership } = await (supabase
    .from('school_members')
    .select(`
      role,
      schools(id, name, primary_color, secondary_color)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  // Si ya tiene una escuela Y no se fuerza mostrar, redirigir según su rol
  if (membership && !forceShow) {
    if (membership.role === 'admin') {
      redirect('/admin');
    } else if (membership.role === 'owner') {
      redirect('/panel');
    } else {
      redirect('/inicio');
    }
  }

  // Mostrar opciones (no tiene escuela o forzado)
  return (
    <ChooseDestinoClient
      userName={user.user_metadata?.full_name || user.email!}
      hasSchool={!!membership}
      currentSchool={membership?.schools}
    />
  );
}
