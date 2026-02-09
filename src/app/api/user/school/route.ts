import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get school_id from active membership
    const { data: membership, error: membershipError } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle() as any);

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'No tienes acceso a ninguna autoescuela' },
        { status: 403 }
      );
    }

    // Get school data
    const { data: school, error: schoolError } = await (supabase
      .from('schools')
      .select('id, name, slug, logo_url, primary_color')
      .eq('id', membership.school_id)
      .maybeSingle() as any);

    if (schoolError || !school) {
      return NextResponse.json(
        { error: 'Autoescuela no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    return NextResponse.json(
      { error: 'Error al cargar la autoescuela' },
      { status: 500 }
    );
  }
}
