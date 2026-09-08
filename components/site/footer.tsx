'use client';

import Link from 'next/link';
import { Zap, Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" fill="black" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Agent<span className="text-brand">Forge</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              The AI agency that runs itself. Deploy production-ready agents for
              your business in under 10 minutes.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand/10 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4 text-white/60" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand/10 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4 text-white/60" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand/10 flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4 text-white/60" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/marketplace" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Agent Marketplace
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Find Your Agent
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Agents</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/agents/customer-support" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/agents/marketing-automation" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Marketing Automation
                </Link>
              </li>
              <li>
                <Link href="/agents/lead-qualification" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Lead Qualification
                </Link>
              </li>
              <li>
                <Link href="/agents/reputation-monitor" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Reputation Monitor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@agentforge4ai.com" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Admin Panel
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/50 hover:text-brand transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} AgentForge. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            The AI Agency That Runs Itself.
          </p>
        </div>
      </div>
    </footer>
  );
}
