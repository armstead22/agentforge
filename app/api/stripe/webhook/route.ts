import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe-server';
import { supabaseServer } from '@/lib/supabase-server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: import('stripe').Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as import('stripe').Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.metadata?.supabase_user_id;

        if (userId) {
          const trialEnd = session.subscription
            ? await getSubscriptionTrialEnd(stripe, session.subscription as string)
            : null;

          await supabase
            .from('customers')
            .update({
              stripe_customer_id: customerId,
              subscription_status: 'trialing',
              trial_ends_at: trialEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as import('stripe').Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (!customer) break;

        const status = mapSubscriptionStatus(subscription.status);
        const tier = mapPriceToTier(subscription.items.data[0]?.price?.id || '');
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null;

        await supabase
          .from('customers')
          .update({
            subscription_status: status,
            subscription_tier: tier,
            trial_ends_at: trialEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as import('stripe').Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (!customer) break;

        await supabase
          .from('customers')
          .update({
            subscription_status: 'canceled',
            subscription_tier: 'free',
            trial_ends_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id);

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as import('stripe').Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (invoice.billing_reason === 'subscription_cycle' && invoice.amount_paid > 0) {
          const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

          if (customer) {
            await supabase.from('revenue_records').insert({
              customer_id: customer.id,
              amount_cents: invoice.amount_paid,
              currency: invoice.currency,
              description: `Subscription payment - Invoice ${invoice.number || invoice.id}`,
              stripe_invoice_id: invoice.id,
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as import('stripe').Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (customer) {
          await supabase
            .from('customers')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', customer.id);
        }
        break;
      }

      default:
        break;
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

async function getSubscriptionTrialEnd(stripe: import('stripe').Stripe, subscriptionId: string): Promise<string | null> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
  } catch {
    return null;
  }
}

function mapSubscriptionStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'none',
    incomplete_expired: 'none',
  };
  return map[stripeStatus] || 'none';
}

function mapPriceToTier(priceId: string): string {
  const starterPrice = process.env.STRIPE_PRICE_STARTER || '';
  const growthPrice = process.env.STRIPE_PRICE_GROWTH || '';
  const scalePrice = process.env.STRIPE_PRICE_SCALE || '';

  if (priceId === starterPrice) return 'starter';
  if (priceId === growthPrice) return 'growth';
  if (priceId === scalePrice) return 'scale';
  return 'free';
}
