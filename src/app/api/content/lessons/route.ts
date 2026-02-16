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
    const { module_id, title, description, video_path } = body;

    if (!module_id || !title) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Get current max order_index for this module
    const { data: lastLesson } = await (supabase
      .from('lessons')
      .select('order_index')
      .eq('module_id', module_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle()) as any;

    const newOrderIndex = (lastLesson?.order_index ?? -1) + 1;

    const { data, error } = await (supabase
      .from('lessons') as any)
      .insert({
        school_id: membership.school_id,
        module_id,
        title,
        description: description || null,
        video_path: video_path || null,
        order_index: newOrderIndex,
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear la clase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lesson: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
