import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get user's school membership
    const { data: membership } = await (supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('role', 'owner')
      .maybeSingle()) as any;

    if (!membership) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Get school's Stripe customer ID
    const { data: school } = await (supabase
      .from('schools')
      .select('stripe_customer_id, stripe_subscription_id, subscription_status')
      .eq('id', membership.school_id)
      .maybeSingle()) as any;

    if (!school?.stripe_customer_id) {
      return NextResponse.json({ invoices: [], subscription: null });
    }

    // Get subscription details
    let subscription = null;
    if (school.stripe_subscription_id) {
      try {
        subscription = await stripe?.subscriptions.retrieve(school.stripe_subscription_id);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    }

    // Get invoices
    let invoices: any[] = [];
    try {
      const invoiceList = await stripe?.invoices.list({
        customer: school.stripe_customer_id,
        limit: 20,
      });
      if (invoiceList) {
        invoices = invoiceList.data.map((invoice: any) => ({
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency.toUpperCase(),
          status: invoice.status,
          created: invoice.created * 1000,
          hosted_invoice_url: invoice.hosted_invoice_url,
          pdf_url: invoice.invoice_pdf,
        }));
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }

    return NextResponse.json({
      invoices,
      subscription: subscription ? {
        status: (subscription as any).status,
        current_period_start: (subscription as any).current_period_start * 1000,
        current_period_end: (subscription as any).current_period_end * 1000,
        cancel_at_period_end: (subscription as any).cancel_at_period_end,
        items: (subscription as any).items.data.map((item: any) => ({
          price: item.price.unit_amount / 100,
          currency: item.price.currency.toUpperCase(),
        })),
      } : null,
      subscriptionStatus: school.subscription_status,
    });
  } catch (error: any) {
    console.error('Error in invoices API:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    );
  }
}
