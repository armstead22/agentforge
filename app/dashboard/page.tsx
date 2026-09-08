'use client';

import { supabase } from '@/lib/supabase-client';
import type { Agent, Customer, Deployment, SupportTicket } from '@/lib/types';
import { formatEuro, formatRelativeTime, getTierAgentLimit } from '@/lib/format';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { SiteShell } from '@/components/site/site-shell';
import { AgentIcon } from '@/components/site/agent-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Pause,
  Play,
  Trash2,
  Ticket,
  CreditCard,
  TrendingUp,
  Loader2,
  LogOut,
  Plus,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DeploymentWithAgent extends Deployment {
  agent: Agent;
}

export default function DashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [deployments, setDeployments] = useState<DeploymentWithAgent[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('normal');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const loadData = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setAuthChecked(true);
      setLoading(false);
      return;
    }

    const userId = sessionData.session.user.id;

    const { data: custData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!custData) {
      const { data: newCust } = await supabase
        .from('customers')
        .insert({
          id: userId,
          email: sessionData.session.user.email || '',
          full_name: sessionData.session.user.user_metadata?.full_name || null,
          company: sessionData.session.user.user_metadata?.company || null,
        })
        .select()
        .maybeSingle();
      if (newCust) setCustomer(newCust as Customer);
    } else {
      setCustomer(custData as Customer);
    }

    const { data: depData } = await supabase
      .from('deployments')
      .select('*, agent:agents(*)')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (depData) setDeployments(depData as DeploymentWithAgent[]);

    const { data: tickData } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (tickData) setTickets(tickData as SupportTicket[]);

    if (depData && depData.length > 0) {
      const usagePromises = depData.map(async (dep: any) => {
        const { count } = await supabase
          .from('usage_events')
          .select('*', { count: 'exact', head: true })
          .eq('deployment_id', dep.id);
        return { [dep.id]: count || 0 };
      });
      const results = await Promise.all(usagePromises);
      const merged = results.reduce((acc, obj) => ({ ...acc, ...obj }), {});
      setUsageMap(merged);
    }

    setAuthChecked(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleDeployment = async (dep: DeploymentWithAgent) => {
    const newStatus = dep.status === 'active' ? 'paused' : 'active';
    const { error } = await supabase
      .from('deployments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', dep.id);

    if (error) {
      toast.error('Failed to update agent');
      return;
    }

    setDeployments((prev) =>
      prev.map((d) => (d.id === dep.id ? { ...d, status: newStatus } : d))
    );
    toast.success(
      newStatus === 'active' ? `${dep.agent.name} resumed` : `${dep.agent.name} paused`
    );
  };

  const terminateDeployment = async (dep: DeploymentWithAgent) => {
    const { error } = await supabase.from('deployments').delete().eq('id', dep.id);
    if (error) {
      toast.error('Failed to remove agent');
      return;
    }
    setDeployments((prev) => prev.filter((d) => d.id !== dep.id));
    toast.success(`${dep.agent.name} removed`);
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmittingTicket(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          subject: ticketSubject,
          message: ticketMessage,
          priority: ticketPriority,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) setTickets((prev) => [data as SupportTicket, ...prev]);
      setTicketSubject('');
      setTicketMessage('');
      setTicketPriority('normal');
      toast.success('Support ticket submitted. We will get back to you soon.');
    } catch {
      toast.error('Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const openStripePortal = async () => {
    setPortalLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to open billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || 'Unable to open billing portal.');
      setPortalLoading(false);
    }
  };

  if (loading && !authChecked) {
    return (
      <SiteShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </SiteShell>
    );
  }

  if (!authChecked || (!loading && !customer)) {
    return (
      <SiteShell>
        <div className="max-w-md mx-auto px-4 py-32 text-center">
          <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Sign in required</h1>
          <p className="text-white/50 mb-8">
            You need an account to access your dashboard.
          </p>
          <Button
            onClick={() => router.push('/auth?redirect=/dashboard')}
            className="bg-gradient-brand text-black hover:opacity-90 font-semibold"
          >
            Sign In or Sign Up
          </Button>
        </div>
      </SiteShell>
    );
  }

  const activeCount = deployments.filter((d) => d.status === 'active').length;
  const pausedCount = deployments.filter((d) => d.status === 'paused').length;
  const totalUsage = Object.values(usageMap).reduce((a, b) => a + b, 0);
  const agentLimit = customer ? getTierAgentLimit(customer.subscription_tier) : 0;
  const atLimit = agentLimit !== 'unlimited' && activeCount >= agentLimit;
  const tierLabel = customer?.subscription_tier
    ? customer.subscription_tier.charAt(0).toUpperCase() +
      customer.subscription_tier.slice(1)
    : 'Free';

  return (
    <SiteShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Welcome back, {customer?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-white/50">Manage your agents, track usage, and get support.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-brand/10 text-brand border border-brand/20">{tierLabel} Plan</Badge>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111] border-white/8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Active Agents</span>
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand" />
                </div>
              </div>
              <div className="text-2xl font-bold">{activeCount}</div>
              {agentLimit !== 'unlimited' && <p className="text-xs text-white/40 mt-1">of {agentLimit} allowed</p>}
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Paused</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Pause className="w-4 h-4 text-white/50" />
                </div>
              </div>
              <div className="text-2xl font-bold">{pausedCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Total Tasks</span>
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-brand" />
                </div>
              </div>
              <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Open Tickets</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white/50" />
                </div>
              </div>
              <div className="text-2xl font-bold">
                {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {agentLimit !== 'unlimited' && agentLimit > 0 && (
          <Card className="bg-[#111] border-white/8 mb-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Agent slot usage</span>
                <span className="text-sm text-white/50">{activeCount} / {agentLimit}</span>
              </div>
              <Progress value={agentLimit > 0 ? (activeCount / agentLimit) * 100 : 0} className="h-2 bg-white/5" />
              {atLimit && (
                <p className="text-xs text-brand mt-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  You have reached your plan limit. Upgrade to deploy more agents.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="agents">
          <TabsList className="bg-white/5">
            <TabsTrigger value="agents" className="data-[state=active]:bg-gradient-brand data-[state=active]:text-black">My Agents</TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-gradient-brand data-[state=active]:text-black">Support</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-gradient-brand data-[state=active]:text-black">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Deployed Agents</h2>
              <Button onClick={() => router.push('/marketplace')} className="bg-gradient-brand text-black hover:opacity-90" disabled={atLimit}>
                <Plus className="w-4 h-4 mr-2" />
                {atLimit ? 'Limit Reached' : 'Add Agent'}
              </Button>
            </div>
            {deployments.length === 0 ? (
              <Card className="bg-[#111] border-white/8">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-brand" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No agents deployed yet</h3>
                  <p className="text-white/50 mb-6 max-w-md mx-auto">
                    Browse the marketplace and deploy your first AI agent. It takes less than 10 minutes to get started.
                  </p>
                  <Button onClick={() => router.push('/marketplace')} className="bg-gradient-brand text-black hover:opacity-90">
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deployments.map((dep) => (
                  <Card key={dep.id} className="bg-[#111] border-white/8">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                            <AgentIcon name={dep.agent.icon} className="w-6 h-6 text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold truncate">{dep.agent.name}</h3>
                              <Badge className={dep.status === 'active' ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-white/5 text-white/50'}>
                                {dep.status === 'active' ? 'Active' : 'Paused'}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/40 truncate">{dep.agent.tagline}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                              <span>Deployed {formatRelativeTime(dep.created_at)}</span>
                              <span>{(usageMap[dep.id] || 0).toLocaleString()} tasks</span>
                              <span>{formatEuro(dep.agent.price_cents)}/mo</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={dep.status === 'active'} onCheckedChange={() => toggleDeployment(dep)} />
                          <Button variant="ghost" size="icon" className="text-white/30 hover:text-destructive" onClick={() => terminateDeployment(dep)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#111] border-white/8">
                <CardHeader><CardTitle className="text-lg">Submit a Support Ticket</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={submitTicket} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticket-subject">Subject</Label>
                      <Input id="ticket-subject" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} placeholder="Brief description of the issue" required className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={ticketPriority} onValueChange={setTicketPriority}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-message">Message</Label>
                      <Textarea id="ticket-message" value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} placeholder="Describe your issue in detail..." required rows={5} className="bg-white/5 border-white/10" />
                    </div>
                    <Button type="submit" disabled={submittingTicket} className="w-full bg-gradient-brand text-black hover:opacity-90">
                      {submittingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Tickets</h3>
                {tickets.length === 0 ? (
                  <Card className="bg-[#111] border-white/8">
                    <CardContent className="p-8 text-center">
                      <Ticket className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">No tickets yet. We are here when you need us.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id} className="bg-[#111] border-white/8">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ticket.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : ticket.status === 'resolved' ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-white/5 text-white/50'}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-white/30">{formatRelativeTime(ticket.created_at)}</span>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{ticket.subject}</h4>
                          <p className="text-xs text-white/40 line-clamp-2">{ticket.message}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="max-w-2xl space-y-6">
              <Card className="bg-[#111] border-white/8">
                <CardHeader><CardTitle className="text-lg">Subscription</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Current Plan</span>
                    <Badge className="bg-brand/10 text-brand border border-brand/20">{tierLabel}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Status</span>
                    <span className="text-sm capitalize">
                      {customer?.subscription_status === 'none' && !customer?.trial_ends_at ? 'No active subscription' : customer?.subscription_status.replace('_', ' ')}
                    </span>
                  </div>
                  {customer?.trial_ends_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Trial Ends</span>
                      <span className="text-sm text-brand">{formatRelativeTime(customer.trial_ends_at)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-white/8">
                <CardHeader><CardTitle className="text-lg">Billing Management</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-white/50 mb-4">
                    Manage your payment methods, update your plan, view invoices, or cancel your subscription through the Stripe customer portal.
                  </p>
                  <Button onClick={openStripePortal} disabled={portalLoading} className="bg-gradient-brand text-black hover:opacity-90 w-full">
                    {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    Open Billing Portal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SiteShell>
  );
}
