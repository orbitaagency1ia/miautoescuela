import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    const { students } = await request.json();

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron alumnos para importar' },
        { status: 400 }
      );
    }

    const schoolId = membership.school_id;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days to join

    const results = {
      created: 0,
      errors: [] as Array<{ row: number; student: any; error: string }>,
    };

    // Check for existing emails
    const emails = students.map(s => s.email);
    const { data: existingInvites } = await (supabase
      .from('invites')
      .select('email')
      .eq('school_id', schoolId)
      .in('email', emails)) as any;

    const existingEmails = new Set(existingInvites?.map((i: any) => i.email) || []);

    // Create invites for each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (existingEmails.has(student.email)) {
        results.errors.push({
          row: i + 1,
          student,
          error: 'Email ya tiene una invitación pendiente',
        });
        continue;
      }

      const { error } = await (supabase
        .from('invites') as any)
        .insert({
          school_id: schoolId,
          email: student.email,
          role: 'student',
          token_hash: crypto.randomUUID(),
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        results.errors.push({
          row: i + 1,
          student,
          error: error.message,
        });
      } else {
        results.created++;
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      { error: 'Error al importar alumnos' },
      { status: 500 }
    );
  }
}
