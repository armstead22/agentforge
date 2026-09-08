'use client';

import { supabase } from '@/lib/supabase-client';
import type { Agent, Customer, SupportTicket, RevenueRecord } from '@/lib/types';
import { formatEuro, formatDate, formatNumber } from '@/lib/format';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DollarSign,
  Users,
  Bot,
  Ticket,
  Loader2,
  Save,
  Trash2,
  Plus,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminCustomer extends Customer {
  deployment_count?: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [creatingAgent, setCreatingAgent] = useState(false);

  // New agent form
  const blankAgent: Partial<Agent> = {
    name: '',
    slug: '',
    tagline: '',
    description: '',
    icon: 'Bot',
    category: 'General',
    price_cents: 9900,
    features: [],
    is_active: true,
    sort_order: 99,
  };
  const [agentForm, setAgentForm] = useState<Partial<Agent>>(blankAgent);
  const [featuresText, setFeaturesText] = useState('');
  const [savingAgent, setSavingAgent] = useState(false);

  const checkAdminAndLoad = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setLoading(false);
      return;
    }

    const { data: cust } = await supabase
      .from('customers')
      .select('*')
      .eq('id', session.session.user.id)
      .maybeSingle();

    if (!cust || cust.role !== 'admin') {
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    // Load agents
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .order('sort_order', { ascending: true });
    if (agentData) setAgents(agentData as Agent[]);

    // Load customers
    const { data: custData } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (custData) setCustomers(custData as AdminCustomer[]);

    // Load tickets
    const { data: tickData } = await supabase
      .from('support_tickets')
      .select('*, customer:customers(email, full_name, company)')
      .order('created_at', { ascending: false })
      .limit(20);
    if (tickData) setTickets(tickData as SupportTicket[]);

    // Load revenue
    const { data: revData } = await supabase
      .from('revenue_records')
      .select('*, customer:customers(email, full_name, company)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (revData) {
      setRevenue(revData as RevenueRecord[]);
      const total = (revData as RevenueRecord[]).reduce(
        (sum, r) => sum + r.amount_cents,
        0
      );
      setTotalRevenue(total);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkAdminAndLoad();
  }, [checkAdminAndLoad]);

  const startEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setCreatingAgent(false);
    setAgentForm(agent);
    setFeaturesText(agent.features.join('\n'));
  };

  const startCreateAgent = () => {
    setCreatingAgent(true);
    setEditingAgent(null);
    setAgentForm(blankAgent);
    setFeaturesText('');
  };

  const saveAgent = async () => {
    if (!agentForm.name || !agentForm.slug || !agentForm.tagline || !agentForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSavingAgent(true);
    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...agentForm,
      features,
      price_cents: Number(agentForm.price_cents) || 9900,
      sort_order: Number(agentForm.sort_order) || 99,
    };

    try {
      if (creatingAgent) {
        const { data, error } = await supabase
          .from('agents')
          .insert(payload)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setAgents((prev) => [...prev, data as Agent].sort((a, b) => a.sort_order - b.sort_order));
        }
        toast.success('Agent created successfully');
      } else if (editingAgent) {
        const { data, error } = await supabase
          .from('agents')
          .update(payload)
          .eq('id', editingAgent.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setAgents((prev) =>
            prev.map((a) => (a.id === editingAgent.id ? (data as Agent) : a))
              .sort((a, b) => a.sort_order - b.sort_order)
          );
        }
        toast.success('Agent updated successfully');
      }
      setEditingAgent(null);
      setCreatingAgent(false);
      setAgentForm(blankAgent);
      setFeaturesText('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save agent');
    } finally {
      setSavingAgent(false);
    }
  };

  const deleteAgent = async (agent: Agent) => {
    if (!confirm(`Delete ${agent.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from('agents').delete().eq('id', agent.id);
    if (error) {
      toast.error('Failed to delete agent');
      return;
    }
    setAgents((prev) => prev.filter((a) => a.id !== agent.id));
    toast.success(`${agent.name} deleted`);
  };

  const toggleAgentActive = async (agent: Agent) => {
    const { error } = await supabase
      .from('agents')
      .update({ is_active: !agent.is_active })
      .eq('id', agent.id);
    if (error) {
      toast.error('Failed to update agent');
      return;
    }
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, is_active: !a.is_active } : a))
    );
  };

  const updateTicketStatus = async (ticket: SupportTicket, status: string) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticket.id);
    if (error) {
      toast.error('Failed to update ticket');
      return;
    }
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, status: status as SupportTicket['status'] } : t))
    );
    toast.success('Ticket status updated');
  };

  if (loading) {
    return (
      <SiteShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      </SiteShell>
    );
  }

  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="max-w-md mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-3">Admin Access Required</h1>
          <p className="text-white/50 mb-8">
            You need an admin account to access this panel.
          </p>
          <Button
            onClick={() => router.push('/auth?redirect=/admin')}
            className="bg-gradient-brand text-black hover:opacity-90"
          >
            Sign In as Admin
          </Button>
        </div>
      </SiteShell>
    );
  }

  const activeCustomers = customers.filter(
    (c) => c.subscription_status === 'active' || c.subscription_status === 'trialing'
  ).length;
  const openTickets = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress'
  ).length;

  return (
    <SiteShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Panel</h1>
        <p className="text-white/50 mb-8">Manage agents, customers, and revenue.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111] border-white/8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Total Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-brand" />
                </div>
              </div>
              <div className="text-2xl font-bold">{formatEuro(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Active Customers</span>
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-brand" />
                </div>
              </div>
              <div className="text-2xl font-bold">{activeCustomers}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111] border-white/8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/50">Total Agents</span>
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-brand" />
                </div>
              </div>
              <div className="text-2xl font-bold">{agents.length}</div>
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
              <div className="text-2xl font-bold">{openTickets}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agents">
          <TabsList className="bg-white/5">
            <TabsTrigger value="agents" className="data-[state=active]:bg-gradient-brand data-[state=active]:text-black">
              Agents
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-gradient-brand data-[state=active]:text-black">
              Customers
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-gradient-brand data-[state=active]:text-black">
              Tickets
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-gradient-brand data-[state=active]:text-black">
              Revenue
            </TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Manage Agents</h2>
              <Button
                onClick={startCreateAgent}
                className="bg-gradient-brand text-black hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </Button>
            </div>

            {(creatingAgent || editingAgent) && (
              <Card className="bg-[#111] border-brand/20 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {creatingAgent ? 'Create New Agent' : `Edit ${editingAgent?.name}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={agentForm.name || ''}
                        onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug (URL)</Label>
                      <Input
                        value={agentForm.slug || ''}
                        onChange={(e) => setAgentForm({ ...agentForm, slug: e.target.value })}
                        placeholder="my-agent"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={agentForm.tagline || ''}
                      onChange={(e) => setAgentForm({ ...agentForm, tagline: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={agentForm.description || ''}
                      onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                      rows={4}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Icon (lucide name)</Label>
                      <Input
                        value={agentForm.icon || ''}
                        onChange={(e) => setAgentForm({ ...agentForm, icon: e.target.value })}
                        placeholder="Headphones"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={agentForm.category || ''}
                        onChange={(e) => setAgentForm({ ...agentForm, category: e.target.value })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (cents)</Label>
                      <Input
                        type="number"
                        value={agentForm.price_cents || 9900}
                        onChange={(e) => setAgentForm({ ...agentForm, price_cents: Number(e.target.value) })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Features (one per line)</Label>
                    <Textarea
                      value={featuresText}
                      onChange={(e) => setFeaturesText(e.target.value)}
                      rows={5}
                      placeholder="24/7 instant responses&#10;Auto-resolves 70% of tickets"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={saveAgent}
                      disabled={savingAgent}
                      className="bg-gradient-brand text-black hover:opacity-90"
                    >
                      {savingAgent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {creatingAgent ? 'Create Agent' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/10"
                      onClick={() => {
                        setEditingAgent(null);
                        setCreatingAgent(false);
                        setAgentForm(blankAgent);
                        setFeaturesText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-3">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-[#111] border-white/8">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                          <AgentIcon name={agent.icon} className="w-5 h-5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold truncate">{agent.name}</h3>
                            <Badge variant="secondary" className="bg-white/5 text-white/50">
                              {agent.category}
                            </Badge>
                            {!agent.is_active && (
                              <Badge className="bg-white/5 text-white/40">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-xs text-white/40 truncate mt-1">
                            {agent.tagline} &middot; {formatEuro(agent.price_cents)}/mo
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={agent.is_active}
                          onCheckedChange={() => toggleAgentActive(agent)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/50 hover:text-white"
                          onClick={() => startEditAgent(agent)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/30 hover:text-destructive"
                          onClick={() => deleteAgent(agent)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="mt-6">
            <h2 className="text-xl font-semibold mb-6">Customers</h2>
            <Card className="bg-[#111] border-white/8">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/8 hover:bg-transparent">
                      <TableHead className="text-white/50">Name</TableHead>
                      <TableHead className="text-white/50">Email</TableHead>
                      <TableHead className="text-white/50">Plan</TableHead>
                      <TableHead className="text-white/50">Status</TableHead>
                      <TableHead className="text-white/50">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((c) => (
                      <TableRow key={c.id} className="border-white/5">
                        <TableCell className="font-medium">
                          {c.full_name || 'Unknown'}
                          {c.company && (
                            <span className="text-xs text-white/30 block">{c.company}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white/60">{c.email}</TableCell>
                        <TableCell>
                          <Badge className="bg-brand/10 text-brand border border-brand/20 capitalize">
                            {c.subscription_tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              c.subscription_status === 'active'
                                ? 'bg-brand/10 text-brand border border-brand/20'
                                : c.subscription_status === 'trialing'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-white/5 text-white/50'
                            }
                          >
                            {c.subscription_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/40 text-sm">
                          {formatDate(c.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-6">
            <h2 className="text-xl font-semibold mb-6">Support Tickets</h2>
            {tickets.length === 0 ? (
              <Card className="bg-[#111] border-white/8">
                <CardContent className="p-8 text-center">
                  <Ticket className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No support tickets yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-[#111] border-white/8">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                            <Badge
                              className={
                                ticket.priority === 'urgent'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : ticket.priority === 'high'
                                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                  : 'bg-white/5 text-white/50'
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-white/40 mb-2">
                            {(ticket as any).customer?.email || 'Unknown'} &middot; {formatDate(ticket.created_at)}
                          </p>
                          <p className="text-sm text-white/60">{ticket.message}</p>
                        </div>
                        <select
                          value={ticket.status}
                          onChange={(e) => updateTicketStatus(ticket, e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Revenue Records</h2>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand" />
                <span className="text-2xl font-bold text-brand">
                  {formatEuro(totalRevenue)}
                </span>
              </div>
            </div>
            <Card className="bg-[#111] border-white/8">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/8 hover:bg-transparent">
                      <TableHead className="text-white/50">Customer</TableHead>
                      <TableHead className="text-white/50">Amount</TableHead>
                      <TableHead className="text-white/50">Description</TableHead>
                      <TableHead className="text-white/50">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenue.length === 0 ? (
                      <TableRow className="border-white/5">
                        <TableCell colSpan={4} className="text-center text-white/40 py-8">
                          No revenue records yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      revenue.map((r) => (
                        <TableRow key={r.id} className="border-white/5">
                          <TableCell className="text-white/60">
                            {(r as any).customer?.email || 'Unknown'}
                          </TableCell>
                          <TableCell className="font-medium text-brand">
                            {formatEuro(r.amount_cents)}
                          </TableCell>
                          <TableCell className="text-white/50 text-sm">
                            {r.description || '-'}
                          </TableCell>
                          <TableCell className="text-white/40 text-sm">
                            {formatDate(r.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SiteShell>
  );
}
