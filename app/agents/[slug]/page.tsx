'use client';

import { supabase } from '@/lib/supabase-client';
import type { Agent } from '@/lib/types';
import { formatEuro } from '@/lib/format';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteShell } from '@/components/site/site-shell';
import { AgentIcon } from '@/components/site/agent-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Plug,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [session, setSession] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('agents')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAgent(data as Agent);
        setLoading(false);
      });
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
  }, [slug]);

  const handleDeploy = async () => {
    if (!agent) return;
    if (!session) {
      toast.info('Please sign in to deploy an agent');
      router.push('/auth?redirect=' + encodeURIComponent(`/agents/${agent.slug}`));
      return;
    }
    setDeploying(true);
    try {
      const { data: existing } = await supabase
        .from('deployments')
        .select('id, status')
        .eq('agent_id', agent.id)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'active') {
          toast.info('You already have this agent deployed');
          router.push('/dashboard');
          return;
        }
        await supabase
          .from('deployments')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        toast.success(`${agent.name} reactivated!`);
        router.push('/dashboard');
        return;
      }

      const { error } = await supabase.from('deployments').insert({
        agent_id: agent.id,
        status: 'active',
        config: {},
      });

      if (error) throw error;
      toast.success(`${agent.name} deployed successfully!`);
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to deploy agent. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <SiteShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Skeleton className="h-8 w-32 mb-8 bg-white/5" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-xl bg-white/5" />
              <Skeleton className="h-48 rounded-xl bg-white/5" />
            </div>
            <Skeleton className="h-96 rounded-xl bg-white/5" />
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!agent) {
    return (
      <SiteShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Agent not found</h1>
          <p className="text-white/50 mb-8">
            The agent you are looking for does not exist or has been removed.
          </p>
          <Link href="/marketplace">
            <Button className="bg-gradient-brand text-black hover:opacity-90">
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </SiteShell>
    );
  }

  const valueProps = [
    { icon: Zap, title: 'Deploys in minutes', desc: 'No engineering required. Connect your tools and go live instantly.' },
    { icon: Shield, title: 'Enterprise-grade security', desc: 'SOC 2 compliant. Your data is encrypted and never shared.' },
    { icon: Clock, title: 'Runs 24/7', desc: 'Your agent never sleeps, takes breaks, or goes on vacation.' },
    { icon: TrendingUp, title: 'Improves over time', desc: 'Learns from every interaction to get smarter and faster.' },
  ];

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-radial-brand opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Agent info */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <AgentIcon name={agent.icon} className="w-10 h-10 text-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="bg-white/5 text-white/60">
                      {agent.category}
                    </Badge>
                    <Badge variant="outline" className="border-brand/20 text-brand">
                      {formatEuro(agent.price_cents)}/mo
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    {agent.name}
                  </h1>
                  <p className="text-lg text-white/60">{agent.tagline}</p>
                </div>
              </div>

              <Card className="bg-[#111] border-white/8 mb-6">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-4">What it does</h2>
                  <p className="text-white/70 leading-relaxed whitespace-pre-line">
                    {agent.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-white/8 mb-6">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">Key features</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {agent.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-brand" />
                        </div>
                        <span className="text-sm text-white/70 leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 gap-4">
                {valueProps.map((vp) => (
                  <Card key={vp.title} className="bg-[#0d0d0d] border-white/8">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                        <vp.icon className="w-5 h-5 text-brand" />
                      </div>
                      <h3 className="font-semibold mb-1 text-sm">{vp.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{vp.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: Deploy sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-[#111] border-white/8 overflow-hidden">
                  <div className="p-6 border-b border-white/8">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold tracking-tight">
                        {formatEuro(agent.price_cents)}
                      </span>
                      <span className="text-white/40 text-sm">/month</span>
                    </div>
                    <p className="text-sm text-brand font-medium">
                      14-day free trial — no card required
                    </p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Plug className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="text-white/70">Connect in under 2 minutes</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="text-white/70">Cancel anytime</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="text-white/70">Live in under 10 minutes</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleDeploy}
                      disabled={deploying}
                      className="w-full bg-gradient-brand text-black hover:opacity-90 font-semibold h-12 glow-brand"
                      size="lg"
                    >
                      {deploying ? 'Deploying...' : 'Deploy This Agent'}
                      {!deploying && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>

                    <p className="text-xs text-white/40 text-center">
                      Deploying creates a deployment record. You can pause or
                      cancel from your dashboard at any time.
                    </p>

                    <div className="pt-4 border-t border-white/8">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 text-brand" fill="#00e87a" />
                        ))}
                      </div>
                      <p className="text-xs text-white/40">
                        Rated 4.8/5 by 300+ teams using this agent
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Link href="/onboarding">
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-white/10 text-white/60 hover:text-white"
                  >
                    Not sure? Find your perfect agent
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
