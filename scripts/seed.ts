/**
 * AgentForge — Database Seed Script
 *
 * Seeds the agents table with 6 production-ready AI agents.
 * Uses the Supabase service role key to bypass RLS.
 *
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const agents = [
  {
    slug: 'customer-support',
    name: 'Customer Support',
    tagline: 'Resolve tickets instantly, 24/7, in 50+ languages',
    description:
      'Deploy an AI support agent that reads your docs, help center, and past tickets to answer customer questions accurately and instantly. It escalates complex issues to your human team with full context, tags and routes conversations automatically, and learns from every resolution to improve over time. Works across email, chat, WhatsApp, and social DMs — no engineering setup required.',
    icon: 'Headphones',
    category: 'Support',
    price_cents: 9900,
    currency: 'eur',
    features: [
      '24/7 instant responses across email, chat & WhatsApp',
      'Auto-resolves up to 70% of tier-1 tickets',
      'Escalates to humans with full conversation context',
      'Learns from your docs and past resolutions',
      'Sentiment detection and proactive outreach',
    ],
    is_active: true,
    sort_order: 1,
  },
  {
    slug: 'marketing-automation',
    name: 'Marketing Automation',
    tagline: 'Run multi-channel campaigns that convert on autopilot',
    description:
      'An always-on marketing agent that plans, writes, and optimizes your campaigns across email, social, and ad platforms. It segments your audience automatically, A/B tests subject lines and creatives, adjusts spend based on performance, and generates weekly reports with actionable insights. Connect your CRM and ad accounts in minutes — the agent handles the rest.',
    icon: 'Megaphone',
    category: 'Marketing',
    price_cents: 9900,
    currency: 'eur',
    features: [
      'Plans and writes multi-channel campaigns',
      'Automatic audience segmentation',
      'A/B testing of subject lines and creatives',
      'Budget optimization across ad platforms',
      'Weekly performance reports with insights',
    ],
    is_active: true,
    sort_order: 2,
  },
  {
    slug: 'lead-qualification',
    name: 'Lead Qualification',
    tagline: 'Score, enrich, and route every lead before your team lifts a finger',
    description:
      'Stop wasting reps time on cold leads. This agent engages every inbound lead in real time, asks qualifying questions, enriches the profile with firmographic data, scores readiness, and routes hot leads directly to the right sales rep — all before your team even opens their inbox. Integrates with HubSpot, Salesforce, Pipedrive, and custom CRMs.',
    icon: 'Target',
    category: 'Sales',
    price_cents: 9900,
    currency: 'eur',
    features: [
      'Real-time lead engagement via chat & email',
      'Automatic enrichment with firmographic data',
      'AI scoring with custom qualification criteria',
      'Routes hot leads to the right rep instantly',
      'HubSpot, Salesforce & Pipedrive integrations',
    ],
    is_active: true,
    sort_order: 3,
  },
  {
    slug: 'invoice-admin',
    name: 'Invoice & Admin',
    tagline: 'Automate invoicing, expense tracking, and financial reporting',
    description:
      'An AI back-office agent that generates and sends invoices, tracks payments, chases overdue accounts, categorizes expenses from receipt scans, and produces monthly financial summaries. It connects to your bank, accounting software, and project tools to keep your books spotless without hiring a full-time accountant.',
    icon: 'Receipt',
    category: 'Operations',
    price_cents: 9900,
    currency: 'eur',
    features: [
      'Auto-generates and sends professional invoices',
      'Tracks payments and chases overdue accounts',
      'Receipt scanning and expense categorization',
      'Monthly financial summaries and reports',
      'Integrates with QuickBooks, Xero & bank feeds',
    ],
    is_active: true,
    sort_order: 4,
  },
  {
    slug: 'hiring-assistant',
    name: 'Hiring Assistant',
    tagline: 'Screen, schedule, and shortlist candidates without the busywork',
    description:
      'Transform your recruitment process with an AI agent that writes job descriptions, screens resumes against your criteria, conducts initial chat-based interviews, schedules calls with shortlisted candidates, and keeps everyone updated automatically. It eliminates bias in screening, reduces time-to-hire by 60%, and keeps your ATS perfectly in sync.',
    icon: 'Users',
    category: 'HR',
    price_cents: 9900,
    currency: 'eur',
    features: [
      'Writes optimized job descriptions',
      'Screens resumes against custom criteria',
      'Conducts initial chat-based interviews',
      'Automated scheduling with calendar sync',
      'Reduces time-to-hire by up to 60%',
    ],
    is_active: true,
    sort_order: 5,
  },
  {
    slug: 'reputation-monitor',
    name: 'Reputation Monitor',
    tagline: 'Track every review, respond instantly, and protect your brand',
    description:
      'An AI agent that monitors your brand across 50+ review platforms and social media, responds to reviews automatically with on-brand replies, flags negative sentiment before it spreads, and surfaces trends in customer feedback. It alerts you to crises in real time and generates monthly reputation reports so you always know where you stand.',
    icon: 'Star',
    category: 'Marketing',
    price_cents: 9900,
    currency: 'eur',
    features: [
      'Monitors 50+ review platforms and social media',
      'Auto-responds to reviews with on-brand replies',
      'Real-time alerts for negative sentiment',
      'Trend analysis of customer feedback',
      'Monthly reputation scorecard and reports',
    ],
    is_active: true,
    sort_order: 6,
  },
];

async function main() {
  console.log('\n=== AgentForge Database Seed ===\n');
  console.log(`Seeding ${agents.length} agents...\n`);

  const { data, error } = await supabase
    .from('agents')
    .upsert(agents, { onConflict: 'slug' })
    .select('slug, name');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  if (data) {
    data.forEach((agent: any) => {
      console.log(`  [ok] ${agent.name} (${agent.slug})`);
    });
  }

  console.log(`\n${data?.length || 0} agents seeded successfully.\n`);
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
