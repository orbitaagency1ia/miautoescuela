import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get user's school membership
    const { data: membership } = await supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('role', 'owner')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const schoolId = membership.school_id;

    // Get time ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('school_members')
      .select('user_id, joined_at, status')
      .eq('school_id', schoolId)
      .eq('role', 'student');

    if (studentsError) {
      return NextResponse.json({ error: 'Error al obtener alumnos' }, { status: 500 });
    }

    // Get modules and lessons
    const { data: modules } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        lessons (
          id,
          title,
          is_published
        )
      `)
      .eq('school_id', schoolId)
      .eq('is_published', true);

    const lessons = modules?.flatMap((m: any) => m.lessons?.filter((l: any) => l.is_published) || []) || [];
    const lessonIds = lessons.map((l: any) => l.id);
    const userIds = students?.map((s: any) => s.user_id) || [];

    // Get lesson progress
    let lessonProgress: any[] = [];
    if (lessonIds.length > 0 && userIds.length > 0) {
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, user_id, completed_at, progress_percent, last_watched_at')
        .in('lesson_id', lessonIds)
        .in('user_id', userIds);
      lessonProgress = progress || [];
    }

    // Calculate metrics
    const totalStudents = students?.length || 0;
    const activeStudents = students?.filter((s: any) => s.status === 'active').length || 0;

    // Active in last 7 days (has watched any lesson recently)
    const recentlyActiveStudentIds = new Set(
      lessonProgress
        .filter((p: any) => p.last_watched_at && new Date(p.last_watched_at) >= sevenDaysAgo)
        .map((p: any) => p.user_id)
    );
    const activeLast7Days = recentlyActiveStudentIds.size;

    // Completions
    const completedLessons = lessonProgress.filter((p: any) => p.completed_at);
    const totalCompletions = completedLessons.length;

    // Average completion percentage per student
    const studentProgress = new Map<string, { completed: number; total: number; percent: number }>();
    lessonProgress.forEach((p: any) => {
      const current = studentProgress.get(p.user_id) || { completed: 0, total: 0, percent: 0 };
      studentProgress.set(p.user_id, {
        completed: current.completed + (p.completed_at ? 1 : 0),
        total: current.total + 1,
        percent: 0,
      });
    });

    studentProgress.forEach((data, userId) => {
      const avgPercent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
      studentProgress.set(userId, { ...data, percent: avgPercent });
    });

    const avgCompletionPercent = studentProgress.size > 0
      ? Math.round(Array.from(studentProgress.values()).reduce((a, b) => a + b.percent, 0) / studentProgress.size)
      : 0;

    // Lesson-specific metrics
    const lessonMetrics = new Map<string, { completions: number; views: number; dropoffs: number }>();
    lessonProgress.forEach((p: any) => {
      const current = lessonMetrics.get(p.lesson_id) || { completions: 0, views: 0, dropoffs: 0 };
      lessonMetrics.set(p.lesson_id, {
        completions: current.completions + (p.completed_at ? 1 : 0),
        views: current.views + 1,
        dropoffs: current.dropoffs + (!p.completed_at && p.progress_percent < 50 ? 1 : 0),
      });
    });

    // Most/least viewed lessons
    const lessonsWithMetrics = lessons.map((lesson: any) => {
      const metrics = lessonMetrics.get(lesson.id) || { completions: 0, views: 0, dropoffs: 0 };
      return {
        ...lesson,
        ...metrics,
        completionRate: metrics.views > 0 ? Math.round((metrics.completions / metrics.views) * 100) : 0,
      };
    });

    const mostViewed = [...lessonsWithMetrics].sort((a, b) => b.views - a.views).slice(0, 5);
    const leastCompleted = [...lessonsWithMetrics]
      .filter((l: any) => l.views > 5) // Only lessons with meaningful data
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5);

    // New registrations (last 30 days)
    const newRegistrations = students?.filter((s: any) => {
      return s.joined_at && new Date(s.joined_at) >= thirtyDaysAgo;
    }).length || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalStudents,
        activeStudents,
        activeLast7Days,
        totalLessons: lessons.length,
        totalCompletions,
        avgCompletionPercent,
        newRegistrations,
        mostViewed,
        leastCompleted,
      },
    });
  } catch (error: any) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Error al obtener analytics' },
      { status: 500 }
    );
  }
}
