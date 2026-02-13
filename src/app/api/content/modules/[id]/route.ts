import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase
    .from('modules')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el tema' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
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

    const { error } = await supabase
      .from('modules')
      .update({ is_published })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar el tema' },
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
