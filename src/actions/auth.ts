'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';

interface FormState {
  error: string | null;
  success: string | null;
}

/**
 * Login action con manejo de errores mejorado
 */
export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      error: 'Por favor, introduce tu email y contraseña.',
      success: null,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error login:', error.message);

    // Manejo específico de errores comunes
    if (error.message === 'Invalid login credentials') {
      return {
        error: 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.',
        success: null,
      };
    }

    if (error.message === 'Email not confirmed') {
      return {
        error: 'Por favor, confirma tu email antes de iniciar sesión.',
        success: null,
      };
    }

    return {
      error: 'Error al iniciar sesión. Por favor, inténtalo de nuevo.',
      success: null,
    };
  }

  if (!data.user) {
    return {
      error: 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.',
      success: null,
    };
  }

  // Obtener membresía del usuario para redirigir correctamente
  const { data: membership } = await (supabase
    .from('school_members')
    .select('role')
    .eq('user_id', data.user.id)
    .eq('status', 'active')
    .maybeSingle() as any);

  // Check if user is super admin (email domain check)
  const userEmail = data.user.email;
  const isSuperAdmin = userEmail?.endsWith('@miautoescuela.com') ||
                       userEmail?.endsWith('@admin.com') ||
                       data.user.user_metadata?.role === 'admin';

  revalidatePath('/', 'layout');

  // Redirigir según rol
  // Super admins: van a /admin (panel global de todas las escuelas)
  // Owners: van a /panel (panel de su escuela)
  // Admins de escuela: van a /panel (panel de su escuela)
  if (isSuperAdmin) {
    redirect('/admin');
  } else if (membership?.role === 'owner' || membership?.role === 'admin') {
    redirect('/panel');
  } else {
    redirect('/inicio');
  }

  return {
    error: null,
    success: null,
  };
}

/**
 * Register action con manejo de errores mejorado
 */
export async function registerAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const serviceSupabase = await createServiceClient();

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string | null;
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    return {
      error: 'Por favor, completa todos los campos requeridos.',
      success: null,
    };
  }

  if (password.length < 8) {
    return {
      error: 'La contraseña debe tener al menos 8 caracteres.',
      success: null,
    };
  }

  // Crear usuario
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/setup`,
    },
  });

  if (authError) {
    console.error('Error registro:', authError.message);

    if (authError.message === 'User already registered') {
      return {
        error: 'Este email ya está registrado. Inicia sesión en su lugar.',
        success: null,
      };
    }

    return {
      error: `Error al registrar: ${authError.message}`,
      success: null,
    };
  }

  if (!authData.user) {
    return {
      error: 'No se pudo completar el registro. Por favor, inténtalo de nuevo.',
      success: null,
    };
  }

  // Crear perfil usando service role (bypasses RLS)
  const { error: profileError } = await (serviceSupabase.from('profiles') as any).insert({
    user_id: authData.user.id,
    full_name: fullName,
    phone: phone || null,
  });

  if (profileError) {
    console.error('Error creando perfil:', profileError);
    return {
      error: 'Error al crear tu perfil. Por favor, contacta con soporte.',
      success: null,
    };
  }

  revalidatePath('/', 'layout');

  return {
    error: null,
    success: '¡Cuenta creada exitosamente! Redirigiendo...',
  };
}

/**
 * Logout action for use with useActionState (Client Components)
 */
export async function logoutAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logout:', error.message);
    return {
      error: 'Error al cerrar sesión. Por favor, inténtalo de nuevo.',
      success: null,
    };
  }

  revalidatePath('/', 'layout');

  return {
    error: null,
    success: null,
  };
}

/**
 * Simple logout action for use in Server Components directly
 */
export async function simpleLogoutAction(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logout:', error.message);
    throw new Error('Error al cerrar sesión');
  }

  revalidatePath('/', 'layout');

  redirect('/iniciar-sesion');
}

/**
 * Register via invite action
 * Allows users to register using an invite token that contains their email and school_id
 */
export async function registerViaInviteAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const serviceSupabase = await createServiceClient();

  const token = formData.get('token') as string;
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string | null;
  const password = formData.get('password') as string;

  if (!token || !fullName || !password) {
    return {
      error: 'Por favor, completa todos los campos requeridos.',
      success: null,
    };
  }

  if (password.length < 8) {
    return {
      error: 'La contraseña debe tener al menos 8 caracteres.',
      success: null,
    };
  }

  // Hash the token to compare with token_hash in database
  const { hashToken } = await import('@/lib/utils');
  const tokenHash = await hashToken(token);

  // Verify invite token and get invite data
  // Note: table has token_hash (SHA-256), not token
  // Note: table uses used_at (null = pending, date = used), not status
  const { data: invite, error: inviteError } = await (supabase
    .from('invites')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .maybeSingle() as any);

  if (inviteError || !invite) {
    console.error('Error verifying invite:', inviteError);
    return {
      error: 'La invitación no es válida o ha expirado.',
      success: null,
    };
  }

  // Check if invite has expired
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return {
      error: 'La invitación ha expirado. Por favor, solicita una nueva.',
      success: null,
    };
  }

  // Create user with email from invite
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invite.email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/inicio`,
    },
  });

  if (authError) {
    console.error('Error registro via invite:', authError.message);

    if (authError.message === 'User already registered') {
      return {
        error: 'Este email ya está registrado. Inicia sesión en su lugar.',
        success: null,
      };
    }

    return {
      error: `Error al registrar: ${authError.message}`,
      success: null,
    };
  }

  if (!authData.user) {
    return {
      error: 'No se pudo completar el registro. Por favor, inténtalo de nuevo.',
      success: null,
    };
  }

  // Create profile using service role (bypasses RLS)
  const { error: profileError } = await (serviceSupabase.from('profiles') as any).insert({
    user_id: authData.user.id,
    full_name: fullName,
    phone: phone || null,
  });

  if (profileError) {
    console.error('Error creando perfil:', profileError);
    return {
      error: 'Error al crear tu perfil. Por favor, contacta con soporte.',
      success: null,
    };
  }

  // Add user to school_members
  const { error: memberError } = await (serviceSupabase.from('school_members') as any).insert({
    user_id: authData.user.id,
    school_id: invite.school_id,
    role: invite.role || 'student',
    status: 'active',
  });

  if (memberError) {
    console.error('Error añadiendo a escuela:', memberError);
    return {
      error: 'Error al unirte a la autoescuela. Por favor, contacta con soporte.',
      success: null,
    };
  }

  // Mark invite as used by setting used_at
  await (serviceSupabase
    .from('invites') as any)
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', tokenHash);

  revalidatePath('/', 'layout');

  return {
    error: null,
    success: '¡Cuenta creada exitosamente! Redirigiendo...',
  };
}
