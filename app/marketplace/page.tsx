'use client';

import { supabase } from '@/lib/supabase-client';
import type { Agent } from '@/lib/types';
import { formatEuro } from '@/lib/format';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SiteShell } from '@/components/site/site-shell';
import { AgentIcon } from '@/components/site/agent-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowRight, SlidersHorizontal } from 'lucide-react';

const categories = ['All', 'Support', 'Marketing', 'Sales', 'Operations', 'HR'];

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setAgents(data as Agent[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchesSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tagline.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || a.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [agents, search, category]);

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-radial-brand opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Agent Marketplace
          </h1>
          <p className="text-lg text-white/50 max-w-2xl">
            Browse our catalog of production-ready AI agents. Each one deploys in
            minutes and comes with a 14-day free trial.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <Input
              placeholder="Search agents by name, keyword, or capability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="w-4 h-4 text-white/30 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-gradient-brand text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-white/40">
          {loading ? 'Loading agents...' : `${filtered.length} agent${filtered.length !== 1 ? 's' : ''} available`}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/40 text-lg mb-4">
              No agents match your search.
            </p>
            <Button
              variant="outline"
              className="border-white/15"
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((agent) => (
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
                    <Badge variant="secondary" className="mb-3 bg-white/5 text-white/50">
                      {agent.category}
                    </Badge>
                    <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
                      {agent.tagline}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agent.features.slice(0, 2).map((f) => (
                        <span
                          key={f}
                          className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/60"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-brand group-hover:gap-2 transition-all">
                      View details
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
