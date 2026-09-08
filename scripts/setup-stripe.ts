/**
 * AgentForge — Stripe Setup Script
 *
 * Creates Stripe products and prices for the three pricing tiers.
 * Run with: npx tsx scripts/setup-stripe.ts
 *
 * Requires STRIPE_SECRET_KEY in your .env file.
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('ERROR: STRIPE_SECRET_KEY is not set. Add it to your .env file.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2026-08-26.dahlia',
});

const tiers = [
  {
    id: 'starter',
    name: 'AgentForge Starter',
    description: '1 AI agent, email support, standard integrations. 14-day free trial.',
    price: 99,
    envVar: 'STRIPE_PRICE_STARTER',
  },
  {
    id: 'growth',
    name: 'AgentForge Growth',
    description: '3 AI agents, all integrations, priority support, custom configuration. 14-day free trial.',
    price: 249,
    envVar: 'STRIPE_PRICE_GROWTH',
  },
  {
    id: 'scale',
    name: 'AgentForge Scale',
    description: 'Unlimited agents, custom training, dedicated SLA, API access. 14-day free trial.',
    price: 599,
    envVar: 'STRIPE_PRICE_SCALE',
  },
];

async function main() {
  console.log('\n=== AgentForge Stripe Setup ===\n');
  console.log('Creating products and prices...\n');

  const envUpdates: Record<string, string> = {};

  for (const tier of tiers) {
    // Check if product already exists by searching
    const existingProducts = await stripe.products.search({
      query: `name:'${tier.name}'`,
    });

    let product: Stripe.Product;

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`[exists] Product: ${tier.name} (${product.id})`);
    } else {
      product = await stripe.products.create({
        id: `agentforge_${tier.id}`,
        name: tier.name,
        description: tier.description,
      });
      console.log(`[created] Product: ${tier.name} (${product.id})`);
    }

    // Check for existing recurring price on this product
    const existingPrices = await stripe.prices.list({
      product: product.id,
      type: 'recurring',
      active: true,
    });

    let price: Stripe.Price;

    if (existingPrices.data.length > 0) {
      price = existingPrices.data[0];
      console.log(`[exists] Price: ${tier.name} - EUR ${(tier.price).toFixed(2)}/mo (${price.id})`);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.price * 100,
        currency: 'eur',
        recurring: {
          interval: 'month',
        },
        metadata: {
          tier: tier.id,
        },
      });
      console.log(`[created] Price: ${tier.name} - EUR ${(tier.price).toFixed(2)}/mo (${price.id})`);
    }

    envUpdates[tier.envVar] = price.id;
  }

  // Update .env file with price IDs
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  for (const [key, value] of Object.entries(envUpdates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');

  console.log('\n=== Setup Complete ===\n');
  console.log('Price IDs have been written to your .env file:\n');
  for (const [key, value] of Object.entries(envUpdates)) {
    console.log(`  ${key}=${value}`);
  }
  console.log('\nNext steps:');
  console.log('  1. Set up the webhook endpoint in your Stripe dashboard:');
  console.log('     URL: https://agentforge4ai.com/api/stripe/webhook');
  console.log('     Events: checkout.session.completed, customer.subscription.created,');
  console.log('             customer.subscription.updated, customer.subscription.deleted,');
  console.log('             invoice.paid, invoice.payment_failed');
  console.log('  2. Add the webhook signing secret as STRIPE_WEBHOOK_SECRET in your .env');
  console.log('  3. Run the seed script: npx tsx scripts/seed.ts\n');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
