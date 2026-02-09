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
              subscription_status: 'active',
              trial_ends_at: null, // End trial when they subscribe
            })
            .eq('id', schoolId);

          console.log(`School ${schoolId} subscribed successfully`);
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

          console.log(`School ${schoolId} subscription updated to ${status}`);
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

          console.log(`School ${schoolId} subscription canceled`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('Payment succeeded');
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

            console.log(`School ${schoolId} payment failed, marked as past_due`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
