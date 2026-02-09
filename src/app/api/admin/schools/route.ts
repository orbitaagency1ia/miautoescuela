import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: schools, error } = await (supabase
    .from('schools')
    .select('*') as any)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schools });
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
      .select('id') as any)
      .eq('slug', slug)
      .maybeSingle();

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

    const insertResult = await (supabase
      .from('schools') as any)
      .insert(schoolData)
      .select()
      .single();

    const { data: school, error: schoolError } = insertResult as { data: any; error: any };

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
    await (supabase.from('profiles') as any).insert({
      user_id: authData.user.id,
      full_name: ownerName,
    });

    // Add as owner
    await (supabase.from('school_members') as any).insert({
      school_id: school.id,
      user_id: authData.user.id,
      role: 'owner',
      status: 'active',
    });

    // TODO: Send email with temp password
    console.log(`School created! Owner temp password: ${tempPassword}`);

    return NextResponse.json({ success: true, school });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
