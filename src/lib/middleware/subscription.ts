/**
 * Subscription Protection Middleware
 * Protección de rutas basada en estado de suscripción
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type School = Database['public']['Tables']['schools']['Row'];
type SchoolMember = Database['public']['Tables']['school_members']['Row'];

/**
 * Verifica si una escuela tiene acceso permitido
 */
export async function checkSchoolAccess(schoolId: string): Promise<{
  allowed: boolean;
  school?: School | null;
  reason?: string;
}> {
  const supabase = await createClient();

  const { data: school } = await supabase
    .from('schools')
    .select('id, name, subscription_status, trial_ends_at')
    .eq('id', schoolId)
    .single();

  if (!school) {
    return { allowed: false, reason: 'School not found' };
  }

  const status = school.subscription_status;

  // Estados permitidos: 'trialing' y 'active'
  if (status === 'trialing' || status === 'active') {
    // Si está en trial, verificar que no haya expirado
    if (status === 'trialing' && school.trial_ends_at) {
      const trialEnd = new Date(school.trial_ends_at);
      const now = new Date();

      if (trialEnd < now) {
        return {
          allowed: false,
          school,
          reason: 'Trial period has ended. Please subscribe to continue using the platform.'
        };
      }
    }

    return { allowed: true, school };
  }

  // Estados no permitidos: 'past_due', 'canceled', 'incomplete'
  const reasonMap = {
    past_due: 'Payment is overdue. Please update your payment method.',
    canceled: 'Subscription has been canceled.',
    incomplete: 'Subscription setup is incomplete.',
  };

  return {
    allowed: false,
    school,
    reason: reasonMap[status as keyof typeof reasonMap] || 'Subscription is not active.'
  };
}

/**
 * Verifica si un usuario es miembro de una escuela con acceso permitido
 */
export async function checkUserSchoolAccess(userId: string, schoolId: string): Promise<{
  allowed: boolean;
  member?: SchoolMember | null;
  reason?: string;
}> {
  const supabase = await createClient();

  const { data: member } = await supabase
    .from('school_members')
    .select('id, role, status, school_id')
    .eq('user_id', userId)
    .eq('school_id', schoolId)
    .single();

  if (!member) {
    return { allowed: false, reason: 'Not a member of this school' };
  }

  // Solo miembros activos tienen acceso
  if (member.status !== 'active') {
    return { allowed: false, member, reason: 'Membership is not active' };
  }

  return { allowed: true, member };
}

/**
 * Middleware para proteger rutas de owner/student
 * Verifica que la escuela esté activa antes de permitir acceso
 */
export async function protectSchoolRoute(request: Request, schoolIdParam: string = 'schoolId') {
  const supabase = await createClient();

  // Obtener el school_id de la sesión del usuario
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Obtener school_id del parámetro URL
  const schoolId = request.headers.get('x-school-id') ||
                      (await request.headers()).get('x-school-id') ||
                      schoolIdParam;

  if (!schoolId) {
    return NextResponse.json({ error: 'School ID required' }, { status: 400 });
  }

  // Verificar acceso a la escuela
  const accessCheck = await checkSchoolAccess(schoolId);

  if (!accessCheck.allowed) {
    return NextResponse.json(
      {
        error: accessCheck.reason,
        school: accessCheck.school ? {
          id: accessCheck.school.id,
          name: accessCheck.school.name,
          subscription_status: accessCheck.school.subscription_status,
        } : null
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ allowed: true });
}
