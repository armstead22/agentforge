'use client';

import { supabase } from '@/lib/supabase-client';
import type { Agent } from '@/lib/types';
import { ONBOARDING_QUESTIONS } from '@/lib/types';
import { formatEuro } from '@/lib/format';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteShell } from '@/components/site/site-shell';
import { AgentIcon } from '@/components/site/agent-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Rocket,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

type AnswerMap = Record<string, string>;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [agents, setAgents] = useState<Agent[]>([]);
  const [result, setResult] = useState<Agent | null>(null);

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

  const totalSteps = ONBOARDING_QUESTIONS.length;
  const progress = ((step + 1) / (totalSteps + 1)) * 100;

  const selectOption = (questionId: string, optionId: string, agentSlug: string) => {
    const newAnswers = { ...answers, [questionId]: agentSlug };
    setAnswers(newAnswers);

    if (step < totalSteps - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      computeResult(newAnswers);
    }
  };

  const computeResult = (allAnswers: AnswerMap) => {
    const counts: Record<string, number> = {};
    Object.values(allAnswers).forEach((slug) => {
      counts[slug] = (counts[slug] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topSlug = sorted[0]?.[0];
    const matched = agents.find((a) => a.slug === topSlug);
    if (matched) {
      setResult(matched);
      setStep(totalSteps);
    }
  };

  const restart = () => {
    setAnswers({});
    setResult(null);
    setStep(0);
  };

  const handleDeploy = () => {
    if (!result) return;
    toast.success(`${result.name} is ready for deployment!`);
  };

  if (step === totalSteps && result) {
    return (
      <SiteShell>
        <section className="relative overflow-hidden min-h-[80vh] flex items-center">
          <div className="absolute inset-0 bg-radial-brand opacity-40" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-sm text-brand font-medium">
                Your perfect match
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
              We recommend the
              <br />
              <span className="text-gradient-brand">{result.name}</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {result.tagline}
            </p>

            <Card className="max-w-2xl mx-auto bg-[#111] border-brand/20 mb-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <CardContent className="p-8 text-left">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <AgentIcon name={result.icon} className="w-8 h-8 text-brand" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="bg-white/5 text-white/60 mb-2">
                      {result.category}
                    </Badge>
                    <h3 className="text-2xl font-semibold">{result.name}</h3>
                    <p className="text-brand font-medium mt-1">{formatEuro(result.price_cents)}/mo</p>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  {result.description}
                </p>
                <div className="space-y-2">
                  {result.features.slice(0, 4).map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-brand" />
                      </div>
                      <span className="text-sm text-white/70">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Link href={`/agents/${result.slug}`}>
                <Button
                  size="lg"
                  className="bg-gradient-brand text-black hover:opacity-90 font-semibold h-14 px-8 glow-brand"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Deploy This Agent
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-white/15 text-white hover:bg-white/5 h-14 px-8"
                onClick={restart}
              >
                Retake Quiz
              </Button>
            </div>

            <div className="mt-12">
              <Link href="/marketplace" className="text-sm text-white/40 hover:text-brand transition-colors">
                Browse all agents instead
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const currentQ = ONBOARDING_QUESTIONS[step];
  const isLast = step === totalSteps - 1;

  return (
    <SiteShell>
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-radial-brand opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/40">
                Question {step + 1} of {totalSteps}
              </span>
              <span className="text-sm text-brand font-medium">
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-brand transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div key={step} className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-brand" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {currentQ.question}
              </h2>
            </div>
            <p className="text-white/50 mb-8 ml-13">{currentQ.subtitle}</p>

            <div className="grid gap-4">
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.id] === option.agentSlug;
                return (
                  <button
                    key={option.id}
                    onClick={() => selectOption(currentQ.id, option.id, option.agentSlug)}
                    className={`group text-left p-5 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? 'border-brand bg-brand/5 glow-brand'
                        : 'border-white/8 bg-white/[0.02] hover:border-brand/30 hover:bg-brand/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1 group-hover:text-brand transition-colors">
                          {option.label}
                        </h3>
                        <p className="text-sm text-white/50">{option.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-all ${
                        isSelected
                          ? 'border-brand bg-brand'
                          : 'border-white/20 group-hover:border-brand/50'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <Button
                  variant="ghost"
                  className="text-white/50 hover:text-white"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <Link href="/marketplace">
                  <Button variant="ghost" className="text-white/50 hover:text-white">
                    Skip quiz
                  </Button>
                </Link>
              )}
              <span className="text-sm text-white/30">
                {isLast ? 'Last question' : 'Pick one to continue'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
