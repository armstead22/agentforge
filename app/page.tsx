'use client';

import { supabase } from '@/lib/supabase-client';
import type { Agent } from '@/lib/types';
import { formatEuro } from '@/lib/format';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteShell } from '@/components/site/site-shell';
import { AgentIcon } from '@/components/site/agent-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRICING_TIERS } from '@/lib/types';
import {
  ArrowRight,
  Check,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Star,
  Quote,
  Sparkles,
  Target,
} from 'lucide-react';

const stats = [
  { value: '12,000+', label: 'Agents Deployed' },
  { value: '4.2M+', label: 'Tasks Automated' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '70%', label: 'Avg Cost Reduction' },
];

const testimonials = [
  {
    quote:
      'AgentForge cut our support response time from 6 hours to under 2 minutes. Our CSAT score went from 78% to 94% in the first month.',
    author: 'Sarah Chen',
    role: 'Head of Support, LinkaPay',
  },
  {
    quote:
      'We deployed three agents in an afternoon and they paid for themselves within two weeks. The marketing agent alone generated €40k in new pipeline.',
    author: 'Marcus Weber',
    role: 'COO, GrowthLab Ventures',
  },
  {
    quote:
      'The lead qualification agent is like having a tireless SDR that never sleeps. Our reps only talk to ready-to-buy prospects now.',
    author: 'Elena Rossi',
    role: 'VP Sales, Nimbus Cloud',
  },
];

export default function LandingPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setAgents(data as Agent[]);
      });
  }, []);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-brand" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-sm text-brand font-medium">
                14-day free trial — no card required
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
              The AI Agency
              <br />
              That <span className="text-gradient-brand">Runs Itself</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Deploy production-ready AI agents for customer support, marketing,
              sales, and operations. Set them up in under 10 minutes and let
              them work while you sleep.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="bg-gradient-brand text-black hover:opacity-90 font-semibold text-base px-8 h-14 glow-brand"
                >
                  Find Your Agent
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/15 text-white hover:bg-white/5 text-base px-8 h-14"
                >
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating agent preview */}
          <div className="mt-20 max-w-5xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {agents.slice(0, 6).map((agent, i) => (
                <Link key={agent.id} href={`/agents/${agent.slug}`}>
                  <div
                    className="group relative p-5 rounded-xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent hover:border-brand/30 hover:bg-brand/[0.03] transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${0.25 + i * 0.05}s` }}
                  >
                    <div className="w-11 h-11 rounded-lg bg-brand/10 flex items-center justify-center mb-3 group-hover:bg-brand/20 transition-colors">
                      <AgentIcon name={agent.icon} className="w-6 h-6 text-brand" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{agent.name}</h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                      {agent.tagline}
                    </p>
                    <div className="mt-3 text-xs font-medium text-brand">
                      {formatEuro(agent.price_cents)}/mo
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Deploy in 3 simple steps
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            No engineers, no integration headaches. Pick an agent, connect your
            tools, and watch it go to work.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              num: '01',
              title: 'Choose your agent',
              desc: 'Browse the marketplace or take our 5-question quiz to find the right agent for your business.',
              icon: Target,
            },
            {
              num: '02',
              title: 'Connect your tools',
              desc: 'Link your existing stack — CRM, help desk, email, ad accounts. Most integrations take under 2 minutes.',
              icon: Zap,
            },
            {
              num: '03',
              title: 'Watch it work',
              desc: 'Your agent goes live instantly. Track performance, pause anytime, and scale up when ready.',
              icon: TrendingUp,
            },
          ].map((step) => (
            <div key={step.num} className="relative group">
              <div className="absolute -top-4 -left-2 text-7xl font-bold text-white/[0.04] group-hover:text-brand/10 transition-colors">
                {step.num}
              </div>
              <div className="relative p-8 rounded-xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-brand/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Meet your new team
            </h2>
            <p className="text-lg text-white/50 max-w-xl">
              Six specialized AI agents, each built to handle a specific business
              function end-to-end.
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="border-white/15 text-white hover:bg-white/5">
              View all agents
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.slug}`}>
              <Card className="group h-full bg-[#111] border-white/8 hover:border-brand/30 transition-all duration-300 cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                      <AgentIcon name={agent.icon} className="w-7 h-7 text-brand" />
                    </div>
                    <Badge variant="outline" className="border-brand/20 text-brand">
                      {formatEuro(agent.price_cents)}/mo
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    {agent.tagline}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/60"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-brand group-hover:gap-2 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Cancel
            anytime.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-8 transition-all ${
                tier.highlight
                  ? 'border-2 border-brand bg-gradient-to-b from-brand/[0.08] to-transparent glow-brand'
                  : 'border border-white/8 bg-white/[0.02] hover:border-white/15'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-brand text-black font-semibold px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold tracking-tight">
                  &euro;{tier.priceMonthly}
                </span>
                <span className="text-white/40 text-sm ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/onboarding">
                <Button
                  className={`w-full font-semibold ${
                    tier.highlight
                      ? 'bg-gradient-brand text-black hover:opacity-90'
                      : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                  size="lg"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Trusted by fast-moving teams
          </h2>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 text-brand" fill="#00e87a" />
            ))}
            <span className="text-sm text-white/40 ml-2">4.9/5 from 800+ reviews</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.author} className="bg-[#111] border-white/8 p-8">
              <Quote className="w-8 h-8 text-brand/30 mb-4" />
              <p className="text-white/80 leading-relaxed mb-6">{t.quote}</p>
              <div>
                <div className="font-semibold text-white">{t.author}</div>
                <div className="text-sm text-white/40">{t.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] via-transparent to-transparent p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-radial-brand opacity-50" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 mb-6">
              <Clock className="w-4 h-4 text-brand" />
              <span className="text-sm text-brand font-medium">
                Set up in under 10 minutes
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to put your business on autopilot?
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
              Join 12,000+ teams using AgentForge to automate their most
              repetitive work. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="bg-gradient-brand text-black hover:opacity-90 font-semibold text-base px-8 h-14 glow-brand"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/15 text-white hover:bg-white/5 text-base px-8 h-14"
                >
                  Explore Agents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
