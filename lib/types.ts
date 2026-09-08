export type AgentCategory =
  | 'Support'
  | 'Marketing'
  | 'Sales'
  | 'Operations'
  | 'HR'
  | 'General';

export interface Agent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: string;
  price_cents: number;
  currency: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'scale';
export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled';

export interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: 'customer' | 'admin';
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DeploymentStatus = 'active' | 'paused' | 'terminated';

export interface Deployment {
  id: string;
  customer_id: string;
  agent_id: string;
  status: DeploymentStatus;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  agent?: Agent;
}

export interface UsageEvent {
  id: string;
  deployment_id: string;
  event_type: string;
  tokens_used: number;
  created_at: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  customer_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  customer?: Pick<Customer, 'email' | 'full_name' | 'company'>;
}

export interface RevenueRecord {
  id: string;
  customer_id: string | null;
  amount_cents: number;
  currency: string;
  description: string | null;
  stripe_invoice_id: string | null;
  created_at: string;
  customer?: Pick<Customer, 'email' | 'full_name' | 'company'>;
}

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  agentLimit: number | 'unlimited';
  features: string[];
  highlight?: boolean;
  stripePriceId?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 99,
    agentLimit: 1,
    features: [
      '1 AI agent of your choice',
      'Email support (24h response)',
      'Standard integrations',
      'Monthly usage reports',
      '14-day free trial, no card required',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    priceMonthly: 249,
    agentLimit: 3,
    features: [
      '3 AI agents of your choice',
      'All standard integrations',
      'Priority support (4h response)',
      'Weekly usage analytics',
      'Custom agent configuration',
      '14-day free trial, no card required',
    ],
    highlight: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    priceMonthly: 599,
    agentLimit: 'unlimited',
    features: [
      'Unlimited AI agents',
      'Custom agent training & fine-tuning',
      'Dedicated Slack channel & SLA',
      'Real-time analytics dashboard',
      'White-glove onboarding',
      'Custom integrations & API access',
      '14-day free trial, no card required',
    ],
  },
];

export interface OnboardingQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: {
    id: string;
    label: string;
    description: string;
    agentSlug: string;
  }[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'q1',
    question: 'What is your biggest operational challenge right now?',
    subtitle: 'Pick the area where your team spends the most manual effort.',
    options: [
      { id: 'support', label: 'Customer support volume', description: 'Tickets pile up faster than your team can respond', agentSlug: 'customer-support' },
      { id: 'marketing', label: 'Inconsistent marketing', description: 'Campaigns are manual and hard to track', agentSlug: 'marketing-automation' },
      { id: 'sales', label: 'Unqualified leads', description: 'Sales reps waste time on cold prospects', agentSlug: 'lead-qualification' },
      { id: 'admin', label: 'Invoicing & admin overhead', description: 'Back-office tasks eat hours every week', agentSlug: 'invoice-admin' },
    ],
  },
  {
    id: 'q2',
    question: 'How does your team handle repetitive conversations today?',
    subtitle: 'We will match you to the agent that saves the most hours.',
    options: [
      { id: 'manual', label: 'Fully manual, one by one', description: 'Each message gets a human reply from scratch', agentSlug: 'customer-support' },
      { id: 'templates', label: 'Templates & macros', description: 'We use saved replies but routing is still manual', agentSlug: 'customer-support' },
      { id: 'outsourced', label: 'Outsourced team', description: 'An external agency handles volume', agentSlug: 'lead-qualification' },
      { id: 'nothing', label: 'We do not handle them', description: 'Messages go unanswered or get delayed', agentSlug: 'reputation-monitor' },
    ],
  },
  {
    id: 'q3',
    question: 'Which workflow would have the biggest revenue impact?',
    subtitle: 'Think about what drives or protects revenue directly.',
    options: [
      { id: 'leads', label: 'Closing more qualified leads', description: 'Faster follow-up means higher conversion', agentSlug: 'lead-qualification' },
      { id: 'campaigns', label: 'Running better campaigns', description: 'Automated, multi-channel marketing at scale', agentSlug: 'marketing-automation' },
      { id: 'reviews', label: 'Protecting our reputation', description: 'Reviews and brand sentiment affect every deal', agentSlug: 'reputation-monitor' },
      { id: 'invoices', label: 'Getting paid faster', description: 'Chasing invoices and reducing overdue accounts', agentSlug: 'invoice-admin' },
    ],
  },
  {
    id: 'q4',
    question: 'What size is your team today?',
    subtitle: 'We factor this into the pricing tier we recommend.',
    options: [
      { id: 'solo', label: '1–5 people', description: 'Solo founder or small team — every hour matters', agentSlug: 'customer-support' },
      { id: 'small', label: '6–25 people', description: 'Growing team with defined roles', agentSlug: 'marketing-automation' },
      { id: 'medium', label: '26–100 people', description: 'Multiple departments and processes', agentSlug: 'invoice-admin' },
      { id: 'large', label: '100+ people', description: 'Enterprise with complex workflows', agentSlug: 'hiring-assistant' },
    ],
  },
  {
    id: 'q5',
    question: 'How quickly do you want to see results?',
    subtitle: 'All agents deploy in under 10 minutes, but some show ROI faster.',
    options: [
      { id: 'instant', label: 'This week', description: 'I need immediate relief on an overflowing inbox', agentSlug: 'customer-support' },
      { id: 'weeks', label: 'Within a month', description: 'I want a measurable lift in pipeline or campaigns', agentSlug: 'marketing-automation' },
      { id: 'quarter', label: 'Next quarter', description: 'I am planning ahead and want strategic automation', agentSlug: 'hiring-assistant' },
      { id: 'ongoing', label: 'Ongoing improvement', description: 'I want steady, compounding gains over time', agentSlug: 'reputation-monitor' },
    ],
  },
];
