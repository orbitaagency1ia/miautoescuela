import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as '2025-01-27.acacia',
      typescript: true,
    })
  : null;

export const STRIPE_PRICES = {
  MONTHLY: process.env.STRIPE_PRICE_MONTHLY_ID || '',
};

export const getStripeUrl = () => {
  return process.env.NEXT_PUBLIC_STRIPE_URL || 'https://dashboard.stripe.com';
};
