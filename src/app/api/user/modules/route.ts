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
      .maybeSingle()) as any;

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'No tienes acceso a ninguna autoescuela' },
        { status: 403 }
      );
    }

    // Get published modules with published lessons
    const { data: modules, error: modulesError } = await (supabase
      .from('modules')
      .select(`
        id,
        title,
        description,
        order_index,
        lessons!inner (
          id,
          title,
          description,
          video_path,
          order_index,
          is_published
        )
      `)
      .eq('school_id', membership.school_id)
      .eq('is_published', true)
      .order('order_index', { ascending: true })) as any;

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return NextResponse.json(
        { error: 'Error al cargar los temas' },
        { status: 500 }
      );
    }

    // Filter and sort lessons within each module
    const modulesWithSortedLessons = (modules || []).map((module: any) => ({
      ...module,
      lessons: (module.lessons || [])
        .filter((l: any) => l.is_published)
        .sort((a: any, b: any) => a.order_index - b.order_index),
    }));

    return NextResponse.json(modulesWithSortedLessons);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Error al cargar los temas' },
      { status: 500 }
    );
  }
}
