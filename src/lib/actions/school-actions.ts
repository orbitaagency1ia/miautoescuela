'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// School Actions
export async function updateSchool(schoolId: string, data: {
  name?: string;
  slug?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  website?: string;
  primary_color?: string;
  secondary_color?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('schools')
    .update(data)
    .eq('id', schoolId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/autoescuelas/${schoolId}`);
  revalidatePath('/admin');
  return { success: true };
}

export async function toggleSchoolStatus(schoolId: string, currentStatus: string) {
  const supabase = await createClient();

  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

  const { error } = await supabase
    .from('schools')
    .update({ subscription_status: newStatus })
    .eq('id', schoolId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/autoescuelas/${schoolId}`);
  revalidatePath('/admin');
  return { success: true, newStatus };
}

export async function deleteSchool(schoolId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('schools')
    .delete()
    .eq('id', schoolId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/autoescuelas');
  revalidatePath('/admin');
  redirect('/admin/autoescuelas');
}

// Student Actions
export async function updateStudentStatus(schoolId: string, userId: string, newStatus: 'active' | 'suspended') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('school_members')
    .update({ status: newStatus })
    .eq('school_id', schoolId)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/autoescuelas/${schoolId}`);
  return { success: true, newStatus };
}

export async function removeStudent(schoolId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('school_members')
    .delete()
    .eq('school_id', schoolId)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/autoescuelas/${schoolId}`);
  return { success: true };
}

export async function inviteStudent(schoolId: string, email: string, role: string = 'student') {
  const supabase = await createClient();

  // Check if email already exists in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  // Check if already invited
  const { data: existingInvite } = await supabase
    .from('invites')
    .select('*')
    .eq('school_id', schoolId)
    .eq('email', email)
    .eq('accepted', false)
    .maybeSingle();

  if (existingInvite) {
    return { success: false, error: 'Ya existe una invitación pendiente para este email' };
  }

  // If user exists, add directly to school_members
  if (existingProfile) {
    const { error: memberError } = await supabase
      .from('school_members')
      .insert({
        school_id: schoolId,
        user_id: existingProfile.id,
        role: role,
        status: 'active',
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      return { success: false, error: memberError.message };
    }

    revalidatePath(`/admin/autoescuelas/${schoolId}`);
    return { success: true, message: 'Usuario añadido directamente a la autoescuela' };
  }

  // Create invite
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const { error } = await supabase
    .from('invites')
    .insert({
      school_id: schoolId,
      email,
      role,
      accepted: false,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/autoescuelas/${schoolId}`);
  return { success: true, message: 'Invitación enviada correctamente' };
}

// Admin Actions
export async function addAdmin(schoolId: string, email: string, role: 'owner' | 'admin') {
  return inviteStudent(schoolId, email, role);
}

export async function removeAdmin(schoolId: string, userId: string) {
  return removeStudent(schoolId, userId);
}

export async function updateAdminRole(schoolId: string, userId: string, newRole: 'owner' | 'admin') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('school_members')
    .update({ role: newRole })
    .eq('school_id', schoolId)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/autoescuelas/${schoolId}`);
  return { success: true, newRole };
}
