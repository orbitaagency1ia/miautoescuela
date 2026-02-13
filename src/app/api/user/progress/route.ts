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

    // Get all completed lessons (where completed_at is not null)
    const { data: completedLessons, error: progressError } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Error al cargar el progreso' },
        { status: 500 }
      );
    }

    const completedLessonIds = completedLessons?.map((p: any) => p.lesson_id) || [];

    // Get activity points from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('activity_points')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      completedLessonIds,
      activityPoints: profile?.activity_points || 0,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Error al cargar el progreso' },
      { status: 500 }
    );
  }
}
