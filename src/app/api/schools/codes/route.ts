import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// GET - List all codes for the school
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get user's school membership
    const { data: membership } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('role', 'owner')
      .maybeSingle()) as any;

    if (!membership) {
      return NextResponse.json(
        { error: 'No eres propietario de ninguna autoescuela' },
        { status: 403 }
      );
    }

    // Get all invites/codes for this school
    const { data: codes, error } = await (supabase
      .from('invites')
      .select(`
        id,
        email,
        role,
        token_hash,
        created_at
      `)
      .eq('school_id', membership.school_id)
      .order('created_at', { ascending: false })) as any;

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener códigos' },
        { status: 500 }
      );
    }

    // Filter and format codes (only show code-based invites, not email-based)
    const codeBasedInvites = codes
      ?.filter((invite: any) => invite.email?.includes('@code'))
      .map((invite: any) => ({
        id: invite.id,
        code: invite.token_hash,
        createdAt: invite.created_at,
      }));

    return NextResponse.json({ codes: codeBasedInvites || [] });
  } catch (error: any) {
    console.error('Error getting codes:', error);
    return NextResponse.json(
      { error: 'Error al obtener códigos' },
      { status: 500 }
    );
  }
}

// POST - Generate a new code
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get user's school membership
    const { data: membership } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('role', 'owner')
      .maybeSingle()) as any;

    if (!membership) {
      return NextResponse.json(
        { error: 'No eres propietario de ninguna autoescuela' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { codeType = 'multi', maxUses = 50, expiresInDays = 7 } = body;

    // Generate unique code
    const code = nanoid(8).toUpperCase();

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create invite
    const { data: invite, error } = await (supabase
      .from('invites') as any)
      .insert({
        school_id: membership.school_id,
        email: `${code}@code`,
        role: 'student',
        token_hash: code,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select('id, token_hash, expires_at')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al generar código' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code: {
        id: invite.id,
        code: invite.token_hash,
        expiresAt: invite.expires_at,
        shareableLink: `${process.env.NEXT_PUBLIC_APP_URL}/elegir-destino?code=${invite.token_hash}`,
      },
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: 'Error al generar código' },
      { status: 500 }
    );
  }
}
