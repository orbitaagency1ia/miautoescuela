'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateToken, hashToken, isValidEmail } from '@/lib/utils';
import { TOAST_MESSAGES, INVITE_TOKEN_EXPIRY_DAYS } from '@/lib/constants';
import { sendInviteEmail } from '@/lib/email';

/**
 * Create Invite Action
 * Crear invitación para alumno
 * TEMPORAL: Sin autenticación - usa primera escuela disponible
 */
export async function createInviteAction(email: string, message?: string) {
  const supabase = await createServiceClient();

  if (!isValidEmail(email)) {
    throw new Error('El correo electrónico no es válido');
  }

  // TEMPORAL: Obtener primera escuela disponible sin autenticación
  const result = await (supabase
    .from('schools') as any)
    .select('id, subscription_status')
    .limit(1);

  const school = result.data;

  if (!school) {
    throw new Error('No hay autoescuelas creadas aún. Ve a Administración y crea una primero.');
  }

  // TEMPORAL: Permitir invitar sin verificar suscripción
  // La comprobación de suscripción se puede reactivar más tarde

  // Generate secure token
  const token = generateToken();
  const tokenHash = await hashToken(token);

  // Calculate expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);

  // Create invite
  const { error: inviteError } = await (supabase
    .from('invites') as any)
    .insert({
      school_id: school.id,
      email,
      role: 'student',
      token_hash: tokenHash,
      invited_by: 'temp-admin', // TEMPORAL
      expires_at: expiresAt.toISOString(),
    });

  if (inviteError) {
    console.error('Error creating invite:', inviteError);
    throw new Error(TOAST_MESSAGES.ERROR_GENERIC);
  }

  // Send email with invite link
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitacion/${token}`;
  const schoolName = school.name || 'Tu autoescuela';
  const inviterName = 'Administrador'; // TODO: Get actual inviter name from context

  await sendInviteEmail(email, schoolName, token, inviterName, message);

  revalidatePath('/alumnos');
}

/**
 * Get User's School Context
 * Obtener contexto de la autoescuela del usuario
 * TEMPORAL: Devuelve primera escuela disponible sin autenticación
 */
export async function getSchoolContext() {
  const supabase = await createClient();

  // TEMPORAL: Obtener primera escuela sin autenticación
  const { data: school } = await (supabase
    .from('schools') as any)
    .select('id, name, slug, logo_url, primary_color, subscription_status')
    .limit(1)
    .maybeSingle();

  if (!school) {
    return null;
  }

  // Retornar en el mismo formato que antes
  return {
    school_id: school.id,
    role: 'owner', // TEMPORAL
    status: 'active',
    schools: school,
  };
}
