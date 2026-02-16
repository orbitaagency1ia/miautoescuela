import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  // Get lesson to delete video file
  const { data: lesson } = await (supabase
    .from('lessons')
    .select('video_path')
    .eq('id', id)
    .single()) as any;

  // Delete lesson from database
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la clase' },
      { status: 500 }
    );
  }

  // Delete video file from storage
  if (lesson?.video_path) {
    await supabase.storage.from('lesson-videos').remove([lesson.video_path]);
  }

  return NextResponse.json({ success: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

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
    const { title, description, video_path } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'El título es obligatorio' },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase
      .from('lessons') as any)
      .update({
        title,
        description: description || null,
        video_path: video_path || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar la clase' },
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const { is_published } = body;

    const { error } = await (supabase
      .from('lessons') as any)
      .update({ is_published })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar la clase' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
