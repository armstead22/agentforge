# Vercel Deployment Guide

## Complete Checklist for Production Deployment

- [ ] Repository pushed to GitHub
- [ ] All environment variables configured
- [ ] Supabase database setup complete
- [ ] Stripe webhook configured
- [ ] OpenAI API key obtained
- [ ] Local build works: `npm run build && npm start`
- [ ] TypeScript check passes: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`

## Step-by-Step Deployment

### 1. Prepare Repository

```bash
# Ensure everything is committed
git status

# Push to GitHub
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up or sign in with GitHub
3. Click **"Add New" → "Project"**
4. Select `armstead22/agentforge` repository
5. Click **"Import"**

### 3. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

#### Supabase Variables (Get from supabase.com)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY (Mark as Exposed to Browser)
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
```

⚠️ **Important:** For variables starting with `NEXT_PUBLIC_`, enable "Automatically exposed to the browser"

#### Stripe Variables (Get from dashboard.stripe.com)

```
STRIPE_SECRET_KEY (starts with sk_test_ or sk_live_)
STRIPE_WEBHOOK_SECRET (starts with whsec_)
STRIPE_PRICE_STARTER (e.g., price_1Ov...)
STRIPE_PRICE_GROWTH (e.g., price_1Ov...)
STRIPE_PRICE_SCALE (e.g., price_1Ov...)
```

#### App URL

```
NEXT_PUBLIC_APP_URL = https://agentforge.vercel.app
```

(Replace with your actual domain if using custom domain)

#### OpenAI

```
OPENAI_API_KEY (starts with sk-)
```

### 4. Deploy

Once all environment variables are added:

1. Click **"Deploy"** button
2. Vercel will build and deploy automatically
3. You'll see a progress indicator
4. Deployment complete! 🎉

## Post-Deployment

### Update Stripe Webhook URL

After successful deployment:

1. Get your Vercel domain (e.g., `agentforge-v2.vercel.app`)
2. Go to Stripe Dashboard → Developers → Webhooks
3. Update webhook URL to: `https://your-vercel-domain/api/stripe/webhook`
4. Save and test

### Verify Deployment

1. Open your Vercel URL in browser
2. Check Network tab for 200 status codes
3. Test Stripe webhook:
   - Stripe Dashboard → Webhooks → Test
   - Send test event
   - Verify in Vercel logs

## Monitoring & Logs

### View Deployment Logs

1. Go to Vercel Dashboard
2. Select `agentforge` project
3. Go to **Deployments**
4. Click on latest deployment
5. View logs in **Functions** tab

### Monitor API Performance

```
Vercel Dashboard → Deployments → Analytics
```

Track:
- API response times
- Error rates
- Bandwidth usage

## Troubleshooting Deployment

### Build Fails

**Error:** "Failed to compile"

**Solution:**
1. Check Vercel logs for specific error
2. Run locally: `npm run build`
3. Fix TypeScript errors: `npm run typecheck`
4. Push to GitHub again
5. Vercel will auto-redeploy

### Environment Variables Not Found

**Error:** "Cannot find module" or undefined variables

**Solution:**
1. Verify all variables are added in Vercel Settings
2. Check variable names match exactly (case-sensitive)
3. For `NEXT_PUBLIC_*` variables, mark as "Exposed to Browser"
4. Redeploy after adding variables

### Stripe Webhook Fails

**Error:** 500 error on webhook calls

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Check Stripe webhook logs: Developers → Webhooks
3. Ensure endpoint is `https://your-domain/api/stripe/webhook`
4. Verify database connection in `SUPABASE_*` variables

### Database Connection Issues

**Error:** "Connection refused" or timeout

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Check Supabase project is not paused
3. Verify database tables exist
4. Test connection from local machine
5. Check Supabase Row Level Security (RLS) policies

## Custom Domain Setup

To use a custom domain (e.g., agentforge4ai.com):

1. Vercel Dashboard → Settings → Domains
2. Enter your domain
3. Follow DNS configuration steps
4. Update `NEXT_PUBLIC_APP_URL` to your domain
5. Redeploy

## Scaling for Production

### Database

- Add indexes to frequently queried columns
- Monitor query performance in Supabase
- Consider connection pooling for high load

### API Functions

- Stripe webhook: 60s timeout (already configured)
- Optimize database queries
- Cache responses where appropriate

### Performance

- Enable image optimization (currently disabled)
- Implement caching headers
- Monitor Core Web Vitals in Vercel Analytics

## Security Checklist

- [ ] STRIPE_WEBHOOK_SECRET is only in Vercel (not git)
- [ ] OPENAI_API_KEY is only in Vercel (not git)
- [ ] SUPABASE_SERVICE_ROLE_KEY is only in Vercel
- [ ] Environment variables are git-ignored
- [ ] Security headers are configured (vercel.json)
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Database RLS policies are configured

## Rollback Procedure

If deployment has issues:

1. Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click three dots → "Promote to Production"
4. Rollback complete

Or via Git:

```bash
git revert <commit-hash>
git push origin main
# Vercel auto-redeploys
```

## Monitoring URLs

- **App:** https://agentforge.vercel.app
- **Health Check:** https://agentforge.vercel.app/api/health
- **Vercel Dashboard:** https://vercel.com/armstead/agent-forge
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Issues: Create issue in repository
