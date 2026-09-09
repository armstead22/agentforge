# AgentForge

🤖 **AgentForge — The AI Agency That Runs Itself**

Deploy production-ready AI agents for your business in under 10 minutes. Build AI agents for customer support, marketing, sales, operations, and HR.

- ✅ **14-day free trial** — no card required
- ⚡ **Production-ready** — fully configured for enterprise use
- 🔒 **Secure** — bank-level security headers
- 📊 **Scalable** — built for high-performance applications

## Tech Stack

| Technology | Purpose |
|-----------|----------|
| **Next.js 13** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Supabase** | PostgreSQL database & authentication |
| **Stripe** | Payment processing & subscriptions |
| **OpenAI** | AI model integration |
| **Tailwind CSS** | Utility-first styling |
| **Radix UI** | Accessible component library |

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- npm or yarn
- Supabase project ([create free](https://supabase.com))
- Stripe account ([create free](https://stripe.com))
- OpenAI API key ([get key](https://platform.openai.com))

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/armstead22/agentforge.git
cd agentforge
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:

```env
# Supabase (from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_SCALE=price_...

# OpenAI (from platform.openai.com)
OPENAI_API_KEY=sk-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build optimized production bundle
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
npm run format       # Format code with Prettier
```

## Project Structure

```
agentforge/
├── app/                      # Next.js App Router
│   ├── api/                  # API endpoints
│   │   ├── stripe/          # Stripe webhook handler
│   │   ├── health/          # Health check endpoint
│   │   └── [...routes]      # Other API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   └── ui/                  # Radix UI components
├── lib/                     # Utility functions
│   ├── supabase-server.ts  # Supabase client
│   ├── stripe-server.ts    # Stripe configuration
│   └── utils.ts            # Helper utilities
├── public/                  # Static assets
├── .env.example            # Environment template
├── .env.local              # Local environment (git-ignored)
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── vercel.json             # Vercel deployment config
└── package.json            # Dependencies
```

## Environment Variables Reference

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings → API**
3. Copy these values:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` → Service role key

### Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Go to **Developers → API Keys**
3. Copy `STRIPE_SECRET_KEY` (starts with `sk_test_`)
4. Go to **Webhooks**:
   - Add endpoint: `https://your-domain/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`
5. Create price IDs for each tier:
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_GROWTH`
   - `STRIPE_PRICE_SCALE`

### OpenAI Setup

1. Create account at [platform.openai.com](https://platform.openai.com)
2. Go to **API keys**
3. Create new secret key
4. Copy to `OPENAI_API_KEY`

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New" → "Project"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 3: Add Environment Variables

In Vercel project settings, go to **"Settings → Environment Variables"** and add:

**Supabase Variables** (mark as "Automatically exposed to the browser" for `NEXT_PUBLIC_*`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

**Stripe Variables**:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_SCALE`

**Other**:
- `NEXT_PUBLIC_APP_URL` → Set to your Vercel domain (e.g., `https://agentforge.vercel.app`)
- `OPENAI_API_KEY`

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app is live! 🎉

## Database Setup

### Create Tables in Supabase

Run these SQL commands in Supabase SQL editor:

```sql
-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'none',
  subscription_tier TEXT DEFAULT 'free',
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Revenue records
CREATE TABLE revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  amount_cents INTEGER,
  currency TEXT,
  description TEXT,
  stripe_invoice_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX idx_revenue_customer_id ON revenue_records(customer_id);
```

## Stripe Webhook Configuration

Your webhook endpoint is configured to handle:

- `checkout.session.completed` — User purchased subscription
- `customer.subscription.created` — New subscription activated
- `customer.subscription.updated` — Subscription updated
- `customer.subscription.deleted` — Subscription canceled
- `invoice.paid` — Payment received
- `invoice.payment_failed` — Payment failed

## Health Check

The app includes a health check endpoint at `/api/health` for monitoring and uptime checks.

## API Response Times

- Stripe webhook: Max 60 seconds
- Health check: Max 10 seconds
- Other endpoints: Max 30 seconds (Vercel default)

## Security Features

✅ **Security Headers:**
- `X-Content-Type-Options: nosniff` — Prevent MIME type sniffing
- `X-Frame-Options: DENY` — Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` — XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` — Privacy
- `Permissions-Policy` — Disable unnecessary features

✅ **Code Quality:**
- ESLint configuration
- TypeScript strict mode
- Prettier code formatting

✅ **Environment Security:**
- `.env.local` is git-ignored
- Environment variables only accessible in appropriate contexts
- Public keys properly separated from secrets

## Troubleshooting

### Build Fails

```bash
# Check TypeScript errors
npm run typecheck

# Check ESLint errors
npm run lint

# Verify Node.js version
node --version  # Should be 18+

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

- **Local:** Restart dev server after updating `.env.local`
- **Vercel:** Redeploy after adding environment variables
- **Check:** Verify variable names match exactly (case-sensitive)

### Stripe Webhook Issues

1. Check webhook secret is copied correctly
2. Verify endpoint URL is `https://your-domain/api/stripe/webhook`
3. Check Stripe Dashboard → Webhooks for delivery logs
4. Ensure endpoint is publicly accessible (not localhost)

### Supabase Connection Issues

- Verify project URL and keys are correct
- Check network connectivity to Supabase
- Ensure database tables exist
- Check Row Level Security (RLS) policies

## Performance Optimization

- **Image Optimization:** Images are unoptimized for edge deployment
- **Bundle Size:** Tree-shaking enabled, unused code removed
- **Caching:** Strategic cache headers configured
- **Database:** Use indexes on frequently queried columns

## Monitoring

- Monitor API logs in Vercel Dashboard
- Check Stripe dashboard for webhook deliveries
- Monitor Supabase database performance
- Track uptime with `/api/health` endpoint

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 🗄️ [Supabase Docs](https://supabase.com/docs)
- 💳 [Stripe Docs](https://stripe.com/docs)
- 🤖 [OpenAI Docs](https://platform.openai.com/docs)

## License

MIT License — see LICENSE file for details

---

**Made with ❤️ by AgentForge**
