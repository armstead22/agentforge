import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentForge — The AI Agency That Runs Itself',
  description:
    'AgentForge deploys production-ready AI agents for customer support, marketing, sales, operations, and HR. Start your 14-day free trial — no card required.',
  metadataBase: new URL('https://agentforge4ai.com'),
  openGraph: {
    title: 'AgentForge — The AI Agency That Runs Itself',
    description:
      'Deploy production-ready AI agents for your business in under 10 minutes. 14-day free trial, no card required.',
    url: 'https://agentforge4ai.com',
    siteName: 'AgentForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentForge — The AI Agency That Runs Itself',
    description:
      'Deploy production-ready AI agents for your business in under 10 minutes.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
