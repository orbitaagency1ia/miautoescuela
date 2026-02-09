'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export interface UpdateSchoolData {
  name?: string;
  primary_color?: string;
  secondary_color?: string;
  welcome_message?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

/**
 * Get service client with admin privileges
 */
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createServiceClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Update school data
 * Actualiza los datos de la autoescuela
 */
export async function updateSchoolAction(schoolId: string, data: UpdateSchoolData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'No autenticado' };
  }

  // Verify user owns this school
  const { data: membership } = await supabase
    .from('school_members')
    .select('role')
    .eq('school_id', schoolId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single() as { data: { role: string } | null };

  if (!membership || membership.role !== 'owner') {
    return { error: 'No tienes permisos para actualizar esta escuela' };
  }

  // Use service client to bypass RLS for update
  const serviceClient = getSupabaseServiceClient();

  // Update school
  const { error } = await serviceClient
    .from('schools')
    .update(data)
    .eq('id', schoolId);

  if (error) {
    console.error('Error updating school:', error);
    return { error: 'Error al actualizar la escuela: ' + error.message };
  }

  revalidatePath('/configuracion');
  revalidatePath('/panel');
  revalidatePath('/');

  return { success: true };
}

/**
 * Upload school logo
 * Sube el logo de la autoescuela a Supabase Storage
 */
export async function uploadSchoolLogoAction(schoolId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'No autenticado' };
  }

  // Verify user owns this school
  const { data: membership } = await supabase
    .from('school_members')
    .select('role')
    .eq('school_id', schoolId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single() as { data: { role: string } | null };

  if (!membership || membership.role !== 'owner') {
    return { error: 'No tienes permisos para actualizar esta escuela' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No se proporcionó archivo' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'El archivo debe ser una imagen' };
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'El archivo no puede superar 2MB' };
  }

  try {
    const serviceClient = getSupabaseServiceClient();

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${schoolId}/${Date.now()}.${fileExt}`;

    // Convert File to Buffer for service client
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file using service client
    const { error: uploadError } = await serviceClient.storage
      .from('school-logos')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return { error: 'Error al subir el logo: ' + uploadError.message };
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from('school-logos')
      .getPublicUrl(fileName);

    const logoUrl = urlData.publicUrl;

    // Update school with new logo URL
    const { error: updateError } = await serviceClient
      .from('schools')
      .update({ logo_url: logoUrl })
      .eq('id', schoolId);

    if (updateError) {
      console.error('Error updating school logo:', updateError);
      return { error: 'Error al actualizar el logo en la escuela' };
    }

    revalidatePath('/configuracion');
    revalidatePath('/panel');
    revalidatePath('/');

    return { success: true, logoUrl };
  } catch (error: any) {
    console.error('Error in uploadSchoolLogoAction:', error);
    return { error: 'Error al procesar la subida: ' + error.message };
  }
}

/**
 * Upload school banner
 * Sube el banner de la autoescuela a Supabase Storage
 */
export async function uploadSchoolBannerAction(schoolId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'No autenticado' };
  }

  // Verify user owns this school
  const { data: membership } = await supabase
    .from('school_members')
    .select('role')
    .eq('school_id', schoolId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single() as { data: { role: string } | null };

  if (!membership || membership.role !== 'owner') {
    return { error: 'No tienes permisos para actualizar esta escuela' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No se proporcionó archivo' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'El archivo debe ser una imagen' };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'El archivo no puede superar 5MB' };
  }

  try {
    const serviceClient = getSupabaseServiceClient();

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${schoolId}/banner/${Date.now()}.${fileExt}`;

    // Convert File to Buffer for service client
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file using service client
    const { error: uploadError } = await serviceClient.storage
      .from('school-banners')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Error uploading banner:', uploadError);
      return { error: 'Error al subir el banner: ' + uploadError.message };
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from('school-banners')
      .getPublicUrl(fileName);

    const bannerUrl = urlData.publicUrl;

    // Update school with new banner URL
    const { error: updateError } = await serviceClient
      .from('schools')
      .update({ banner_url: bannerUrl })
      .eq('id', schoolId);

    if (updateError) {
      console.error('Error updating school banner:', updateError);
      return { error: 'Error al actualizar el banner en la escuela' };
    }

    revalidatePath('/configuracion');
    revalidatePath('/panel');
    revalidatePath('/');

    return { success: true, bannerUrl };
  } catch (error: any) {
    console.error('Error in uploadSchoolBannerAction:', error);
    return { error: 'Error al procesar la subida: ' + error.message };
  }
}
