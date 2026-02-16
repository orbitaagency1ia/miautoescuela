import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe no está configurado' },
      { status: 503 }
    );
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get school_id from request body
    const body = await request.json().catch(() => ({}));
    const schoolId = body.school_id;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la escuela' },
        { status: 400 }
      );
    }

    // Check if user is owner or admin of this school
    const { data: membership, error: memberError } = await (supabase
      .from('school_members')
      .select('role, status')
      .eq('school_id', schoolId)
      .eq('user_id', user.id)
      .maybeSingle()) as any;

    if (memberError) {
      console.error('Error fetching membership:', memberError);
      return NextResponse.json(
        { error: 'Error al verificar permisos' },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        { error: 'No eres miembro de esta escuela' },
        { status: 403 }
      );
    }

    if (membership.status !== 'active') {
      return NextResponse.json(
        { error: 'Tu membresía no está activa' },
        { status: 403 }
      );
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return NextResponse.json(
        { error: `Tu rol (${membership.role}) no permite gestionar suscripciones` },
        { status: 403 }
      );
    }

    // Get stripe_customer_id from school
    const { data: school, error: schoolError } = await (supabase
      .from('schools')
      .select('id, stripe_customer_id, name')
      .eq('id', schoolId)
      .maybeSingle()) as any;

    if (schoolError) {
      console.error('Error fetching school:', schoolError);
      return NextResponse.json(
        { error: 'Error al obtener información de la escuela' },
        { status: 500 }
      );
    }

    if (!school) {
      return NextResponse.json(
        { error: 'Escuela no encontrada' },
        { status: 404 }
      );
    }

    if (!school.stripe_customer_id) {
      return NextResponse.json(
        { error: `La escuela "${school.name}" no tiene una suscripción de Stripe configurada. Contacta a soporte.` },
        { status: 400 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: school.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/autoescuelas/${schoolId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la sesión del portal' },
      { status: 500 }
    );
  }
}
