'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';
import { TOAST_MESSAGES } from '@/lib/constants';

/**
 * Create School Action
 * Acción para crear una autoescuela
 */
export async function createSchoolAction(formData: FormData) {
  const supabase = await createServiceClient();

  const name = formData.get('name') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const phone = formData.get('phone') as string;
  const ownerEmail = formData.get('ownerEmail') as string;
  const ownerName = formData.get('ownerName') as string;

  if (!name || !contactEmail || !ownerEmail || !ownerName) {
    throw new Error(TOAST_MESSAGES.ERROR_REQUIRED_FIELD);
  }

  // Generate slug from name
  const slug = generateSlug(name);

  // Check if slug already exists
  const { data: existingSchool } = await (supabase.from('schools') as any)
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existingSchool) {
    throw new Error('Ya existe una autoescuela con ese nombre.');
  }

  // Create school with trial subscription
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const { data: school, error: schoolError } = await (supabase.from('schools') as any)
    .insert({
      name,
      slug,
      contact_email: contactEmail,
      phone: phone || null,
      subscription_status: 'trialing',
      trial_ends_at: trialEndsAt.toISOString(),
    })
    .select()
    .single();

  if (schoolError) {
    console.error('Error creating school:', schoolError);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  // Generate temporary password for owner
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
    console.error('Error creating owner:', authError);
    throw new Error(
      authError.message === 'User already registered'
        ? 'El correo del propietario ya está registrado.'
        : TOAST_MESSAGES.ERROR_GENERIC
    );
  }

  if (!authData.user) {
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  // Create profile (using id as primary key)
  const { error: profileError } = await (supabase.from('profiles') as any).insert({
    id: authData.user.id,
    user_id: authData.user.id,
    full_name: ownerName,
  });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  // Add as owner
  const { error: memberError } = await (supabase.from('school_members') as any).insert({
    school_id: school.id,
    user_id: authData.user.id,
    role: 'owner',
    status: 'active',
  });

  if (memberError) {
    console.error('Error adding owner:', memberError);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  // TODO: Send welcome email with temporary password
  console.log(`School created! Owner temp password: ${tempPassword}`);

  revalidatePath('/admin/autoescuelas');
  redirect('/admin/autoescuelas');
}

/**
 * Update School Action
 * Acción para actualizar una autoescuela
 */
export async function updateSchoolAction(schoolId: string, formData: FormData) {
  const supabase = await createServiceClient();

  const name = formData.get('name') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const phone = formData.get('phone') as string;
  const primaryColor = formData.get('primaryColor') as string;
  const subscriptionStatus = formData.get('subscriptionStatus') as string;

  if (!name) {
    throw new Error(TOAST_MESSAGES.ERROR_REQUIRED_FIELD);
  }

  // Generate slug from name
  const slug = generateSlug(name);

  const { error } = await (supabase.from('schools') as any)
    .update({
      name,
      slug,
      contact_email: contactEmail || null,
      phone: phone || null,
      primary_color: primaryColor || '#3B82F6',
      subscription_status: subscriptionStatus || 'trialing',
    })
    .eq('id', schoolId);

  if (error) {
    console.error('Error updating school:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/admin/autoescuelas');
  revalidatePath(`/admin/autoescuelas/${schoolId}`);
}

/**
 * Delete School Action
 * Acción para eliminar una autoescuela
 */
export async function deleteSchoolAction(schoolId: string) {
  const supabase = await createServiceClient();

  const { error } = await (supabase.from('schools') as any)
    .delete()
    .eq('id', schoolId);

  if (error) {
    console.error('Error deleting school:', error);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  revalidatePath('/admin/autoescuelas');
  redirect('/admin/autoescuelas');
}
