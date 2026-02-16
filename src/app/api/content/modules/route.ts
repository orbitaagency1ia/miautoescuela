import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get school_id
    const { data: membership } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()) as any;

    if (!membership) {
      return NextResponse.json(
        { error: 'No tienes acceso a ninguna autoescuela' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'El título es obligatorio' },
        { status: 400 }
      );
    }

    // Get current max order_index
    const { data: lastModule } = await (supabase
      .from('modules')
      .select('order_index')
      .eq('school_id', membership.school_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle()) as any;

    const newOrderIndex = (lastModule?.order_index ?? -1) + 1;

    const { data, error } = await (supabase
      .from('modules') as any)
      .insert({
        school_id: membership.school_id,
        title,
        description: description || null,
        order_index: newOrderIndex,
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear el tema' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, module: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
