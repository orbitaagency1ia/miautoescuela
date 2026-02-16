import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET() {
  const supabase = await createClient();

  // Primero obtener todas las escuelas
  const { data: schools, error: schoolsError } = await (supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })) as any;

  if (schoolsError) {
    return NextResponse.json({ error: schoolsError.message }, { status: 500 });
  }

  // Luego obtener los miembros de cada escuela por separado para evitar conflictos de aliases
  const schoolsWithMembers = await Promise.all(
    (schools || []).map(async (school) => {
      const { data: members } = await (supabase
        .from('school_members')
        .select('user_id, role, status, profiles!inner(email, full_name)')
        .eq('school_id', school.id)
        .in('role', ['owner', 'admin'])) as any;

      return {
        ...school,
        members: members || []
      };
    })
  );

  return NextResponse.json({ schools: schoolsWithMembers });
}

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  try {
    const body = await request.json();
    const { name, contactEmail, phone, ownerEmail, ownerName } = body;

    if (!name || !contactEmail || !ownerEmail || !ownerName) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug exists
    const { data: existingSchool } = await (supabase
      .from('schools')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()) as any;

    if (existingSchool) {
      return NextResponse.json(
        { error: 'Ya existe una autoescuela con ese nombre' },
        { status: 400 }
      );
    }

    // Create school
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const schoolData = {
      name,
      slug,
      contact_email: contactEmail,
      phone: phone || null,
      subscription_status: 'trialing',
      trial_ends_at: trialEndsAt.toISOString(),
    };

    const { data: school, error: schoolError } = await (supabase
      .from('schools') as any)
      .insert(schoolData)
      .select()
      .single();

    if (schoolError) {
      return NextResponse.json(
        { error: 'Error al crear la autoescuela' },
        { status: 500 }
      );
    }

    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create owner user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ownerEmail,
      password: tempPassword,
      options: {
        data: {
          full_name: ownerName,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        {
          error:
            authError.message === 'User already registered'
              ? 'El correo del propietario ya está registrado'
              : 'Error al crear el usuario',
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

    // Create profile
    await (supabase
      .from('profiles') as any)
      .insert({
      user_id: authData.user.id,
      full_name: ownerName,
    });

    // Add as owner
    await (supabase
      .from('school_members') as any)
      .insert({
      school_id: school.id,
      user_id: authData.user.id,
      role: 'owner',
      status: 'active',
    });

    // Send welcome email with temp password
    await sendWelcomeEmail(ownerEmail, name, tempPassword);

    return NextResponse.json({ success: true, school });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
