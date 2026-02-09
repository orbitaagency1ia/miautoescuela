import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener school_id del owner
    const { data: membership } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('role', 'owner')
      .maybeSingle() as any);

    if (!membership) {
      return NextResponse.json(
        { error: 'No eres propietario de ninguna autoescuela' },
        { status: 403 }
      );
    }

    // Generar código único de 6 caracteres (ej: AUTO12)
    const code = nanoid(6).toUpperCase();

    // Calcular fecha de expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Crear invitación
    const { data: invite, error: inviteError } = await (supabase
      .from('invites') as any)
      .insert({
        school_id: membership.school_id,
        email: code + '@code', // Email placeholder (no se usa para registro)
        role: 'student',
        token_hash: code, // Usar el código directamente como hash (simplificado)
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select('token_hash, expires_at')
      .single();

    if (inviteError) {
      return NextResponse.json(
        { error: 'Error al generar código' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code: invite.token_hash,
      expiresAt: invite.expires_at,
      shareableLink: `${process.env.NEXT_PUBLIC_APP_URL}/elegir-destino?code=${invite.token_hash}`,
    });
  } catch (error: any) {
    console.error('Error generando código:', error);
    return NextResponse.json(
      { error: 'Error al generar código' },
      { status: 500 }
    );
  }
}
