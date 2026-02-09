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

    // Get school_id and stripe_customer_id
    const { data: membership } = await (supabase
      .from('school_members')
      .select(`
        school_id,
        schools (
          id,
          stripe_customer_id
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as any);

    if (!membership || !membership.schools?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No tienes una suscripción activa' },
        { status: 400 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: membership.schools.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Error al crear la sesión del portal' },
      { status: 500 }
    );
  }
}
