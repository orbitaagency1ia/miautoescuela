import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service client without cookies (bypasses RLS)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { name, slug, userId, userEmail, userName } = await request.json();

    if (!name || !slug || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // First, ensure profile exists (fix for registration bug)
    const { data: existingProfile } = await supabaseService
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabaseService
        .from('profiles')
        .insert({
          id: userId, // Use userId as the id (primary key)
          user_id: userId,
          full_name: userName || userEmail.split('@')[0],
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return NextResponse.json(
          { error: 'Error al crear el perfil: ' + profileError.message },
          { status: 500 }
        );
      }
    }

    // Check if slug is already taken
    const { data: existingSchool } = await supabaseService
      .from('schools')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSchool) {
      return NextResponse.json(
        { error: 'Esta URL ya está en uso. Prueba con otra.' },
        { status: 400 }
      );
    }

    // Create the school with trial subscription
    const { data: school, error: schoolError } = await supabaseService
      .from('schools')
      .insert({
        name,
        slug,
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
      })
      .select('id')
      .single();

    if (schoolError || !school) {
      console.error('Error creating school:', schoolError);
      return NextResponse.json(
        { error: 'Error al crear la autoescuela' },
        { status: 500 }
      );
    }

    // Add user as owner of the school
    const { error: memberError } = await supabaseService
      .from('school_members')
      .insert({
        school_id: school.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
      });

    if (memberError) {
      console.error('Error adding owner:', memberError);
      return NextResponse.json(
        { error: 'Error al asignar el propietario: ' + memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, schoolId: school.id });
  } catch (error) {
    console.error('Error in create-school API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
