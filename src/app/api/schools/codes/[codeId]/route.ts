import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

interface RouteContext {
  params: Promise<{ codeId: string }>;
}

// PATCH - Update code (revoke, regenerate)
export async function PATCH(request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const { codeId } = await context.params;

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
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Get the existing code
    const { data: existingCode } = await (supabase
      .from('invites')
      .select('*')
      .eq('id', codeId)
      .eq('school_id', membership.school_id)
      .single()) as any;

    if (!existingCode) {
      return NextResponse.json(
        { error: 'Código no encontrado' },
        { status: 404 }
      );
    }

    if (action === 'revoke') {
      // Revoke the code
      const { error } = await (supabase
        .from('invites') as any)
        .update({ status: 'revoked' })
        .eq('id', codeId);

      if (error) {
        return NextResponse.json(
          { error: 'Error al revocar código' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Código revocado' });
    }

    if (action === 'regenerate') {
      // Generate new code
      const newCode = nanoid(8).toUpperCase();

      const { data: updated, error } = await (supabase
        .from('invites') as any)
        .update({
          token_hash: newCode,
          email: `${newCode}@code`,
        })
        .eq('id', codeId)
        .select('id, token_hash, expires_at')
        .single();

      if (error || !updated) {
        return NextResponse.json(
          { error: 'Error al regenerar código' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        code: {
          id: updated.id,
          code: updated.token_hash,
          expiresAt: updated.expires_at,
          shareableLink: `${process.env.NEXT_PUBLIC_APP_URL}/elegir-destino?code=${updated.token_hash}`,
        },
      });
    }

    if (action === 'activate') {
      // Reactivate a revoked code
      const { error } = await (supabase
        .from('invites') as any)
        .update({ status: 'active' })
        .eq('id', codeId);

      if (error) {
        return NextResponse.json(
          { error: 'Error al activar código' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Código activado' });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating code:', error);
    return NextResponse.json(
      { error: 'Error al actualizar código' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a code
export async function DELETE(request: NextRequest, context: RouteContext) {
  const supabase = await createClient();
  const { codeId } = await context.params;

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
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Delete the code
    const { error } = await (supabase
      .from('invites') as any)
      .delete()
      .eq('id', codeId)
      .eq('school_id', membership.school_id);

    if (error) {
      return NextResponse.json(
        { error: 'Error al eliminar código' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Código eliminado' });
  } catch (error: any) {
    console.error('Error deleting code:', error);
    return NextResponse.json(
      { error: 'Error al eliminar código' },
      { status: 500 }
    );
  }
}
