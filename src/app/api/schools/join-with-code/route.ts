import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toUpperCase();

    // Buscar la invitación por el código
    // Primero buscamos por una invite que coincida con el código
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token_hash', trimmedCode)
      .is('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (inviteError || !invite) {
      console.error('Error buscando invitación:', inviteError);
      return NextResponse.json(
        { error: 'Código inválido o expirado. Verifica con tu autoescuela.' },
        { status: 404 }
      );
    }

    // Verificar que el usuario no esté ya en esa escuela
    const { data: existingMember } = await supabase
      .from('school_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', invite.school_id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: 'Ya eres miembro de esta autoescuela' },
        { status: 400 }
      );
    }

    // Crear perfil si no existe
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      // El perfil no existe, crearlo
      await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email || '',
          phone: user.user_metadata?.phone || null,
        });
    }

    // Añadir usuario a la escuela con el rol de la invitación
    const { error: memberError } = await supabase
      .from('school_members')
      .insert({
        user_id: user.id,
        school_id: invite.school_id,
        role: invite.role || 'student',
        status: 'active',
      });

    if (memberError) {
      return NextResponse.json(
        { error: 'Error al unirse a la autoescuela' },
        { status: 500 }
      );
    }

    // Marcar la invitación como usada
    await supabase
      .from('invites')
      .update({ used_at: new Date().toISOString() })
      .eq('token_hash', trimmedCode);

    return NextResponse.json({
      success: true,
      schoolName: invite.school_id, // Podríamos hacer join para obtener el nombre
    });
  } catch (error: any) {
    console.error('Error uniendo a escuela:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
