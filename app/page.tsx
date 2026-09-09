'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    // TODO: Implement sign-up flow
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl text-center space-y-8 animate-fade-up">
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand via-brand-dark to-brand bg-clip-text text-transparent">
              AgentForge
            </h1>
            <p className="text-xl text-gray-400">
              The AI Agency That Runs Itself
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Deploy production-ready AI agents for customer support, marketing, sales, operations,
            and HR in under 10 minutes. No technical knowledge required.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
            {[
              { icon: '⚡', label: 'Fast Setup', desc: '10 minutes to deploy' },
              { icon: '🔒', label: 'Secure', desc: 'Enterprise-grade security' },
              { icon: '📊', label: 'Scalable', desc: 'Handles any load' },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-1">{feature.label}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-brand hover:bg-brand-dark text-black font-semibold"
            >
              {isLoading ? 'Loading...' : 'Start Free Trial'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 hover:bg-gray-900"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-gray-500 pt-4">
            14-day free trial • No card required • Cancel anytime
          </p>
        </div>
      </section>
    </main>
  );
}
