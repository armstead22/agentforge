# AgentForge

**The AI Agency That Runs Itself**

AgentForge is a full-stack production-ready platform for deploying AI agents that handle customer support, marketing, sales, operations, and HR — automatically, 24/7.

Domain: [agentforge4ai.com](https://agentforge4ai.com)

---

## Tech Stack

| Layer        | Technology                                      |
|-------------|------------------------------------------------|
| Frontend     | Next.js 13 (App Router), React, TypeScript      |
| Styling      | Tailwind CSS, shadcn/ui, Lucide icons           |
| Database     | PostgreSQL (Supabase)                           |
| Auth         | Supabase Auth (email/password)                  |
| Payments     | Stripe (Checkout, Customer Portal, Webhooks)    |
| AI           | OpenAI GPT-4o (via agent integrations)          |
| Deployment   | Vercel                                          |

---

## Features

### Pages
- **Landing** — Hero, stats, agent showcase, pricing tiers, testimonials, CTA
- **Marketplace** — Browsable agent grid with search and category filters
- **Agent Detail** — Full description, feature list, pricing, Deploy CTA
- **Onboarding** — 5-question quiz that recommends the right agent
- **Customer Dashboard** — Active agents, usage stats, pause/resume, support tickets, Stripe portal
- **Admin Panel** — Manage agents (CRUD), view customers, revenue records, support tickets
- **Auth** — Sign in / sign up with email and password

### AI Agents (6 pre-seeded)
1. **Customer Support** — 24/7 ticket resolution across email, chat & WhatsApp
2. **Marketing Automation** — Multi-channel campaign planning and optimization
3. **Lead Qualification** — Real-time lead scoring, enrichment, and routing
4. **Invoice & Admin** — Automated invoicing, expense tracking, financial reports
5. **Hiring Assistant** — Resume screening, chat interviews, automated scheduling
6. **Reputation Monitor** — Review monitoring, auto-responses, sentiment alerts

### Pricing
| Tier     | Price     | Agents     | Key Features                                        |
|----------|-----------|------------|-----------------------------------------------------|
| Starter  | €99/mo    | 1          | Email support, standard integrations                |
| Growth   | €249/mo   | 3          | Priority support, custom configuration              |
| Scale    | €599/mo   | Unlimited  | Custom training, dedicated SLA, API access          |

All tiers include a **14-day free trial** — no credit card required upfront.

### Stripe Integration
- Stripe Checkout for subscription sign-ups with 14-day trial
- Stripe Customer Portal for self-serve billing management
- Webhook handler for subscription lifecycle events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (or use the provisioned one)
- A Stripe account
- An OpenAI API key (for agent integrations)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable                        | Description                              |
|--------------------------------|------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon (public) key               |
| `SUPABASE_URL`                 | Same as above (server-side)              |
| `SUPABASE_ANON_KEY`            | Same as above (server-side)              |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabase service role key                |
| `STRIPE_SECRET_KEY`            | Stripe API secret key                    |
| `STRIPE_WEBHOOK_SECRET`        | Stripe webhook signing secret            |
| `NEXT_PUBLIC_APP_URL`          | Your app URL (e.g. http://localhost:3000)|
| `STRIPE_PRICE_STARTER`         | Auto-filled by setup-stripe script       |
| `STRIPE_PRICE_GROWTH`          | Auto-filled by setup-stripe script       |
| `STRIPE_PRICE_SCALE`           | Auto-filled by setup-stripe script       |
| `OPENAI_API_KEY`               | OpenAI API key for agent integrations    |

### 3. Database Setup

The database schema is managed via Supabase migrations. If the migrations have not been applied yet, they are located in `supabase/migrations/`. The schema includes:

- `agents` — AI agent catalog
- `customers` — User profiles with Stripe linkage
- `deployments` — Which agents each customer has deployed
- `usage_events` — Per-deployment usage tracking
- `support_tickets` — Customer support requests
- `revenue_records` — Revenue data for admin panel

All tables have Row Level Security (RLS) enabled with owner-scoped policies.

### 4. Seed the Database

Populate the 6 AI agents:

```bash
npx tsx scripts/seed.ts
```

### 5. Set Up Stripe Products

Create the three pricing tiers in your Stripe account:

```bash
npx tsx scripts/setup-stripe.ts
```

This script creates products and prices for Starter (€99), Growth (€249), and Scale (€599), then writes the price IDs to your `.env` file.

### 6. Set Up Stripe Webhook

1. Go to your [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in your `.env`

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 7. Create an Admin User

After signing up through the app, promote your account to admin by running this SQL in the Supabase SQL editor:

```sql
UPDATE customers SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 8. Run the Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env` in the Vercel project settings
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy

The `vercel.json` file is pre-configured with security headers and webhook function timeout.

### Stripe Webhook (Production)

Update your Stripe webhook endpoint URL to:
```
https://agentforge4ai.com/api/stripe/webhook
```

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with theme
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles + brand colors
│   ├── agents/[slug]/          # Agent detail page
│   ├── marketplace/            # Agent marketplace
│   ├── onboarding/             # 5-question quiz
│   ├── auth/                   # Sign in / sign up
│   ├── dashboard/              # Customer dashboard
│   ├── admin/                  # Admin panel
│   └── api/
│       └── stripe/
│           ├── checkout/       # Stripe Checkout session
│           ├── portal/         # Stripe Customer Portal
│           └── webhook/        # Stripe webhook handler
├── components/
│   ├── site/                   # Navbar, Footer, SiteShell, AgentIcon
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── types.ts                # Shared TypeScript types + constants
│   ├── supabase-client.ts      # Supabase client (client + server)
│   ├── format.ts               # Currency/date formatting utilities
│   └── utils.ts                # cn() utility
├── scripts/
│   ├── seed.ts                 # Seed 6 agents into database
│   └── setup-stripe.ts         # Create Stripe products & prices
├── supabase/
│   └── migrations/             # SQL migrations (tables + RLS policies)
├── .env.example
├── vercel.json
└── README.md
```

---

## Brand

- **Background:** `#0a0a0a` (near-black)
- **Accent:** `#00e87a` (vibrant green)
- **Text:** `#ffffff` (white)
- **Tagline:** "The AI Agency That Runs Itself"
- **Font:** Inter (system-ui fallback)

---

## License

This is a proprietary project. All rights reserved.
