import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service client without cookies (bypasses RLS)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

async function uploadFile(
  file: File,
  schoolId: string,
  type: 'logo' | 'banner'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${schoolId}/${type}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabaseService.storage
      .from('school-assets')
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      return null;
    }

    const { data: { publicUrl } } = supabaseService.storage
      .from('school-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const userId = formData.get('userId') as string;
    const userEmail = formData.get('userEmail') as string;
    const userName = formData.get('userName') as string;

    // Branding data
    const primaryColor = formData.get('primaryColor') as string || '#3B82F6';
    const secondaryColor = formData.get('secondaryColor') as string || '#1E40AF';
    const welcomeMessage = formData.get('welcomeMessage') as string || '';
    const website = formData.get('website') as string || '';

    // Contact data
    const contactEmail = formData.get('contactEmail') as string || '';
    const phone = formData.get('phone') as string || '';
    const address = formData.get('address') as string || '';

    // Content data
    const createFirstModule = formData.get('createFirstModule') === 'true';
    const firstModuleName = formData.get('firstModuleName') as string || '';
    const firstModuleDescription = formData.get('firstModuleDescription') as string || '';

    // Invitations data
    const inviteStudents = formData.get('inviteStudents') === 'true';
    const studentEmails = formData.get('studentEmails') as string || '';

    // Files
    const logo = formData.get('logo') as File | null;
    const banner = formData.get('banner') as File | null;

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
          id: userId,
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

    // Upload files if provided
    let logoUrl: string | null = null;
    let bannerUrl: string | null = null;

    if (logo) {
      logoUrl = await uploadFile(logo, 'temp', 'logo');
    }
    if (banner) {
      bannerUrl = await uploadFile(banner, 'temp', 'banner');
    }

    // Create school with trial subscription and all wizard data
    const { data: school, error: schoolError } = await supabaseService
      .from('schools')
      .insert({
        name,
        slug,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        welcome_message: welcomeMessage,
        website: website || null,
        contact_email: contactEmail || null,
        phone: phone || null,
        address: address || null,
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
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

    // Re-upload files with correct school_id if they were uploaded
    if (logoUrl || bannerUrl) {
      if (logo) {
        const correctLogoUrl = await uploadFile(logo, school.id, 'logo');
        if (correctLogoUrl) {
          await supabaseService
            .from('schools')
            .update({ logo_url: correctLogoUrl })
            .eq('id', school.id);
        }
      }
      if (banner) {
        const correctBannerUrl = await uploadFile(banner, school.id, 'banner');
        if (correctBannerUrl) {
          await supabaseService
            .from('schools')
            .update({ banner_url: correctBannerUrl })
            .eq('id', school.id);
        }
      }
    }

    // Add user as owner of school
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

    // Create first module if requested
    if (createFirstModule && firstModuleName) {
      const { error: moduleError } = await supabaseService
        .from('modules')
        .insert({
          school_id: school.id,
          title: firstModuleName,
          description: firstModuleDescription,
          order_index: 0,
          is_published: false,
        });

      if (moduleError) {
        console.error('Error creating first module:', moduleError);
        // Don't fail the whole process if module creation fails
      }
    }

    // Create invites for students if requested
    if (inviteStudents && studentEmails) {
      const emails = studentEmails
        .split('\n')
        .map(e => e.trim())
        .filter(e => e && e.includes('@'));

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      for (const email of emails) {
        await supabaseService
          .from('invites')
          .insert({
            school_id: school.id,
            email: email,
            role: 'student',
            token_hash: crypto.randomUUID(),
            invited_by: userId,
            expires_at: expiresAt.toISOString(),
          });
      }
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
