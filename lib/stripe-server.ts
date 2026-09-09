import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('Missing Stripe environment variable: STRIPE_SECRET_KEY');
  }

  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });

  return stripeInstance;
}
