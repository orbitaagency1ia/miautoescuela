import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe no está configurado' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const schoolId = session.metadata?.school_id;

        if (schoolId) {
          const subscriptionId = session.subscription as string;

          // Update school with subscription info
          await (supabase
            .from('schools') as any)
            .update({
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
              subscription_status: 'active',
              trial_ends_at: null,
            })
            .eq('id', schoolId);

        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const schoolId = subscription.metadata?.school_id;

        if (schoolId) {
          const status = subscription.status === 'active' || subscription.status === 'trialing'
            ? subscription.status
            : 'past_due';

          await (supabase
            .from('schools') as any)
            .update({
              subscription_status: status,
            })
            .eq('id', schoolId);

        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const schoolId = subscription.metadata?.school_id;

        if (schoolId) {
          await (supabase
            .from('schools') as any)
            .update({
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', schoolId);

        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Update school status to active if it was past_due
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          );
          const schoolId = subscription.metadata?.school_id;

          if (schoolId && subscription.status === 'active') {
            await (supabase
              .from('schools') as any)
              .update({
                subscription_status: 'active',
              })
              .eq('id', schoolId);
          }
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        // Get subscription to find school
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          );
          const schoolId = subscription.metadata?.school_id;

          if (schoolId) {
            await (supabase
              .from('schools') as any)
              .update({
                subscription_status: 'past_due',
              })
              .eq('id', schoolId);

          }
        }
        break;
      }

      // NEW EVENTS

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        // Could track refunds in a separate table
        break;
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        // Could update default payment method in schools table
        break;
      }

      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice;
        const schoolId = (invoice as any).subscription_metadata?.school_id;

        if (schoolId) {
          // Could send notification email about upcoming payment
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const schoolId = subscription.metadata?.school_id;

        if (schoolId) {
          // Could send notification about trial ending
        }
        break;
      }

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
