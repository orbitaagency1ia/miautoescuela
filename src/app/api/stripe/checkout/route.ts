import { createClient } from '@/lib/supabase/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';
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
          stripe_customer_id,
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as any);

    if (!membership) {
      return NextResponse.json(
        { error: 'No tienes acceso a ninguna autoescuela' },
        { status: 403 }
      );
    }

    const school = membership.schools;
    let customerId = school?.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: school?.name || 'Autoescuela',
        metadata: {
          school_id: membership.school_id,
        },
      });

      customerId = customer.id;

      // Save customer_id to school
      await (supabase
        .from('schools') as any)
        .update({ stripe_customer_id: customerId })
        .eq('id', membership.school_id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICES.MONTHLY,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion?canceled=true`,
      metadata: {
        school_id: membership.school_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago' },
      { status: 500 }
    );
  }
}
